package com.sap.smart_academic_calendar.model;

/**
 * Classifies how a prerequisite must be satisfied.
 *
 * PREREQUISITE  – must be completed (with passing grade) before enrolling.
 * COREQUISITE   – may be taken concurrently in the same semester.
 * OTHER         – a non-course requirement, e.g. a Math Placement score,
 *                 departmental approval, or a test score.  The human-readable
 *                 details live in PrerequisiteEntry.description.
 */
public enum PrerequisiteType {
    PREREQUISITE,
    COREQUISITE,
    OTHER
}
