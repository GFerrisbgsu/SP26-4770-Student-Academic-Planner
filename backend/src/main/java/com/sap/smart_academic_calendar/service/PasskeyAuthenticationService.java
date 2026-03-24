package com.sap.smart_academic_calendar.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.LoginResponse;
import com.sap.smart_academic_calendar.dto.PasskeyAuthenticationCompleteRequest;
import com.sap.smart_academic_calendar.dto.PasskeyAuthenticationStartResponse;
import com.sap.smart_academic_calendar.model.User;

/**
 * Service class for passkey-based authentication.
 * Orchestrates WebAuthn authentication flow and JWT token generation.
 */
@Service
public class PasskeyAuthenticationService {

    private final PasskeyService passkeyService;
    private final AuthService authService;

    public PasskeyAuthenticationService(
            PasskeyService passkeyService,
            AuthService authService) {
        this.passkeyService = passkeyService;
        this.authService = authService;
    }

    /**
     * Initiate passkey authentication (passwordless login).
     * Generates a challenge for the user to sign with their authenticator.
     * 
     * @return authentication options including challenge and RP ID
     */
    @Transactional
    public PasskeyAuthenticationStartResponse initiatePasskeyAuth() {
        return passkeyService.startAuthentication();
    }

    /**
     * Complete passkey authentication after browser provides assertion.
     * Validates the WebAuthn assertion and generates JWT tokens upon successful authentication.
     * 
     * @param request the assertion response from the browser
     * @return LoginResponse with user details
     */
    @Transactional
    public LoginResponse authenticateWithPasskey(PasskeyAuthenticationCompleteRequest request) {
        // Verify the passkey assertion and get the authenticated user
        User user = passkeyService.completeAuthentication(request);

        // Return login response (tokens will be set as HttpOnly cookies by the controller)
        return new LoginResponse(user.getId(), user.getUsername(), user.getEmail(),
                user.getFirstName(), user.getLastName());
    }

    /**
     * Generate access token for a user.
     * Used by the controller to set HttpOnly cookie.
     * 
     * @param user the authenticated user
     * @return JWT access token
     */
    public String generateAccessToken(User user) {
        return authService.generateAccessToken(user);
    }

    /**
     * Generate refresh token for a user.
     * Used by the controller to set HttpOnly cookie.
     * 
     * @param user the authenticated user
     * @param rememberMe whether to use extended expiry (30 days vs 7 days)
     * @return JWT refresh token
     */
    public String generateRefreshToken(User user, boolean rememberMe) {
        return authService.generateRefreshToken(user, rememberMe);
    }
}
