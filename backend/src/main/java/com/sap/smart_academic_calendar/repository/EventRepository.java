package com.sap.smart_academic_calendar.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Event;

/**
 * Repository interface for Event entity.
 * Provides database access methods for events.
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * Find all events for a specific user.
     * @param userId the user ID
     * @return list of events for the user
     */
    List<Event> findByUserId(Long userId);

    /**
     * Find all events for a user on a specific date.
     * @param userId the user ID
     * @param date the target date
     * @return list of events on that date
     */
    List<Event> findByUserIdAndDate(Long userId, LocalDate date);

    /**
     * Find all events for a user within a date range.
     * @param userId the user ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of events within the date range
     */
    List<Event> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    /**
     * Find all events for a user by type.
     * @param userId the user ID
     * @param type the event type (class, assignment, event)
     * @return list of events of that type
     */
    List<Event> findByUserIdAndType(Long userId, String type);

    /**
     * Find all events for a user by tag.
     * @param userId the user ID
     * @param tag the event tag (school, work, personal, meeting, fun)
     * @return list of events with that tag
     */
    List<Event> findByUserIdAndTag(Long userId, String tag);

    /**
     * Find all events for a user by course ID.
     * @param userId the user ID
     * @param courseId the course ID
     * @return list of events for that course
     */
    List<Event> findByUserIdAndCourseId(Long userId, String courseId);

    /**
     * Find all events for a specific project.
     * @param projectId the project ID
     * @return list of events in the project
     */
    List<Event> findByProjectId(Long projectId);

    /**
     * Count total events for a specific project.
     * @param projectId the project ID
     * @return count of events in the project
     */
    Long countByProjectId(Long projectId);

    /**
     * Count completed/uncompleted events for a specific project.
     * @param projectId the project ID
     * @param completed the completion status
     * @return count of events matching the criteria
     */
    Long countByProjectIdAndCompleted(Long projectId, Boolean completed);

    /**
     * Delete all events for a specific project.
     * @param projectId the project ID
     */
    void deleteByProjectId(Long projectId);

    /**
     * Delete all events for a user by course ID.
     * @param userId the user ID
     * @param courseId the course ID
     */
    void deleteByUserIdAndCourseId(Long userId, String courseId);

    /**
     * Find all events for a specific to-do list.
     * @param todoListId the to-do list ID
     * @return list of events in the to-do list
     */
    List<Event> findByTodoListId(Long todoListId);

    /**
     * Count total events for a specific to-do list.
     * @param todoListId the to-do list ID
     * @return count of events in the to-do list
     */
    Integer countByTodoListId(Long todoListId);

    /**
     * Find all events for a user and to-do list.
     * @param userId the user ID
     * @param todoListId the to-do list ID
     * @return list of events
     */
    List<Event> findByUserIdAndTodoListId(Long userId, Long todoListId);
}
