package com.skillforge.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * JWT Authentication Filter - Processes JWT tokens from Authorization header
 * 
 * Extracts Bearer token from "Authorization: Bearer <token>" header
 * Validates token and sets authentication in SecurityContext if valid
 * 
 * Positioned before UsernamePasswordAuthenticationFilter.
 * Skips OAuth2 callback paths to let Spring Security handle those.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final List<String> SKIP_PATHS = Arrays.asList(
            "/oauth2/", "/login/oauth2/"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return SKIP_PATHS.stream().anyMatch(path::startsWith);
    }
    
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private CustomAuthenticationManager authenticationManager;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            // Extract JWT token from Authorization header
            String token = extractToken(request);

            if (token != null && jwtProvider.validateToken(token)) {
                Long userId = jwtProvider.getUserIdFromToken(token);
                JwtAuthenticationToken authenticationToken = new JwtAuthenticationToken(userId, token);
                
                // Authenticate using custom manager
                Authentication authentication = authenticationManager.authenticate(authenticationToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("JWT authentication set for user: {}", userId);
            }
        } catch (Exception e) {
            log.debug("Could not set user authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract Bearer token from Authorization header
     * Expected format: "Bearer <token>"
     */
    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);  // Remove "Bearer " prefix
        }
        return null;
    }
}
