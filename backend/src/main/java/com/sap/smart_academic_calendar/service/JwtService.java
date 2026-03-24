package com.sap.smart_academic_calendar.service;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.sap.smart_academic_calendar.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    private final Key signingKey;
    private final long accessExpirationMinutes;
    private final long refreshExpirationDays;
    private final long refreshExpirationDaysRememberMe;
    private final String issuer;

    public JwtService(
        @Value("${app.jwt.secret}") String base64Secret,
        @Value("${app.jwt.access-expiration-minutes:15}") long accessExpirationMinutes,
        @Value("${app.jwt.refresh-expiration-days:7}") long refreshExpirationDays,
        @Value("${app.jwt.refresh-expiration-days-remember-me:30}") long refreshExpirationDaysRememberMe,
        @Value("${app.jwt.issuer:smart-academic-calendar}") String issuer
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessExpirationMinutes = accessExpirationMinutes;
        this.refreshExpirationDays = refreshExpirationDays;
        this.refreshExpirationDaysRememberMe = refreshExpirationDaysRememberMe;
        this.issuer = issuer;
    }

    /**
     * Generates an access token with short expiration (15 minutes default)
     */
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(accessExpirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
            .setSubject(String.valueOf(user.getId()))
            .setIssuer(issuer)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiresAt))
            .claim("username", user.getUsername())
            .claim("type", "access")
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Generates a refresh token with long expiration (7 or 30 days based on rememberMe)
     */
    public String generateRefreshToken(User user, boolean rememberMe) {
        Instant now = Instant.now();
        long daysToExpire = rememberMe ? refreshExpirationDaysRememberMe : refreshExpirationDays;
        Instant expiresAt = now.plus(daysToExpire, ChronoUnit.DAYS);

        return Jwts.builder()
            .setSubject(String.valueOf(user.getId()))
            .setIssuer(issuer)
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiresAt))
            .claim("username", user.getUsername())
            .claim("type", "refresh")
            .signWith(signingKey, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Deprecated: Use generateAccessToken instead
     * Kept for backward compatibility during migration
     */
    @Deprecated
    public String generateToken(User user) {
        return generateAccessToken(user);
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(signingKey)
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Validates an access token and checks that it has the correct type
     */
    public boolean isAccessTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            String type = claims.get("type", String.class);
            return "access".equals(type);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Validates a refresh token and checks that it has the correct type
     */
    public boolean isRefreshTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            String type = claims.get("type", String.class);
            return "refresh".equals(type);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extracts the user ID from the token
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = parseClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extracts the username from the token
     */
    public String getUsernameFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.get("username", String.class);
    }

    /**
     * Gets the expiration date from the token
     */
    public Date getExpirationFromToken(String token) {
        Claims claims = parseClaims(token);
        return claims.getExpiration();
    }
}
