package com.sap.smart_academic_calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.AssignRequirementRequest;
import com.sap.smart_academic_calendar.dto.EnrollCourseRequest;
import com.sap.smart_academic_calendar.dto.FulfillmentDTO;
import com.sap.smart_academic_calendar.dto.UserCourseEnrollmentDTO;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.EnrollmentStatus;
import com.sap.smart_academic_calendar.model.RequirementGroup;
import com.sap.smart_academic_calendar.model.Semester;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.model.UserCourseEnrollment;
import com.sap.smart_academic_calendar.model.UserRequirementFulfillment;
import com.sap.smart_academic_calendar.repository.CourseRepository;
import com.sap.smart_academic_calendar.repository.RequirementGroupRepository;
import com.sap.smart_academic_calendar.repository.SemesterRepository;
import com.sap.smart_academic_calendar.repository.UserCourseEnrollmentRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;
import com.sap.smart_academic_calendar.repository.UserRequirementFulfillmentRepository;

/**
 * Manages per-user course enrollments and requirement fulfillments.
 * Enforces credit limits, exclusive group rules, and dual-counting.
 */
@Service
public class EnrollmentService {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    private final UserCourseEnrollmentRepository enrollmentRepository;
    private final UserRequirementFulfillmentRepository fulfillmentRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final UserRepository userRepository;
    private final RequirementGroupRepository requirementGroupRepository;

    public EnrollmentService(UserCourseEnrollmentRepository enrollmentRepository,
                             UserRequirementFulfillmentRepository fulfillmentRepository,
                             CourseRepository courseRepository,
                             SemesterRepository semesterRepository,
                             UserRepository userRepository,
                             RequirementGroupRepository requirementGroupRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.fulfillmentRepository = fulfillmentRepository;
        this.courseRepository = courseRepository;
        this.semesterRepository = semesterRepository;
        this.userRepository = userRepository;
        this.requirementGroupRepository = requirementGroupRepository;
    }

    /**
     * Returns all enrollments for a user (across all semesters).
     */
    @Transactional(readOnly = true)
    public List<UserCourseEnrollmentDTO> getUserEnrollments(Long userId) {
        return enrollmentRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns enrollments for a specific semester.
     */
    @Transactional(readOnly = true)
    public List<UserCourseEnrollmentDTO> getUserEnrollmentsForSemester(Long userId, Long semesterId) {
        return enrollmentRepository.findByUserIdAndSemesterId(userId, semesterId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Returns total credits enrolled in a given semester.
     */
    public int getSemesterCredits(Long userId, Long semesterId) {
        return enrollmentRepository.sumCreditsByUserIdAndSemesterId(userId, semesterId);
    }

    /**
     * Enrolls a course for a user in a specified semester.
     * Validates: course exists, not already enrolled, credit limit not exceeded.
     */
    @Transactional
    public UserCourseEnrollmentDTO enrollCourse(Long userId, EnrollCourseRequest request) {
        if (enrollmentRepository.existsByUserIdAndCourseId(userId, request.getCourseId())) {
            throw new RuntimeException("Already enrolled in this course");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found: " + request.getCourseId()));
        Semester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new RuntimeException("Semester not found: " + request.getSemesterId()));

        // Credit limit check
        int currentCredits = enrollmentRepository.sumCreditsByUserIdAndSemesterId(
                userId, semester.getId());
        int courseCredits = course.getCredits() != null ? course.getCredits() : 0;
        if (currentCredits + courseCredits > semester.getMaxCredits()) {
            throw new RuntimeException("Credit limit exceeded. Current: " + currentCredits +
                    ", adding: " + courseCredits + ", max: " + semester.getMaxCredits());
        }

        UserCourseEnrollment enrollment = new UserCourseEnrollment();
        enrollment.setUser(user);
        enrollment.setCourse(course);
        enrollment.setSemester(semester);
        enrollment.setStatus(EnrollmentStatus.ENROLLED);

        UserCourseEnrollment saved = enrollmentRepository.save(enrollment);

        // Sync the legacy enrolled flag so the courses tab reflects enrollment
        course.setEnrolled(true);
        courseRepository.save(course);

        log.info("User {} enrolled in {} for {}", userId, course.getCode(), semester.getName());
        return toDTO(saved);
    }

    /**
     * Unenrolls a course. Only ENROLLED courses can be unenrolled (not COMPLETED).
     */
    @Transactional
    public void unenrollCourse(Long userId, String courseId) {
        UserCourseEnrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        if (enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot unenroll from a completed course");
        }

        // Sync the legacy enrolled flag and clear the schedule so the user
        // gets prompted to set a new schedule if they re-enroll.
        Course course = enrollment.getCourse();
        course.setEnrolled(false);
        course.setSchedule(null);
        courseRepository.save(course);

        enrollmentRepository.delete(enrollment);
        log.info("User {} unenrolled from {}", userId, courseId);
    }

    /**
     * Assigns a course enrollment to fulfill a requirement group.
     * Enforces exclusive group rules (MDC).
     */
    @Transactional
    public FulfillmentDTO assignRequirementFulfillment(Long userId, AssignRequirementRequest request) {
        UserCourseEnrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(userId, request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Enrollment not found for course: " + request.getCourseId()));

        RequirementGroup group = requirementGroupRepository.findById(request.getRequirementGroupId())
                .orElseThrow(() -> new RuntimeException("Requirement group not found: " + request.getRequirementGroupId()));

        // Check if already assigned
        if (fulfillmentRepository.existsByEnrollmentIdAndRequirementGroupId(
                enrollment.getId(), group.getId())) {
            throw new RuntimeException("Course already fulfills this requirement group");
        }

        // Exclusive group enforcement
        List<UserRequirementFulfillment> existingFulfillments =
                fulfillmentRepository.findByEnrollmentId(enrollment.getId());

        if (Boolean.TRUE.equals(group.getExclusive())) {
            // Assigning to exclusive group — course must not fulfill any other group
            if (!existingFulfillments.isEmpty()) {
                throw new RuntimeException("Course already fulfills another requirement. " +
                        "Exclusive groups (like MDC) require the course to only be used for that group.");
            }
        } else {
            // Assigning to non-exclusive group — course must not already fulfill an exclusive group
            boolean fulfillsExclusive = existingFulfillments.stream()
                    .anyMatch(f -> Boolean.TRUE.equals(f.getRequirementGroup().getExclusive()));
            if (fulfillsExclusive) {
                throw new RuntimeException("Course is already assigned to an exclusive requirement group (MDC). " +
                        "It cannot be used for other requirements.");
            }
        }

        UserRequirementFulfillment fulfillment = new UserRequirementFulfillment();
        fulfillment.setEnrollment(enrollment);
        fulfillment.setRequirementGroup(group);
        fulfillment.setSlotIndex(request.getSlotIndex() != null ? request.getSlotIndex() : 0);

        UserRequirementFulfillment saved = fulfillmentRepository.save(fulfillment);
        log.info("User {} assigned {} to group '{}'", userId, request.getCourseId(), group.getName());
        return toFulfillmentDTO(saved);
    }

    /**
     * Removes a specific requirement fulfillment.
     */
    @Transactional
    public void removeRequirementFulfillment(Long userId, String courseId, Long groupId) {
        UserCourseEnrollment enrollment = enrollmentRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        UserRequirementFulfillment fulfillment = fulfillmentRepository
                .findByEnrollmentIdAndRequirementGroupId(enrollment.getId(), groupId)
                .orElseThrow(() -> new RuntimeException("Fulfillment not found"));

        fulfillmentRepository.delete(fulfillment);
        log.info("User {} removed fulfillment of {} from group {}", userId, courseId, groupId);
    }

    // --- DTO conversion ---

    private UserCourseEnrollmentDTO toDTO(UserCourseEnrollment e) {
        UserCourseEnrollmentDTO dto = new UserCourseEnrollmentDTO();
        dto.setId(e.getId());
        dto.setUserId(e.getUser().getId());
        dto.setCourseId(e.getCourse().getId());
        dto.setCourseCode(e.getCourse().getCode());
        dto.setCourseName(e.getCourse().getName());
        dto.setCredits(e.getCourse().getCredits());
        dto.setSemesterId(e.getSemester().getId());
        dto.setSemesterName(e.getSemester().getName());
        dto.setStatus(e.getStatus().name());
        dto.setGrade(e.getGrade());
        dto.setFulfillments(e.getFulfillments().stream()
                .map(this::toFulfillmentDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private FulfillmentDTO toFulfillmentDTO(UserRequirementFulfillment f) {
        return new FulfillmentDTO(
                f.getId(),
                f.getRequirementGroup().getId(),
                f.getRequirementGroup().getName(),
                f.getSlotIndex()
        );
    }
}
