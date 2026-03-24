package com.sap.smart_academic_calendar.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for displaying passkey information.
 * Used when listing a user's registered passkeys.
 */
public class PasskeyDTO {

    private Long id;
    private String name;
    private String credentialId;
    private LocalDateTime createdAt;

    // Constructors
    public PasskeyDTO() {
    }

    public PasskeyDTO(Long id, String name, String credentialId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.credentialId = credentialId;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCredentialId() {
        return credentialId;
    }

    public void setCredentialId(String credentialId) {
        this.credentialId =credentialId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
