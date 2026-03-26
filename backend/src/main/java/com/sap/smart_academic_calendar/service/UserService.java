package com.sap.smart_academic_calendar.service;

import com.sap.smart_academic_calendar.dto.CreateUserRequest;
import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for User operations.
 * Handles business logic for user management (CRUD operations).
 * Authentication logic is in AuthService.
 */
@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final TodoListService todoListService;

    public UserService(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder, TodoListService todoListService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.todoListService = todoListService;
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        // Validate input
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Hash password before storing
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create user with all fields including firstName and lastName
        User user = new User(
            request.getUsername(),
            request.getEmail(),
            request.getFirstName() != null ? request.getFirstName() : "",
            request.getLastName() != null ? request.getLastName() : "",
            hashedPassword
        );
        // Auto-verify users since email delivery is not available yet
        user.setEmailVerified(true);

        User savedUser = userRepository.save(user);

        // Create default to-do lists for new user
        try {
            todoListService.createDefaultLists(savedUser.getId());
        } catch (Exception e) {
            log.error("Failed to create default to-do lists for user {}: {}", savedUser.getId(), e.getMessage());
            // Don't fail user creation if list creation fails
        }

        return convertToDTO(savedUser);
    }

    @Transactional
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("User already verified");
        }
        if (!code.equals(user.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code");
        }
        if (LocalDateTime.now().isAfter(user.getVerificationCodeExpiresAt())) {
            throw new RuntimeException("Verification code expired");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiresAt(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("User already verified");
        }

        String verificationCode = emailService.generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationCode);
        } catch (Exception e) {
            log.error("Failed to resend verification email to {}: {}", user.getEmail(), e.getMessage());
            throw new RuntimeException("Failed to send verification email. Please try again later.");
        }
    }

    /**
     * Request a password reset for the given email address.
     * Generates a random token, hashes it before storing, and emails the plain token to the user.
     * Token expires after 30 minutes.
     * 
     * Security: Token is hashed in database to protect against database breaches.
     * Plain token is sent via email (necessary for user to submit reset request).
     * 
     * @param email User's email address
     */
    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return;
        }

        // Generate plain token to send in email
        String plainToken = emailService.generatePasswordResetToken();
        
        // Hash the token before storing in database
        String hashedToken = passwordEncoder.encode(plainToken);
        user.setPasswordResetToken(hashedToken);
        user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        try {
            // Send plain token in email (user needs this to submit)
            emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), plainToken);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Reset user password using a password reset token.
     * Validates the token (compares hash), checks expiration, updates password, and clears token.
     * 
     * Security: Tokens are hashed using BCrypt, so we iterate through users with active tokens
     * and use passwordEncoder.matches() to find the correct user. This is acceptable for 
     * small-scale applications with short-lived tokens (30 minutes) and automatic cleanup.
     * 
     * @param plainToken The plain token submitted by user (from email link)
     * @param newPassword The new password to set
     * @throws RuntimeException if token is invalid, expired, or not found
     */
    @Transactional
    public void resetPassword(String plainToken, String newPassword) {
        // Since tokens are hashed, we need to check all users with active reset tokens
        // This is acceptable for small-scale applications with 30-minute token expiration
        List<User> usersWithTokens = userRepository.findAll().stream()
            .filter(u -> u.getPasswordResetToken() != null)
            .toList();

        User user = null;
        for (User u : usersWithTokens) {
            // Check if submitted token matches the hashed token in database
            if (passwordEncoder.matches(plainToken, u.getPasswordResetToken())) {
                user = u;
                break;
            }
        }

        if (user == null) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        // Check if token has expired
        if (user.getPasswordResetTokenExpiresAt() == null || 
            user.getPasswordResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            // Clear expired token
            user.setPasswordResetToken(null);
            user.setPasswordResetTokenExpiresAt(null);
            userRepository.save(user);
            throw new RuntimeException("Reset token has expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Clear reset token (single-use)
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
        
        userRepository.save(user);
        log.info("Password reset successful for user: {}", user.getUsername());
    }

    /**
     * Change password for an authenticated user.
     * Verifies the current password before updating to the new one.
     *
     * @param username       The username of the authenticated user
     * @param currentPassword The user's current password for verification
     * @param newPassword     The new password to set
     * @throws RuntimeException if current password is incorrect or user not found
     */
    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", user.getUsername());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::convertToDTO)
            .toList();
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return convertToDTO(user);
    }

    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt()
        );
    }
}