package com.sap.smart_academic_calendar.dto;

/**
 * Data Transfer Object for initiating passkey registration.
 * Contains an optional user-friendly name for the new passkey.
 */
public class PasskeyRegistrationStartRequest {

    private String name;

    // Constructors
    public PasskeyRegistrationStartRequest() {
    }

    public PasskeyRegistrationStartRequest(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
