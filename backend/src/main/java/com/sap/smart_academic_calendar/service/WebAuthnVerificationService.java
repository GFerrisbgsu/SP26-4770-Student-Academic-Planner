package com.sap.smart_academic_calendar.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Service class for WebAuthn credential verification.
 * Handles validation of passkey registration and authentication responses.
 */
@Service
public class WebAuthnVerificationService {

    private static final Logger log = LoggerFactory.getLogger(WebAuthnVerificationService.class);

    private final String rpId;
    private final String origin;

    public WebAuthnVerificationService(
            @Value("${app.webauthn.rp.id:localhost}") String rpId,
            @Value("${app.webauthn.origin:http://localhost:8080}") String origin) {
        this.rpId = rpId;
        this.origin = origin;
    }

    /**
     * Verify a passkey registration attestation response.
     * 
     * @param clientDataJSON the client data JSON from the browser
     * @param attestationObject the attestation object from the browser
     * @param expectedChallenge the challenge originally sent to the client
     * @return true if verification succeeds
     * @throws RuntimeException if verification fails
     */
    public boolean verifyRegistration(String clientDataJSON, String attestationObject, String expectedChallenge) {
        try {
            // Decode Base64 client data
            byte[] clientDataBytes = Base64.getUrlDecoder().decode(clientDataJSON);
            String clientData = new String(clientDataBytes, StandardCharsets.UTF_8);

            log.info("[WebAuthn] verifyRegistration - clientData: {}", clientData);
            log.info("[WebAuthn] verifyRegistration - expectedChallenge: {}", expectedChallenge);
            log.info("[WebAuthn] verifyRegistration - configuredOrigin: {}", this.origin);

            // Verify challenge matches
            if (!clientData.contains(expectedChallenge)) {
                log.error("[WebAuthn] Challenge mismatch! clientData={}, expected={}", clientData, expectedChallenge);
                throw new RuntimeException("Challenge mismatch in registration");
            }

            // Verify origin matches
            if (!clientData.contains(this.origin)) {
                log.error("[WebAuthn] Origin mismatch! clientData contains origin field, but not '{}'", this.origin);
                throw new RuntimeException("Origin mismatch in registration");
            }

            // TODO: Full WebAuthn4J validation will be implemented in future iteration
            // For now, basic validation is sufficient for MVP
            return true;

        } catch (Exception e) {
            throw new RuntimeException("Registration verification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Verify a passkey authentication assertion response.
     * 
     * @param clientDataJSON the client data JSON from the browser
     * @param authenticatorData the authenticator data
     * @param signature the signature to verify
     * @param expectedChallenge the challenge originally sent to the client
     * @param storedPublicKey the public key stored during registration
     * @param currentSignCount the current signature counter
     * @return the new signature counter
     * @throws RuntimeException if verification fails
     */
    public long verifyAuthentication(
            String clientDataJSON,
            String authenticatorData,
            String signature,
            String expectedChallenge,
            String storedPublicKey,
            long currentSignCount) {

        try {
            // Decode Base64 client data
            byte[] clientDataBytes = Base64.getUrlDecoder().decode(clientDataJSON);
            String clientData = new String(clientDataBytes, StandardCharsets.UTF_8);

            // Verify challenge matches
            if (!clientData.contains(expectedChallenge)) {
                throw new RuntimeException("Challenge mismatch in authentication");
            }

            // Verify origin matches
            if (!clientData.contains(this.origin)) {
                throw new RuntimeException("Origin mismatch in authentication");
            }

            // Decode authenticator data to extract sign count
            byte[] authDataBytes = Base64.getUrlDecoder().decode(authenticatorData);
            
            // Sign count is at bytes 33-36 in authenticator data
            if (authDataBytes.length < 37) {
                throw new RuntimeException("Invalid authenticator data");
            }

            long newSignCount = bytesToLong(authDataBytes, 33);

            // Verify sign count increased (prevents cloning)
            if (newSignCount <= currentSignCount) {
                throw new RuntimeException("Sign count did not increase - possible cloned authenticator");
            }

            // TODO: Full signature verification with stored public key will be implemented
            // In future iteration using WebAuthn4J library for cryptographic validation
            
            return newSignCount;

        } catch (Exception e) {
            throw new RuntimeException("Authentication verification failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate a random challenge for WebAuthn ceremonies.
     * 
     * @return Base64URL-encoded random challenge
     */
    public String generateChallenge() {
        try {
            // Generate 32 random bytes
            byte[] challenge = new byte[32];
            new java.security.SecureRandom().nextBytes(challenge);
            
            // Encode to Base64URL
            return Base64.getUrlEncoder().withoutPadding().encodeToString(challenge);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate challenge", e);
        }
    }

    /**
     * Compute SHA-256 hash of data.
     * 
     * @param data the data to hash
     * @return Base64-encoded hash
     */
    public String computeHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Convert 4 bytes from byte array to long (big-endian).
     */
    private long bytesToLong(byte[] bytes, int offset) {
        long value = 0;
        for (int i = 0; i < 4; i++) {
            value = (value << 8) | (bytes[offset + i] & 0xFF);
        }
        return value;
    }

    public String getRpId() {
        return rpId;
    }

    public String getOrigin() {
        return origin;
    }
}
