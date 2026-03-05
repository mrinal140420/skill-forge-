package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ProgressDTO - Data Transfer Object for Progress entity
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgressDTO {
    
    @JsonProperty("_id")
    private Long id;
    
    private Long userId;
    private CourseDTO courseId;  // Populated course data
    private String moduleId;
    private Boolean completed;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ProgressDTO() {
    }

    public ProgressDTO(Long id, Long userId, CourseDTO courseId, String moduleId, Boolean completed,
                       LocalDateTime completedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.moduleId = moduleId;
        this.completed = completed;
        this.completedAt = completedAt;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public CourseDTO getCourseId() {
        return courseId;
    }

    public void setCourseId(CourseDTO courseId) {
        this.courseId = courseId;
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
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

    // Builder pattern
    public static ProgressDTOBuilder builder() {
        return new ProgressDTOBuilder();
    }

    public static class ProgressDTOBuilder {
        private Long id;
        private Long userId;
        private CourseDTO courseId;
        private String moduleId;
        private Boolean completed;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProgressDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ProgressDTOBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public ProgressDTOBuilder courseId(CourseDTO courseId) {
            this.courseId = courseId;
            return this;
        }

        public ProgressDTOBuilder moduleId(String moduleId) {
            this.moduleId = moduleId;
            return this;
        }

        public ProgressDTOBuilder completed(Boolean completed) {
            this.completed = completed;
            return this;
        }

        public ProgressDTOBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public ProgressDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ProgressDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ProgressDTO build() {
            return new ProgressDTO(id, userId, courseId, moduleId, completed, completedAt, createdAt, updatedAt);
        }
    }
}

/**
 * Progress Summary DTO - Groups progress by course with overall metrics
 * Returned by GET /api/progress/me endpoint
 */
class ProgressSummaryDTO {
    private CourseDTO course;
    private Integer totalModules;
    private Integer completedModules;
    private Double completionPercentage;
    private List<ProgressDTO> modules;

    // Constructors
    public ProgressSummaryDTO() {
    }

    public ProgressSummaryDTO(CourseDTO course, Integer totalModules, Integer completedModules,
                              Double completionPercentage, List<ProgressDTO> modules) {
        this.course = course;
        this.totalModules = totalModules;
        this.completedModules = completedModules;
        this.completionPercentage = completionPercentage;
        this.modules = modules;
    }

    // Getters and Setters
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

    // Builder pattern
    public static ProgressSummaryDTOBuilder builder() {
        return new ProgressSummaryDTOBuilder();
    }

    public static class ProgressSummaryDTOBuilder {
        private CourseDTO course;
        private Integer totalModules;
        private Integer completedModules;
        private Double completionPercentage;
        private List<ProgressDTO> modules;

        public ProgressSummaryDTOBuilder course(CourseDTO course) {
            this.course = course;
            return this;
        }

        public ProgressSummaryDTOBuilder totalModules(Integer totalModules) {
            this.totalModules = totalModules;
            return this;
        }

        public ProgressSummaryDTOBuilder completedModules(Integer completedModules) {
            this.completedModules = completedModules;
            return this;
        }

        public ProgressSummaryDTOBuilder completionPercentage(Double completionPercentage) {
            this.completionPercentage = completionPercentage;
            return this;
        }

        public ProgressSummaryDTOBuilder modules(List<ProgressDTO> modules) {
            this.modules = modules;
            return this;
        }

        public ProgressSummaryDTO build() {
            return new ProgressSummaryDTO(course, totalModules, completedModules, completionPercentage, modules);
        }
    }
}
