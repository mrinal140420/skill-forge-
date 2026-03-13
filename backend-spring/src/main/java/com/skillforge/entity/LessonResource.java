package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * LessonResource Entity - Represents study materials for a lesson
 * Types: VIDEO, NOTES, IMAGE, PDF, CODE_SNIPPET
 */
@Entity
@Table(name = "lesson_resources")
public class LessonResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    /**
     * URL or path to the resource
     * For videos: YouTube URL or S3 URL
     * For notes: Text content or S3 PDF URL
     * For images: S3 URL
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String contentUrl;

    /**
     * Order of display within the lesson
     */
    @Column(nullable = false)
    private Integer orderIndex;

    /**
     * Optional: Duration in minutes (for videos)
     */
    @Column(columnDefinition = "INTEGER DEFAULT 0")
    private Integer durationMinutes;

    /**
     * Optional: File size in bytes
     */
    @Column(columnDefinition = "BIGINT DEFAULT 0")
    private Long fileSizeBytes;

    /**
     * Whether this resource is published/visible to students
     */
    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean isVisible;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Resource Type Enum
    public enum ResourceType {
        VIDEO("Video Lecture"),
        NOTES("Study Notes"),
        IMAGE("Image/Diagram"),
        PDF("PDF Document"),
        CODE_SNIPPET("Code Example"),
        ARTICLE("Article/Blog"),
        LINK("External Link");

        private final String displayName;

        ResourceType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Constructors
    public LessonResource() {
    }

    public LessonResource(Lesson lesson, String title, String description, ResourceType type, 
                         String contentUrl, Integer orderIndex) {
        this.lesson = lesson;
        this.title = title;
        this.description = description;
        this.type = type;
        this.contentUrl = contentUrl;
        this.orderIndex = orderIndex;
        this.isVisible = true;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Lesson getLesson() {
        return lesson;
    }

    public void setLesson(Lesson lesson) {
        this.lesson = lesson;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public String getContentUrl() {
        return contentUrl;
    }

    public void setContentUrl(String contentUrl) {
        this.contentUrl = contentUrl;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(Long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
