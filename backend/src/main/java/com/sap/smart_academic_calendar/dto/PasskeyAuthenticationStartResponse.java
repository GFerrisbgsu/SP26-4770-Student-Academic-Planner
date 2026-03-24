package com.sap.smart_academic_calendar.dto;

/**
 * Data Transfer Object for passkey authentication initialization response.
 * Contains the challenge for WebAuthn authentication.
 */
public class PasskeyAuthenticationStartResponse {

    private String challenge;
    private String rpId;

    // Constructors
    public PasskeyAuthenticationStartResponse() {
    }

    public PasskeyAuthenticationStartResponse(String challenge, String rpId) {
        this.challenge = challenge;
        this.rpId = rpId;
    }

    // Getters and Setters
    public String getChallenge() {
        return challenge;
    }

    public void setChallenge(String challenge) {
        this.challenge = challenge;
    }

    public String getRpId() {
        return rpId;
    }

    public void setRpId(String rpId) {
        this.rpId = rpId;
    }
}
