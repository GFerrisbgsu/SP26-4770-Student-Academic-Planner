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
 * Entity representing course information and metadata in the system.
 * Maps to the 'course_info' table in the database.
 */
@Entity
@Table(name = "course_info")
public class CourseInfo {

    @Id
    @Column(name = "course_id", length = 255)
    private String courseId;

    @ElementCollection
    @CollectionTable(name = "course_prerequisites", joinColumns = @JoinColumn(name = "course_id"))
    private List<PrerequisiteEntry> prerequisites;

    @Column(nullable = false, length = 255)
    private String program;

    @Column(name = "course_type", nullable = false, length = 255)
    private String courseType;

    // Default constructor required by JPA
    public CourseInfo() {}

    public CourseInfo(String courseId, List<PrerequisiteEntry> prerequisites, String program, String courseType) {
        this.courseId = courseId;
        this.prerequisites = prerequisites;
        this.program = program;
        this.courseType = courseType;
    }

    // Getters and Setters
    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public List<PrerequisiteEntry> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<PrerequisiteEntry> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getCourseType() {
        return courseType;
    }

    public void setCourseType(String courseType) {
        this.courseType = courseType;
    }
}