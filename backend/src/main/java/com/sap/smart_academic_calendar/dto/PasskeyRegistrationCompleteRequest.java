package com.sap.smart_academic_calendar.dto;

import java.util.Map;

/**
 * Data Transfer Object for completing passkey registration.
 * Contains the WebAuthn credential data received from the browser.
 */
public class PasskeyRegistrationCompleteRequest {

    private String id;
    private String rawId;
    private String type;
    private String name; // User-friendly passkey name
    private Map<String, Object> response;
    private Map<String, Object> clientExtensionResults;

    // Constructors
    public PasskeyRegistrationCompleteRequest() {
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRawId() {
        return rawId;
    }

    public void setRawId(String rawId) {
        this.rawId = rawId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Map<String, Object> getResponse() {
        return response;
    }

    public void setResponse(Map<String, Object> response) {
        this.response = response;
    }

    public Map<String, Object> getClientExtensionResults() {
        return clientExtensionResults;
    }

    public void setClientExtensionResults(Map<String, Object> clientExtensionResults) {
        this.clientExtensionResults = clientExtensionResults;
    }
}
