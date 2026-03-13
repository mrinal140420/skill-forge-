package com.skillforge.service;

import com.skillforge.dto.*;
import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Auth Service - Handles user authentication (register, login, retrieve current user)
 * 
 * Validates user inputs, manages password hashing, and generates JWT tokens.
 * Implements identical authentication logic as the original Express backend.
 */
@Service
public class AuthService {
    
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Register a new user
     * 
     * Validates: name, email, password (min 6 chars)
     * Prevents: duplicate email registrations
     * 
     * @param request RegisterRequestDTO with name, email, password
     * @return AuthResponseDTO with token and user data
     * @throws IllegalArgumentException if validation fails
     */
    public AuthResponseDTO register(RegisterRequestDTO request) {
        // Validations (matching Express backend exactly)
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }

        // Create new user with hashed password
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(User.UserRole.STUDENT)
                .lastActivityAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        // Generate token and return response
        return generateAuthResponse(user);
    }

    /**
     * Login user with email and password
     * 
     * Validates: email and password are provided
     * Checks: user exists and password is correct
     * Updates: lastActivityAt timestamp on successful login
     * 
     * @param request LoginRequestDTO with email and password
     * @return AuthResponseDTO with token and user data
     * @throws IllegalArgumentException if credentials are invalid
     */
    public AuthResponseDTO login(LoginRequestDTO request) {
        // Validations
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Update last activity timestamp
        user.setLastActivityAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());

        // Generate token and return response
        return generateAuthResponse(user);
    }

    /**
     * Get current logged-in user profile
     * 
     * @param userId The user ID from JWT claim
     * @return UserDTO with user profile data
     * @throws IllegalArgumentException if user not found
     */
    public UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return convertUserToDTO(user);
    }

    public UserDTO updateCurrentUser(Long userId, UpdateProfileRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() != null) {
            String normalizedName = request.getName().trim();
            if (normalizedName.isEmpty()) {
                throw new IllegalArgumentException("Name cannot be empty");
            }
            user.setName(normalizedName);
        }

        if (request.getEmail() != null) {
            String normalizedEmail = request.getEmail().trim().toLowerCase();
            if (normalizedEmail.isEmpty()) {
                throw new IllegalArgumentException("Email cannot be empty");
            }
            User existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new IllegalArgumentException("Email already registered");
            }
            user.setEmail(normalizedEmail);
        }

        if (request.getAvatar() != null) {
            user.setAvatar(normalizeOptionalField(request.getAvatar()));
        }
        if (request.getBio() != null) {
            user.setBio(normalizeOptionalField(request.getBio()));
        }
        if (request.getLinkedin() != null) {
            user.setLinkedin(normalizeOptionalField(request.getLinkedin()));
        }
        if (request.getGithub() != null) {
            user.setGithub(normalizeOptionalField(request.getGithub()));
        }
        user.setLastActivityAt(LocalDateTime.now());

        user = userRepository.save(user);
        return convertUserToDTO(user);
    }

    public void changePassword(Long userId, ChangePasswordRequestDTO request) {
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("Current password is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("New password is required");
        }
        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters");
        }
        if (request.getConfirmPassword() == null || !request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirmation do not match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setLastActivityAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Generate JWT token and create auth response
     * Helper method used by register and login
     */
    private AuthResponseDTO generateAuthResponse(User user) {
        // Create JWT claims
        JwtClaimsDTO claims = JwtClaimsDTO.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        // Generate token
        String token = jwtProvider.generateToken(claims);

        // Return response with token and user data
        return AuthResponseDTO.builder()
                .token(token)
                .user(convertUserToDTO(user))
                .build();
    }

    /**
     * Convert User entity to UserDTO (excludes password hash)
     */
    private UserDTO convertUserToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .linkedin(user.getLinkedin())
                .github(user.getGithub())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .lastActivityAt(user.getLastActivityAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private String normalizeOptionalField(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
