package com.sap.smart_academic_calendar.dto;

/**
 * Request body for assigning a course enrollment to a requirement group.
 */
public class AssignRequirementRequest {

    private String courseId;
    private Long requirementGroupId;
    private Integer slotIndex;

    public AssignRequirementRequest() {}

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public Long getRequirementGroupId() { return requirementGroupId; }
    public void setRequirementGroupId(Long requirementGroupId) { this.requirementGroupId = requirementGroupId; }

    public Integer getSlotIndex() { return slotIndex; }
    public void setSlotIndex(Integer slotIndex) { this.slotIndex = slotIndex; }
}
