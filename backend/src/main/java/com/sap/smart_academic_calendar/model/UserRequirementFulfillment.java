package com.sap.smart_academic_calendar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Links a course enrollment to a requirement group it fulfills.
 * Multiple rows per enrollment are allowed to support dual-counting
 * (e.g. ETHN 1010 counts for both BGP Social Sciences AND Cultural Diversity).
 * UNIQUE(enrollment_id, requirement_group_id) prevents duplicate assignments.
 */
@Entity
@Table(name = "user_requirement_fulfillments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"enrollment_id", "requirement_group_id"}))
public class UserRequirementFulfillment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private UserCourseEnrollment enrollment;

    @ManyToOne
    @JoinColumn(name = "requirement_group_id", nullable = false)
    private RequirementGroup requirementGroup;

    @Column(name = "slot_index", nullable = false)
    private Integer slotIndex = 0;

    public UserRequirementFulfillment() {}

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UserCourseEnrollment getEnrollment() { return enrollment; }
    public void setEnrollment(UserCourseEnrollment enrollment) { this.enrollment = enrollment; }

    public RequirementGroup getRequirementGroup() { return requirementGroup; }
    public void setRequirementGroup(RequirementGroup requirementGroup) { this.requirementGroup = requirementGroup; }

    public Integer getSlotIndex() { return slotIndex; }
    public void setSlotIndex(Integer slotIndex) { this.slotIndex = slotIndex; }
}
