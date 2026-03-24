package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * DTO for a user's course enrollment, including which requirement groups it fulfills.
 */
public class UserCourseEnrollmentDTO {

    private Long id;
    private Long userId;
    private String courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Long semesterId;
    private String semesterName;
    private String status;
    private String grade;
    private List<FulfillmentDTO> fulfillments;

    public UserCourseEnrollmentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public List<FulfillmentDTO> getFulfillments() { return fulfillments; }
    public void setFulfillments(List<FulfillmentDTO> fulfillments) { this.fulfillments = fulfillments; }
}
