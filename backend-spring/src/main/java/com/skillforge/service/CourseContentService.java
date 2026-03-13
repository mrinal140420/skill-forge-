package com.skillforge.service;

import com.skillforge.dto.TopicDTO;
import com.skillforge.dto.LessonDTO;
import com.skillforge.dto.LessonResourceDTO;
import com.skillforge.entity.*;
import com.skillforge.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Course Content Service - Manages topics, lessons, and resources for courses
 */
@Service
public class CourseContentService {

    private static final Logger log = LoggerFactory.getLogger(CourseContentService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TopicRepository topicRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private LessonResourceRepository lessonResourceRepository;

    // ============ TOPIC OPERATIONS ============

    /**
     * Get all topics for a course
     */
    public List<TopicDTO> getTopicsForCourse(Long courseId) {
        return topicRepository.findByCourseIdOrderByOrderIndex(courseId).stream()
                .map(this::convertTopicToDto)
                .collect(Collectors.toList());
    }

    public List<String> getTopicTitlesForCourse(Long courseId) {
        return topicRepository.findByCourseIdOrderByOrderIndex(courseId).stream()
                .map(Topic::getTitle)
                .collect(Collectors.toList());
    }

    /**
     * Create a new topic
     */
    public TopicDTO createTopic(Long courseId, String title, String description, Integer orderIndex) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Topic topic = new Topic(course, title, description, orderIndex);
        Topic savedTopic = topicRepository.save(topic);
        log.info("Created topic: {} in course {}", title, courseId);

        return convertTopicToDto(savedTopic);
    }

    /**
     * Update a topic
     */
    public TopicDTO updateTopic(Long topicId, String title, String description, Integer orderIndex) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found"));

        if (title != null) topic.setTitle(title);
        if (description != null) topic.setDescription(description);
        if (orderIndex != null) topic.setOrderIndex(orderIndex);

        Topic updatedTopic = topicRepository.save(topic);
        log.info("Updated topic: {}", topicId);

        return convertTopicToDto(updatedTopic);
    }

    /**
     * Delete a topic and all its lessons
     */
    public void deleteTopic(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found"));

        topicRepository.delete(topic);
        log.info("Deleted topic: {}", topicId);
    }

    // ============ LESSON OPERATIONS ============

    /**
     * Get all lessons for a topic
     */
    public List<LessonDTO> getLessonsForTopic(Long topicId) {
        return lessonRepository.findByTopicIdOrderByOrderIndex(topicId).stream()
                .map(this::convertLessonToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new lesson
     */
    public LessonDTO createLesson(Long topicId, String title, String description, 
                                  Integer orderIndex, Integer durationMinutes) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new IllegalArgumentException("Topic not found"));

        Lesson lesson = new Lesson(topic, title, description, orderIndex, durationMinutes);
        Lesson savedLesson = lessonRepository.save(lesson);
        log.info("Created lesson: {} in topic {}", title, topicId);

        return convertLessonToDto(savedLesson);
    }

    /**
     * Update a lesson
     */
    public LessonDTO updateLesson(Long lessonId, String title, String description, 
                                  Integer orderIndex, Integer durationMinutes) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        if (title != null) lesson.setTitle(title);
        if (description != null) lesson.setDescription(description);
        if (orderIndex != null) lesson.setOrderIndex(orderIndex);
        if (durationMinutes != null) lesson.setDurationMinutes(durationMinutes);

        Lesson updatedLesson = lessonRepository.save(lesson);
        log.info("Updated lesson: {}", lessonId);

        return convertLessonToDto(updatedLesson);
    }

    /**
     * Delete a lesson and all its resources
     */
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        lessonRepository.delete(lesson);
        log.info("Deleted lesson: {}", lessonId);
    }

    // ============ RESOURCE OPERATIONS ============

    /**
     * Get all resources for a lesson
     */
    public List<LessonResourceDTO> getResourcesForLesson(Long lessonId) {
        return lessonResourceRepository.findByLessonIdOrderByOrderIndex(lessonId).stream()
                .filter(r -> r.getIsVisible())
                .map(this::convertResourceToDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a new resource (video, notes, image, etc.)
     */
    public LessonResourceDTO createResource(Long lessonId, String title, String description, 
                                           String type, String contentUrl, Integer orderIndex,
                                           Integer durationMinutes, Long fileSizeBytes) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));

        LessonResource.ResourceType resourceType;
        try {
            resourceType = LessonResource.ResourceType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid resource type: " + type);
        }

        LessonResource resource = new LessonResource(lesson, title, description, resourceType, contentUrl, orderIndex);
        if (durationMinutes != null) resource.setDurationMinutes(durationMinutes);
        if (fileSizeBytes != null) resource.setFileSizeBytes(fileSizeBytes);

        LessonResource savedResource = lessonResourceRepository.save(resource);
        log.info("Created resource: {} in lesson {}", title, lessonId);

        return convertResourceToDto(savedResource);
    }

    /**
     * Update a resource
     */
    public LessonResourceDTO updateResource(Long resourceId, String title, String description,
                                           String type, String contentUrl, Integer orderIndex,
                                           Integer durationMinutes, Long fileSizeBytes, Boolean isVisible) {
        LessonResource resource = lessonResourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (title != null) resource.setTitle(title);
        if (description != null) resource.setDescription(description);
        if (type != null) {
            try {
                resource.setType(LessonResource.ResourceType.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid resource type: " + type);
            }
        }
        if (contentUrl != null) resource.setContentUrl(contentUrl);
        if (orderIndex != null) resource.setOrderIndex(orderIndex);
        if (durationMinutes != null) resource.setDurationMinutes(durationMinutes);
        if (fileSizeBytes != null) resource.setFileSizeBytes(fileSizeBytes);
        if (isVisible != null) resource.setIsVisible(isVisible);

        LessonResource updatedResource = lessonResourceRepository.save(resource);
        log.info("Updated resource: {}", resourceId);

        return convertResourceToDto(updatedResource);
    }

    /**
     * Delete a resource
     */
    public void deleteResource(Long resourceId) {
        LessonResource resource = lessonResourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        lessonResourceRepository.delete(resource);
        log.info("Deleted resource: {}", resourceId);
    }

    // ============ CONVERSION HELPERS ============

    private TopicDTO convertTopicToDto(Topic topic) {
        List<LessonDTO> lessons = topic.getLessons().stream()
                .map(this::convertLessonToDto)
                .collect(Collectors.toList());

        return new TopicDTO(
                topic.getId(),
                topic.getCourse().getId(),
                topic.getTitle(),
                topic.getDescription(),
                topic.getOrderIndex(),
                lessons,
                topic.getCreatedAt(),
                topic.getUpdatedAt()
        );
    }

    private LessonDTO convertLessonToDto(Lesson lesson) {
        List<LessonResourceDTO> resources = lesson.getResources().stream()
                .filter(r -> r.getIsVisible())
                .map(this::convertResourceToDto)
                .collect(Collectors.toList());

        return new LessonDTO(
                lesson.getId(),
                lesson.getTopic().getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getOrderIndex(),
                lesson.getDurationMinutes(),
                resources,
                lesson.getCreatedAt(),
                lesson.getUpdatedAt()
        );
    }

    private LessonResourceDTO convertResourceToDto(LessonResource resource) {
        return new LessonResourceDTO(
                resource.getId(),
                resource.getLesson().getId(),
                resource.getTitle(),
                resource.getDescription(),
                resource.getType().toString(),
                resource.getContentUrl(),
                resource.getOrderIndex(),
                resource.getDurationMinutes(),
                resource.getFileSizeBytes(),
                resource.getIsVisible(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }
}
