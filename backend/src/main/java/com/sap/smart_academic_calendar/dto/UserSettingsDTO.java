package com.sap.smart_academic_calendar.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserSettings.
 * Used to transfer user settings data between layers.
 */
public class UserSettingsDTO {

    private Long id;
    private Long userId;
    private String phoneNumber;
    private String timeZone;
    private Boolean notificationsEnabled;
    private Boolean emailNotifications;
    private Boolean smsNotifications;
    private String defaultCalendarView;
    private String themePreference;
    private Integer reminderMinutesBefore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserSettingsDTO() {}

    public UserSettingsDTO(Long id, Long userId, String phoneNumber, String timeZone,
                          Boolean notificationsEnabled, Boolean emailNotifications,
                          String defaultCalendarView, String themePreference) {
        this.id = id;
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.timeZone = timeZone;
        this.notificationsEnabled = notificationsEnabled;
        this.emailNotifications = emailNotifications;
        this.defaultCalendarView = defaultCalendarView;
        this.themePreference = themePreference;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public Boolean getEmailNotifications() {
        return emailNotifications;
    }

    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public Boolean getSmsNotifications() {
        return smsNotifications;
    }

    public void setSmsNotifications(Boolean smsNotifications) {
        this.smsNotifications = smsNotifications;
    }

    public String getDefaultCalendarView() {
        return defaultCalendarView;
    }

    public void setDefaultCalendarView(String defaultCalendarView) {
        this.defaultCalendarView = defaultCalendarView;
    }

    public String getThemePreference() {
        return themePreference;
    }

    public void setThemePreference(String themePreference) {
        this.themePreference = themePreference;
    }

    public Integer getReminderMinutesBefore() {
        return reminderMinutesBefore;
    }

    public void setReminderMinutesBefore(Integer reminderMinutesBefore) {
        this.reminderMinutesBefore = reminderMinutesBefore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}