package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.CreateUserRequest;
import com.sap.smart_academic_calendar.dto.EmailVerificationRequest;
import com.sap.smart_academic_calendar.dto.LoginRequest;
import com.sap.smart_academic_calendar.dto.LoginResponse;
import com.sap.smart_academic_calendar.dto.PasskeyAuthenticationCompleteRequest;
import com.sap.smart_academic_calendar.dto.PasskeyAuthenticationStartResponse;
import com.sap.smart_academic_calendar.dto.PasskeyDTO;
import com.sap.smart_academic_calendar.dto.PasskeyRegistrationCompleteRequest;
import com.sap.smart_academic_calendar.dto.PasskeyRegistrationStartRequest;
import com.sap.smart_academic_calendar.dto.PasskeyRegistrationStartResponse;
import com.sap.smart_academic_calendar.dto.ChangePasswordRequest;
import com.sap.smart_academic_calendar.dto.PasswordResetRequest;
import com.sap.smart_academic_calendar.dto.ResetPasswordRequest;
import com.sap.smart_academic_calendar.dto.ResendVerificationRequest;
import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import com.sap.smart_academic_calendar.service.AuthService;
import com.sap.smart_academic_calendar.service.PasskeyAuthenticationService;
import com.sap.smart_academic_calendar.service.PasskeyService;
import com.sap.smart_academic_calendar.service.UserService;
import com.sap.smart_academic_calendar.service.seeding.CategorySeeder;
import com.sap.smart_academic_calendar.util.CookieUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

/**
 * REST Controller for Authentication operations.
 * Handles HTTP requests related to user authentication with JWT tokens in HttpOnly cookies.
 * Contains no business logic - delegates to AuthService, UserService, and PasskeyService.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    private final AuthService authService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final CookieUtils cookieUtils;
    private final PasskeyService passkeyService;
    private final PasskeyAuthenticationService passkeyAuthenticationService;
    private final CategorySeeder categorySeeder;

    public AuthController(
            AuthService authService,
            UserService userService,
            UserRepository userRepository,
            CookieUtils cookieUtils,
            PasskeyService passkeyService,
            PasskeyAuthenticationService passkeyAuthenticationService,
            CategorySeeder categorySeeder) {
        this.authService = authService;
        this.userService = userService;
        this.userRepository = userRepository;
        this.cookieUtils = cookieUtils;
        this.passkeyService = passkeyService;
        this.passkeyAuthenticationService = passkeyAuthenticationService;
        this.categorySeeder = categorySeeder;
    }

    // ========== Registration & Email Verification ==========

    /**
     * POST endpoint to register a new user.
     * Creates user account and sends email verification.
     * User must verify email before they can log in.
     *
     * @param request the registration request with user details
     * @return ResponseEntity with success message
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody CreateUserRequest request) {
        try {
            userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body("Account created successfully. Please check your email for verification instructions.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST endpoint to verify a user's email address.
     *
     * @param request the verification request containing email and code
     * @return ResponseEntity indicating success or failure
     */
    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestBody EmailVerificationRequest request) {
        try {
            userService.verifyEmail(request.getEmail(), request.getCode());
            return ResponseEntity.ok("Email verified successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST endpoint to resend verification email to a user.
     *
     * @param request the resend request containing email address
     * @return ResponseEntity indicating success or failure
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerificationEmail(@RequestBody ResendVerificationRequest request) {
        try {
            userService.resendVerificationEmail(request.getEmail());
            return ResponseEntity.ok("Verification email sent successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST endpoint to request a password reset email.
     * Always returns success to avoid account enumeration.
     *
     * @param request the password reset request containing email address
     * @return ResponseEntity indicating success
     */
    @PostMapping("/request-password-reset")
    public ResponseEntity<String> requestPasswordReset(@RequestBody PasswordResetRequest request) {
        userService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("If an account exists for that email, a reset link has been sent.");
    }

    /**
     * POST endpoint to reset password using token from email.
     *
     * @param request the reset password request containing token and new password
     * @return ResponseEntity indicating success or error
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok("Password has been reset successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * POST endpoint to change password for an authenticated user.
     * Requires valid access token and current password verification.
     *
     * @param request the change password request with current and new passwords
     * @return ResponseEntity indicating success or error
     */
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            userService.changePassword(user.getUsername(), request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password changed successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ========== Login / Session ==========

    /**
     * POST endpoint to authenticate a user.
     * Validates username and password, generates access and refresh tokens.
     * Tokens are set as HttpOnly cookies, user data returned in response body.
     *
     * @param request  the login request with username, password, and rememberMe flag
     * @param response the HTTP response to set cookies
     * @return ResponseEntity with login response containing user data
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response) {
        try {
            LoginResponse loginResponse = authService.login(request);

            User user = userRepository.findById(loginResponse.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Seed default budget categories for user if they don't have any
            categorySeeder.seedCategoriesForUser(user.getId());

            String accessToken = authService.generateAccessToken(user);
            String refreshToken = authService.generateRefreshToken(user, request.isRememberMe());

            int accessTokenMaxAge = CookieUtils.minutesToSeconds(15);
            int refreshTokenMaxAge = request.isRememberMe()
                    ? CookieUtils.daysToSeconds(30)
                    : CookieUtils.daysToSeconds(7);

            Cookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken, accessTokenMaxAge);
            Cookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken, refreshTokenMaxAge);

            response.addCookie(accessCookie);
            response.addCookie(refreshCookie);

            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * POST endpoint to refresh access token using refresh token.
     * Validates refresh token, blacklists it, and issues new tokens (token rotation).
     *
     * @param refreshToken the current refresh token from cookie
     * @param response     the HTTP response to set new cookies
     * @return ResponseEntity with success status
     */
    @PostMapping("/refresh")
    public ResponseEntity<Void> refresh(
            @CookieValue(value = CookieUtils.REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        try {
            if (refreshToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = authService.refreshToken(refreshToken);

            String newAccessToken = authService.generateAccessToken(user);
            String newRefreshToken = authService.generateRefreshToken(user, false);

            int accessTokenMaxAge = CookieUtils.minutesToSeconds(15);
            int refreshTokenMaxAge = CookieUtils.daysToSeconds(7);

            Cookie accessCookie = cookieUtils.createAccessTokenCookie(newAccessToken, accessTokenMaxAge);
            Cookie refreshCookie = cookieUtils.createRefreshTokenCookie(newRefreshToken, refreshTokenMaxAge);

            response.addCookie(accessCookie);
            response.addCookie(refreshCookie);

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * POST endpoint to logout user.
     * Blacklists refresh token and clears cookies.
     *
     * @param refreshToken the refresh token from cookie
     * @param response     the HTTP response to clear cookies
     * @return ResponseEntity with success status
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = CookieUtils.REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse response) {
        authService.logout(refreshToken);

        response.addCookie(cookieUtils.deleteCookie(CookieUtils.ACCESS_TOKEN_COOKIE_NAME));
        response.addCookie(cookieUtils.deleteCookie(CookieUtils.REFRESH_TOKEN_COOKIE_NAME));

        return ResponseEntity.ok().build();
    }

    /**
     * GET endpoint to retrieve current authenticated user's information.
     * Requires valid access token in cookie.
     *
     * @return ResponseEntity with user data
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDTO userDTO = new UserDTO(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getCreatedAt()
            );

            return ResponseEntity.ok(userDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // ========== Passkey Endpoints ==========

    /**
     * POST endpoint to begin passkey registration.
     * Generates a WebAuthn challenge for the authenticated user.
     * Requires valid access token.
     */
    @PostMapping("/passkey/register/begin")
    public ResponseEntity<PasskeyRegistrationStartResponse> beginPasskeyRegistration(
            @RequestBody PasskeyRegistrationStartRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            PasskeyRegistrationStartResponse response = passkeyService.startRegistration(user.getId(), request);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * POST endpoint to complete passkey registration.
     * Validates the WebAuthn attestation response and stores the credential.
     * Requires valid access token.
     */
    @PostMapping("/passkey/register/complete")
    public ResponseEntity<Void> completePasskeyRegistration(
            @RequestBody PasskeyRegistrationCompleteRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            passkeyService.completeRegistration(user.getId(), request);

            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            log.error("[Passkey] Registration complete failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * POST endpoint to begin passkey authentication (passwordless login).
     * Generates a WebAuthn challenge. Public endpoint - no authentication required.
     */
    @PostMapping("/passkey/authenticate/begin")
    public ResponseEntity<PasskeyAuthenticationStartResponse> beginPasskeyAuthentication() {
        try {
            PasskeyAuthenticationStartResponse response = passkeyAuthenticationService.initiatePasskeyAuth();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST endpoint to complete passkey authentication.
     * Validates the WebAuthn assertion and issues JWT tokens as HttpOnly cookies.
     * Public endpoint - no authentication required.
     */
    @PostMapping("/passkey/authenticate/complete")
    public ResponseEntity<LoginResponse> completePasskeyAuthentication(
            @RequestBody PasskeyAuthenticationCompleteRequest request,
            HttpServletResponse response) {
        try {
            LoginResponse loginResponse = passkeyAuthenticationService.authenticateWithPasskey(request);

            User user = userRepository.findById(loginResponse.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String accessToken = passkeyAuthenticationService.generateAccessToken(user);
            String refreshToken = passkeyAuthenticationService.generateRefreshToken(user, false);

            int accessTokenMaxAge = CookieUtils.minutesToSeconds(15);
            int refreshTokenMaxAge = CookieUtils.daysToSeconds(7);

            Cookie accessCookie = cookieUtils.createAccessTokenCookie(accessToken, accessTokenMaxAge);
            Cookie refreshCookie = cookieUtils.createRefreshTokenCookie(refreshToken, refreshTokenMaxAge);

            response.addCookie(accessCookie);
            response.addCookie(refreshCookie);

            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * GET endpoint to list all passkeys for the authenticated user.
     * Requires valid access token.
     */
    @GetMapping("/passkeys")
    public ResponseEntity<List<PasskeyDTO>> getUserPasskeys() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<PasskeyDTO> passkeys = passkeyService.getUserPasskeys(user.getId());

            return ResponseEntity.ok(passkeys);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * DELETE endpoint to remove a specific passkey.
     * Verifies ownership before deletion. Requires valid access token.
     */
    @DeleteMapping("/passkeys/{id}")
    public ResponseEntity<Void> deletePasskey(@PathVariable("id") Long passkeyId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = Long.parseLong(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            passkeyService.deletePasskey(passkeyId, user.getId());

            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
}