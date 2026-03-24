package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * DTO for a requirement group within a category.
 */
public class RequirementGroupDTO {

    private Long id;
    private String name;
    private String description;
    private String selectionRule;
    private Integer minCoursesRequired;
    private Integer minCreditsRequired;
    private String constraintNotes;
    private Boolean exclusive;
    private Integer sortOrder;
    private List<RequirementOptionDTO> options;

    public RequirementGroupDTO() {}

    public RequirementGroupDTO(Long id, String name, String description,
                               String selectionRule, Integer minCoursesRequired,
                               Integer minCreditsRequired, String constraintNotes,
                               Boolean exclusive, Integer sortOrder,
                               List<RequirementOptionDTO> options) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.selectionRule = selectionRule;
        this.minCoursesRequired = minCoursesRequired;
        this.minCreditsRequired = minCreditsRequired;
        this.constraintNotes = constraintNotes;
        this.exclusive = exclusive;
        this.sortOrder = sortOrder;
        this.options = options;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSelectionRule() { return selectionRule; }
    public void setSelectionRule(String selectionRule) { this.selectionRule = selectionRule; }

    public Integer getMinCoursesRequired() { return minCoursesRequired; }
    public void setMinCoursesRequired(Integer minCoursesRequired) { this.minCoursesRequired = minCoursesRequired; }

    public Integer getMinCreditsRequired() { return minCreditsRequired; }
    public void setMinCreditsRequired(Integer minCreditsRequired) { this.minCreditsRequired = minCreditsRequired; }

    public String getConstraintNotes() { return constraintNotes; }
    public void setConstraintNotes(String constraintNotes) { this.constraintNotes = constraintNotes; }

    public Boolean getExclusive() { return exclusive; }
    public void setExclusive(Boolean exclusive) { this.exclusive = exclusive; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public List<RequirementOptionDTO> getOptions() { return options; }
    public void setOptions(List<RequirementOptionDTO> options) { this.options = options; }
}
