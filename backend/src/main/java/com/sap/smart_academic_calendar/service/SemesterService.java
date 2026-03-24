package com.sap.smart_academic_calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.SemesterDTO;
import com.sap.smart_academic_calendar.dto.UserSemesterDTO;
import com.sap.smart_academic_calendar.model.EnrollmentStatus;
import com.sap.smart_academic_calendar.model.Program;
import com.sap.smart_academic_calendar.model.Semester;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.model.UserCourseEnrollment;
import com.sap.smart_academic_calendar.model.UserSemester;
import com.sap.smart_academic_calendar.repository.ProgramRepository;
import com.sap.smart_academic_calendar.repository.SemesterRepository;
import com.sap.smart_academic_calendar.repository.UserCourseEnrollmentRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;
import com.sap.smart_academic_calendar.repository.UserRequirementFulfillmentRepository;
import com.sap.smart_academic_calendar.repository.UserSemesterRepository;

/**
 * Manages semester reference data and user semester progression.
 */
@Service
public class SemesterService {

    private static final Logger log = LoggerFactory.getLogger(SemesterService.class);

    private final SemesterRepository semesterRepository;
    private final UserSemesterRepository userSemesterRepository;
    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final UserRequirementFulfillmentRepository fulfillmentRepository;
    private final UserRepository userRepository;
    private final ProgramRepository programRepository;

    public SemesterService(SemesterRepository semesterRepository,
                           UserSemesterRepository userSemesterRepository,
                           UserCourseEnrollmentRepository enrollmentRepository,
                           UserRequirementFulfillmentRepository fulfillmentRepository,
                           UserRepository userRepository,
                           ProgramRepository programRepository) {
        this.semesterRepository = semesterRepository;
        this.userSemesterRepository = userSemesterRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.fulfillmentRepository = fulfillmentRepository;
        this.userRepository = userRepository;
        this.programRepository = programRepository;
    }

    /**
     * Returns all semesters ordered by sort_order.
     */
    public List<SemesterDTO> getAllSemesters() {
        return semesterRepository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Gets the user's current semester. If none exists, initializes to Fall 1.
     */
    @Transactional
    public UserSemesterDTO getUserCurrentSemester(Long userId) {
        UserSemester us = userSemesterRepository.findByUserId(userId)
                .orElseGet(() -> initializeUserSemester(userId));
        return toUserSemesterDTO(us);
    }

    /**
     * Advances the user to the next semester.
     * Marks all ENROLLED courses in the current semester as COMPLETED.
     */
    @Transactional
    public UserSemesterDTO advanceSemester(Long userId) {
        UserSemester us = userSemesterRepository.findByUserId(userId)
                .orElseGet(() -> initializeUserSemester(userId));

        Semester current = us.getCurrentSemester();

        // Mark current semester's ENROLLED courses as COMPLETED
        List<UserCourseEnrollment> currentEnrollments =
                enrollmentRepository.findByUserIdAndSemesterId(userId, current.getId());
        for (UserCourseEnrollment e : currentEnrollments) {
            if (e.getStatus() == EnrollmentStatus.ENROLLED) {
                e.setStatus(EnrollmentStatus.COMPLETED);
                e.getCourse().setEnrolled(false);
            }
        }
        enrollmentRepository.saveAll(currentEnrollments);

        // Advance to the next semester if one exists; otherwise stay on the last one
        List<Semester> all = semesterRepository.findAllByOrderBySortOrderAsc();
        Semester next = all.stream()
                .filter(s -> s.getSortOrder() > current.getSortOrder())
                .findFirst()
                .orElse(null);

        if (next != null) {
            us.setCurrentSemester(next);
            userSemesterRepository.save(us);
            log.info("User {} advanced from {} to {}", userId, current.getName(), next.getName());
        } else {
            log.info("User {} completed final semester {}", userId, current.getName());
        }

        return toUserSemesterDTO(us);
    }

    /**
     * Rolls back to a target semester.
     * Deletes all enrollments (and cascaded fulfillments) after the target semester.
     */
    @Transactional
    public UserSemesterDTO rollbackSemester(Long userId, Long targetSemesterId) {
        UserSemester us = userSemesterRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User semester not initialized"));

        Semester target = semesterRepository.findById(targetSemesterId)
                .orElseThrow(() -> new RuntimeException("Semester not found: " + targetSemesterId));

        if (target.getSortOrder() > us.getCurrentSemester().getSortOrder()) {
            throw new RuntimeException("Cannot rollback to a semester after the current one");
        }

        // Delete enrollments after the target semester — first clear enrolled flags
        List<UserCourseEnrollment> laterEnrollments =
                enrollmentRepository.findByUserIdAndSemesterSortOrderGreaterThan(
                        userId, target.getSortOrder());
        for (UserCourseEnrollment e : laterEnrollments) {
            e.getCourse().setEnrolled(false);
        }
        enrollmentRepository.deleteByUserIdAndSemesterSortOrderGreaterThan(
                userId, target.getSortOrder());

        // Reset COMPLETED courses in the target semester back to ENROLLED
        List<UserCourseEnrollment> targetEnrollments =
                enrollmentRepository.findByUserIdAndSemesterId(userId, target.getId());
        for (UserCourseEnrollment e : targetEnrollments) {
            if (e.getStatus() == EnrollmentStatus.COMPLETED) {
                e.setStatus(EnrollmentStatus.ENROLLED);
                e.getCourse().setEnrolled(true);
            }
        }
        enrollmentRepository.saveAll(targetEnrollments);

        us.setCurrentSemester(target);
        userSemesterRepository.save(us);

        log.info("User {} rolled back to {}", userId, target.getName());
        return toUserSemesterDTO(us);
    }

    /**
     * Switches the user to a different program.
     * Deletes all fulfillments and enrollments, resets semester to Fall 1.
     */
    @Transactional
    public UserSemesterDTO switchProgram(Long userId, Long programId) {
        UserSemester us = userSemesterRepository.findByUserId(userId)
                .orElseGet(() -> initializeUserSemester(userId));

        Program newProgram = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        if (us.getProgram() != null && us.getProgram().getId().equals(programId)) {
            return toUserSemesterDTO(us);
        }

        // Clear enrolled flags on courses before deleting enrollments
        List<UserCourseEnrollment> allEnrollments = enrollmentRepository.findByUserId(userId);
        for (UserCourseEnrollment e : allEnrollments) {
            e.getCourse().setEnrolled(false);
        }

        // Delete all fulfillments then all enrollments for this user
        fulfillmentRepository.deleteAllByEnrollmentUserId(userId);
        enrollmentRepository.deleteAllByUserId(userId);

        // Reset to Fall 1
        Semester first = semesterRepository.findAllByOrderBySortOrderAsc().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No semesters configured"));
        us.setCurrentSemester(first);
        us.setProgram(newProgram);
        userSemesterRepository.save(us);

        log.info("User {} switched to program '{}', progress reset", userId, newProgram.getName());
        return toUserSemesterDTO(us);
    }

    // --- Private helpers ---

    private UserSemester initializeUserSemester(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Semester first = semesterRepository.findAllByOrderBySortOrderAsc().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No semesters configured"));
        Program defaultProgram = programRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Default program not found"));

        UserSemester us = new UserSemester();
        us.setUser(user);
        us.setCurrentSemester(first);
        us.setProgram(defaultProgram);
        return userSemesterRepository.save(us);
    }

    private SemesterDTO toDTO(Semester s) {
        return new SemesterDTO(s.getId(), s.getName(), s.getTerm().name(),
                               s.getYearNumber(), s.getSortOrder(), s.getMaxCredits());
    }

    private UserSemesterDTO toUserSemesterDTO(UserSemester us) {
        Long programId = us.getProgram() != null ? us.getProgram().getId() : null;
        String programName = us.getProgram() != null ? us.getProgram().getName() : null;
        return new UserSemesterDTO(us.getId(), us.getUser().getId(),
                                    toDTO(us.getCurrentSemester()), programId, programName);
    }
}
