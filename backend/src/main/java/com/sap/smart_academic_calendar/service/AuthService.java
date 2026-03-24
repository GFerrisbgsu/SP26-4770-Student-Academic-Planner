package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.LoginRequest;
import com.sap.smart_academic_calendar.dto.LoginResponse;
import com.sap.smart_academic_calendar.model.TokenBlacklist;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.TokenBlacklistRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service class for authentication operations.
 * Handles login, logout, and token refresh with JWT-based authentication.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            TokenBlacklistRepository tokenBlacklistRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Authenticates a user by username and password.
     * Returns user data using BCrypt password verification.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        // Verify password using BCrypt
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        return new LoginResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getFirstName(), user.getLastName());
    }

    /**
     * Generates a new access token for a user.
     */
    public String generateAccessToken(User user) {
        return jwtService.generateAccessToken(user);
    }

    /**
     * Generates a new refresh token for a user.
     */
    public String generateRefreshToken(User user, boolean rememberMe) {
        return jwtService.generateRefreshToken(user, rememberMe);
    }

    /**
     * Refreshes tokens using a valid refresh token.
     * Returns the user associated with the refresh token.
     * Blacklists the old refresh token for security (token rotation).
     * 
     * @param refreshToken the current refresh token
     * @return the User associated with the token
     * @throws RuntimeException if token is invalid, expired, or blacklisted
     */
    @Transactional
    public User refreshToken(String refreshToken) {
        // Validate refresh token
        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Check if token is blacklisted
        if (tokenBlacklistRepository.existsByToken(refreshToken)) {
            throw new RuntimeException("Refresh token has been revoked");
        }

        // Extract user ID from token
        Long userId = jwtService.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Blacklist the old refresh token (token rotation for security)
        Date expiryDate = jwtService.getExpirationFromToken(refreshToken);
        LocalDateTime expiryDateTime = LocalDateTime.ofInstant(
                expiryDate.toInstant(), ZoneId.systemDefault());
        
        TokenBlacklist blacklistEntry = new TokenBlacklist(refreshToken, userId, expiryDateTime);
        tokenBlacklistRepository.save(blacklistEntry);

        return user;
    }

    /**
     * Logs out a user by blacklisting their refresh token.
     * 
     * @param refreshToken the refresh token to blacklist
     */
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            return; // Nothing to blacklist
        }

        // Validate token format (don't throw error if invalid - just ignore)
        if (!jwtService.isTokenValid(refreshToken)) {
            return;
        }

        // Check if already blacklisted
        if (tokenBlacklistRepository.existsByToken(refreshToken)) {
            return; // Already blacklisted
        }

        // Blacklist the token
        try {
            Long userId = jwtService.getUserIdFromToken(refreshToken);
            Date expiryDate = jwtService.getExpirationFromToken(refreshToken);
            LocalDateTime expiryDateTime = LocalDateTime.ofInstant(
                    expiryDate.toInstant(), ZoneId.systemDefault());
            
            TokenBlacklist blacklistEntry = new TokenBlacklist(refreshToken, userId, expiryDateTime);
            tokenBlacklistRepository.save(blacklistEntry);
        } catch (Exception e) {
            // Silently fail - token parsing errors during logout are acceptable
        }
    }
}
