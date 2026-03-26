package com.sap.smart_academic_calendar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Assignment;

/**
 * Spring Data JPA repository for Assignment operations.
 * Provides CRUD and custom query methods for assignments.
 */
@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    /**
     * Find all assignments for a given course.
     * @param courseId the course ID
     * @return list of assignments for the course
     */
    List<Assignment> findByCourseId(String courseId);

    /**
     * Find all assignments for a course with a specific status.
     * @param courseId the course ID
     * @param status the assignment status
     * @return list of assignments matching the criteria
     */
    List<Assignment> findByCourseIdAndStatus(String courseId, String status);

    /**
     * Check if an assignment exists for a given course.
     * @param courseId the course ID
     * @return true if assignments exist, false otherwise
     */
    boolean existsByCourseId(String courseId);

    /**
     * Delete all assignments for a given course.
     * @param courseId the course ID
     */
    void deleteByCourseId(String courseId);
}
