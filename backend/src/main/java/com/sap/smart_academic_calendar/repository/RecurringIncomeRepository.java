package com.sap.smart_academic_calendar.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.RecurringIncome;

/**
 * Repository for RecurringIncome entities.
 * Provides methods to query recurring income records from the database.
 */
@Repository
public interface RecurringIncomeRepository extends JpaRepository<RecurringIncome, Long> {

    /**
     * Find all active recurring incomes for a user.
     */
    List<RecurringIncome> findByUserIdAndIsActiveTrue(Long userId);

    /**
     * Find all recurring incomes for a user (active and inactive).
     */
    List<RecurringIncome> findByUserId(Long userId);

    /**
     * Find all active recurring incomes that are due (next date is today or earlier).
     * Used by scheduled job to determine which incomes need to be applied.
     */
    @Query("SELECT ri FROM RecurringIncome ri WHERE ri.isActive = true AND ri.nextDate <= :today")
    List<RecurringIncome> findDueRecurringIncomes(@Param("today") LocalDate today);

    /**
     * Find a specific recurring income by ID and user ID (for authorization checks).
     */
    Optional<RecurringIncome> findByIdAndUserId(Long id, Long userId);

    /**
     * Find active recurring incomes for a user and category.
     */
    List<RecurringIncome> findByUserIdAndCategoryIdAndIsActiveTrue(Long userId, Long categoryId);

    /**
     * Disable (pause) multiple recurring incomes by ID for a user (bulk operation).
     * Returns the number of rows updated.
     */
    @Modifying
    @Query("UPDATE RecurringIncome ri SET ri.isActive = false WHERE ri.id IN :ids AND ri.user.id = :userId")
    int disableBulk(@Param("userId") Long userId, @Param("ids") List<Long> ids);

    /**
     * Enable (resume) multiple recurring incomes by ID for a user (bulk operation).
     * Returns the number of rows updated.
     */
    @Modifying
    @Query("UPDATE RecurringIncome ri SET ri.isActive = true WHERE ri.id IN :ids AND ri.user.id = :userId")
    int enableBulk(@Param("userId") Long userId, @Param("ids") List<Long> ids);

    /**
     * Delete multiple recurring incomes by ID for a user (bulk operation).
     * Returns the number of rows deleted.
     */
    @Modifying
    @Query("DELETE FROM RecurringIncome ri WHERE ri.id IN :ids AND ri.user.id = :userId")
    int deleteBulk(@Param("userId") Long userId, @Param("ids") List<Long> ids);
}
