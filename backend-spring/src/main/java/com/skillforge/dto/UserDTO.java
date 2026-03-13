package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * User DTO - Data Transfer Object for User entity
 * Sent in API responses matched to original Express backend exactly.
 * 
 * Excludes passwordHash from all responses (sensitivity).
 * Includes role, timestamps, and activity tracking.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO {
    
    private Long id;
    private String name;
    private String email;
    private String avatar;
    private String bio;
    private String linkedin;
    private String github;
    private String role;  // STUDENT, COURSE_ADMIN, or SUPER_ADMIN
    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime updatedAt;
    
    public UserDTO() {}
    
    public UserDTO(Long id, String name, String email, String avatar, String bio, String linkedin, String github, String role, LocalDateTime createdAt, LocalDateTime lastActivityAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatar = avatar;
        this.bio = bio;
        this.linkedin = linkedin;
        this.github = github;
        this.role = role;
        this.createdAt = createdAt;
        this.lastActivityAt = lastActivityAt;
        this.updatedAt = updatedAt;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }
    
    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * Builder pattern for UserDTO
     */
    public static UserDTOBuilder builder() {
        return new UserDTOBuilder();
    }

    public static class UserDTOBuilder {
        private Long id;
        private String name;
        private String email;
        private String avatar;
        private String bio;
        private String linkedin;
        private String github;
        private String role;
        private LocalDateTime createdAt;
        private LocalDateTime lastActivityAt;
        private LocalDateTime updatedAt;

        public UserDTOBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserDTOBuilder name(String name) {
            this.name = name;
            return this;
        }

        public UserDTOBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserDTOBuilder avatar(String avatar) {
            this.avatar = avatar;
            return this;
        }

        public UserDTOBuilder bio(String bio) {
            this.bio = bio;
            return this;
        }

        public UserDTOBuilder linkedin(String linkedin) {
            this.linkedin = linkedin;
            return this;
        }

        public UserDTOBuilder github(String github) {
            this.github = github;
            return this;
        }

        public UserDTOBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserDTOBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserDTOBuilder lastActivityAt(LocalDateTime lastActivityAt) {
            this.lastActivityAt = lastActivityAt;
            return this;
        }

        public UserDTOBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public UserDTO build() {
            return new UserDTO(id, name, email, avatar, bio, linkedin, github, role, createdAt, lastActivityAt, updatedAt);
        }
    }
}
