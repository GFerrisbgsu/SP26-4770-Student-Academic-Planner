package com.sap.smart_academic_calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.ProgramDTO;
import com.sap.smart_academic_calendar.dto.RequirementCategoryDTO;
import com.sap.smart_academic_calendar.dto.RequirementCourseDTO;
import com.sap.smart_academic_calendar.dto.RequirementGroupDTO;
import com.sap.smart_academic_calendar.dto.RequirementOptionDTO;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.Program;
import com.sap.smart_academic_calendar.model.RequirementCategory;
import com.sap.smart_academic_calendar.model.RequirementCourse;
import com.sap.smart_academic_calendar.model.RequirementGroup;
import com.sap.smart_academic_calendar.model.RequirementOption;
import com.sap.smart_academic_calendar.repository.ProgramRepository;

/**
 * Business logic for degree programs and their requirement hierarchies.
 */
@Service
public class ProgramService {



    private final ProgramRepository programRepository;

    public ProgramService(ProgramRepository programRepository) {
        this.programRepository = programRepository;
    }

    /**
     * Returns a summary list of all programs (without nested categories/groups).
     */
    @Transactional(readOnly = true)
    public List<ProgramDTO> getAllPrograms() {
        return programRepository.findAll().stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns the full program hierarchy by ID.
     */
    @Transactional(readOnly = true)
    public ProgramDTO getProgramById(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
        return toFullDTO(program);
    }

    /**
     * Returns the full program hierarchy by name.
     */
    @Transactional(readOnly = true)
    public ProgramDTO getProgramByName(String name) {
        Program program = programRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Program not found: " + name));
        return toFullDTO(program);
    }

    // ── DTO conversion ──

    private ProgramDTO toSummaryDTO(Program p) {
        return new ProgramDTO(
                p.getId(), p.getName(), p.getDegreeType(),
                p.getTotalCreditsRequired(), p.getMinGpa(),
                p.getCatalogYear(), p.getCatalogUrl(),
                p.getDescription(), p.getAdmissionRequirements(),
                p.getGraduationNotes(), null
        );
    }

    private ProgramDTO toFullDTO(Program p) {
        List<RequirementCategoryDTO> cats = p.getCategories().stream()
                .map(this::toCategoryDTO)
                .collect(Collectors.toList());

        return new ProgramDTO(
                p.getId(), p.getName(), p.getDegreeType(),
                p.getTotalCreditsRequired(), p.getMinGpa(),
                p.getCatalogYear(), p.getCatalogUrl(),
                p.getDescription(), p.getAdmissionRequirements(),
                p.getGraduationNotes(), cats
        );
    }

    private RequirementCategoryDTO toCategoryDTO(RequirementCategory c) {
        List<RequirementGroupDTO> groups = c.getGroups().stream()
                .map(this::toGroupDTO)
                .collect(Collectors.toList());

        return new RequirementCategoryDTO(
                c.getId(), c.getName(), c.getDescription(),
                c.getTotalCreditsRequired(), c.getSortOrder(), groups
        );
    }

    private RequirementGroupDTO toGroupDTO(RequirementGroup g) {
        List<RequirementOptionDTO> options = g.getOptions().stream()
                .map(this::toOptionDTO)
                .collect(Collectors.toList());

        return new RequirementGroupDTO(
                g.getId(), g.getName(), g.getDescription(),
                g.getSelectionRule().name(),
                g.getMinCoursesRequired(), g.getMinCreditsRequired(),
                g.getConstraintNotes(), g.getExclusive(), g.getSortOrder(), options
        );
    }

    private RequirementOptionDTO toOptionDTO(RequirementOption o) {
        List<RequirementCourseDTO> courses = o.getCourses().stream()
                .map(this::toCourseDTO)
                .collect(Collectors.toList());

        return new RequirementOptionDTO(
                o.getId(), o.getName(), o.getDescription(),
                o.getSortOrder(), courses
        );
    }

    private RequirementCourseDTO toCourseDTO(RequirementCourse rc) {
        Course c = rc.getCourse();
        return new RequirementCourseDTO(
                rc.getId(), c.getId(), c.getCode(), c.getName(),
                c.getCredits(), rc.getSortOrder()
        );
    }
}
