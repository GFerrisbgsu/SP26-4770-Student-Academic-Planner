package com.sap.smart_academic_calendar.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.SemesterDTO;
import com.sap.smart_academic_calendar.dto.UserSemesterDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import com.sap.smart_academic_calendar.service.SemesterService;

/**
 * REST endpoints for semester reference data and user semester progression.
 */
@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService semesterService;
    private final UserRepository userRepository;

    public SemesterController(SemesterService semesterService, UserRepository userRepository) {
        this.semesterService = semesterService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/semesters — returns all semesters (public).
     */
    @GetMapping
    public ResponseEntity<List<SemesterDTO>> getAllSemesters() {
        return ResponseEntity.ok(semesterService.getAllSemesters());
    }

    /**
     * GET /api/semesters/current — returns the authenticated user's current semester.
     */
    @GetMapping("/current")
    public ResponseEntity<UserSemesterDTO> getCurrentSemester() {
        Long userId = getAuthenticatedUserId();
        return ResponseEntity.ok(semesterService.getUserCurrentSemester(userId));
    }

    /**
     * POST /api/semesters/advance — advances the user to the next semester.
     */
    @PostMapping("/advance")
    public ResponseEntity<UserSemesterDTO> advanceSemester() {
        Long userId = getAuthenticatedUserId();
        try {
            return ResponseEntity.ok(semesterService.advanceSemester(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/semesters/rollback — rolls back to a target semester.
     * Body: { "targetSemesterId": 3 }
     */
    @PostMapping("/rollback")
    public ResponseEntity<UserSemesterDTO> rollbackSemester(@RequestBody Map<String, Long> body) {
        Long userId = getAuthenticatedUserId();
        Long targetId = body.get("targetSemesterId");
        if (targetId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(semesterService.rollbackSemester(userId, targetId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/semesters/switch-program — switches the user to a different program.
     * Clears all enrollments, fulfillments, and resets semester to Fall 1.
     * Body: { "programId": 2 }
     */
    @PostMapping("/switch-program")
    public ResponseEntity<UserSemesterDTO> switchProgram(@RequestBody Map<String, Long> body) {
        Long userId = getAuthenticatedUserId();
        Long programId = body.get("programId");
        if (programId == null) {
            return ResponseEntity.badRequest().build();
        }
        try {
            return ResponseEntity.ok(semesterService.switchProgram(userId, programId));
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
