package com.skillforge.service;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.skillforge.dto.CourseDTO;
import com.skillforge.dto.ProgressDTO;
import com.skillforge.entity.Course;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Progress;
import com.skillforge.entity.QuizAttempt;
import com.skillforge.entity.User;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ProgressRepository;
import com.skillforge.repository.QuizAttemptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Progress Service - Handles learning progress tracking
 * 
 * Operations:
 * - Mark module as complete
 * - Get user's progress across all courses
 * - Submit quiz attempts
 */
@Service
public class ProgressService {
    
    private static final Logger log = LoggerFactory.getLogger(ProgressService.class);

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    private static final Gson gson = new Gson();

    /**
     * Mark a module as complete
     * 
     * Validations:
     * - User must be enrolled in the course
     * - If progress doesn't exist, create it
     * - If already completed, update completedAt timestamp
     * 
     * @param userId User ID (from JWT)
     * @param courseId Course ID
     * @param moduleId Module ID
     * @return ProgressDTO
     * @throws IllegalArgumentException if validation fails
     */
    public ProgressDTO markModuleComplete(Long userId, String courseId, String moduleId) {
        // Parse course ID
        Long parsedCourseId;
        try {
            parsedCourseId = Long.parseLong(courseId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid course ID");
        }

        // Verify enrollment
        boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, parsedCourseId);
        if (!isEnrolled) {
            throw new IllegalArgumentException("Not enrolled in this course");
        }

        // Get or create progress record
        Progress progress = progressRepository
                .findByUserIdAndCourseIdAndModuleId(userId, parsedCourseId, moduleId)
                .orElse(null);

        if (progress == null) {
            // Create new progress record
            progress = new Progress();
            
            // Simplified approach: fetch user and course
            var user = new com.skillforge.entity.User();
            user.setId(userId);
            var course = new Course();
            course.setId(parsedCourseId);
            
            progress.setUser(user);
            progress.setCourse(course);
            progress.setModuleId(moduleId);
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
        } else {
            // Update existing progress
            if (!progress.getCompleted()) {
                progress.setCompleted(true);
                progress.setCompletedAt(LocalDateTime.now());
            }
        }

        progress = progressRepository.save(progress);
        log.info("User {} marked module {} complete in course {}", userId, moduleId, parsedCourseId);

        return convertProgressToDTO(progress);
    }

    /**
     * Get user's learning progress across all enrolled courses
     * Groups progress by course with metrics:
     * - Total modules
     * - Completed modules
     * - Completion percentage
     * 
     * @param userId User ID (from JWT)
     * @return Map of course data with progress metrics
     */
    public ProgressSummaryResponse getMyProgress(Long userId) {
        // Get all progress for user
        List<Progress> allProgress = progressRepository.findAllByUserId(userId);

        // Group by course
        Map<Long, ProgressSummaryByCache> summaryMap = new HashMap<>();
        
        for (Progress p : allProgress) {
            Long courseId = p.getCourse().getId();
            summaryMap.putIfAbsent(courseId, new ProgressSummaryByCache(
                    p.getCourse(),
                    0,  // totalModules
                    0,  // completedModules
                    new ArrayList<>()
            ));

            ProgressSummaryByCache summary = summaryMap.get(courseId);
            summary.totalModules++;
            if (p.getCompleted()) {
                summary.completedModules++;
            }
            summary.modules.add(p);
        }

        // Convert to response
        List<ProgressSummaryItem> summaries = summaryMap.values().stream()
                .map(this::convertToProgressSummaryItem)
                .collect(Collectors.toList());

        return ProgressSummaryResponse.builder()
                .count(summaries.size())
                .summary(summaries)
                .build();
    }

    /**
     * Submit a quiz attempt
     * 
     * Scoring: Each correct answer = 10 points (max 100)
     * Pass: score >= 60
     * 
     * @param userId User ID (from JWT)
     * @param courseId Course ID
     * @param moduleId Module ID
     * @param answers Array of correct/incorrect answers
     * @param timeTakenSec Time taken to complete quiz (seconds)
     * @return QuizSubmitResponseDTO with score, pass status, and feedback
     * @throws IllegalArgumentException if validation fails
     */
    public QuizSubmitResponse submitQuiz(Long userId, String courseId, String moduleId,
                                         List<Boolean> answers, Long timeTakenSec) {
        // Validations
        if (courseId == null || moduleId == null || answers == null) {
            throw new IllegalArgumentException("courseId, moduleId, and answers are required");
        }

        Long parsedCourseId;
        try {
            parsedCourseId = Long.parseLong(courseId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid course ID");
        }

        // Verify enrollment
        boolean isEnrolled = enrollmentRepository.existsByUserIdAndCourseId(userId, parsedCourseId);
        if (!isEnrolled) {
            throw new IllegalArgumentException("Not enrolled in this course");
        }

        // Calculate score (10 points per correct answer, max 100)
        int correctCount = (int) answers.stream().filter(a -> a).count();
        int score = Math.min(correctCount * 10, 100);
        boolean passed = score >= 60;

        // Create quiz attempt
        var user = new com.skillforge.entity.User();
        user.setId(userId);
        var course = new Course();
        course.setId(parsedCourseId);

        QuizAttempt attempt = QuizAttempt.builder()
                .user(user)
                .course(course)
                .moduleId(moduleId)
                .score(score)
                .timeTakenSec(timeTakenSec != null ? timeTakenSec : 0)
                .passed(passed)
                .build();

        attempt = quizAttemptRepository.save(attempt);
        log.info("Quiz submitted by user {} for module {} - Score: {}", userId, moduleId, score);

        // Return response
        String feedback = passed ? "Great job!" : "Try again to improve your score.";
        
        return QuizSubmitResponse.builder()
                .score(score)
                .passed(passed)
                .feedback(feedback)
                .attemptId(attempt.getId())
                .build();
    }

    /**
     * Convert Progress entity to ProgressDTO
     */
    private ProgressDTO convertProgressToDTO(Progress progress) {
        return ProgressDTO.builder()
                .id(progress.getId())
                .userId(progress.getUser().getId())
                .courseId(convertCourseToDTOWithParsedData(progress.getCourse()))
                .moduleId(progress.getModuleId())
                .completed(progress.getCompleted())
                .completedAt(progress.getCompletedAt())
                .createdAt(progress.getCreatedAt())
                .updatedAt(progress.getUpdatedAt())
                .build();
    }

    /**
     * Convert cached progress summary to response item
     */
    private ProgressSummaryItem convertToProgressSummaryItem(ProgressSummaryByCache cached) {
        double completionPercentage = cached.totalModules > 0 ?
                (cached.completedModules * 100.0) / cached.totalModules : 0.0;

        return ProgressSummaryItem.builder()
                .course(convertCourseToDTOWithParsedData(cached.course))
                .totalModules(cached.totalModules)
                .completedModules(cached.completedModules)
                .completionPercentage(completionPercentage)
                .modules(cached.modules.stream()
                        .map(this::convertProgressToDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * Convert Course to CourseDTO with parsed JSON
     */
    private CourseDTO convertCourseToDTOWithParsedData(Course course) {
        Type stringListType = new TypeToken<List<String>>(){}.getType();
        Type moduleListType = new TypeToken<List<CourseDTO.ModuleDTO>>(){}.getType();
        Type longListType = new TypeToken<List<Long>>(){}.getType();

        List<String> tags = course.getTags() != null ? 
                gson.fromJson(course.getTags(), stringListType) : List.of();
        List<CourseDTO.ModuleDTO> modules = course.getSyllabusModules() != null ?
                gson.fromJson(course.getSyllabusModules(), moduleListType) : List.of();
        List<Long> prerequisites = course.getPrerequisites() != null ?
                gson.fromJson(course.getPrerequisites(), longListType) : List.of();

        return CourseDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .slug(course.getSlug())
                .category(course.getCategory().name())
                .level(course.getLevel().name())
                .durationHours(course.getDurationHours())
                .rating(course.getRating())
                .thumbnailUrl(course.getThumbnailUrl())
                .description(course.getDescription())
                .tags(tags)
                .syllabusModules(modules)
                .prerequisites(prerequisites)
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    // Helper classes
    public static class ProgressSummaryByCache {
        public Course course;
        public int totalModules;
        public int completedModules;
        public List<Progress> modules;

        public ProgressSummaryByCache(Course course, int totalModules, int completedModules, List<Progress> modules) {
            this.course = course;
            this.totalModules = totalModules;
            this.completedModules = completedModules;
            this.modules = modules;
        }

        public Course getCourse() {
            return course;
        }

        public void setCourse(Course course) {
            this.course = course;
        }

        public int getTotalModules() {
            return totalModules;
        }

        public void setTotalModules(int totalModules) {
            this.totalModules = totalModules;
        }

        public int getCompletedModules() {
            return completedModules;
        }

        public void setCompletedModules(int completedModules) {
            this.completedModules = completedModules;
        }

        public List<Progress> getModules() {
            return modules;
        }

        public void setModules(List<Progress> modules) {
            this.modules = modules;
        }
    }

    public static class ProgressSummaryResponse {
        private int count;
        private List<ProgressSummaryItem> summary;

        public ProgressSummaryResponse() {
        }

        public ProgressSummaryResponse(int count, List<ProgressSummaryItem> summary) {
            this.count = count;
            this.summary = summary;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }

        public List<ProgressSummaryItem> getSummary() {
            return summary;
        }

        public void setSummary(List<ProgressSummaryItem> summary) {
            this.summary = summary;
        }

        public static ProgressSummaryResponseBuilder builder() {
            return new ProgressSummaryResponseBuilder();
        }

        public static class ProgressSummaryResponseBuilder {
            private int count;
            private List<ProgressSummaryItem> summary;

            public ProgressSummaryResponseBuilder count(int count) {
                this.count = count;
                return this;
            }

            public ProgressSummaryResponseBuilder summary(List<ProgressSummaryItem> summary) {
                this.summary = summary;
                return this;
            }

            public ProgressSummaryResponse build() {
                return new ProgressSummaryResponse(count, summary);
            }
        }
    }

    public static class ProgressSummaryItem {
        private CourseDTO course;
        private Integer totalModules;
        private Integer completedModules;
        private Double completionPercentage;
        private List<ProgressDTO> modules;

        public ProgressSummaryItem() {
        }

        public ProgressSummaryItem(CourseDTO course, Integer totalModules, Integer completedModules, 
                                   Double completionPercentage, List<ProgressDTO> modules) {
            this.course = course;
            this.totalModules = totalModules;
            this.completedModules = completedModules;
            this.completionPercentage = completionPercentage;
            this.modules = modules;
        }

        public CourseDTO getCourse() {
            return course;
        }

        public void setCourse(CourseDTO course) {
            this.course = course;
        }

        public Integer getTotalModules() {
            return totalModules;
        }

        public void setTotalModules(Integer totalModules) {
            this.totalModules = totalModules;
        }

        public Integer getCompletedModules() {
            return completedModules;
        }

        public void setCompletedModules(Integer completedModules) {
            this.completedModules = completedModules;
        }

        public Double getCompletionPercentage() {
            return completionPercentage;
        }

        public void setCompletionPercentage(Double completionPercentage) {
            this.completionPercentage = completionPercentage;
        }

        public List<ProgressDTO> getModules() {
            return modules;
        }

        public void setModules(List<ProgressDTO> modules) {
            this.modules = modules;
        }

        public static ProgressSummaryItemBuilder builder() {
            return new ProgressSummaryItemBuilder();
        }

        public static class ProgressSummaryItemBuilder {
            private CourseDTO course;
            private Integer totalModules;
            private Integer completedModules;
            private Double completionPercentage;
            private List<ProgressDTO> modules;

            public ProgressSummaryItemBuilder course(CourseDTO course) {
                this.course = course;
                return this;
            }

            public ProgressSummaryItemBuilder totalModules(Integer totalModules) {
                this.totalModules = totalModules;
                return this;
            }

            public ProgressSummaryItemBuilder completedModules(Integer completedModules) {
                this.completedModules = completedModules;
                return this;
            }

            public ProgressSummaryItemBuilder completionPercentage(Double completionPercentage) {
                this.completionPercentage = completionPercentage;
                return this;
            }

            public ProgressSummaryItemBuilder modules(List<ProgressDTO> modules) {
                this.modules = modules;
                return this;
            }

            public ProgressSummaryItem build() {
                return new ProgressSummaryItem(course, totalModules, completedModules, completionPercentage, modules);
            }
        }
    }

    public static class QuizSubmitResponse {
        private Integer score;
        private Boolean passed;
        private String feedback;
        private Long attemptId;

        public QuizSubmitResponse() {
        }

        public QuizSubmitResponse(Integer score, Boolean passed, String feedback, Long attemptId) {
            this.score = score;
            this.passed = passed;
            this.feedback = feedback;
            this.attemptId = attemptId;
        }

        public Integer getScore() {
            return score;
        }

        public void setScore(Integer score) {
            this.score = score;
        }

        public Boolean getPassed() {
            return passed;
        }

        public void setPassed(Boolean passed) {
            this.passed = passed;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }

        public Long getAttemptId() {
            return attemptId;
        }

        public void setAttemptId(Long attemptId) {
            this.attemptId = attemptId;
        }

        public static QuizSubmitResponseBuilder builder() {
            return new QuizSubmitResponseBuilder();
        }

        public static class QuizSubmitResponseBuilder {
            private Integer score;
            private Boolean passed;
            private String feedback;
            private Long attemptId;

            public QuizSubmitResponseBuilder score(Integer score) {
                this.score = score;
                return this;
            }

            public QuizSubmitResponseBuilder passed(Boolean passed) {
                this.passed = passed;
                return this;
            }

            public QuizSubmitResponseBuilder feedback(String feedback) {
                this.feedback = feedback;
                return this;
            }

            public QuizSubmitResponseBuilder attemptId(Long attemptId) {
                this.attemptId = attemptId;
                return this;
            }

            public QuizSubmitResponse build() {
                return new QuizSubmitResponse(score, passed, feedback, attemptId);
            }
        }
    }
}
