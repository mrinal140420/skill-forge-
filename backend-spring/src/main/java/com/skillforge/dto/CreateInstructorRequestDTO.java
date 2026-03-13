package com.skillforge.dto;

/**
 * Request DTO for creating a new course admin/instructor
 */
public class CreateInstructorRequestDTO {
    
    private String name;
    private String email;
    
    // Constructors
    public CreateInstructorRequestDTO() {
    }
    
    public CreateInstructorRequestDTO(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    // Getters and Setters
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
}
