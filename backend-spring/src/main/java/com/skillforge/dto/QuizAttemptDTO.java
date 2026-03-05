package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * QuizAttemptDTO - Data Transfer Object for QuizAttempt entity
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizAttemptDTO {
    
    private Long id;
    private Long userId;
    private Long courseId;
    private String moduleId;
    private Integer score;
    private Long timeTakenSec;
    private Boolean passed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public QuizAttemptDTO() {
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getCourseId() { return courseId; }
    public String getModuleId() { return moduleId; }
    public Integer getScore() { return score; }
    public Long getTimeTakenSec() { return timeTakenSec; }
    public Boolean getPassed() { return passed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    public void setScore(Integer score) { this.score = score; }
    public void setTimeTakenSec(Long timeTakenSec) { this.timeTakenSec = timeTakenSec; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

/**
 * Quiz Submission Request DTO
 * Matches request body structure from POST /api/quiz/submit
 */
class QuizSubmitRequestDTO {
    private String courseId;
    private String moduleId;
    private List<Boolean> answers;  // Array of correct/incorrect answers
    private Long timeTakenSec;
    
    public QuizSubmitRequestDTO() {}
    
    public QuizSubmitRequestDTO(String courseId, String moduleId, List<Boolean> answers, Long timeTakenSec) {
        this.courseId = courseId;
        this.moduleId = moduleId;
        this.answers = answers;
        this.timeTakenSec = timeTakenSec;
    }
    
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    
    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }
    
    public List<Boolean> getAnswers() { return answers; }
    public void setAnswers(List<Boolean> answers) { this.answers = answers; }
    
    public Long getTimeTakenSec() { return timeTakenSec; }
    public void setTimeTakenSec(Long timeTakenSec) { this.timeTakenSec = timeTakenSec; }
}

/**
 * Quiz Submission Response DTO
 * Returned after successful quiz submission
 */
class QuizSubmitResponseDTO {
    private Integer score;
    private Boolean passed;
    private String feedback;
    private QuizAttemptDTO attempt;
    
    public QuizSubmitResponseDTO() {}
    
    public QuizSubmitResponseDTO(Integer score, Boolean passed, String feedback, QuizAttemptDTO attempt) {
        this.score = score;
        this.passed = passed;
        this.feedback = feedback;
        this.attempt = attempt;
    }
    
    public static QuizSubmitResponseDTOBuilder builder() {
        return new QuizSubmitResponseDTOBuilder();
    }
    
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    
    public Boolean getPassed() { return passed; }
    public void setPassed(Boolean passed) { this.passed = passed; }
    
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    
    public QuizAttemptDTO getAttempt() { return attempt; }
    public void setAttempt(QuizAttemptDTO attempt) { this.attempt = attempt; }
    
    public static class QuizSubmitResponseDTOBuilder {
        private Integer score;
        private Boolean passed;
        private String feedback;
        private QuizAttemptDTO attempt;
        
        public QuizSubmitResponseDTOBuilder score(Integer score) {
            this.score = score;
            return this;
        }
        
        public QuizSubmitResponseDTOBuilder passed(Boolean passed) {
            this.passed = passed;
            return this;
        }
        
        public QuizSubmitResponseDTOBuilder feedback(String feedback) {
            this.feedback = feedback;
            return this;
        }
        
        public QuizSubmitResponseDTOBuilder attempt(QuizAttemptDTO attempt) {
            this.attempt = attempt;
            return this;
        }
        
        public QuizSubmitResponseDTO build() {
            return new QuizSubmitResponseDTO(this.score, this.passed, this.feedback, this.attempt);
        }
    }
}
