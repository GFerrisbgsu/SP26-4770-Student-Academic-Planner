package com.sap.smart_academic_calendar.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * An individual requirement slot within a category.
 * Examples: "SE Core Courses", "SE Electives (choose 3)", "Calculus",
 *           "World Languages and Cultures".
 *
 * The {@link #selectionRule} field determines how courses/options must be chosen:
 * see {@link SelectionRule} for details.
 */
@Entity
@Table(name = "requirement_groups")
public class RequirementGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private RequirementCategory category;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "selection_rule", nullable = false, length = 50)
    private SelectionRule selectionRule = SelectionRule.ALL_REQUIRED;

    @Column(name = "min_courses_required")
    private Integer minCoursesRequired;

    @Column(name = "min_credits_required")
    private Integer minCreditsRequired;

    @Column(name = "constraint_notes", columnDefinition = "TEXT")
    private String constraintNotes;

    @Column(nullable = false)
    private Boolean exclusive = false;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<RequirementOption> options = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public RequirementGroup() {}

    public RequirementGroup(String name, SelectionRule selectionRule, int sortOrder) {
        this.name = name;
        this.selectionRule = selectionRule;
        this.sortOrder = sortOrder;
    }

    // --- Helper ---
    public void addOption(RequirementOption option) {
        options.add(option);
        option.setGroup(this);
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RequirementCategory getCategory() { return category; }
    public void setCategory(RequirementCategory category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public SelectionRule getSelectionRule() { return selectionRule; }
    public void setSelectionRule(SelectionRule selectionRule) { this.selectionRule = selectionRule; }

    public Integer getMinCoursesRequired() { return minCoursesRequired; }
    public void setMinCoursesRequired(Integer minCoursesRequired) { this.minCoursesRequired = minCoursesRequired; }

    public Integer getMinCreditsRequired() { return minCreditsRequired; }
    public void setMinCreditsRequired(Integer minCreditsRequired) { this.minCreditsRequired = minCreditsRequired; }

    public String getConstraintNotes() { return constraintNotes; }
    public void setConstraintNotes(String constraintNotes) { this.constraintNotes = constraintNotes; }

    public Boolean getExclusive() { return exclusive; }
    public void setExclusive(Boolean exclusive) { this.exclusive = exclusive; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<RequirementOption> getOptions() { return options; }
    public void setOptions(List<RequirementOption> options) { this.options = options; }
}
