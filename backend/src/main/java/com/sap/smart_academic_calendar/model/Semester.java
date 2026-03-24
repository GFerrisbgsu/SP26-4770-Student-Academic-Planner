package com.sap.smart_academic_calendar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A discrete academic semester (e.g. Fall 1, Spring 2).
 * Seeded via Flyway V22; rows are fixed reference data.
 */
@Entity
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SemesterTerm term;

    @Column(name = "year_number", nullable = false)
    private Integer yearNumber;

    @Column(name = "sort_order", nullable = false, unique = true)
    private Integer sortOrder;

    @Column(name = "max_credits", nullable = false)
    private Integer maxCredits = 18;

    public Semester() {}

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public SemesterTerm getTerm() { return term; }
    public void setTerm(SemesterTerm term) { this.term = term; }

    public Integer getYearNumber() { return yearNumber; }
    public void setYearNumber(Integer yearNumber) { this.yearNumber = yearNumber; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Integer getMaxCredits() { return maxCredits; }
    public void setMaxCredits(Integer maxCredits) { this.maxCredits = maxCredits; }
}
