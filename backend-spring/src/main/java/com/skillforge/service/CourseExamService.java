package com.skillforge.service;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.skillforge.dto.CourseDTO;
import com.skillforge.dto.GeneratedExamDTO;
import com.skillforge.entity.Course;
import com.skillforge.entity.Lesson;
import com.skillforge.entity.LessonResource;
import com.skillforge.entity.Topic;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.LessonRepository;
import com.skillforge.repository.LessonResourceRepository;
import com.skillforge.repository.TopicRepository;
import com.skillforge.services.GoogleGenerativeAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class CourseExamService {
    private static final Gson gson = new Gson();

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonResourceRepository lessonResourceRepository;

    @Autowired
    private GoogleGenerativeAIService googleGenerativeAIService;

    public GeneratedExamDTO getOrGenerateExam(Long courseId) {
        Course course = findCourse(courseId);
        GeneratedExamDTO storedExam = parseStoredExam(course);
        if (storedExam != null && storedExam.getQuestions() != null && !storedExam.getQuestions().isEmpty()) {
            return storedExam;
        }
        return generateAndSaveExam(courseId);
    }

    public GeneratedExamDTO generateAndSaveExam(Long courseId) {
        Course course = findCourse(courseId);
        GeneratedExamDTO exam = generateExamDefinition(course);
        course.setGeneratedExamJson(gson.toJson(exam));
        courseRepository.save(course);
        return exam;
    }

    public List<Boolean> gradeAnswers(Long courseId, List<Integer> selectedAnswers) {
        GeneratedExamDTO exam = getOrGenerateExam(courseId);
        List<Boolean> gradedAnswers = new ArrayList<>();
        List<GeneratedExamDTO.QuestionDTO> questions = exam.getQuestions() == null ? List.of() : exam.getQuestions();

        for (int index = 0; index < questions.size(); index++) {
          Integer selected = index < selectedAnswers.size() ? selectedAnswers.get(index) : null;
          Integer correct = questions.get(index).getCorrectAnswerIndex();
          gradedAnswers.add(selected != null && correct != null && selected.equals(correct));
        }

        return gradedAnswers;
    }

    public GeneratedExamDTO sanitizeForStudent(GeneratedExamDTO exam) {
        GeneratedExamDTO safe = new GeneratedExamDTO();
        safe.setCourseId(exam.getCourseId());
        safe.setTitle(exam.getTitle());
        safe.setDurationSeconds(exam.getDurationSeconds());
        safe.setGeneratedAt(exam.getGeneratedAt());

        List<GeneratedExamDTO.QuestionDTO> questions = new ArrayList<>();
        for (GeneratedExamDTO.QuestionDTO question : exam.getQuestions()) {
            GeneratedExamDTO.QuestionDTO safeQuestion = new GeneratedExamDTO.QuestionDTO();
            safeQuestion.setId(question.getId());
            safeQuestion.setQuestion(question.getQuestion());
            safeQuestion.setOptions(question.getOptions());
            questions.add(safeQuestion);
        }
        safe.setQuestions(questions);
        return safe;
    }

    private Course findCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    private GeneratedExamDTO parseStoredExam(Course course) {
        if (course.getGeneratedExamJson() == null || course.getGeneratedExamJson().isBlank()) {
            return null;
        }

        try {
            return gson.fromJson(course.getGeneratedExamJson(), GeneratedExamDTO.class);
        } catch (JsonSyntaxException exception) {
            return null;
        }
    }

    private GeneratedExamDTO generateExamDefinition(Course course) {
        String promptContext = buildPromptContext(course);
        String generated = googleGenerativeAIService.generateStructuredContent(
                "You generate clean JSON exams for SkillForge courses. Return JSON only.",
                "Create a 5-question multiple-choice exam for the following course context. Each question must have exactly 4 options, one correctAnswerIndex between 0 and 3, and a brief explanation. JSON shape: {\"title\":string,\"durationSeconds\":number,\"questions\":[{\"id\":string,\"question\":string,\"options\":[string,string,string,string],\"correctAnswerIndex\":number,\"explanation\":string}]}. Context:\n" + promptContext
        );

        GeneratedExamDTO parsed = parseGeneratedExamJson(generated, course.getId());
        if (parsed != null && parsed.getQuestions() != null && !parsed.getQuestions().isEmpty()) {
            return parsed;
        }

        return buildFallbackExam(course);
    }

    private GeneratedExamDTO parseGeneratedExamJson(String generated, Long courseId) {
        if (generated == null || generated.isBlank()) {
            return null;
        }

        String cleaned = generated.trim();
        if (cleaned.startsWith("```") ) {
            cleaned = cleaned.replaceFirst("^```json", "").replaceFirst("^```", "").replaceFirst("```$", "").trim();
        }

        try {
            GeneratedExamDTO exam = gson.fromJson(cleaned, GeneratedExamDTO.class);
            if (exam == null || exam.getQuestions() == null || exam.getQuestions().isEmpty()) {
                return null;
            }
            normalizeExam(exam, courseId);
            return exam;
        } catch (JsonSyntaxException exception) {
            return null;
        }
    }

    private void normalizeExam(GeneratedExamDTO exam, Long courseId) {
        exam.setCourseId(String.valueOf(courseId));
        if (exam.getTitle() == null || exam.getTitle().isBlank()) {
            exam.setTitle("Course Assessment");
        }
        if (exam.getDurationSeconds() == null || exam.getDurationSeconds() <= 0) {
            exam.setDurationSeconds(300);
        }
        exam.setGeneratedAt(LocalDateTime.now().toString());

        for (int index = 0; index < exam.getQuestions().size(); index++) {
            GeneratedExamDTO.QuestionDTO question = exam.getQuestions().get(index);
            question.setId(question.getId() == null || question.getId().isBlank() ? "q-" + (index + 1) : question.getId());
            if (question.getOptions() == null) {
                question.setOptions(List.of());
            }
        }
    }

    private GeneratedExamDTO buildFallbackExam(Course course) {
        GeneratedExamDTO exam = new GeneratedExamDTO();
        exam.setCourseId(String.valueOf(course.getId()));
        exam.setTitle(course.getTitle() + " Assessment");
        exam.setDurationSeconds(300);
        exam.setGeneratedAt(LocalDateTime.now().toString());

        List<String> concepts = collectConcepts(course);
        List<GeneratedExamDTO.QuestionDTO> questions = new ArrayList<>();
        for (int index = 0; index < Math.min(5, concepts.size()); index++) {
            String concept = concepts.get(index);
            GeneratedExamDTO.QuestionDTO question = new GeneratedExamDTO.QuestionDTO();
            question.setId("q-" + (index + 1));
            question.setQuestion("Which option best describes " + concept + " in " + course.getTitle() + "?");
            question.setOptions(List.of(
                    concept + " is a core concept covered in the course materials",
                    concept + " is unrelated to the course domain",
                    concept + " should always be skipped during practice",
                    concept + " is only relevant after the exam"
            ));
            question.setCorrectAnswerIndex(0);
            question.setExplanation("The course materials present " + concept + " as part of the main learning path.");
            questions.add(question);
        }
        exam.setQuestions(questions);
        return exam;
    }

    private List<String> collectConcepts(Course course) {
        Set<String> concepts = new LinkedHashSet<>();

        try {
            List<CourseDTO.ModuleDTO> modules = course.getSyllabusModules() == null
                    ? List.of()
                    : gson.fromJson(course.getSyllabusModules(), com.google.gson.reflect.TypeToken.getParameterized(List.class, CourseDTO.ModuleDTO.class).getType());
            for (CourseDTO.ModuleDTO module : modules) {
                if (module != null && module.getTitle() != null && !module.getTitle().isBlank()) {
                    concepts.add(module.getTitle());
                }
            }
        } catch (Exception ignored) {
        }

        List<Topic> topics = topicRepository.findByCourseIdOrderByOrderIndex(course.getId());
        for (Topic topic : topics) {
            concepts.add(topic.getTitle());
            List<Lesson> lessons = lessonRepository.findByTopicIdOrderByOrderIndex(topic.getId());
            for (Lesson lesson : lessons) {
                concepts.add(lesson.getTitle());
                List<LessonResource> resources = lessonResourceRepository.findByLessonIdOrderByOrderIndex(lesson.getId());
                for (LessonResource resource : resources) {
                    if (resource.getTitle() != null && !resource.getTitle().isBlank()) {
                        concepts.add(resource.getTitle());
                    }
                }
            }
        }

        if (concepts.isEmpty()) {
            concepts.add(course.getTitle());
            concepts.add("core concepts");
            concepts.add("practical applications");
            concepts.add("best practices");
            concepts.add("review topics");
        }

        return new ArrayList<>(concepts);
    }

    private String buildPromptContext(Course course) {
        StringBuilder builder = new StringBuilder();
        builder.append("Course: ").append(course.getTitle()).append('\n');
        builder.append("Description: ").append(course.getDescription()).append('\n');
        builder.append("Concepts: ").append(String.join(", ", collectConcepts(course)));
        return builder.toString();
    }
}