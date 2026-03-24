package com.sap.smart_academic_calendar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Links a specific {@link Course} to a {@link RequirementOption}.
 * The {@code sortOrder} determines the display/prerequisite progression order.
 */
@Entity
@Table(name = "requirement_courses")
public class RequirementCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "option_id", nullable = false)
    private RequirementOption option;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public RequirementCourse() {}

    public RequirementCourse(Course course, int sortOrder) {
        this.course = course;
        this.sortOrder = sortOrder;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RequirementOption getOption() { return option; }
    public void setOption(RequirementOption option) { this.option = option; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
