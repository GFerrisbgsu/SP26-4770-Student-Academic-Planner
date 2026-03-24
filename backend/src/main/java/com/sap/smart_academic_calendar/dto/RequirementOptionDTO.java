package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * DTO for a requirement option within a group.
 */
public class RequirementOptionDTO {

    private Long id;
    private String name;
    private String description;
    private Integer sortOrder;
    private List<RequirementCourseDTO> courses;

    public RequirementOptionDTO() {}

    public RequirementOptionDTO(Long id, String name, String description,
                                Integer sortOrder, List<RequirementCourseDTO> courses) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sortOrder = sortOrder;
        this.courses = courses;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public List<RequirementCourseDTO> getCourses() { return courses; }
    public void setCourses(List<RequirementCourseDTO> courses) { this.courses = courses; }
}
