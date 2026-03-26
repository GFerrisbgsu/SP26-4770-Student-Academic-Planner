package com.sap.smart_academic_calendar.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(EnrollmentController.class);

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
    public ResponseEntity<?> getAllEnrollments() {
        try {
            Long userId = getAuthenticatedUserId();
            return ResponseEntity.ok(enrollmentService.getUserEnrollments(userId));
        } catch (RuntimeException e) {
            log.error("Failed to get enrollments", e);
            if ("User not found".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not found"));
            }
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/enrollments/semester/{semesterId} — enrollments for a specific semester.
     */
    @GetMapping("/semester/{semesterId}")
    public ResponseEntity<?> getEnrollmentsForSemester(
            @PathVariable Long semesterId) {
        try {
            Long userId = getAuthenticatedUserId();
            return ResponseEntity.ok(enrollmentService.getUserEnrollmentsForSemester(userId, semesterId));
        } catch (RuntimeException e) {
            log.error("Failed to get semester enrollments", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/enrollments/credits/{semesterId} — total credits for a semester.
     */
    @GetMapping("/credits/{semesterId}")
    public ResponseEntity<?> getSemesterCredits(@PathVariable Long semesterId) {
        try {
            Long userId = getAuthenticatedUserId();
            return ResponseEntity.ok(enrollmentService.getSemesterCredits(userId, semesterId));
        } catch (RuntimeException e) {
            log.error("Failed to get semester credits", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
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
        Long userId = Long.parseLong(auth.getName());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
