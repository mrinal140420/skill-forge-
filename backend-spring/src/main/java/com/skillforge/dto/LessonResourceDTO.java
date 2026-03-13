package com.skillforge.dto;

import com.skillforge.entity.LessonResource;
import java.time.LocalDateTime;

public class LessonResourceDTO {
    private Long id;
    private Long lessonId;
    private String title;
    private String description;
    private String type;  // VIDEO, NOTES, IMAGE, PDF, CODE_SNIPPET
    private String contentUrl;
    private Integer orderIndex;
    private Integer durationMinutes;
    private Long fileSizeBytes;
    private Boolean isVisible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public LessonResourceDTO() {
    }

    public LessonResourceDTO(Long id, Long lessonId, String title, String description, String type,
                            String contentUrl, Integer orderIndex, Integer durationMinutes, 
                            Long fileSizeBytes, Boolean isVisible, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.lessonId = lessonId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.contentUrl = contentUrl;
        this.orderIndex = orderIndex;
        this.durationMinutes = durationMinutes;
        this.fileSizeBytes = fileSizeBytes;
        this.isVisible = isVisible;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
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
