package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Progress Entity - Maps to PostgreSQL progress table
 * Replaces MongoDB Progress schema.
 * 
 * Tracks user progress through course modules.
 * Each record represents completion status of a specific module within a course.
 */
@Entity
@Table(name = "progress")
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Module ID as string to allow flexibility in module identification
     * (could be numeric or alphanumeric based on frontend requirements)
     */
    @Column(nullable = false, length = 200)
    private String moduleId;

    @Column(nullable = false)
    private Boolean completed;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Progress() {
    }

    public Progress(User user, Course course, String moduleId, Boolean completed, LocalDateTime completedAt) {
        this.user = user;
        this.course = course;
        this.moduleId = moduleId;
        this.completed = completed;
        this.completedAt = completedAt;
    }

    public Progress(Long id, User user, Course course, String moduleId, Boolean completed, LocalDateTime completedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.course = course;
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
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
    public static ProgressBuilder builder() {
        return new ProgressBuilder();
    }

    public static class ProgressBuilder {
        private Long id;
        private User user;
        private Course course;
        private String moduleId;
        private Boolean completed;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProgressBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ProgressBuilder user(User user) {
            this.user = user;
            return this;
        }

        public ProgressBuilder course(Course course) {
            this.course = course;
            return this;
        }

        public ProgressBuilder moduleId(String moduleId) {
            this.moduleId = moduleId;
            return this;
        }

        public ProgressBuilder completed(Boolean completed) {
            this.completed = completed;
            return this;
        }

        public ProgressBuilder completedAt(LocalDateTime completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public ProgressBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ProgressBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Progress build() {
            Progress progress = new Progress();
            progress.id = this.id;
            progress.user = this.user;
            progress.course = this.course;
            progress.moduleId = this.moduleId;
            progress.completed = this.completed;
            progress.completedAt = this.completedAt;
            progress.createdAt = this.createdAt;
            progress.updatedAt = this.updatedAt;
            return progress;
        }
    }
}
