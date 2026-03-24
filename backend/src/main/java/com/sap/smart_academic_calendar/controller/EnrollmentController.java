package com.sap.smart_academic_calendar.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.AssignRequirementRequest;
import com.sap.smart_academic_calendar.dto.EnrollCourseRequest;
import com.sap.smart_academic_calendar.dto.FulfillmentDTO;
import com.sap.smart_academic_calendar.dto.UserCourseEnrollmentDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import com.sap.smart_academic_calendar.service.EnrollmentService;

/**
 * REST endpoints for per-user course enrollment and requirement fulfillment.
 */
@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;

    public EnrollmentController(EnrollmentService enrollmentService, UserRepository userRepository) {
        this.enrollmentService = enrollmentService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/enrollments — all enrollments for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<UserCourseEnrollmentDTO>> getAllEnrollments() {
        Long userId = getAuthenticatedUserId();
        return ResponseEntity.ok(enrollmentService.getUserEnrollments(userId));
    }

    /**
     * GET /api/enrollments/semester/{semesterId} — enrollments for a specific semester.
     */
    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<List<UserCourseEnrollmentDTO>> getEnrollmentsForSemester(
            @PathVariable Long semesterId) {
        Long userId = getAuthenticatedUserId();
        return ResponseEntity.ok(enrollmentService.getUserEnrollmentsForSemester(userId, semesterId));
    }

    /**
     * GET /api/enrollments/credits/{semesterId} — total credits for a semester.
     */
    @GetMapping("/credits/{semesterId}")
    public ResponseEntity<Integer> getSemesterCredits(@PathVariable Long semesterId) {
        Long userId = getAuthenticatedUserId();
        return ResponseEntity.ok(enrollmentService.getSemesterCredits(userId, semesterId));
    }

    /**
     * POST /api/enrollments — enroll in a course.
     */
    @PostMapping
    public ResponseEntity<?> enrollCourse(
            @RequestBody EnrollCourseRequest request) {
        Long userId = getAuthenticatedUserId();
        try {
            UserCourseEnrollmentDTO dto = enrollmentService.enrollCourse(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/enrollments/{courseId} — unenroll from a course.
     */
    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> unenrollCourse(@PathVariable String courseId) {
        Long userId = getAuthenticatedUserId();
        try {
            enrollmentService.unenrollCourse(userId, courseId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/enrollments/fulfill — assign a course to a requirement group.
     */
    @PostMapping("/fulfill")
    public ResponseEntity<?> assignFulfillment(
            @RequestBody AssignRequirementRequest request) {
        Long userId = getAuthenticatedUserId();
        try {
            FulfillmentDTO dto = enrollmentService.assignRequirementFulfillment(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/enrollments/{courseId}/fulfill/{groupId} — remove a fulfillment.
     */
    @DeleteMapping("/{courseId}/fulfill/{groupId}")
    public ResponseEntity<Void> removeFulfillment(
            @PathVariable String courseId, @PathVariable Long groupId) {
        Long userId = getAuthenticatedUserId();
        try {
            enrollmentService.removeRequirementFulfillment(userId, courseId, groupId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
