package com.skillforge.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * JWT Authentication Token
 * Custom authentication token for JWT-based authentication flow
 */
public class JwtAuthenticationToken extends AbstractAuthenticationToken {

    private final Long userId;
    private final String token;

    public JwtAuthenticationToken(Long userId, String token) {
        super(null);  // No authorities initially
        this.userId = userId;
        this.token = token;
        setAuthenticated(false);
    }

    public JwtAuthenticationToken(Long userId, String token, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.userId = userId;
        this.token = token;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return userId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getToken() {
        return token;
    }
}
