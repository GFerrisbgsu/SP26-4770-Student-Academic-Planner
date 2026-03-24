package com.sap.smart_academic_calendar.dto;

/**
 * Data Transfer Object for login responses.
 * Contains user info only - tokens are sent via HttpOnly cookies.
 */
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String token;

    public LoginResponse(Long userId, String username, String email, String firstName, String lastName, String token) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.token = token;
    }

    // Constructor without token (cookie-based auth flow)
    public LoginResponse(Long userId, String username, String email, String firstName, String lastName) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.token = null;
    }

    // Backward compatibility constructor
    public LoginResponse(Long userId, String username, String email, String token) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = "";
        this.lastName = "";
        this.token = token;
    }

    // Getters and setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
