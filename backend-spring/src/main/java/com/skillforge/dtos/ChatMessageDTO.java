package com.skillforge.dtos;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    
    private Long id;
    private Long userId;
    private Long courseId;
    private String userMessage;
    private String botResponse;
    private String messageType;
    private LocalDateTime createdAt;
    private Boolean isHelpful;
    private String feedback;
    
    public ChatMessageDTO() {}
    
    public ChatMessageDTO(Long userId, String userMessage, String botResponse) {
        this.userId = userId;
        this.userMessage = userMessage;
        this.botResponse = botResponse;
        this.createdAt = LocalDateTime.now();
        this.messageType = "question";
    }
    
    // Builder Pattern
    public static class ChatMessageDTOBuilder {
        private Long id;
        private Long userId;
        private Long courseId;
        private String userMessage;
        private String botResponse;
        private String messageType = "question";
        private LocalDateTime createdAt;
        private Boolean isHelpful;
        private String feedback;
        
        public ChatMessageDTOBuilder id(Long id) { this.id = id; return this; }
        public ChatMessageDTOBuilder userId(Long userId) { this.userId = userId; return this; }
        public ChatMessageDTOBuilder courseId(Long courseId) { this.courseId = courseId; return this; }
        public ChatMessageDTOBuilder userMessage(String userMessage) { this.userMessage = userMessage; return this; }
        public ChatMessageDTOBuilder botResponse(String botResponse) { this.botResponse = botResponse; return this; }
        public ChatMessageDTOBuilder messageType(String messageType) { this.messageType = messageType; return this; }
        public ChatMessageDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ChatMessageDTOBuilder isHelpful(Boolean isHelpful) { this.isHelpful = isHelpful; return this; }
        public ChatMessageDTOBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        
        public ChatMessageDTO build() {
            ChatMessageDTO dto = new ChatMessageDTO();
            dto.id = this.id;
            dto.userId = this.userId;
            dto.courseId = this.courseId;
            dto.userMessage = this.userMessage;
            dto.botResponse = this.botResponse;
            dto.messageType = this.messageType;
            dto.createdAt = this.createdAt;
            dto.isHelpful = this.isHelpful;
            dto.feedback = this.feedback;
            return dto;
        }
    }
    
    public static ChatMessageDTOBuilder builder() {
        return new ChatMessageDTOBuilder();
    }
    
    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getCourseId() { return courseId; }
    public String getUserMessage() { return userMessage; }
    public String getBotResponse() { return botResponse; }
    public String getMessageType() { return messageType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Boolean getIsHelpful() { return isHelpful; }
    public String getFeedback() { return feedback; }
    
    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
    public void setBotResponse(String botResponse) { this.botResponse = botResponse; }
    public void setMessageType(String messageType) { this.messageType = messageType; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setIsHelpful(Boolean isHelpful) { this.isHelpful = isHelpful; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
}
