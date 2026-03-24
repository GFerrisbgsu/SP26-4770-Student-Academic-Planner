package com.sap.smart_academic_calendar.dto;

/**
 * DTO for a semester reference row.
 */
public class SemesterDTO {

    private Long id;
    private String name;
    private String term;
    private Integer yearNumber;
    private Integer sortOrder;
    private Integer maxCredits;

    public SemesterDTO() {}

    public SemesterDTO(Long id, String name, String term,
                       Integer yearNumber, Integer sortOrder, Integer maxCredits) {
        this.id = id;
        this.name = name;
        this.term = term;
        this.yearNumber = yearNumber;
        this.sortOrder = sortOrder;
        this.maxCredits = maxCredits;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public Integer getYearNumber() { return yearNumber; }
    public void setYearNumber(Integer yearNumber) { this.yearNumber = yearNumber; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Integer getMaxCredits() { return maxCredits; }
    public void setMaxCredits(Integer maxCredits) { this.maxCredits = maxCredits; }
}
