package com.skillforge.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI/Swagger Configuration
 * 
 * Swagger UI available at: http://localhost:8080/swagger-ui.html
 * OpenAPI JSON at: http://localhost:8080/v3/api-docs
 */
@Configuration
public class OpenAPIConfiguration {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SkillForge Backend API")
                        .version("1.0.0")
                        .description("Spring Boot 3 backend for SkillForge CSE Learning Portal\n\n" +
                                "This is a complete migration from Node.js/Express + MongoDB to Spring Boot 3 + PostgreSQL.\n" +
                                "All APIs maintain 100% backwards compatibility with the original Express backend.")
                        .contact(new Contact()
                                .name("SkillForge Team")
                                .url("https://skillforge.dev")))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Local development server"))
                .addServersItem(new Server()
                        .url("https://api.skillforge.dev")
                        .description("Production server"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token from /api/auth/login or /api/auth/register")));
    }
}
