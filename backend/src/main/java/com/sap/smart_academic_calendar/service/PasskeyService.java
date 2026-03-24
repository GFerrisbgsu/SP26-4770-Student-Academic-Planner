package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.PasskeyAuthenticationCompleteRequest;
import com.sap.smart_academic_calendar.dto.PasskeyAuthenticationStartResponse;
import com.sap.smart_academic_calendar.dto.PasskeyDTO;
import com.sap.smart_academic_calendar.dto.PasskeyRegistrationCompleteRequest;
import com.sap.smart_academic_calendar.dto.PasskeyRegistrationStartRequest;
import com.sap.smart_academic_calendar.dto.PasskeyRegistrationStartResponse;
import com.sap.smart_academic_calendar.model.Passkey;
import com.sap.smart_academic_calendar.model.PasskeySession;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.PasskeyRepository;
import com.sap.smart_academic_calendar.repository.PasskeySessionRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service class for passkey registration and management operations.
 * Handles WebAuthn credential lifecycle including registration, authentication, and deletion.
 */
@Service
public class PasskeyService {

    private final UserRepository userRepository;
    private final PasskeyRepository passkeyRepository;
    private final PasskeySessionRepository passkeySessionRepository;
    private final WebAuthnVerificationService webAuthnVerificationService;
    private final String rpName;
    private final int challengeDurationSeconds;

    public PasskeyService(
            UserRepository userRepository,
            PasskeyRepository passkeyRepository,
            PasskeySessionRepository passkeySessionRepository,
            WebAuthnVerificationService webAuthnVerificationService,
            @Value("${app.webauthn.rp.name:Smart Academic Calendar}") String rpName,
            @Value("${app.webauthn.challenge-duration-seconds:600}") int challengeDurationSeconds) {
        this.userRepository = userRepository;
        this.passkeyRepository = passkeyRepository;
        this.passkeySessionRepository = passkeySessionRepository;
        this.webAuthnVerificationService = webAuthnVerificationService;
        this.rpName = rpName;
        this.challengeDurationSeconds = challengeDurationSeconds;
    }

    /**
     * Start passkey registration for an authenticated user.
     * Generates a challenge and stores session for verification.
     * 
     * @param userId the ID of the user registering a passkey
     * @param request the registration start request
     * @return registration options including challenge and RP config
     */
    @Transactional
    public PasskeyRegistrationStartResponse startRegistration(Long userId, PasskeyRegistrationStartRequest request) {
        // Fetch user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate challenge
        String challenge = webAuthnVerificationService.generateChallenge();

        // Create session to track this registration attempt
        // Delete any stale sessions for this user first (from previous failed attempts)
        passkeySessionRepository.deleteByUserId(userId);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(challengeDurationSeconds);
        PasskeySession session = new PasskeySession(userId, challenge, expiresAt);
        passkeySessionRepository.save(session);

        // Encode userId as base64url for WebAuthn (userId must be bytes, not a string number)
        String encodedUserId = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(userId.toString().getBytes());

        // Return registration options for the browser
        return new PasskeyRegistrationStartResponse(
                challenge,
                encodedUserId,
                user.getUsername(),
                webAuthnVerificationService.getRpId(),
                rpName
        );
    }

    /**
     * Complete passkey registration after browser provides credential.
     * Validates attestation and stores the new passkey.
     * 
     * @param userId the ID of the user completing registration
     * @param request the attestation response from the browser
     */
    @Transactional
    public void completeRegistration(Long userId, PasskeyRegistrationCompleteRequest request) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the most recent pending session for this user
        PasskeySession session = passkeySessionRepository.findMostRecentByUserId(userId)
                .orElseThrow(() -> new RuntimeException("No pending passkey registration found"));

        // Check session hasn't expired
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            passkeySessionRepository.delete(session);
            throw new RuntimeException("Registration session expired");
        }

        // Extract response data
        Map<String, Object> response = request.getResponse();
        String clientDataJSON = (String) response.get("clientDataJSON");
        String attestationObject = (String) response.get("attestationObject");

        // Verify the attestation
        webAuthnVerificationService.verifyRegistration(
                clientDataJSON,
                attestationObject,
                session.getChallenge()
        );

        // Extract public key from attestation object (simplified for MVP)
        // In production, use WebAuthn4J to properly parse attestation
        String publicKey = attestationObject; // Store entire attestation for now
        String credentialId = request.getRawId();

        // Check if credential ID already exists
        if (passkeyRepository.existsByCredentialId(credentialId)) {
            throw new RuntimeException("Passkey with this credential ID already registered");
        }

        // Use user-provided name, or fall back to a default
        String passkeyName = (request.getName() != null && !request.getName().isBlank())
                ? request.getName()
                : "My Passkey";

        // Create and save the passkey
        Passkey passkey = new Passkey(
                userId,
                credentialId,
                publicKey,
                passkeyName
        );
        passkeyRepository.save(passkey);

        // Update user to indicate passkey is enabled
        user.setPasskeyEnabled(true);
        userRepository.save(user);

        // Clean up the session
        passkeySessionRepository.delete(session);
    }

    /**
     * Start passkey authentication (passwordless login).
     * Generates a challenge for the user to sign.
     * 
     * @return authentication options including challenge
     */
    @Transactional
    public PasskeyAuthenticationStartResponse startAuthentication() {
        // Generate challenge
        String challenge = webAuthnVerificationService.generateChallenge();

        // Create session (no userId yet - this is passwordless)
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(challengeDurationSeconds);
        PasskeySession session = new PasskeySession(null, challenge, expiresAt);
        passkeySessionRepository.save(session);

        // Return authentication options
        return new PasskeyAuthenticationStartResponse(
                challenge,
                webAuthnVerificationService.getRpId()
        );
    }

    /**
     * Complete passkey authentication after browser provides assertion.
     * Validates signature and returns the authenticated user.
     * 
     * @param request the assertion response from the browser
     * @return the authenticated User
     */
    @Transactional
    public User completeAuthentication(PasskeyAuthenticationCompleteRequest request) {
        String credentialId = request.getRawId();

        // Find the passkey by credential ID
        Passkey passkey = passkeyRepository.findByCredentialId(credentialId)
                .orElseThrow(() -> new RuntimeException("Passkey not found"));

        // Find the pending session by challenge
        Map<String, Object> response = request.getResponse();
        String clientDataJSON = (String) response.get("clientDataJSON");
        
        // Extract challenge from client data
        byte[] clientDataBytes = Base64.getUrlDecoder().decode(clientDataJSON);
        String clientData = new String(clientDataBytes);
        
        // Find session (simplified - in production parse JSON properly)
        List<PasskeySession> sessions = passkeySessionRepository.findAll();
        PasskeySession session = sessions.stream()
                .filter(s -> clientData.contains(s.getChallenge()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No pending authentication session found"));

        // Check session hasn't expired
        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            passkeySessionRepository.delete(session);
            throw new RuntimeException("Authentication session expired");
        }

        // Verify the assertion
        String authenticatorData = (String) response.get("authenticatorData");
        String signature = (String) response.get("signature");

        long newSignCount = webAuthnVerificationService.verifyAuthentication(
                clientDataJSON,
                authenticatorData,
                signature,
                session.getChallenge(),
                passkey.getPublicKey(),
                passkey.getSignCount()
        );

        // Update sign count to prevent replay attacks
        passkey.setSignCount(newSignCount);
        passkey.setUpdatedAt(LocalDateTime.now());
        passkeyRepository.save(passkey);

        // Clean up the session
        passkeySessionRepository.delete(session);

        // Return the authenticated user
        return userRepository.findById(passkey.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Get all passkeys registered to a user.
     * 
     * @param userId the user's ID
     * @return list of passkey DTOs
     */
    @Transactional(readOnly = true)
    public List<PasskeyDTO> getUserPasskeys(Long userId) {
        return passkeyRepository.findByUserId(userId).stream()
                .map(passkey -> new PasskeyDTO(
                        passkey.getId(),
                        passkey.getName(),
                        passkey.getCredentialId(),
                        passkey.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Delete a specific passkey.
     * Verifies the passkey belongs to the requesting user.
     * 
     * @param passkeyId the passkey ID to delete
     * @param userId the requesting user's ID
     */
    @Transactional
    public void deletePasskey(Long passkeyId, Long userId) {
        Passkey passkey = passkeyRepository.findById(passkeyId)
                .orElseThrow(() -> new RuntimeException("Passkey not found"));

        // Verify ownership
        if (!passkey.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this passkey");
        }

        passkeyRepository.delete(passkey);

        // If no passkeys left, disable passkey flag on user
        long remainingPasskeys = passkeyRepository.countByUserId(userId);
        if (remainingPasskeys == 0) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setPasskeyEnabled(false);
            userRepository.save(user);
        }
    }

    /**
     * Clean up expired passkey sessions.
     * Should be called periodically by a scheduled task.
     */
    @Transactional
    public int cleanupExpiredSessions() {
        return passkeySessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }
}
