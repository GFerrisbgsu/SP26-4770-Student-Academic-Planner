package com.sap.smart_academic_calendar.dto;

public class UpsertUserPreferenceRequest {

    private String preferenceValue;

    public UpsertUserPreferenceRequest() {
    }

    public String getPreferenceValue() {
        return preferenceValue;
    }

    public void setPreferenceValue(String preferenceValue) {
        this.preferenceValue = preferenceValue;
    }
}
