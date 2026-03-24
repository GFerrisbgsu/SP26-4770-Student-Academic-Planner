package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * DTO for a requirement category within a program.
 */
public class RequirementCategoryDTO {

    private Long id;
    private String name;
    private String description;
    private Integer totalCreditsRequired;
    private Integer sortOrder;
    private List<RequirementGroupDTO> groups;
    private Integer completed; // Credits completed
    private Integer inProgress; // Credits in progress
    private List<RequirementCourseDTO> courses; // Individual courses with status

    public RequirementCategoryDTO() {}

    public RequirementCategoryDTO(Long id, String name, String description,
                                  Integer totalCreditsRequired, Integer sortOrder,
                                  List<RequirementGroupDTO> groups) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.totalCreditsRequired = totalCreditsRequired;
        this.sortOrder = sortOrder;
        this.groups = groups;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getTotalCreditsRequired() { return totalCreditsRequired; }
    public void setTotalCreditsRequired(Integer totalCreditsRequired) { this.totalCreditsRequired = totalCreditsRequired; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public List<RequirementGroupDTO> getGroups() { return groups; }
    public void setGroups(List<RequirementGroupDTO> groups) { this.groups = groups; }

    public Integer getCompleted() { return completed; }
    public void setCompleted(Integer completed) { this.completed = completed; }

    public Integer getInProgress() { return inProgress; }
    public void setInProgress(Integer inProgress) { this.inProgress = inProgress; }

    public List<RequirementCourseDTO> getCourses() { return courses; }
    public void setCourses(List<RequirementCourseDTO> courses) { this.courses = courses; }
}
