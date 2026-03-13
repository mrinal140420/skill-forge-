package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;

/**
 * Doubt DTO - Data Transfer Object for Doubt entity
 * Used for student query submissions and admin doubt management
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DoubtDTO {
    
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;
    private String courseTitle;
    private String moduleId;
    private String title;
    private String description;
    private String status;  // OPEN, RESOLVED, CLOSED
    private String adminReply;
    private Long repliedByAdminId;
    private String repliedByAdminName;
    private LocalDateTime repliedAt;
    private String priority;  // LOW, MEDIUM, HIGH
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public DoubtDTO() {
    }
    
    public DoubtDTO(Long id, Long studentId, String studentName, Long courseId, String courseTitle,
                    String title, String description, String status, String priority, LocalDateTime createdAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.courseId = courseId;
        this.courseTitle = courseTitle;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminReply() {
        return adminReply;
    }

    public void setAdminReply(String adminReply) {
        this.adminReply = adminReply;
    }

    public Long getRepliedByAdminId() {
        return repliedByAdminId;
    }

    public void setRepliedByAdminId(Long repliedByAdminId) {
        this.repliedByAdminId = repliedByAdminId;
    }

    public String getRepliedByAdminName() {
        return repliedByAdminName;
    }

    public void setRepliedByAdminName(String repliedByAdminName) {
        this.repliedByAdminName = repliedByAdminName;
    }

    public LocalDateTime getRepliedAt() {
        return repliedAt;
    }

    public void setRepliedAt(LocalDateTime repliedAt) {
        this.repliedAt = repliedAt;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
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
