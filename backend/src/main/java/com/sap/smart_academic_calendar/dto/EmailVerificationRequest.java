package com.sap.smart_academic_calendar.dto;

/**
 * Data Transfer Object for email verification request.
 * Contains the email and verification code to verify a user's email address.
 */
public class EmailVerificationRequest {
    private String email;
    private String code;

    // Default constructor for JSON deserialization
    public EmailVerificationRequest() {}

    public EmailVerificationRequest(String email, String code) {
        this.email = email;
        this.code = code;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}