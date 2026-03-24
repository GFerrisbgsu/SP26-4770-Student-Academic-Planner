package com.sap.smart_academic_calendar.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

/**
 * Entity representing a degree program (e.g., "Software Engineering, B.S.").
 * Top-level of the hierarchy: Program → RequirementCategory → RequirementGroup → RequirementOption → RequirementCourse.
 */
@Entity
@Table(name = "programs")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "degree_type", nullable = false, length = 50)
    private String degreeType;

    @Column(name = "total_credits_required", nullable = false)
    private Integer totalCreditsRequired = 120;

    @Column(name = "min_gpa", nullable = false)
    private Double minGpa = 2.00;

    @Column(name = "catalog_year", length = 20)
    private String catalogYear;

    @Column(name = "catalog_url", columnDefinition = "TEXT")
    private String catalogUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "admission_requirements", columnDefinition = "TEXT")
    private String admissionRequirements;

    @Column(name = "graduation_notes", columnDefinition = "TEXT")
    private String graduationNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<RequirementCategory> categories = new ArrayList<>();

    // Lifecycle hooks
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Default constructor required by JPA
    public Program() {}

    public Program(String name, String degreeType) {
        this.name = name;
        this.degreeType = degreeType;
    }

    // --- Helper ---
    public void addCategory(RequirementCategory category) {
        categories.add(category);
        category.setProgram(this);
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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public List<RequirementCategory> getCategories() { return categories; }
    public void setCategories(List<RequirementCategory> categories) { this.categories = categories; }
}
