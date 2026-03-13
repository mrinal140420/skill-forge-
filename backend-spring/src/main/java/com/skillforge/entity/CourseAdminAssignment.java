package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * CourseAdminAssignment Entity - Maps COURSE_ADMIN users to courses they manage
 * 
 * Enables one admin to manage multiple courses
 * Supports both single-admin and multi-admin course management scenarios
 */
@Entity
@Table(name = "course_admin_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"course_id", "admin_id"})
})
public class CourseAdminAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    /**
     * Role of the admin within this course context
     * Values: COURSE_ADMIN (default)
     */
    @Column(nullable = false)
    private String role;

    /**
     * Additional permissions if needed in future
     * e.g., "can_edit_content", "can_manage_quizzes", "can_view_analytics"
     * Stored as comma-separated for simplicity
     */
    @Column(columnDefinition = "TEXT")
    private String permissions;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public CourseAdminAssignment() {
    }

    public CourseAdminAssignment(Course course, User admin, String role) {
        this.course = course;
        this.admin = admin;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPermissions() {
        return permissions;
    }

    public void setPermissions(String permissions) {
        this.permissions = permissions;
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
    public static CourseAdminAssignmentBuilder builder() {
        return new CourseAdminAssignmentBuilder();
    }

    public static class CourseAdminAssignmentBuilder {
        private Course course;
        private User admin;
        private String role;
        private String permissions;

        public CourseAdminAssignmentBuilder course(Course course) {
            this.course = course;
            return this;
        }

        public CourseAdminAssignmentBuilder admin(User admin) {
            this.admin = admin;
            return this;
        }

        public CourseAdminAssignmentBuilder role(String role) {
            this.role = role;
            return this;
        }

        public CourseAdminAssignmentBuilder permissions(String permissions) {
            this.permissions = permissions;
            return this;
        }

        public CourseAdminAssignment build() {
            CourseAdminAssignment assignment = new CourseAdminAssignment();
            assignment.course = this.course;
            assignment.admin = this.admin;
            assignment.role = this.role;
            assignment.permissions = this.permissions;
            return assignment;
        }
    }
}
