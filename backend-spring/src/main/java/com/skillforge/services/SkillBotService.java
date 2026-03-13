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
import java.util.stream.Collectors;

/**
 * SkillBot Service - AI Tutor powered by intelligent prompts
 * Provides contextual answers to student questions based on course content
 */
@Service
public class SkillBotService {
    private static final Logger log = LoggerFactory.getLogger(SkillBotService.class);
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
            botResponse = ensurePersonalized(user, course, botResponse);
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
                + "2. Keep the answer short, clear, and practical. Use at most 3 sentences.\n"
                + "3. Start with the student's first name when replying.\n"
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

    private String ensurePersonalized(User user, Course course, String response) {
        String cleaned = response == null ? "" : response.trim();
        if (cleaned.isBlank()) {
            cleaned = "Please review the current lesson material for " + course.getTitle() + " and ask me about one topic at a time.";
        }

        String firstName = firstName(user);
        if (!cleaned.toLowerCase(Locale.ROOT).startsWith(("hi " + firstName).toLowerCase(Locale.ROOT))) {
            cleaned = "Hi " + firstName + ", " + cleaned;
        }
        if (cleaned.length() > 340) {
            cleaned = cleaned.substring(0, 337).trim() + "...";
        }
        return cleaned;
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
