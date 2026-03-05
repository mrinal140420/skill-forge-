package com.skillforge.dto;

/**
 * JWT claims DTO
 * Contains data encoded in the JWT token
 */
public class JwtClaimsDTO {
    private Long userId;
    private String email;
    private String role;

    public JwtClaimsDTO() {}

    public JwtClaimsDTO(Long userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long userId;
        private String email;
        private String role;

        public Builder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public JwtClaimsDTO build() {
            return new JwtClaimsDTO(userId, email, role);
        }
    }
}
