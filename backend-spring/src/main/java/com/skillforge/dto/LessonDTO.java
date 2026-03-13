package com.skillforge.dto;

import java.time.LocalDateTime;
import java.util.List;

public class LessonDTO {
    private Long id;
    private Long topicId;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer durationMinutes;
    private List<LessonResourceDTO> resources;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public LessonDTO() {
    }

    public LessonDTO(Long id, Long topicId, String title, String description, Integer orderIndex,
                     Integer durationMinutes, List<LessonResourceDTO> resources, 
                     LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.topicId = topicId;
        this.title = title;
        this.description = description;
        this.orderIndex = orderIndex;
        this.durationMinutes = durationMinutes;
        this.resources = resources;
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

    public Long getTopicId() {
        return topicId;
    }

    public void setTopicId(Long topicId) {
        this.topicId = topicId;
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

    public List<LessonResourceDTO> getResources() {
        return resources;
    }

    public void setResources(List<LessonResourceDTO> resources) {
        this.resources = resources;
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
