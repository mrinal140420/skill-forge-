package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Enrollment Entity - Maps to PostgreSQL enrollments table
 * Replaces MongoDB Enrollment schema.
 * 
 * Represents a user's enrollment in a course with status tracking.
 * Enforces unique (userId, courseId) constraint to prevent duplicate enrollments.
 */
@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "course_id"}, name = "uk_enrollments_user_course")
})
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;

    @CreationTimestamp
    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public Enrollment() {
    }

    public Enrollment(User user, Course course, EnrollmentStatus status) {
        this.user = user;
        this.course = course;
        this.status = status;
    }

    public Enrollment(Long id, User user, Course course, EnrollmentStatus status, LocalDateTime enrolledAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.course = course;
        this.status = status;
        this.enrolledAt = enrolledAt;
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

    public EnrollmentStatus getStatus() {
        return status;
    }

    public void setStatus(EnrollmentStatus status) {
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

    /**
     * Enrollment Status enum - matches original MongoDB schema
     */
    public enum EnrollmentStatus {
        active, completed
    }

    // Builder pattern
    public static EnrollmentBuilder builder() {
        return new EnrollmentBuilder();
    }

    public static class EnrollmentBuilder {
        private Long id;
        private User user;
        private Course course;
        private EnrollmentStatus status;
        private LocalDateTime enrolledAt;
        private LocalDateTime updatedAt;

        public EnrollmentBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public EnrollmentBuilder user(User user) {
            this.user = user;
            return this;
        }

        public EnrollmentBuilder course(Course course) {
            this.course = course;
            return this;
        }

        public EnrollmentBuilder status(EnrollmentStatus status) {
            this.status = status;
            return this;
        }

        public EnrollmentBuilder enrolledAt(LocalDateTime enrolledAt) {
            this.enrolledAt = enrolledAt;
            return this;
        }

        public EnrollmentBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Enrollment build() {
            Enrollment enrollment = new Enrollment();
            enrollment.id = this.id;
            enrollment.user = this.user;
            enrollment.course = this.course;
            enrollment.status = this.status;
            enrollment.enrolledAt = this.enrolledAt;
            enrollment.updatedAt = this.updatedAt;
            return enrollment;
        }
    }
}
