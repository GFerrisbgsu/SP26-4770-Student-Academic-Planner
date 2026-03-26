package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.BudgetCategory;

@Repository
public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {

    List<BudgetCategory> findByUserIdAndIsDeletedFalse(Long userId);

    List<BudgetCategory> findByUserIdAndIsPredefinedAndIsDeletedFalse(Long userId, Boolean isPredefined);

    Optional<BudgetCategory> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNameAndIsDeletedFalse(Long userId, String name);
}
