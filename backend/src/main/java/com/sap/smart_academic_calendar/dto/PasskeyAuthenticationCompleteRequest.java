package com.sap.smart_academic_calendar.dto;

import java.util.Map;

/**
 * Data Transfer Object for completing passkey authentication.
 * Contains the WebAuthn assertion data received from the browser.
 */
public class PasskeyAuthenticationCompleteRequest {

    private String id;
    private String rawId;
    private String type;
    private Map<String, Object> response;
    private Map<String, Object> clientExtensionResults;

    // Constructors
    public PasskeyAuthenticationCompleteRequest() {
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
