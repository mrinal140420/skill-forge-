package com.skillforge.services;

import com.skillforge.dto.TopicDTO;
import com.skillforge.dtos.ChatMessageDTO;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import com.skillforge.models.ChatMessage;
import com.skillforge.repositories.ChatMessageRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.CourseContentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * SkillBot Service - AI Tutor powered by intelligent prompts
 * Provides contextual answers to student questions based on course content
 */
@Service
public class SkillBotService {
    private static final Logger log = LoggerFactory.getLogger(SkillBotService.class);
    private static final Pattern SENTENCE_SPLIT_PATTERN = Pattern.compile("(?<=[.!?])\\s+");
    private static final List<String> OFF_TOPIC_KEYWORDS = List.of(
            "weather", "sports", "match", "cricket", "football", "politics", "election",
            "movie", "music", "celebrity", "meme", "joke", "funny", "dating", "relationship",
            "bitcoin", "crypto", "stock market", "horoscope", "astrology"
    );
    
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseContentService courseContentService;
    private final GoogleGenerativeAIService googleGenerativeAIService;
    
    public SkillBotService(ChatMessageRepository chatMessageRepository,
                           UserRepository userRepository,
                           CourseRepository courseRepository,
                           CourseContentService courseContentService,
                           GoogleGenerativeAIService googleGenerativeAIService) {
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.courseContentService = courseContentService;
        this.googleGenerativeAIService = googleGenerativeAIService;
    }

    public ChatMessageDTO chat(Long userId, String userMessage, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (courseId == null) {
            return createEphemeralResponse(userId, null, userMessage,
                    "Please open SkillBot from a specific enrolled course so I can answer within that course context.",
                    "clarification");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String botResponse;
        String messageType = categorizeQuestion(userMessage);
        if (!isCourseRelated(userMessage, course)) {
            botResponse = buildOffTopicResponse(user, course);
            messageType = "clarification";
        } else {
            botResponse = googleGenerativeAIService.generateResponse(buildSystemPrompt(course, user), userMessage);
            botResponse = ensurePersonalized(user, course, userMessage, botResponse);
        }

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setUser(user);
        chatMessage.setCourse(course);
        chatMessage.setUserMessage(userMessage);
        chatMessage.setBotResponse(botResponse);
        chatMessage.setMessageType(messageType);
        chatMessage.setCreatedAt(LocalDateTime.now());
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        log.info("SkillBot responded to user {} for course {} with mode {} ({})",
                userId, courseId, messageType, googleGenerativeAIService.getConfigurationStatus());

        return convertToDTO(savedMessage);
    }

    private String categorizeQuestion(String message) {
        String lower = message.toLowerCase();
        if (lower.contains("example") || lower.contains("code") || lower.contains("how to")) {
            return "example_request";
        } else if (lower.contains("clarify") || lower.contains("confused") || lower.contains("difference")) {
            return "clarification";
        } else {
            return "question";
        }
    }

    private String buildSystemPrompt(Course course, User user) {
        List<TopicDTO> topics = courseContentService.getTopicsForCourse(course.getId());
        String topicTitles = topics.stream()
                .map(TopicDTO::getTitle)
                .filter(Objects::nonNull)
                .collect(Collectors.joining(", "));

        String lessonTitles = topics.stream()
                .flatMap(topic -> topic.getLessons().stream())
                .map(lesson -> lesson.getTitle())
                .filter(Objects::nonNull)
                .limit(10)
                .collect(Collectors.joining(", "));

        return "You are SkillBot, a strict course tutor for SkillForge.\n"
                + "Course Title: " + course.getTitle() + "\n"
                + "Student Name: " + firstName(user) + "\n"
                + "Course Description: " + course.getDescription() + "\n"
                + "Course Topics: " + (topicTitles.isBlank() ? course.getCategory().name() : topicTitles) + "\n"
                + "Sample Lessons: " + (lessonTitles.isBlank() ? "No lesson titles available yet" : lessonTitles) + "\n"
                + "Rules:\n"
                + "1. Answer only about this specific course.\n"
                + "2. Keep the answer clear and practical. Aim for 4-7 sentences: concept, why it matters, one practical example, and one next step.\n"
                + "3. Begin your reply with 'Hi " + firstName(user) + ",' followed by your answer.\n"
                + "4. If the question is broad, anchor it to the course topics above.\n"
                + "5. Do not answer off-topic or casual questions. Redirect the student to the course content.\n";
    }

    private boolean isCourseRelated(String message, Course course) {
        String normalizedMessage = message.toLowerCase(Locale.ROOT);
        if (OFF_TOPIC_KEYWORDS.stream().anyMatch(normalizedMessage::contains)) {
            return false;
        }

        List<String> courseTokens = buildCourseTokens(course);
        if (courseTokens.stream().anyMatch(normalizedMessage::contains)) {
            return true;
        }

        List<String> academicTokens = List.of(
            "explain", "example", "why", "how", "what is", "define", "concept", "module", "lesson", "topic",
            "practice", "problem", "algorithm", "query", "memory", "network", "database", "system", "basics", "fundamentals"
        );
        return academicTokens.stream().anyMatch(normalizedMessage::contains);
    }

    private List<String> buildCourseTokens(Course course) {
        List<String> rawValues = new ArrayList<>();
        rawValues.add(course.getTitle());
        rawValues.add(course.getDescription());
        rawValues.add(course.getCategory() != null ? course.getCategory().name() : null);
        rawValues.addAll(courseContentService.getTopicTitlesForCourse(course.getId()));

        return rawValues.stream()
            .filter(Objects::nonNull)
            .flatMap(value -> expandCourseTerms(value).stream())
                .distinct()
                .toList();
    }

        private List<String> expandCourseTerms(String value) {
        String normalized = value.toLowerCase(Locale.ROOT)
            .replace('_', ' ')
            .replace('-', ' ')
            .trim();

        List<String> expanded = new ArrayList<>();
        if (normalized.length() > 2) {
            expanded.add(normalized);
        }

        expanded.addAll(Arrays.stream(normalized.split("[^a-z0-9]+"))
            .filter(token -> token.length() > 2)
            .toList());

        return expanded;
        }

    private String buildOffTopicResponse(User user, Course course) {
        return "Hi " + firstName(user) + ", I can only help with " + course.getTitle()
            + ". Ask about a topic, lesson, definition, or example from this course and I'll answer directly.";
    }

    private String ensurePersonalized(User user, Course course, String userMessage, String response) {
        String cleaned = response == null ? "" : response.trim();
        if (cleaned.isBlank()) {
            cleaned = "Please review the current lesson material for " + course.getTitle() + " and ask me about one topic at a time.";
        }

        String firstName = firstName(user);
        String lowerFirstName = firstName.toLowerCase(Locale.ROOT);
        String lowerCleaned = cleaned.toLowerCase(Locale.ROOT);

        // Strip a bare "Name," prefix that the AI sometimes adds instead of "Hi Name,"
        if (lowerCleaned.startsWith(lowerFirstName + ",")) {
            cleaned = cleaned.substring(firstName.length() + 1).trim();
        } else if (lowerCleaned.startsWith(lowerFirstName + " ")) {
            cleaned = cleaned.substring(firstName.length()).trim();
            if (cleaned.startsWith(",")) cleaned = cleaned.substring(1).trim();
        }

        if (!cleaned.toLowerCase(Locale.ROOT).startsWith(("hi " + lowerFirstName))) {
            cleaned = "Hi " + firstName + ", " + cleaned;
        }

        cleaned = enforceGracefulAnswer(cleaned, user, course, userMessage);

        if (cleaned.length() > 800) {
            cleaned = cleaned.substring(0, 797).trim() + "...";
        }
        return cleaned;
    }

    private String enforceGracefulAnswer(String response, User user, Course course, String userMessage) {
        String normalized = response.replaceAll("\\s+", " ").trim();
        int sentenceCount = countSentences(normalized);
        boolean hasExample = containsAny(normalized.toLowerCase(Locale.ROOT), "for example", "example", "e.g.");
        boolean hasNextStep = containsAny(normalized.toLowerCase(Locale.ROOT), "next step", "try", "practice", "review", "start with");
        boolean endsWell = normalized.endsWith(".") || normalized.endsWith("!") || normalized.endsWith("?");
        boolean tooShort = normalized.length() < 170 || sentenceCount < 3;

        if (tooShort || !endsWell) {
            return buildGracefulFallbackAnswer(user, course, userMessage);
        }

        String enriched = normalized;
        if (isAiMlConceptQuestion(course, userMessage) && !containsAny(enriched.toLowerCase(Locale.ROOT), "supervised", "unsupervised", "features", "labels", "evaluation")) {
            enriched = enriched + " In AI/ML basics, key pillars include supervised learning, unsupervised learning, feature-label understanding, and proper model evaluation.";
        }
        if (!hasExample) {
            enriched = enriched + " " + buildExampleLine(course);
        }
        if (!hasNextStep) {
            enriched = enriched + " " + buildNextStepLine(course);
        }

        return enriched.replaceAll("\\s+", " ").trim();
    }

    private int countSentences(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }
        return (int) SENTENCE_SPLIT_PATTERN.splitAsStream(text.trim())
                .filter(part -> !part.isBlank())
                .count();
    }

        private String buildGracefulFallbackAnswer(User user, Course course, String userMessage) {
        String name = firstName(user);
        String courseLabel = formatCourseLabel(course);

        if (isAiMlConceptQuestion(course, userMessage)) {
            return "Hi " + name + ", " + courseLabel + " focuses on how systems learn patterns from data to make useful predictions and decisions. "
                + "The key concepts are supervised learning (learning from labeled examples), unsupervised learning (finding hidden structure), and model evaluation using metrics like accuracy or precision. "
                + "You also need to understand features, labels, and why train/test split helps avoid overfitting. "
                + buildExampleLine(course) + " "
                + buildNextStepLine(course);
        }

        return "Hi " + name + ", " + courseLabel + " introduces the key ideas needed to understand this subject clearly and apply it in practice. "
            + "Start by identifying the core concept, then connect it to where it is used in real scenarios, and finally check how outcomes are evaluated. "
            + buildExampleLine(course) + " "
            + buildNextStepLine(course);
    }

    private String buildExampleLine(Course course) {
        String title = course.getTitle() == null ? "this course" : course.getTitle().toLowerCase(Locale.ROOT);
        if (containsAny(title, "ai", "machine learning", "ml")) {
            return "For example, a model can learn from labeled email data to classify new emails as spam or not spam.";
        }
        return "For example, take one concept from your current lesson and apply it to a small real-world scenario from the module.";
    }

    private String buildNextStepLine(Course course) {
        return "Next step: pick one concept from today's lesson, write a short 3-point summary, and solve one related practice question.";
    }

    private String formatCourseLabel(Course course) {
        String title = course.getTitle() == null ? "this course" : course.getTitle().trim();
        String normalized = title.toLowerCase(Locale.ROOT);
        if (containsAny(normalized, "ai", "ml", "machine learning", "artificial intelligence")) {
            return "AI & Machine Learning Basics";
        }
        return title;
    }

    private boolean isAiMlConceptQuestion(Course course, String userMessage) {
        String title = course.getTitle() == null ? "" : course.getTitle().toLowerCase(Locale.ROOT);
        String question = userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT);
        boolean aiMlCourse = containsAny(title, "ai", "ml", "machine learning", "artificial intelligence");
        boolean conceptAsk = containsAny(question, "key concept", "concept", "basics", "introduction", "fundamental", "explain");
        return aiMlCourse && conceptAsk;
    }

    private boolean containsAny(String value, String... candidates) {
        if (value == null) {
            return false;
        }
        String source = value.toLowerCase(Locale.ROOT);
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank() && source.contains(candidate.toLowerCase(Locale.ROOT))) {
                return true;
            }
        }
        return false;
    }

    private String firstName(User user) {
        if (user.getName() == null || user.getName().isBlank()) {
            return "there";
        }
        return user.getName().trim().split("\\s+")[0];
    }

    public void recordFeedback(Long messageId, Boolean isHelpful, String feedbackText) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        message.setIsHelpful(isHelpful);
        message.setFeedback(feedbackText);
        chatMessageRepository.save(message);

        log.info("Feedback recorded for message {}: helpful={}, feedback={}", messageId, isHelpful, feedbackText);
    }

    public List<ChatMessageDTO> getChatHistory(Long userId, Long courseId) {
        if (courseId != null && courseId > 0) {
            return chatMessageRepository.findCourseMessages(userId, courseId)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            return chatMessageRepository.findLatestMessagesForUser(userId)
                    .stream()
                    .map(this::convertToDTO)
                    .limit(50)
                    .collect(Collectors.toList());
        }
    }

    private ChatMessageDTO convertToDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .userId(message.getUser().getId())
                .courseId(message.getCourse() != null ? message.getCourse().getId() : null)
                .userMessage(message.getUserMessage())
                .botResponse(message.getBotResponse())
                .messageType(message.getMessageType())
                .createdAt(message.getCreatedAt())
                .isHelpful(message.getIsHelpful())
                .feedback(message.getFeedback())
                .build();
    }

    private ChatMessageDTO createEphemeralResponse(Long userId, Long courseId, String userMessage, String botResponse, String messageType) {
        return ChatMessageDTO.builder()
                .userId(userId)
                .courseId(courseId)
                .userMessage(userMessage)
                .botResponse(botResponse)
                .messageType(messageType)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
