package com.sap.smart_academic_calendar.dto;

/**
 * Request body for enrolling a course in the current semester.
 */
public class EnrollCourseRequest {

    private String courseId;
    private Long semesterId;

    public EnrollCourseRequest() {}

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }
}
