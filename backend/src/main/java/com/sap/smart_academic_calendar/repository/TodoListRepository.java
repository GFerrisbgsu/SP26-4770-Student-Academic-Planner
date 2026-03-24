package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.TodoList;

/**
 * Repository for TodoList entity.
 * Provides database access for to-do list operations.
 */
@Repository
public interface TodoListRepository extends JpaRepository<TodoList, Long> {

    /**
     * Find all to-do lists for a specific user, ordered by list_order.
     * @param userId the user ID
     * @return list of user's to-do lists
     */
    List<TodoList> findByUserIdOrderByListOrderAsc(Long userId);

    /**
     * Find default to-do lists for a specific user.
     * @param userId the user ID
     * @param isDefault true for default lists
     * @return list of default to-do lists
     */
    List<TodoList> findByUserIdAndIsDefault(Long userId, Boolean isDefault);

    /**
     * Find a to-do list by user ID and list ID.
     * @param userId the user ID
     * @param listId the list ID
     * @return Optional containing the list if found
     */
    Optional<TodoList> findByUserIdAndId(Long userId, Long listId);

    /**
     * Check if a user has any to-do lists.
     * @param userId the user ID
     * @return true if user has at least one list
     */
    boolean existsByUserId(Long userId);

    /**
     * Delete all to-do lists for a specific user.
     * @param userId the user ID
     */
    void deleteByUserId(Long userId);
}
