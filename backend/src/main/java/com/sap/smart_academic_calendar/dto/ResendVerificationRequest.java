package com.sap.smart_academic_calendar.dto;

/**
 * Data Transfer Object for resending verification email request.
 * Contains the email address to resend verification code to.
 */
public class ResendVerificationRequest {
    private String email;

    // Default constructor for JSON deserialization
    public ResendVerificationRequest() {}

    public ResendVerificationRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}