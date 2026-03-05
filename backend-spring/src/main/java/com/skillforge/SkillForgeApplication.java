package com.skillforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

/**
 * Main Spring Boot Application entry point for SkillForge Backend.
 * 
 * Migrated from Node.js/Express to Spring Boot 3.3 with Java 21.
 * - All original API endpoints preserved (100% backwards compatible)
 * - MongoDB replaced with PostgreSQL + JPA
 * - JWT authentication logic identical to Express version
 * - ML service integration maintained via WebClient
 * - OAuth2 (Google + GitHub) authentication supported
 * 
 * API Docs available at: http://localhost:8081/swagger-ui.html
 */
@SpringBootApplication
@PropertySource(value = "file:${user.dir}/.env", ignoreResourceNotFound = true)
@PropertySource(value = "file:.env", ignoreResourceNotFound = true)
@PropertySource(value = "file:backend-spring/.env", ignoreResourceNotFound = true)
public class SkillForgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillForgeApplication.class, args);
    }

}
