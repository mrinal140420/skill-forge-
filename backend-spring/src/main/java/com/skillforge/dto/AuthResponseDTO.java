package com.skillforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Auth response DTO
 * Returned after successful login or registration
 * Matches Express response structure exactly
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponseDTO {
    private String token;  // JWT token
    private UserDTO user;
    
    public AuthResponseDTO() {}
    
    public AuthResponseDTO(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
    
    public static AuthResponseDTOBuilder builder() {
        return new AuthResponseDTOBuilder();
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public UserDTO getUser() {
        return user;
    }
    
    public void setUser(UserDTO user) {
        this.user = user;
    }
    
    public static class AuthResponseDTOBuilder {
        private String token;
        private UserDTO user;
        
        public AuthResponseDTOBuilder token(String token) {
            this.token = token;
            return this;
        }
        
        public AuthResponseDTOBuilder user(UserDTO user) {
            this.user = user;
            return this;
        }
        
        public AuthResponseDTO build() {
            return new AuthResponseDTO(this.token, this.user);
        }
    }
}
