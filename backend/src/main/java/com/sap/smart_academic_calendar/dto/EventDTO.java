package com.sap.smart_academic_calendar.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Event responses.
 * Used to transfer event data to clients without exposing internal details.
 */
public class EventDTO {

    private Long id;
    private Long userId;
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
    private TagDTO tagObject;
    private String courseId;
    private Long projectId;
    private Long todoListId;
    private Boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public EventDTO() {
    }

    public EventDTO(Long id, Long userId, String title, LocalDate date, String time, 
                    Double startTime, Double endTime, String color, String type, 
                    String description, String location, String tag, String courseId,
                    Boolean completed, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
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
        this.completed = completed;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public EventDTO(Long id, Long userId, String title, LocalDate date, String time, 
                    Double startTime, Double endTime, String color, String type, 
                    String description, String location, String tag, Long tagId, TagDTO tagObject,
                    String courseId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
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
        this.tagObject = tagObject;
        this.courseId = courseId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public EventDTO(Long id, Long userId, String title, LocalDate date, String time, 
                    Double startTime, Double endTime, String color, String type, 
                    String description, String location, String tag, Long tagId, TagDTO tagObject,
                    String courseId, Boolean completed, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
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
        this.tagObject = tagObject;
        this.courseId = courseId;
        this.completed = completed;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

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

    public TagDTO getTagObject() {
        return tagObject;
    }

    public void setTagObject(TagDTO tagObject) {
        this.tagObject = tagObject;
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

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
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
