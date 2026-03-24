package com.sap.smart_academic_calendar.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.CourseInfo;

/**
 * Repository interface for CourseInfo entity.
 * Provides database access methods for course information and metadata.
 */
@Repository
public interface CourseInfoRepository extends JpaRepository<CourseInfo, String> {

    /**
     * Find course info by course ID.
     * @param courseId the course ID
     * @return optional containing course info if found
     */
    Optional<CourseInfo> findByCourseId(String courseId);
}
