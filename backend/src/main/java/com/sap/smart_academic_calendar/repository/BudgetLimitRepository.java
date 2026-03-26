package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.BudgetLimit;

@Repository
public interface BudgetLimitRepository extends JpaRepository<BudgetLimit, Long> {

    List<BudgetLimit> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);

    Optional<BudgetLimit> findByUserIdAndCategoryIdAndMonthAndYear(Long userId, Long categoryId, Integer month, Integer year);

    Optional<BudgetLimit> findByIdAndUserId(Long id, Long userId);

    List<BudgetLimit> findByUserIdAndCategoryId(Long userId, Long categoryId);

    void deleteByUserIdAndCategoryIdAndMonthAndYear(Long userId, Long categoryId, Integer month, Integer year);
}
