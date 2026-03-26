package com.sap.smart_academic_calendar.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Assignment responses.
 * Used to transfer assignment data to clients without exposing internal details.
 */
public class AssignmentDTO {

    private Long id;
    private String courseId;
    private String title;
    private String description;
    private String status;
    private LocalDateTime dueDate;
    private Integer points;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public AssignmentDTO() {
    }

    public AssignmentDTO(Long id, String courseId, String title, String description, String status, LocalDateTime dueDate, Integer points, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.dueDate = dueDate;
        this.points = points;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
