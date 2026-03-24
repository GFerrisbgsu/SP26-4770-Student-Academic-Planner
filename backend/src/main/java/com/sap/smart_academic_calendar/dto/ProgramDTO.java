package com.sap.smart_academic_calendar.dto;

import java.util.List;

/**
 * DTO for the full program hierarchy.
 * Program → categories → groups → options → courses.
 */
public class ProgramDTO {

    private Long id;
    private String name;
    private String degreeType;
    private Integer totalCreditsRequired;
    private Double minGpa;
    private String catalogYear;
    private String catalogUrl;
    private String description;
    private String admissionRequirements;
    private String graduationNotes;
    private List<RequirementCategoryDTO> categories;

    public ProgramDTO() {}

    public ProgramDTO(Long id, String name, String degreeType, Integer totalCreditsRequired,
                      Double minGpa, String catalogYear, String catalogUrl, String description,
                      String admissionRequirements, String graduationNotes,
                      List<RequirementCategoryDTO> categories) {
        this.id = id;
        this.name = name;
        this.degreeType = degreeType;
        this.totalCreditsRequired = totalCreditsRequired;
        this.minGpa = minGpa;
        this.catalogYear = catalogYear;
        this.catalogUrl = catalogUrl;
        this.description = description;
        this.admissionRequirements = admissionRequirements;
        this.graduationNotes = graduationNotes;
        this.categories = categories;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDegreeType() { return degreeType; }
    public void setDegreeType(String degreeType) { this.degreeType = degreeType; }

    public Integer getTotalCreditsRequired() { return totalCreditsRequired; }
    public void setTotalCreditsRequired(Integer totalCreditsRequired) { this.totalCreditsRequired = totalCreditsRequired; }

    public Double getMinGpa() { return minGpa; }
    public void setMinGpa(Double minGpa) { this.minGpa = minGpa; }

    public String getCatalogYear() { return catalogYear; }
    public void setCatalogYear(String catalogYear) { this.catalogYear = catalogYear; }

    public String getCatalogUrl() { return catalogUrl; }
    public void setCatalogUrl(String catalogUrl) { this.catalogUrl = catalogUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAdmissionRequirements() { return admissionRequirements; }
    public void setAdmissionRequirements(String admissionRequirements) { this.admissionRequirements = admissionRequirements; }

    public String getGraduationNotes() { return graduationNotes; }
    public void setGraduationNotes(String graduationNotes) { this.graduationNotes = graduationNotes; }

    public List<RequirementCategoryDTO> getCategories() { return categories; }
    public void setCategories(List<RequirementCategoryDTO> categories) { this.categories = categories; }
}
