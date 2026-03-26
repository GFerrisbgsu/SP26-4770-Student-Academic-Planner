package com.sap.smart_academic_calendar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.CourseNote;

/**
 * Spring Data JPA repository for CourseNote operations.
 */
@Repository
public interface CourseNoteRepository extends JpaRepository<CourseNote, Long> {

    List<CourseNote> findByCourseId(String courseId);
}
