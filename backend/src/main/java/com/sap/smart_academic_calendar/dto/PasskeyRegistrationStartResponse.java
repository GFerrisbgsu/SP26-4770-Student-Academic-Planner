package com.sap.smart_academic_calendar.dto;

/**
 * Data Transfer Object for passkey registration initialization response.
 * Contains the challenge and relying party configuration for WebAuthn registration.
 */
public class PasskeyRegistrationStartResponse {

    private String challenge;
    private String userId;
    private String username;
    private String rpId;
    private String rpName;

    // Constructors
    public PasskeyRegistrationStartResponse() {
    }

    public PasskeyRegistrationStartResponse(String challenge, String userId, String username, String rpId, String rpName) {
        this.challenge = challenge;
        this.userId = userId;
        this.username = username;
        this.rpId = rpId;
        this.rpName = rpName;
    }

    // Getters and Setters
    public String getChallenge() {
        return challenge;
    }

    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRpId() {
        return rpId;
    }

    public void setRpId(String rpId) {
        this.rpId = rpId;
    }

    public String getRpName() {
        return rpName;
    }

    public void setRpName(String rpName) {
        this.rpName = rpName;
    }
}
