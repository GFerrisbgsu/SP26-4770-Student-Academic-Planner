package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * Request DTO for creating a new course.
 * Contains all necessary fields for course creation.
 */
public class CreateCourseRequest {

    private String id;
    private String name;
    private String code;
    private String subject;
    private String number;
    private String color;
    private String instructor;
    private String schedule;
    private Integer credits;
    private Boolean enrolled;
    private List<String> semesters;
    private List<String> history;
    private String description;
    private String prerequisiteText;

    public CreateCourseRequest() {}

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Boolean getEnrolled() {
        return enrolled;
    }

    public void setEnrolled(Boolean enrolled) {
        this.enrolled = enrolled;
    }

    public List<String> getSemesters() {
        return semesters;
    }

    public void setSemesters(List<String> semesters) {
        this.semesters = semesters;
    }

    public List<String> getHistory() {
        return history;
    }

    public void setHistory(List<String> history) {
        this.history = history;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPrerequisiteText() {
        return prerequisiteText;
    }

    public void setPrerequisiteText(String prerequisiteText) {
        this.prerequisiteText = prerequisiteText;
    }
}
