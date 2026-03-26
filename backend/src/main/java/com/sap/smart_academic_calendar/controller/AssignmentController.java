package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.AssignmentDTO;
import com.sap.smart_academic_calendar.dto.CreateAssignmentRequest;
import com.sap.smart_academic_calendar.service.AssignmentService;

/**
 * REST Controller for Assignment operations.
 * Handles HTTP requests related to assignment management.
 * Contains no business logic - delegates to AssignmentService.
 */
@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    // Constructor injection for dependencies
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    /**
     * POST endpoint to create a new assignment for a course.
     * @param courseId the course ID
     * @param request the assignment creation request
     * @return ResponseEntity with created assignment data
     */
    @PostMapping("/course/{courseId}")
    public ResponseEntity<AssignmentDTO> createAssignment(
            @PathVariable String courseId,
            @RequestBody CreateAssignmentRequest request) {
        try {
            AssignmentDTO createdAssignment = assignmentService.createAssignment(courseId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAssignment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET endpoint to retrieve all assignments for a course.
     * Optionally filter by status.
     * @param courseId the course ID
     * @param status optional status filter (TODO, IN_PROGRESS, COMPLETED)
     * @return ResponseEntity with list of assignments
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsByCourse(
            @PathVariable String courseId,
            @RequestParam(required = false) String status) {
        try {
            List<AssignmentDTO> assignments;
            if (status != null && !status.isEmpty()) {
                assignments = assignmentService.getAssignmentsByCourseAndStatus(courseId, status);
            } else {
                assignments = assignmentService.getAssignmentsByCourse(courseId);
            }
            return ResponseEntity.ok(assignments);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve a specific assignment by ID.
     * @param assignmentId the assignment ID
     * @return ResponseEntity with the assignment data
     */
    @GetMapping("/{assignmentId}")
    public ResponseEntity<AssignmentDTO> getAssignmentById(@PathVariable Long assignmentId) {
        try {
            AssignmentDTO assignment = assignmentService.getAssignmentById(assignmentId);
            return ResponseEntity.ok(assignment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT endpoint to update an existing assignment.
     * @param assignmentId the assignment ID
     * @param request the update request
     * @return ResponseEntity with updated assignment data
     */
    @PutMapping("/{assignmentId}")
    public ResponseEntity<AssignmentDTO> updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody CreateAssignmentRequest request) {
        try {
            AssignmentDTO updatedAssignment = assignmentService.updateAssignment(assignmentId, request);
            return ResponseEntity.ok(updatedAssignment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE endpoint to remove an assignment.
     * @param assignmentId the assignment ID
     * @return ResponseEntity with no content on success
     */
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long assignmentId) {
        try {
            assignmentService.deleteAssignment(assignmentId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
