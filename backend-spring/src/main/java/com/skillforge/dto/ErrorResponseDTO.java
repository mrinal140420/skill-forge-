package com.skillforge.dto;

/**
 * Standard error response DTO
 */
public class ErrorResponseDTO {
    private String error;
    private String message;
    private Integer status;
    
    public ErrorResponseDTO() {}
    
    public ErrorResponseDTO(String error, String message, Integer status) {
        this.error = error;
        this.message = message;
        this.status = status;
    }
    
    public static ErrorResponseDTOBuilder builder() {
        return new ErrorResponseDTOBuilder();
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public static class ErrorResponseDTOBuilder {
        private String error;
        private String message;
        private Integer status;
        
        public ErrorResponseDTOBuilder error(String error) {
            this.error = error;
            return this;
        }
        
        public ErrorResponseDTOBuilder message(String message) {
            this.message = message;
            return this;
        }
        
        public ErrorResponseDTOBuilder status(Integer status) {
            this.status = status;
            return this;
        }
        
        public ErrorResponseDTO build() {
            return new ErrorResponseDTO(this.error, this.message, this.status);
        }
    }
}
