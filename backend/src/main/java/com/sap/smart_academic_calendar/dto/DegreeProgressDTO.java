package com.sap.smart_academic_calendar.dto;

public class DegreeProgressDTO {
    private String program;
    private String expectedGraduation;
    private int totalCreditsRequired;
    private int creditsCompleted;
    private int creditsInProgress;

    public DegreeProgressDTO() {}

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }
    public String getExpectedGraduation() { return expectedGraduation; }
    public void setExpectedGraduation(String v) { this.expectedGraduation = v; }
    public int getTotalCreditsRequired() { return totalCreditsRequired; }
    public void setTotalCreditsRequired(int v) { this.totalCreditsRequired = v; }
    public int getCreditsCompleted() { return creditsCompleted; }
    public void setCreditsCompleted(int v) { this.creditsCompleted = v; }
    public int getCreditsInProgress() { return creditsInProgress; }
    public void setCreditsInProgress(int v) { this.creditsInProgress = v; }
}