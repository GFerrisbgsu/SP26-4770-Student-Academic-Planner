package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for password reset.
 */
public class PasswordResetRequest {

    private String email;

    public PasswordResetRequest() {
    }

    public PasswordResetRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
