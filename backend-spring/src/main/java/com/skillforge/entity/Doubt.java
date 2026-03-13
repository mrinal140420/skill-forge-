package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Doubt Entity - Represents student queries/doubts linked to courses
 * 
 * Enables students to ask questions, and admins to reply
 * Status: OPEN (pending), RESOLVED, CLOSED
 */
@Entity
@Table(name = "doubts", indexes = {
    @Index(columnList = "student_id"),
    @Index(columnList = "course_id"),
    @Index(columnList = "status")
})
public class Doubt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /**
     * Optional module ID to provide context (JSON-like reference)
     * e.g., "mod_1", "mod_2"
     */
    @Column(length = 100)
    private String moduleId;

    /**
     * Topic or title of the doubt
     */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Detailed description of the doubt
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * Status: OPEN, RESOLVED, CLOSED
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoubtStatus status;

    /**
     * Reply from admin (if any)
     */
    @Column(columnDefinition = "TEXT")
    private String adminReply;

    /**
     * Admin who replied to this doubt
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "replied_by_admin_id")
    private User repliedByAdmin;

    /**
     * When the doubt was replied to
     */
    @Column
    private LocalDateTime repliedAt;

    /**
     * Priority level: LOW, MEDIUM, HIGH
     */
    @Enumerated(EnumType.STRING)
    @Column
    private DoubtPriority priority;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Enum definitions
    public enum DoubtStatus {
        OPEN, RESOLVED, CLOSED
    }

    public enum DoubtPriority {
        LOW, MEDIUM, HIGH
    }

    // Constructors
    public Doubt() {
    }

    public Doubt(User student, Course course, String title, String description) {
        this.student = student;
        this.course = course;
        this.title = title;
        this.description = description;
        this.status = DoubtStatus.OPEN;
        this.priority = DoubtPriority.MEDIUM;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
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

    public DoubtStatus getStatus() {
        return status;
    }

    public void setStatus(DoubtStatus status) {
        this.status = status;
    }

    public String getAdminReply() {
        return adminReply;
    }

    public void setAdminReply(String adminReply) {
        this.adminReply = adminReply;
    }

    public User getRepliedByAdmin() {
        return repliedByAdmin;
    }

    public void setRepliedByAdmin(User repliedByAdmin) {
        this.repliedByAdmin = repliedByAdmin;
    }

    public LocalDateTime getRepliedAt() {
        return repliedAt;
    }

    public void setRepliedAt(LocalDateTime repliedAt) {
        this.repliedAt = repliedAt;
    }

    public DoubtPriority getPriority() {
        return priority;
    }

    public void setPriority(DoubtPriority priority) {
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

    // Builder pattern
    public static DoubtBuilder builder() {
        return new DoubtBuilder();
    }

    public static class DoubtBuilder {
        private User student;
        private Course course;
        private String moduleId;
        private String title;
        private String description;
        private DoubtStatus status;
        private String adminReply;
        private User repliedByAdmin;
        private LocalDateTime repliedAt;
        private DoubtPriority priority;

        public DoubtBuilder student(User student) {
            this.student = student;
            return this;
        }

        public DoubtBuilder course(Course course) {
            this.course = course;
            return this;
        }

        public DoubtBuilder moduleId(String moduleId) {
            this.moduleId = moduleId;
            return this;
        }

        public DoubtBuilder title(String title) {
            this.title = title;
            return this;
        }

        public DoubtBuilder description(String description) {
            this.description = description;
            return this;
        }

        public DoubtBuilder status(DoubtStatus status) {
            this.status = status;
            return this;
        }

        public DoubtBuilder adminReply(String adminReply) {
            this.adminReply = adminReply;
            return this;
        }

        public DoubtBuilder repliedByAdmin(User repliedByAdmin) {
            this.repliedByAdmin = repliedByAdmin;
            return this;
        }

        public DoubtBuilder repliedAt(LocalDateTime repliedAt) {
            this.repliedAt = repliedAt;
            return this;
        }

        public DoubtBuilder priority(DoubtPriority priority) {
            this.priority = priority;
            return this;
        }

        public Doubt build() {
            Doubt doubt = new Doubt();
            doubt.student = this.student;
            doubt.course = this.course;
            doubt.moduleId = this.moduleId;
            doubt.title = this.title;
            doubt.description = this.description;
            doubt.status = this.status;
            doubt.adminReply = this.adminReply;
            doubt.repliedByAdmin = this.repliedByAdmin;
            doubt.repliedAt = this.repliedAt;
            doubt.priority = this.priority;
            return doubt;
        }
    }
}
