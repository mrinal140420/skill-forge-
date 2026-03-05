package com.skillforge.security;

import com.skillforge.dto.JwtClaimsDTO;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT Provider - Handles JWT token generation and validation
 * Implements identical logic to original Express backend using JJWT library.
 * 
 * Token Structure (same as Express version):
 * - Payload contains: userId, email, role
 * - Expiration: 7 days (configurable via JWT_EXPIRES_IN)
 * - Signed with HS512 algorithm
 * 
 * Environment Variables:
 * - JWT_SECRET: Secret key for signing tokens (from .env)
 * - JWT_EXPIRES_IN: Token expiration time (default: 7d)
 */
@Component
public class JwtProvider {
    
    private static final Logger log = LoggerFactory.getLogger(JwtProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:604800000}")  // 7 days in milliseconds
    private long jwtExpiration;

    /**
     * Generate JWT token from user claims
     * Matches Express generateToken function exactly
     */
    public String generateToken(JwtClaimsDTO claims) {
        try {
            SecretKey key = getSigningKey();
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + jwtExpiration);

            return Jwts.builder()
                    .subject(String.valueOf(claims.getUserId()))
                    .claim("userId", claims.getUserId())
                    .claim("email", claims.getEmail())
                    .claim("role", claims.getRole())
                    .issuedAt(now)
                    .expiration(expiryDate)
                    .signWith(key, SignatureAlgorithm.HS512)
                    .compact();
        } catch (Exception e) {
            log.error("Error generating JWT token", e);
            throw new RuntimeException("Error generating JWT token", e);
        }
    }

    /**
     * Get claims from JWT token
     * Called during authentication to extract user info
     */
    public JwtClaimsDTO getClaimsFromToken(String token) {
        try {
            SecretKey key = getSigningKey();
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            JwtClaimsDTO dto = new JwtClaimsDTO();
            dto.setUserId(claims.get("userId", Long.class));
            dto.setEmail(claims.get("email", String.class));
            dto.setRole(claims.get("role", String.class));
            return dto;
        } catch (ExpiredJwtException e) {
            log.error("JWT token expired", e);
            throw new JwtException("Token expired");
        } catch (UnsupportedJwtException e) {
            log.error("JWT token unsupported", e);
            throw new JwtException("Unsupported JWT token");
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token", e);
            throw new JwtException("Invalid JWT token");
        } catch (SignatureException e) {
            log.error("JWT signature validation failed", e);
            throw new JwtException("Invalid JWT signature");
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty", e);
            throw new JwtException("Empty JWT claims");
        }
    }

    /**
     * Validate JWT token
     * Returns true if token is valid and not expired
     */
    public boolean validateToken(String token) {
        try {
            SecretKey key = getSigningKey();
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Get user ID from JWT token
     */
    public Long getUserIdFromToken(String token) {
        JwtClaimsDTO claims = getClaimsFromToken(token);
        return claims.getUserId();
    }

    /**
     * Create signing key from secret
     * Uses HS512 algorithm (same as Express)
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Get token expiration time in milliseconds
     */
    public long getTokenExpiration() {
        return jwtExpiration;
    }
}
