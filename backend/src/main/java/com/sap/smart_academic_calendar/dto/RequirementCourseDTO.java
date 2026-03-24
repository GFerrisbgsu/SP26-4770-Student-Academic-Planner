package com.sap.smart_academic_calendar.dto;

/**
 * DTO for a course within a requirement option.
 * Includes summary fields from the linked Course entity.
 */
public class RequirementCourseDTO {

    private Long id;
    private String courseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Integer sortOrder;
    private String status; // "completed", "inProgress", "notStarted"

    public RequirementCourseDTO() {}

    public RequirementCourseDTO(Long id, String courseId, String courseCode,
                                String courseName, Integer credits, Integer sortOrder) {
        this.id = id;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.credits = credits;
        this.sortOrder = sortOrder;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
