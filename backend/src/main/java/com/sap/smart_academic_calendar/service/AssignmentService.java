package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.AssignmentDTO;
import com.sap.smart_academic_calendar.dto.CreateAssignmentRequest;
import com.sap.smart_academic_calendar.model.Assignment;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.repository.AssignmentRepository;
import com.sap.smart_academic_calendar.repository.CourseRepository;

/**
 * Service layer for assignment operations.
 * Contains all business logic for managing assignments.
 * Stateless and testable - uses constructor injection.
 */
@Service
public class AssignmentService {

    private static final Logger log = LoggerFactory.getLogger(AssignmentService.class);

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;

    public AssignmentService(AssignmentRepository assignmentRepository, CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
    }

    /**
     * Create a new assignment for a course.
     * @param courseId the course ID
     * @param request the assignment creation request
     * @return the created assignment DTO
     */
    @Transactional
    public AssignmentDTO createAssignment(String courseId, CreateAssignmentRequest request) {
        log.info("Creating assignment for course {}", courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        Assignment assignment = new Assignment(
                course,
                request.getTitle(),
                request.getDescription(),
                request.getDueDate(),
                request.getPoints()
        );

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            assignment.setStatus(request.getStatus());
        }

        Assignment savedAssignment = assignmentRepository.save(assignment);
        log.info("Assignment created with ID {}", savedAssignment.getId());

        return convertToDTO(savedAssignment);
    }

    /**
     * Get all assignments for a specific course.
     * @param courseId the course ID
     * @return list of assignment DTOs
     */
    public List<AssignmentDTO> getAssignmentsByCourse(String courseId) {
        log.debug("Fetching assignments for course {}", courseId);

        // Verify course exists
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found: " + courseId);
        }

        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get assignments for a course filtered by status.
     * @param courseId the course ID
     * @param status the assignment status (TODO, IN_PROGRESS, COMPLETED)
     * @return list of assignment DTOs matching the status
     */
    public List<AssignmentDTO> getAssignmentsByCourseAndStatus(String courseId, String status) {
        log.debug("Fetching assignments for course {} with status {}", courseId, status);

        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found: " + courseId);
        }

        List<Assignment> assignments = assignmentRepository.findByCourseIdAndStatus(courseId, status);
        return assignments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific assignment by ID.
     * @param assignmentId the assignment ID
     * @return the assignment DTO
     */
    public AssignmentDTO getAssignmentById(Long assignmentId) {
        log.debug("Fetching assignment with ID {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        return convertToDTO(assignment);
    }

    /**
     * Update an existing assignment.
     * @param assignmentId the assignment ID
     * @param request the update request
     * @return the updated assignment DTO
     */
    @Transactional
    public AssignmentDTO updateAssignment(Long assignmentId, CreateAssignmentRequest request) {
        log.info("Updating assignment with ID {}", assignmentId);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            assignment.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            assignment.setDescription(request.getDescription());
        }

        if (request.getDueDate() != null) {
            assignment.setDueDate(request.getDueDate());
        }

        if (request.getPoints() != null) {
            assignment.setPoints(request.getPoints());
        }

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            assignment.setStatus(request.getStatus());
        }

        assignment.setUpdatedAt(LocalDateTime.now());
        Assignment updatedAssignment = assignmentRepository.save(assignment);
        log.info("Assignment {} updated successfully", assignmentId);

        return convertToDTO(updatedAssignment);
    }

    /**
     * Delete an assignment.
     * @param assignmentId the assignment ID
     */
    @Transactional
    public void deleteAssignment(Long assignmentId) {
        log.info("Deleting assignment with ID {}", assignmentId);

        if (!assignmentRepository.existsById(assignmentId)) {
            throw new RuntimeException("Assignment not found: " + assignmentId);
        }

        assignmentRepository.deleteById(assignmentId);
        log.info("Assignment {} deleted", assignmentId);
    }

    /**
     * Convert an Assignment entity to a DTO.
     * @param assignment the assignment entity
     * @return the assignment DTO
     */
    private AssignmentDTO convertToDTO(Assignment assignment) {
        return new AssignmentDTO(
                assignment.getId(),
                assignment.getCourse().getId(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getStatus(),
                assignment.getDueDate(),
                assignment.getPoints(),
                assignment.getCreatedAt(),
                assignment.getUpdatedAt()
        );
    }
}
