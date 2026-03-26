package com.sap.smart_academic_calendar.dto;

import java.time.LocalDateTime;

/**
 * Request DTO for creating or updating an assignment.
 * Used for input validation and data transfer from clients.
 */
public class CreateAssignmentRequest {

    private String title;
    private String description;
    private LocalDateTime dueDate;

    private Integer points;

    private String status;

    // Constructors
    public CreateAssignmentRequest() {
    }

    public CreateAssignmentRequest(String title, LocalDateTime dueDate) {
        this.title = title;
        this.dueDate = dueDate;
    }

    public CreateAssignmentRequest(String title, String description, LocalDateTime dueDate, Integer points, String status) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.points = points;
        this.status = status;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
