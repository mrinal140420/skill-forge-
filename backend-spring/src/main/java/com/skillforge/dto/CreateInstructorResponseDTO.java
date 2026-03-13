package com.skillforge.dto;

/**
 * Response DTO for instructor creation with auto-generated credentials
 */
public class CreateInstructorResponseDTO {
    
    private Long userId;
    private String name;
    private String email;
    private String generatedPassword;
    private String message;
    
    // Constructors
    public CreateInstructorResponseDTO() {
    }
    
    public CreateInstructorResponseDTO(Long userId, String name, String email, 
                                       String generatedPassword, String message) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.generatedPassword = generatedPassword;
        this.message = message;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getGeneratedPassword() {
        return generatedPassword;
    }

    public void setGeneratedPassword(String generatedPassword) {
        this.generatedPassword = generatedPassword;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
