package com.sap.smart_academic_calendar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Project;

/**
 * Repository interface for Project entity.
 * Provides database access methods for projects.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    /**
     * Find all projects for a specific user.
     * @param userId the user ID
     * @return list of projects for the user
     */
    List<Project> findByUserId(Long userId);

    /**
     * Find all projects for a user ordered by creation date.
     * @param userId the user ID
     * @return list of projects ordered by creation date
     */
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);
}
