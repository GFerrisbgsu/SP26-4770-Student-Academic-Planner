package com.sap.smart_academic_calendar.model;

/**
 * Defines how courses within a requirement group/option must be selected.
 *
 * <ul>
 *   <li>{@code ALL_REQUIRED} — Take every course in the option (e.g., SE Core).</li>
 *   <li>{@code CHOOSE_N_COURSES} — Pick at least N courses from the option list
 *       (e.g., SE Electives: choose 3 of 8).</li>
 *   <li>{@code CHOOSE_MIN_CREDITS} — Pick courses until reaching the required
 *       minimum credit total (e.g., Additional BGP credits to reach 36).</li>
 *   <li>{@code CHOOSE_ONE_OPTION} — Pick exactly one option from the group,
 *       then complete all courses in that option (e.g., MATH 1310 vs MATH 1340+1350).</li>
 *   <li>{@code CHOOSE_SEQUENCE} — Pick one sequence option and complete all courses
 *       in order (e.g., a 4-course language sequence).</li>
 * </ul>
 */
public enum SelectionRule {
    ALL_REQUIRED,
    CHOOSE_N_COURSES,
    CHOOSE_MIN_CREDITS,
    CHOOSE_ONE_OPTION,
    CHOOSE_SEQUENCE
}
