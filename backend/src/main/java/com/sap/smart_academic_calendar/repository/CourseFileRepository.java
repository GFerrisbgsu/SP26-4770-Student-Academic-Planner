package com.sap.smart_academic_calendar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.CourseFile;

/**
 * Spring Data JPA repository for CourseFile operations.
 */
@Repository
public interface CourseFileRepository extends JpaRepository<CourseFile, Long> {

    List<CourseFile> findByCourseId(String courseId);

    List<CourseFile> findByCourseIdAndCategory(String courseId, String category);
}
