package com.sap.smart_academic_calendar.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Transaction;
import com.sap.smart_academic_calendar.model.TransactionType;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserIdAndCategoryIdAndTransactionDateBetweenOrderByTransactionDateDesc(Long userId, Long categoryId, LocalDate startDate, LocalDate endDate);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.category.id = :categoryId AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserAndCategoryInDateRange(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserInDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    int countByUserIdAndCategoryIdAndTransactionDateBetween(Long userId, Long categoryId, LocalDate startDate, LocalDate endDate);

    // Transaction type specific queries

    List<Transaction> findByUserIdAndTypeAndTransactionDateBetweenOrderByTransactionDateDesc(Long userId, TransactionType type, LocalDate startDate, LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserAndTypeInDateRange(@Param("userId") Long userId, @Param("type") TransactionType type, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.category.id = :categoryId AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserAndTypeAndCategoryInDateRange(@Param("userId") Long userId, @Param("type") TransactionType type, @Param("categoryId") Long categoryId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Uncategorized transaction queries

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND t.category IS NULL AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByUserAndTypeAndCategoryNullInDateRange(@Param("userId") Long userId, @Param("type") TransactionType type, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.user.id = :userId AND t.category IS NULL AND t.transactionDate BETWEEN :startDate AND :endDate")
    int countByUserIdAndCategoryNullAndTransactionDateBetween(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    // Recurring income transaction history queries

    List<Transaction> findByUserIdAndRecurringIncomeIdOrderByTransactionDateDesc(Long userId, Long recurringIncomeId);

    List<Transaction> findByRecurringIncomeIdOrderByTransactionDateDesc(Long recurringIncomeId);
}
