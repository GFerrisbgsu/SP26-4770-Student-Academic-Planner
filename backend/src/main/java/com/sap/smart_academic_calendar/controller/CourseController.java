package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.CourseDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseRequest;
import com.sap.smart_academic_calendar.service.CourseService;
import com.sap.smart_academic_calendar.dto.DegreeProgressDTO;
import com.sap.smart_academic_calendar.dto.RequirementCategoryDTO;

/**
 * REST Controller for Course operations.
 * Handles HTTP requests related to course management.
 * Contains no business logic - delegates to CourseService.
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    // Constructor injection for dependencies
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    /**
     * GET endpoint to retrieve all courses.
     * @return ResponseEntity with list of all courses
     */
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        try {
            List<CourseDTO> courses = courseService.getAllCourses();
            return ResponseEntity.ok(courses);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET endpoint to retrieve a specific course by ID.
     * @param id the course ID
     * @return ResponseEntity with course data
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String id) {
        try {
            CourseDTO course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve all enrolled courses.
     * @return ResponseEntity with list of enrolled courses
     */
    @GetMapping("/enrolled")
    public ResponseEntity<List<CourseDTO>> getEnrolledCourses() {
        try {
            List<CourseDTO> courses = courseService.getEnrolledCourses();
            return ResponseEntity.ok(courses);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET endpoint to retrieve courses by subject.
     * @param subject the subject area
     * @return ResponseEntity with list of courses in that subject
     */
    @GetMapping("/subject/{subject}")
    public ResponseEntity<List<CourseDTO>> getCoursesBySubject(@PathVariable String subject) {
        try {
            List<CourseDTO> courses = courseService.getCoursesBySubject(subject);
            return ResponseEntity.ok(courses);
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST endpoint to create a new course.
     * @param request the course creation request
     * @return ResponseEntity with created course data
     */
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseRequest request) {
        try {
            CourseDTO createdCourse = courseService.createCourse(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT endpoint to update an existing course.
     * @param id the course ID
     * @param request the update request
     * @return ResponseEntity with updated course data
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable String id,
            @RequestBody CreateCourseRequest request) {
        try {
            CourseDTO updatedCourse = courseService.updateCourse(id, request);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH endpoint to enroll in a course.
     * Optionally accepts a schedule if the course doesn't have one.
     * @param id the course ID
     * @param schedule optional schedule string
     * @return ResponseEntity with updated course data
     * @deprecated Use POST /api/enrollments instead for per-user enrollment.
     */
    @Deprecated
    @PatchMapping("/{id}/enroll")
    public ResponseEntity<CourseDTO> enrollCourse(
            @PathVariable String id,
            @RequestParam(required = false) String schedule) {
        try {
            CourseDTO updatedCourse = courseService.enrollCourse(id, schedule);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH endpoint to unenroll from a course.
     * @param id the course ID
     * @return ResponseEntity with updated course data
     * @deprecated Use DELETE /api/enrollments/{courseId} instead for per-user enrollment.
     */
    @Deprecated
    @PatchMapping("/{id}/unenroll")
    public ResponseEntity<CourseDTO> unenrollCourse(@PathVariable String id) {
        try {
            CourseDTO updatedCourse = courseService.unenrollCourse(id);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH endpoint to update a course's schedule.
     * @param id the course ID
     * @param schedule the new schedule string
     * @return ResponseEntity with updated course data
     */
    @PatchMapping("/{id}/schedule")
    public ResponseEntity<CourseDTO> updateSchedule(
            @PathVariable String id,
            @RequestParam String schedule) {
        try {
            CourseDTO updatedCourse = courseService.updateSchedule(id, schedule);
            return ResponseEntity.ok(updatedCourse);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE endpoint to delete a course.
     * @param id the course ID
     * @return ResponseEntity with no content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/degree/progress")
    public ResponseEntity<DegreeProgressDTO> getDegreeProgress() {
        try {
            return ResponseEntity.ok(courseService.getDegreeProgress());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/degree/requirements")
    public ResponseEntity<List<RequirementCategoryDTO>> getRequirementCategories() {
        try {
            return ResponseEntity.ok(courseService.getRequirementCategories());
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
