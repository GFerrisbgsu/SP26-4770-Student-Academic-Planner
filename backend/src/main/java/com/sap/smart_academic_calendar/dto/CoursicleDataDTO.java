package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * Data Transfer Object for Coursicle scraped data
 *
 * Represents course information retrieved from Coursicle.com via section-heading
 * text search and JSON-LD structured data parsing:
 * - instructor  : First name in the "Recent Professors" section
 * - schedule    : Content of the "Usually Offered" section
 * - description : From JSON-LD structured data (most reliable source)
 * - credits     : From JSON-LD numberOfCredits field
 * - semesters   : Comma-separated list from "Recent Semesters" section
 *
 * Used to transfer scraped data from CoursicleScraperService to CourseEnhancementService
 */
public class CoursicleDataDTO {

    private String code;              // Course code (e.g., "CS 2010")
    private String instructor;        // First recent professor (e.g., "Tianyi Song")
    private String schedule;          // Usually offered schedule (e.g., "MWF (50 minutes)")
    private String description;       // Full course description from JSON-LD
    private Integer credits;          // Credit hours (e.g., 3)
    private List<String> semesters;   // Recent semesters (e.g., ["Fall 2025", "Spring 2025"])
    
    // Constructors
    
    public CoursicleDataDTO() {
    }

    public CoursicleDataDTO(String code, String instructor, String schedule) {
        this.code = code;
        this.instructor = instructor;
        this.schedule = schedule;
    }

    public CoursicleDataDTO(String code, String instructor, String schedule,
                            String description, Integer credits, List<String> semesters) {
        this.code = code;
        this.instructor = instructor;
        this.schedule = schedule;
        this.description = description;
        this.credits = credits;
        this.semesters = semesters;
    }
    
    // Getters and Setters
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getInstructor() {
        return instructor;
    }
    
    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }
    
    public String getSchedule() {
        return schedule;
    }
    
    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public List<String> getSemesters() {
        return semesters;
    }

    public void setSemesters(List<String> semesters) {
        this.semesters = semesters;
    }

    @Override
    public String toString() {
        return "CoursicleDataDTO{" +
                "code='" + code + '\'' +
                ", instructor='" + instructor + '\'' +
                ", schedule='" + schedule + '\'' +
                ", credits=" + credits +
                '}';
    }
}
