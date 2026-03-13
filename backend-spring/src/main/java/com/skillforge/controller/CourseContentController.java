package com.skillforge.controller;

import com.skillforge.dto.TopicDTO;
import com.skillforge.dto.LessonDTO;
import com.skillforge.dto.LessonResourceDTO;
import com.skillforge.entity.User;
import com.skillforge.service.CourseContentService;
import com.skillforge.security.AuthorizationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Course Content Controller - Handles topics, lessons, and resources
 * 
 * Endpoints:
 * - GET /api/courses/{courseId}/topics - Get all topics for a course
 * - POST /api/courses/{courseId}/topics - Create a topic (admin only)
 * - PUT /api/topics/{topicId} - Update a topic (admin only)
 * - DELETE /api/topics/{topicId} - Delete a topic (admin only)
 * 
 * - GET /api/topics/{topicId}/lessons - Get all lessons for a topic
 * - POST /api/topics/{topicId}/lessons - Create a lesson (admin only)
 * - PUT /api/lessons/{lessonId} - Update a lesson (admin only)
 * - DELETE /api/lessons/{lessonId} - Delete a lesson (admin only)
 * 
 * - GET /api/lessons/{lessonId}/resources - Get all resources for a lesson
 * - POST /api/lessons/{lessonId}/resources - Add a resource (admin only)
 * - PUT /api/resources/{resourceId} - Update a resource (admin only)
 * - DELETE /api/resources/{resourceId} - Delete a resource (admin only)
 */
@RestController
@RequestMapping("/api/content")
@Tag(name = "Course Content", description = "Topics, lessons, and learning resources")
@SecurityRequirement(name = "Bearer Authentication")
public class CourseContentController {

    private static final Logger log = LoggerFactory.getLogger(CourseContentController.class);

    @Autowired
    private CourseContentService contentService;

    @Autowired
    private AuthorizationUtil authorizationUtil;

    // ============ TOPIC ENDPOINTS ============

    @GetMapping("/courses/{courseId}/topics")
    @Operation(summary = "Get topics for course")
    public ResponseEntity<?> getTopicsForCourse(@PathVariable Long courseId) {
        try {
            List<TopicDTO> topics = contentService.getTopicsForCourse(courseId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", topics.size());
            response.put("topics", topics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching topics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch topics"));
        }
    }

    @PostMapping("/courses/{courseId}/topics")
    @Operation(summary = "Create topic in course (admin only)")
    public ResponseEntity<?> createTopic(
            @PathVariable Long courseId,
            @RequestBody CreateTopicRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.canManageCourse(user, courseId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - cannot manage this course"));
            }

            TopicDTO topic = contentService.createTopic(courseId, request.getTitle(), 
                    request.getDescription(), request.getOrderIndex());
            return ResponseEntity.status(HttpStatus.CREATED).body(topic);
        } catch (Exception e) {
            log.error("Error creating topic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/topics/{topicId}")
    @Operation(summary = "Update topic (admin only)")
    public ResponseEntity<?> updateTopic(
            @PathVariable Long topicId,
            @RequestBody UpdateTopicRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            TopicDTO topic = contentService.updateTopic(topicId, request.getTitle(), 
                    request.getDescription(), request.getOrderIndex());
            return ResponseEntity.ok(topic);
        } catch (Exception e) {
            log.error("Error updating topic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/topics/{topicId}")
    @Operation(summary = "Delete topic (admin only)")
    public ResponseEntity<?> deleteTopic(@PathVariable Long topicId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            contentService.deleteTopic(topicId);
            return ResponseEntity.ok(new MessageResponse("Topic deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting topic", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // ============ LESSON ENDPOINTS ============

    @GetMapping("/topics/{topicId}/lessons")
    @Operation(summary = "Get lessons for topic")
    public ResponseEntity<?> getLessonsForTopic(@PathVariable Long topicId) {
        try {
            List<LessonDTO> lessons = contentService.getLessonsForTopic(topicId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", lessons.size());
            response.put("lessons", lessons);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching lessons", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch lessons"));
        }
    }

    @PostMapping("/topics/{topicId}/lessons")
    @Operation(summary = "Create lesson in topic (admin only)")
    public ResponseEntity<?> createLesson(
            @PathVariable Long topicId,
            @RequestBody CreateLessonRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            LessonDTO lesson = contentService.createLesson(topicId, request.getTitle(),
                    request.getDescription(), request.getOrderIndex(), request.getDurationMinutes());
            return ResponseEntity.status(HttpStatus.CREATED).body(lesson);
        } catch (Exception e) {
            log.error("Error creating lesson", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/lessons/{lessonId}")
    @Operation(summary = "Update lesson (admin only)")
    public ResponseEntity<?> updateLesson(
            @PathVariable Long lessonId,
            @RequestBody UpdateLessonRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            LessonDTO lesson = contentService.updateLesson(lessonId, request.getTitle(),
                    request.getDescription(), request.getOrderIndex(), request.getDurationMinutes());
            return ResponseEntity.ok(lesson);
        } catch (Exception e) {
            log.error("Error updating lesson", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/lessons/{lessonId}")
    @Operation(summary = "Delete lesson (admin only)")
    public ResponseEntity<?> deleteLesson(@PathVariable Long lessonId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            contentService.deleteLesson(lessonId);
            return ResponseEntity.ok(new MessageResponse("Lesson deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting lesson", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // ============ RESOURCE ENDPOINTS ============

    @GetMapping("/lessons/{lessonId}/resources")
    @Operation(summary = "Get resources for lesson (visible to students)")
    public ResponseEntity<?> getResourcesForLesson(@PathVariable Long lessonId) {
        try {
            List<LessonResourceDTO> resources = contentService.getResourcesForLesson(lessonId);
            Map<String, Object> response = new HashMap<>();
            response.put("count", resources.size());
            response.put("resources", resources);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching resources", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch resources"));
        }
    }

    @PostMapping("/lessons/{lessonId}/resources")
    @Operation(summary = "Add resource to lesson (admin only)")
    public ResponseEntity<?> createResource(
            @PathVariable Long lessonId,
            @RequestBody CreateResourceRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            LessonResourceDTO resource = contentService.createResource(lessonId, request.getTitle(),
                    request.getDescription(), request.getType(), request.getContentUrl(),
                    request.getOrderIndex(), request.getDurationMinutes(), request.getFileSizeBytes());
            return ResponseEntity.status(HttpStatus.CREATED).body(resource);
        } catch (Exception e) {
            log.error("Error creating resource", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PutMapping("/resources/{resourceId}")
    @Operation(summary = "Update resource (admin only)")
    public ResponseEntity<?> updateResource(
            @PathVariable Long resourceId,
            @RequestBody UpdateResourceRequest request) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            LessonResourceDTO resource = contentService.updateResource(resourceId, request.getTitle(),
                    request.getDescription(), request.getType(), request.getContentUrl(),
                    request.getOrderIndex(), request.getDurationMinutes(), request.getFileSizeBytes(),
                    request.getIsVisible());
            return ResponseEntity.ok(resource);
        } catch (Exception e) {
            log.error("Error updating resource", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/resources/{resourceId}")
    @Operation(summary = "Delete resource (admin only)")
    public ResponseEntity<?> deleteResource(@PathVariable Long resourceId) {
        try {
            User user = getCurrentUser();
            if (user == null || !authorizationUtil.isAdmin(user)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("Forbidden - admin access required"));
            }

            contentService.deleteResource(resourceId);
            return ResponseEntity.ok(new MessageResponse("Resource deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting resource", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // ============ HELPER METHODS ============

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        if (auth.getDetails() instanceof User user) {
            return user;
        }
        return null;
    }

    // ============ REQUEST/RESPONSE DTOs ============

    public static class CreateTopicRequest {
        private String title;
        private String description;
        private Integer orderIndex;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public Integer getOrderIndex() { return orderIndex; }
    }

    public static class UpdateTopicRequest {
        private String title;
        private String description;
        private Integer orderIndex;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public Integer getOrderIndex() { return orderIndex; }
    }

    public static class CreateLessonRequest {
        private String title;
        private String description;
        private Integer orderIndex;
        private Integer durationMinutes;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public Integer getOrderIndex() { return orderIndex; }
        public Integer getDurationMinutes() { return durationMinutes; }
    }

    public static class UpdateLessonRequest {
        private String title;
        private String description;
        private Integer orderIndex;
        private Integer durationMinutes;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public Integer getOrderIndex() { return orderIndex; }
        public Integer getDurationMinutes() { return durationMinutes; }
    }

    public static class CreateResourceRequest {
        private String title;
        private String description;
        private String type;
        private String contentUrl;
        private Integer orderIndex;
        private Integer durationMinutes;
        private Long fileSizeBytes;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getType() { return type; }
        public String getContentUrl() { return contentUrl; }
        public Integer getOrderIndex() { return orderIndex; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public Long getFileSizeBytes() { return fileSizeBytes; }
    }

    public static class UpdateResourceRequest {
        private String title;
        private String description;
        private String type;
        private String contentUrl;
        private Integer orderIndex;
        private Integer durationMinutes;
        private Long fileSizeBytes;
        private Boolean isVisible;

        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getType() { return type; }
        public String getContentUrl() { return contentUrl; }
        public Integer getOrderIndex() { return orderIndex; }
        public Integer getDurationMinutes() { return durationMinutes; }
        public Long getFileSizeBytes() { return fileSizeBytes; }
        public Boolean getIsVisible() { return isVisible; }
    }

    public static class MessageResponse {
        private String message;

        public MessageResponse(String message) {
            this.message = message;
        }

        public String getMessage() { return message; }
    }

    public static class ErrorResponse {
        private String error;

        public ErrorResponse(String error) {
            this.error = error;
        }

        public String getError() { return error; }
    }
}
