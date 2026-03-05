package com.skillforge.security;

import com.skillforge.dto.JwtClaimsDTO;
import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * OAuth2 Authentication Success Handler
 * 
 * After a user successfully authenticates via Google or GitHub:
 * 1. Extract user info (email, name) from OAuth2 profile
 * 2. Find or create a User entity in the database
 * 3. Generate a JWT token
 * 4. Redirect to the frontend with the token in a query parameter
 */
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    private static final String FRONTEND_REDIRECT_URL = "http://localhost:5173/oauth-callback";

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String email = extractEmail(attributes);
        String name = extractName(attributes);

        if (email == null || email.isBlank()) {
            log.error("OAuth2 login failed: no email found in user attributes: {}", attributes.keySet());
            getRedirectStrategy().sendRedirect(request, response,
                    "http://localhost:5173/login?error=no_email");
            return;
        }

        log.info("OAuth2 login success for: {} ({})", name, email);

        // Find existing user or create a new one
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Creating new OAuth2 user: {}", email);
            User newUser = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .passwordHash("")  // OAuth users have no password
                    .role(User.UserRole.STUDENT)
                    .lastActivityAt(LocalDateTime.now())
                    .build();
            return userRepository.save(newUser);
        });

        // Update last activity
        user.setLastActivityAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT token
        JwtClaimsDTO claims = new JwtClaimsDTO(user.getId(), user.getEmail(),
                user.getRole().name().toLowerCase());
        String token = jwtProvider.generateToken(claims);

        // Build redirect URL with token and user info
        String redirectUrl = FRONTEND_REDIRECT_URL
                + "?token=" + token
                + "&userId=" + user.getId()
                + "&name=" + java.net.URLEncoder.encode(user.getName(), "UTF-8")
                + "&email=" + java.net.URLEncoder.encode(user.getEmail(), "UTF-8")
                + "&role=" + user.getRole().name().toLowerCase();

        log.info("Redirecting OAuth2 user {} to frontend", email);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    /**
     * Extract email from OAuth2 attributes.
     * Google puts email in "email", GitHub may use different attribute names.
     */
    private String extractEmail(Map<String, Object> attributes) {
        Object email = attributes.get("email");
        return email != null ? email.toString() : null;
    }

    /**
     * Extract display name from OAuth2 attributes.
     * Google: "name", GitHub: "name" or "login"
     */
    private String extractName(Map<String, Object> attributes) {
        Object name = attributes.get("name");
        if (name != null && !name.toString().isBlank()) {
            return name.toString();
        }
        // GitHub fallback to login username
        Object login = attributes.get("login");
        return login != null ? login.toString() : null;
    }
}
