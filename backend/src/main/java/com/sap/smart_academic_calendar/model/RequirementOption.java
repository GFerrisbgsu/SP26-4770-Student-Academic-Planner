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
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * One valid path to satisfy a {@link RequirementGroup}.
 *
 * <p>For simple groups (ALL_REQUIRED, CHOOSE_N_COURSES) there is exactly one option.
 * For OR-groups (CHOOSE_ONE_OPTION) there are multiple options — the student picks one.
 * For sequence groups (CHOOSE_SEQUENCE) each option is a full sequence in one language, etc.</p>
 */
@Entity
@Table(name = "requirement_options")
public class RequirementOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private RequirementGroup group;

    @Column(length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "option", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<RequirementCourse> courses = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public RequirementOption() {}

    public RequirementOption(String name, int sortOrder) {
        this.name = name;
        this.sortOrder = sortOrder;
    }

    // --- Helper ---
    public void addCourse(RequirementCourse reqCourse) {
        courses.add(reqCourse);
        reqCourse.setOption(this);
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RequirementGroup getGroup() { return group; }
    public void setGroup(RequirementGroup group) { this.group = group; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<RequirementCourse> getCourses() { return courses; }
    public void setCourses(List<RequirementCourse> courses) { this.courses = courses; }
}
