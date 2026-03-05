package com.skillforge.models;

import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;
    
    @Column(columnDefinition = "TEXT")
    private String userMessage;
    
    @Column(columnDefinition = "TEXT")
    private String botResponse;
    
    @Column(name = "message_type")
    private String messageType; // "question", "clarification", "example_request"
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "is_helpful")
    private Boolean isHelpful;
    
    @Column(name = "feedback")
    private String feedback;
    
    public ChatMessage() {}
    
    public ChatMessage(User user, String userMessage, String botResponse, LocalDateTime createdAt) {
        this.user = user;
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.createdAt = createdAt;
        this.messageType = "question";
    }
    
    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public Course getCourse() { return course; }
    public String getUserMessage() { return userMessage; }
    public String getBotResponse() { return botResponse; }
    public String getMessageType() { return messageType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Boolean getIsHelpful() { return isHelpful; }
    public String getFeedback() { return feedback; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setCourse(Course course) { this.course = course; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
    public void setBotResponse(String botResponse) { this.botResponse = botResponse; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setIsHelpful(Boolean isHelpful) { this.isHelpful = isHelpful; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
