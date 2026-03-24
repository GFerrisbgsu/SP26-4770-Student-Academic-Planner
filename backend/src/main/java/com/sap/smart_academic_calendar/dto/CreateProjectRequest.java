package com.sap.smart_academic_calendar.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Data Transfer Object for creating a project.
 * Used to receive project creation requests from clients.
 */
public class CreateProjectRequest {

    private String name;
    private String description;
    private String color;
    private LocalDate deadline;
    private LocalTime deadlineTime;
    private Boolean completed;
    private Long todoListId;

    // Constructors
    public CreateProjectRequest() {
    }

    public CreateProjectRequest(String name, String description, String color) {
        this.name = name;
        this.description = description;
        this.color = color;
    }

    public CreateProjectRequest(String name, String description, String color, LocalDate deadline, LocalTime deadlineTime) {
        this.name = name;
        this.description = description;
        this.color = color;
        this.deadline = deadline;
        this.deadlineTime = deadlineTime;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public LocalTime getDeadlineTime() {
        return deadlineTime;
    }

    public void setDeadlineTime(LocalTime deadlineTime) {
        this.deadlineTime = deadlineTime;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public Long getTodoListId() {
        return todoListId;
    }

    public void setTodoListId(Long todoListId) {
        this.todoListId = todoListId;
    }
}
