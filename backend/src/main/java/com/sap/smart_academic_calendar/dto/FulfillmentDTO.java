package com.sap.smart_academic_calendar.dto;

/**
 * DTO for a single requirement fulfillment (links enrollment to a requirement group).
 */
public class FulfillmentDTO {

    private Long id;
    private Long requirementGroupId;
    private String requirementGroupName;
    private Integer slotIndex;

    public FulfillmentDTO() {}

    public FulfillmentDTO(Long id, Long requirementGroupId,
                          String requirementGroupName, Integer slotIndex) {
        this.id = id;
        this.requirementGroupId = requirementGroupId;
        this.requirementGroupName = requirementGroupName;
        this.slotIndex = slotIndex;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRequirementGroupId() { return requirementGroupId; }
    public void setRequirementGroupId(Long requirementGroupId) { this.requirementGroupId = requirementGroupId; }

    public String getRequirementGroupName() { return requirementGroupName; }
    public void setRequirementGroupName(String requirementGroupName) { this.requirementGroupName = requirementGroupName; }

    public Integer getSlotIndex() { return slotIndex; }
    public void setSlotIndex(Integer slotIndex) { this.slotIndex = slotIndex; }
}
