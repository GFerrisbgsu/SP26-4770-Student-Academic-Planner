package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for updating user settings.
 * Used to receive user settings update data from the frontend.
 */
public class UpdateUserSettingsRequest {

    private String phoneNumber;
    private String timeZone;
    private String defaultCalendarView;
    private String themePreference;

    public UpdateUserSettingsRequest() {}

    // Getters and Setters
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
}