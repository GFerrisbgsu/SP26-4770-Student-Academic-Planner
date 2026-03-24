package com.sap.smart_academic_calendar.dto;

import com.sap.smart_academic_calendar.model.PrerequisiteEntry;

import java.util.List;

/**
 * Data Transfer Object for CourseInfo.
 * Used to transfer course information and metadata between layers.
 */
public class CourseInfoDTO {

    private String courseId;
    private List<PrerequisiteEntry> prerequisites;
    private String program;
    private String courseType;

    public CourseInfoDTO() {}

    public CourseInfoDTO(String courseId, List<PrerequisiteEntry> prerequisites, String program, String courseType) {
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