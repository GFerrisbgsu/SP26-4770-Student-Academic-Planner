package com.sap.smart_academic_calendar.model;

import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

/**
 * Entity representing a course in the system.
 * Maps to the 'courses' table in the database.
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @Column(length = 255)
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(length = 100)
    private String subject;

    @Column(length = 50)
    private String number;

    @Column(nullable = false, length = 50)
    private String color;

    @Column(nullable = false, length = 255)
    private String instructor;

    @Column(length = 255)
    private String schedule;

    @Column
    private Integer credits;

    @Column(nullable = false)
    private Boolean enrolled = false;

    @ElementCollection
    @CollectionTable(name = "course_semesters", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "semester")
    private List<String> semesters;

    @ElementCollection
    @CollectionTable(name = "course_history", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "history_entry")
    private List<String> history;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Raw prerequisite/corequisite text exactly as written in the course catalog.
    // Stored verbatim so it can be parsed into structured prerequisites later.
    @Column(columnDefinition = "TEXT")
    private String prerequisiteText;

    // Default constructor required by JPA
    public Course() {}

    public Course(String id, String name, String code, String color, String instructor, String schedule) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.color = color;
        this.instructor = instructor;
        this.schedule = schedule;
        this.enrolled = false;
    }

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