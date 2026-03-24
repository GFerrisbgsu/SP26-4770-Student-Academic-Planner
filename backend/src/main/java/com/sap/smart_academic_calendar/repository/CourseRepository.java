package com.sap.smart_academic_calendar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Course;

/**
 * Repository interface for Course entity.
 * Provides database access methods for courses.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, String> {

    /**
     * Find all enrolled courses.
     * @return list of courses where enrolled = true
     */
    List<Course> findByEnrolledTrue();

    /**
     * Find all courses by subject.
     * @param subject the subject area (e.g., "CS", "MATH")
     * @return list of courses in that subject
     */
    List<Course> findBySubject(String subject);

    /**
     * Check if a course exists by code.
     * @param code the course code (e.g., "CS 2010")
     * @return true if course exists, false otherwise
     */
    boolean existsByCode(String code);

    /**
     * Find course by code.
     * @param code the course code
     * @return the course with that code, or null if not found
     */
    Course findByCode(String code);
}
