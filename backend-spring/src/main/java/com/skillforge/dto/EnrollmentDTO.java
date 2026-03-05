package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

/**
 * EnrollmentDTO - Data Transfer Object for Enrollment entity
 * Returns enrollment details with populated course information.
 * 
 * Matches Express backend response structure exactly.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EnrollmentDTO {
    
    @JsonProperty("_id")
    private Long id;
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("courseId")
    private CourseDTO courseId;  // Populated course data
    
    private String status;  // active or completed
    private LocalDateTime enrolledAt;
    private LocalDateTime updatedAt;
    
    public EnrollmentDTO() {}
    
    public EnrollmentDTO(Long id, Long userId, CourseDTO courseId, String status, LocalDateTime enrolledAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.status = status;
        this.enrolledAt = enrolledAt;
        this.updatedAt = updatedAt;
    }
    
    public static EnrollmentDTOBuilder builder() {
        return new EnrollmentDTOBuilder();
    }
    
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
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }
    
    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public static class EnrollmentDTOBuilder {
        private Long id;
        private Long userId;
        private CourseDTO courseId;
        private String status;
        private LocalDateTime enrolledAt;
        private LocalDateTime updatedAt;
        
        public EnrollmentDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }
        
        public EnrollmentDTOBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }
        
        public EnrollmentDTOBuilder courseId(CourseDTO courseId) {
            this.courseId = courseId;
            return this;
        }
        
        public EnrollmentDTOBuilder status(String status) {
            this.status = status;
            return this;
        }
        
        public EnrollmentDTOBuilder enrolledAt(LocalDateTime enrolledAt) {
            this.enrolledAt = enrolledAt;
            return this;
        }
        
        public EnrollmentDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }
        
        public EnrollmentDTO build() {
            return new EnrollmentDTO(this.id, this.userId, this.courseId, this.status, this.enrolledAt, this.updatedAt);
        }
    }
}
