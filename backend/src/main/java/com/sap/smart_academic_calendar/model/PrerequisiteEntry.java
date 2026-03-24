package com.sap.smart_academic_calendar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

/**
 * Embeddable representing a single prerequisite entry in the
 * course_prerequisites table.
 *
 * courseId     – lowercase course ID, e.g. "cs2010". Null for OTHER type.
 * type         – PrerequisiteType enum (PREREQUISITE, COREQUISITE, OTHER).
 * description  – Human-readable detail used when type = OTHER, e.g.
 *                "Math Placement score of MATH 1280 or higher".
 *                Also used for COREQUISITE groups to note the OR logic.
 */
@Embeddable
public class PrerequisiteEntry {

    // Maps to existing 'prerequisite' column — kept for backward compatibility
    @Column(name = "prerequisite")
    private String courseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "prereq_type", nullable = false)
    private PrerequisiteType type = PrerequisiteType.PREREQUISITE;

    @Column(name = "prereq_description", columnDefinition = "TEXT")
    private String description;

    // Required by JPA
    public PrerequisiteEntry() {}

    public PrerequisiteEntry(String courseId, PrerequisiteType type, String description) {
        this.courseId = courseId;
        this.type = type;
        this.description = description;
    }

    /** Convenience constructor for simple PREREQUISITE entries. */
    public PrerequisiteEntry(String courseId) {
        this(courseId, PrerequisiteType.PREREQUISITE, null);
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public PrerequisiteType getType() {
        return type;
    }

    public void setType(PrerequisiteType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
