package com.skillforge.security;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collection;

/**
 * Custom Authentication Manager for JWT authentication
 * Implements AuthenticationManager to handle JWT tokens
 */
@Component
public class CustomAuthenticationManager implements AuthenticationManager {    
    private static final Logger log = LoggerFactory.getLogger(CustomAuthenticationManager.class);
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof JwtAuthenticationToken)) {
            return null;
        }

        JwtAuthenticationToken token = (JwtAuthenticationToken) authentication;
        Long userId = token.getUserId();

        try {
            // Load user from database
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            // Build authorities from user role
            Collection<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

            // Create authenticated token
            JwtAuthenticationToken authenticatedToken = new JwtAuthenticationToken(
                    userId,
                    token.getToken(),
                    authorities
            );

            authenticatedToken.setDetails(user);
            return authenticatedToken;
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", userId, e);
            throw new BadCredentialsException("Invalid token", e);
        }
    }
}
