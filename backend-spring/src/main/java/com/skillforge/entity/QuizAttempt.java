package com.skillforge.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * QuizAttempt Entity - Maps to PostgreSQL quiz_attempts table
 * Replaces MongoDB QuizAttempt schema.
 * 
 * Records each quiz attempt with score, time taken, and pass/fail status.
 * Used for tracking student assessment results and progress metrics.
 */
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {

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
     * Module ID as string (same rationale as Progress entity)
     */
    @Column(nullable = false, length = 200)
    private String moduleId;

    /**
     * Quiz score out of 100
     * Calculated from correct answers submitted in the quiz request
     */
    @Column(nullable = false)
    private Integer score;

    /**
     * Time taken to complete quiz in seconds
     */
    @Column(nullable = false)
    private Long timeTakenSec;

    /**
     * Determined by: score >= 60 means passed
     * Matches original Express scoring logic
     */
    @Column(nullable = false)
    private Boolean passed;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public QuizAttempt() {
    }

    public QuizAttempt(User user, Course course, String moduleId, Integer score, Long timeTakenSec, Boolean passed) {
        this.user = user;
        this.course = course;
        this.moduleId = moduleId;
        this.score = score;
        this.timeTakenSec = timeTakenSec;
        this.passed = passed;
    }

    public QuizAttempt(Long id, User user, Course course, String moduleId, Integer score, Long timeTakenSec, Boolean passed, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.course = course;
        this.moduleId = moduleId;
        this.score = score;
        this.timeTakenSec = timeTakenSec;
        this.passed = passed;
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

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Long getTimeTakenSec() {
        return timeTakenSec;
    }

    public void setTimeTakenSec(Long timeTakenSec) {
        this.timeTakenSec = timeTakenSec;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
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
    public static QuizAttemptBuilder builder() {
        return new QuizAttemptBuilder();
    }

    public static class QuizAttemptBuilder {
        private Long id;
        private User user;
        private Course course;
        private String moduleId;
        private Integer score;
        private Long timeTakenSec;
        private Boolean passed;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public QuizAttemptBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public QuizAttemptBuilder user(User user) {
            this.user = user;
            return this;
        }

        public QuizAttemptBuilder course(Course course) {
            this.course = course;
            return this;
        }

        public QuizAttemptBuilder moduleId(String moduleId) {
            this.moduleId = moduleId;
            return this;
        }

        public QuizAttemptBuilder score(Integer score) {
            this.score = score;
            return this;
        }

        public QuizAttemptBuilder timeTakenSec(Long timeTakenSec) {
            this.timeTakenSec = timeTakenSec;
            return this;
        }

        public QuizAttemptBuilder passed(Boolean passed) {
            this.passed = passed;
            return this;
        }

        public QuizAttemptBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public QuizAttemptBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public QuizAttempt build() {
            QuizAttempt quizAttempt = new QuizAttempt();
            quizAttempt.id = this.id;
            quizAttempt.user = this.user;
            quizAttempt.course = this.course;
            quizAttempt.moduleId = this.moduleId;
            quizAttempt.score = this.score;
            quizAttempt.timeTakenSec = this.timeTakenSec;
            quizAttempt.passed = this.passed;
            quizAttempt.createdAt = this.createdAt;
            quizAttempt.updatedAt = this.updatedAt;
            return quizAttempt;
        }
    }
}
