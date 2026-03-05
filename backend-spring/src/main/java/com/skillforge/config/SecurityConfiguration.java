package com.skillforge.config;

import com.skillforge.security.CustomAuthenticationManager;
import com.skillforge.security.JwtAuthenticationFilter;
import com.skillforge.security.OAuth2AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;

/**
 * Security Configuration - Sets up Spring Security with JWT authentication
 * 
 * Configuration:
 * - JWT token validation via custom JwtAuthenticationFilter
 * - CORS enabled for frontend requests
 * - Password hashing with BCrypt (10 rounds)
 * - Stateless session (no cookies, token-based)
 * - Public endpoints: auth (register, login), courses (get)
 * - Protected endpoints: all others require valid JWT
 * 
 * Matches original Express authentication flow exactly
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfiguration.class);

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CustomAuthenticationManager customAuthenticationManager;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler;

    /**
     * Build the security filter chain
     * 
     * - CORS enabled for all origins (configurable)
     * - CSRF disabled (stateless API, not vulnerable)
     * - Session management: STATELESS (not relying on cookies)
     * - JWT filter added before UsernamePasswordAuthenticationFilter
     * - Public endpoints: No authentication required
     * - Protected endpoints: Require valid JWT bearer token
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())  // Disable CSRF for stateless API
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courses").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
                        
                        // OAuth2 endpoints
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        
                        // Swagger/OpenAPI endpoints
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/oauth2/authorization")
                        .authorizationEndpoint(authz2 -> authz2
                                .baseUri("/oauth2/authorization")
                        )
                        .redirectionEndpoint(redir -> redir
                                .baseUri("/login/oauth2/code/*")
                        )
                        .successHandler(oAuth2SuccessHandler)
                        .failureHandler((request, response, exception) -> {
                            log.error("OAuth2 authentication failed: {}", exception.getMessage());
                            response.sendRedirect("http://localhost:5173/login?error=oauth_failed");
                        })
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\":\"Unauthorized\"}");
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS Configuration
     * Allow requests from frontend and other services
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Password Encoder - BCrypt with strength 10
     * Matches original Express bcryptjs library behavior
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * REST Template for calling external services (ML service)
     * Used by RecommendationService to call FastAPI endpoint
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
