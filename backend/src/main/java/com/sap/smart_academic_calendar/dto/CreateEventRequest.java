package com.sap.smart_academic_calendar.dto;

import java.time.LocalDate;

/**
 * Data Transfer Object for creating an event.
 * Used to receive event creation requests from clients.
 */
public class CreateEventRequest {

    private String title;
    private LocalDate date;
    private String time;
    private Double startTime;
    private Double endTime;
    private String color;
    private String type;
    private String description;
    private String location;
    private String tag;
    private Long tagId;
    private String courseId;
    private Long projectId;
    private Long todoListId;

    // Constructors
    public CreateEventRequest() {
    }

    public CreateEventRequest(String title, LocalDate date, String time, Double startTime,
                             Double endTime, String color, String type, String description,
                             String location, String tag, String courseId) {
        this.title = title;
        this.date = date;
        this.time = time;
        this.startTime = startTime;
        this.endTime = endTime;
        this.color = color;
        this.type = type;
        this.description = description;
        this.location = location;
        this.tag = tag;
        this.courseId = courseId;
    }

    public CreateEventRequest(String title, LocalDate date, String time, Double startTime,
                             Double endTime, String color, String type, String description,
                             String location, String tag, Long tagId, String courseId) {
        this.title = title;
        this.date = date;
        this.time = time;
        this.startTime = startTime;
        this.endTime = endTime;
        this.color = color;
        this.type = type;
        this.description = description;
        this.location = location;
        this.tag = tag;
        this.tagId = tagId;
        this.courseId = courseId;
    }

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Double getStartTime() {
        return startTime;
    }

    public void setStartTime(Double startTime) {
        this.startTime = startTime;
    }

    public Double getEndTime() {
        return endTime;
    }

    public void setEndTime(Double endTime) {
        this.endTime = endTime;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public Long getTagId() {
        return tagId;
    }

    public void setTagId(Long tagId) {
        this.tagId = tagId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getTodoListId() {
        return todoListId;
    }

    public void setTodoListId(Long todoListId) {
        this.todoListId = todoListId;
    }
}
