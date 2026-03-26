package com.sap.smart_academic_calendar.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.BudgetCategoryDTO;
import com.sap.smart_academic_calendar.dto.BudgetLimitDTO;
import com.sap.smart_academic_calendar.dto.BudgetSummaryDTO;
import com.sap.smart_academic_calendar.dto.CategorySpendingDTO;
import com.sap.smart_academic_calendar.dto.CreateBudgetCategoryRequest;
import com.sap.smart_academic_calendar.dto.CreateBudgetLimitRequest;
import com.sap.smart_academic_calendar.dto.CreateTransactionRequest;
import com.sap.smart_academic_calendar.dto.TransactionDTO;
import com.sap.smart_academic_calendar.model.BudgetCategory;
import com.sap.smart_academic_calendar.model.BudgetLimit;
import com.sap.smart_academic_calendar.model.Transaction;
import com.sap.smart_academic_calendar.model.TransactionType;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.BudgetCategoryRepository;
import com.sap.smart_academic_calendar.repository.BudgetLimitRepository;
import com.sap.smart_academic_calendar.repository.RecurringIncomeRepository;
import com.sap.smart_academic_calendar.repository.TransactionRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service for budget management including transactions, categories, and limits.
 * Includes both read (Query) and write (Command) operations.
 */
@Service
public class BudgetService {

    private final BudgetCategoryRepository budgetCategoryRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetLimitRepository budgetLimitRepository;
    private final RecurringIncomeRepository recurringIncomeRepository;
    private final UserRepository userRepository;

    public BudgetService(
        BudgetCategoryRepository budgetCategoryRepository,
        TransactionRepository transactionRepository,
        BudgetLimitRepository budgetLimitRepository,
        RecurringIncomeRepository recurringIncomeRepository,
        UserRepository userRepository
    ) {
        this.budgetCategoryRepository = budgetCategoryRepository;
        this.transactionRepository = transactionRepository;
        this.budgetLimitRepository = budgetLimitRepository;
        this.recurringIncomeRepository = recurringIncomeRepository;
        this.userRepository = userRepository;
    }

    // ==================== CATEGORY QUERIES ====================

    /**
     * Get all active categories for a user
     */
    public List<BudgetCategoryDTO> getUserCategories(Long userId) {
        validateUserExists(userId);
        return budgetCategoryRepository.findByUserIdAndIsDeletedFalse(userId)
            .stream()
            .map(this::convertCategoryToDTO)
            .toList();
    }

    /**
     * Get category by ID, verifying it belongs to the user
     */
    public BudgetCategoryDTO getCategory(Long userId, Long categoryId) {
        validateUserExists(userId);
        BudgetCategory category = budgetCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user"));
        return convertCategoryToDTO(category);
    }

    // ==================== CATEGORY COMMANDS ====================

    /**
     * Create a custom budget category
     */
    @Transactional
    public BudgetCategoryDTO createCategory(Long userId, CreateBudgetCategoryRequest request) {
        User user = validateUserExists(userId);

        if (budgetCategoryRepository.existsByUserIdAndNameAndIsDeletedFalse(userId, request.name())) {
            throw new RuntimeException("Category with this name already exists");
        }

        BudgetCategory category = new BudgetCategory(user, request.name(), request.color(), false);
        BudgetCategory saved = budgetCategoryRepository.save(category);
        return convertCategoryToDTO(saved);
    }

    /**
     * Update a budget category
     */
    @Transactional
    public BudgetCategoryDTO updateCategory(Long userId, Long categoryId, CreateBudgetCategoryRequest request) {
        BudgetCategory category = budgetCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user"));

        category.setName(request.name());
        category.setColor(request.color());
        BudgetCategory saved = budgetCategoryRepository.save(category);
        return convertCategoryToDTO(saved);
    }

    /**
     * Soft delete a category (hide from future use but keep history)
     * This works for both predefined and custom categories.
     */
    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        BudgetCategory category = budgetCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user"));

        category.setIsDeleted(true);
        budgetCategoryRepository.save(category);
    }

    // ==================== TRANSACTION QUERIES ====================

    /**
     * Get transactions for a month
     */
    public List<TransactionDTO> getTransactionsByMonth(Long userId, Integer month, Integer year) {
        validateUserExists(userId);
        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, startDate, endDate)
            .stream()
            .map(this::convertTransactionToDTO)
            .toList();
    }

    /**
     * Get transactions for a specific category in a month
     */
    public List<TransactionDTO> getTransactionsByCategory(Long userId, Long categoryId, Integer month, Integer year) {
        validateUserExists(userId);
        budgetCategoryRepository.findByIdAndUserId(categoryId, userId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        return transactionRepository.findByUserIdAndCategoryIdAndTransactionDateBetweenOrderByTransactionDateDesc(userId, categoryId, startDate, endDate)
            .stream()
            .map(this::convertTransactionToDTO)
            .toList();
    }

    /**
     * Get transaction history for a specific recurring income
     */
    public List<TransactionDTO> getRecurringIncomeTransactionHistory(Long userId, Long recurringIncomeId) {
        validateUserExists(userId);
        // Verify the recurring income belongs to the user
        recurringIncomeRepository.findByIdAndUserId(recurringIncomeId, userId)
            .orElseThrow(() -> new RuntimeException("Recurring income not found"));

        return transactionRepository.findByUserIdAndRecurringIncomeIdOrderByTransactionDateDesc(userId, recurringIncomeId)
            .stream()
            .map(this::convertTransactionToDTO)
            .toList();
    }

    /**
     * Get a single transaction
     */
    public TransactionDTO getTransaction(Long userId, Long transactionId) {
        validateUserExists(userId);
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        return convertTransactionToDTO(transaction);
    }

    // ==================== TRANSACTION COMMANDS ====================

    /**
     * Create a transaction
     */
    @Transactional
    public TransactionDTO createTransaction(Long userId, CreateTransactionRequest request) {
        User user = validateUserExists(userId);
        
        // Category is optional
        BudgetCategory category = null;
        if (request.categoryId() != null) {
            category = budgetCategoryRepository.findByIdAndUserId(request.categoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        }

        Transaction transaction = category != null
            ? new Transaction(user, category, request.amount(), request.transactionDate(), request.type())
            : new Transaction(user, request.amount(), request.transactionDate(), request.type());
        transaction.setDescription(request.description());

        Transaction saved = transactionRepository.save(transaction);
        return convertTransactionToDTO(saved);
    }

    /**
     * Update a transaction
     */
    @Transactional
    public TransactionDTO updateTransaction(Long userId, Long transactionId, CreateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Category is optional
        if (request.categoryId() != null) {
            BudgetCategory category = budgetCategoryRepository.findByIdAndUserId(request.categoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            transaction.setCategory(category);
        } else {
            transaction.setCategory(null);  // Clear category if null provided
        }

        transaction.setAmount(request.amount());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setType(request.type());

        Transaction saved = transactionRepository.save(transaction);
        return convertTransactionToDTO(saved);
    }

    /**
     * Delete a transaction
     */
    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    // ==================== BUDGET LIMIT QUERIES ====================

    /**
     * Get budget limits for a month
     */
    public List<BudgetLimitDTO> getBudgetLimits(Long userId, Integer month, Integer year) {
        validateUserExists(userId);
        return budgetLimitRepository.findByUserIdAndMonthAndYear(userId, month, year)
            .stream()
            .map(limit -> convertLimitToDTO(limit, userId, month, year))
            .toList();
    }

    /**
     * Get a specific budget limit
     */
    public BudgetLimitDTO getBudgetLimit(Long userId, Long limitId) {
        validateUserExists(userId);
        BudgetLimit limit = budgetLimitRepository.findByIdAndUserId(limitId, userId)
            .orElseThrow(() -> new RuntimeException("Budget limit not found"));
        return convertLimitToDTO(limit, userId, limit.getMonth(), limit.getYear());
    }

    // ==================== BUDGET LIMIT COMMANDS ====================

    /**
     * Set or update a budget limit for a category in a month
     */
    @Transactional
    public BudgetLimitDTO setBudgetLimit(Long userId, Integer month, Integer year, CreateBudgetLimitRequest request) {
        User user = validateUserExists(userId);
        BudgetCategory category = budgetCategoryRepository.findByIdAndUserId(request.categoryId(), userId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

        BudgetLimit limit = budgetLimitRepository.findByUserIdAndCategoryIdAndMonthAndYear(userId, request.categoryId(), month, year)
            .orElseGet(() -> new BudgetLimit(user, category, month, year, request.limitAmount()));

        limit.setLimitAmount(request.limitAmount());
        BudgetLimit saved = budgetLimitRepository.save(limit);
        return convertLimitToDTO(saved, userId, month, year);
    }

    /**
     * Delete a budget limit
     */
    @Transactional
    public void deleteBudgetLimit(Long userId, Long limitId) {
        BudgetLimit limit = budgetLimitRepository.findByIdAndUserId(limitId, userId)
            .orElseThrow(() -> new RuntimeException("Budget limit not found"));
        budgetLimitRepository.delete(limit);
    }

    /**
     * Copy budget limits from the previous month to the current month.
     * If the current month already has limits, they are preserved.
     * Only copies limits for categories that don't already have limits in the target month.
     */
    @Transactional
    public List<BudgetLimitDTO> copyLimitsFromPreviousMonth(Long userId, Integer targetMonth, Integer targetYear) {
        validateUserExists(userId);

        // Calculate previous month
        int previousMonth = targetMonth == 0 ? 11 : targetMonth - 1;
        int previousYear = targetMonth == 0 ? targetYear - 1 : targetYear;

        // Get limits from previous month
        List<BudgetLimit> previousMonthLimits = budgetLimitRepository.findByUserIdAndMonthAndYear(userId, previousMonth, previousYear);

        if (previousMonthLimits.isEmpty()) {
            return new java.util.ArrayList<>();
        }

        // Get existing limits in target month to avoid duplicates
        List<BudgetLimit> existingLimits = budgetLimitRepository.findByUserIdAndMonthAndYear(userId, targetMonth, targetYear);
        java.util.Set<Long> existingCategoryIds = existingLimits.stream()
            .map(limit -> limit.getCategory().getId())
            .collect(java.util.stream.Collectors.toSet());

        // Copy limits from previous month, skipping categories that already have limits
        List<BudgetLimitDTO> copiedLimits = new java.util.ArrayList<>();
        for (BudgetLimit previousLimit : previousMonthLimits) {
            if (!existingCategoryIds.contains(previousLimit.getCategory().getId())) {
                BudgetLimit newLimit = new BudgetLimit(
                    previousLimit.getUser(),
                    previousLimit.getCategory(),
                    targetMonth,
                    targetYear,
                    previousLimit.getLimitAmount()
                );
                BudgetLimit saved = budgetLimitRepository.save(newLimit);
                copiedLimits.add(convertLimitToDTO(saved, userId, targetMonth, targetYear));
            }
        }

        return copiedLimits;
    }


    // ==================== BUDGET SUMMARY ====================

    /**
     * Get monthly budget summary with spending breakdown
     */
    public BudgetSummaryDTO getBudgetSummary(Long userId, Integer month, Integer year) {
        validateUserExists(userId);
        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        List<BudgetLimit> limits = budgetLimitRepository.findByUserIdAndMonthAndYear(userId, month, year);
        BigDecimal totalBudget = limits.stream()
            .map(BudgetLimit::getLimitAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Only count EXPENSE transactions toward total spent
        BigDecimal totalSpent = transactionRepository.sumByUserAndTypeInDateRange(userId, TransactionType.EXPENSE, startDate, endDate);
        
        // Calculate total income for the period
        BigDecimal totalIncome = transactionRepository.sumByUserAndTypeInDateRange(userId, TransactionType.INCOME, startDate, endDate);

        // Build category breakdown from budget limits
        List<CategorySpendingDTO> categoryBreakdown = limits.stream()
            .map(limit -> {
                // Only count EXPENSE transactions for category breakdown
                BigDecimal spent = transactionRepository.sumByUserAndTypeAndCategoryInDateRange(userId, TransactionType.EXPENSE, limit.getCategory().getId(), startDate, endDate);
                int transactionCount = transactionRepository.countByUserIdAndCategoryIdAndTransactionDateBetween(userId, limit.getCategory().getId(), startDate, endDate);
                BigDecimal remaining = limit.getLimitAmount().subtract(spent);
                double percentageUsed = limit.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                    ? (spent.doubleValue() / limit.getLimitAmount().doubleValue()) * 100
                    : 0;

                return new CategorySpendingDTO(
                    limit.getCategory().getId(),
                    limit.getCategory().getName(),
                    limit.getCategory().getColor(),
                    limit.getLimitAmount(),
                    spent,
                    remaining,
                    transactionCount,
                    percentageUsed
                );
            })
            .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));

        // Add uncategorized expenses if any exist
        BigDecimal uncategorizedSpent = transactionRepository.sumByUserAndTypeAndCategoryNullInDateRange(userId, TransactionType.EXPENSE, startDate, endDate);
        if (uncategorizedSpent.compareTo(BigDecimal.ZERO) > 0) {
            int uncategorizedCount = transactionRepository.countByUserIdAndCategoryNullAndTransactionDateBetween(userId, startDate, endDate);
            categoryBreakdown.add(new CategorySpendingDTO(
                null,  // No category ID for uncategorized
                "Uncategorized",
                "#9ca3af",  // Gray color
                BigDecimal.ZERO,  // No budget limit for uncategorized
                uncategorizedSpent,
                BigDecimal.ZERO.subtract(uncategorizedSpent),  // Negative remaining
                uncategorizedCount,
                0.0  // No percentage for uncategorized
            ));
        }

        // Calculate remaining budget: Total Budget - Expenses (based on budget limits only)
        BigDecimal remainingBudget = totalBudget.subtract(totalSpent);

        return new BudgetSummaryDTO(month, year, totalBudget, totalSpent, remainingBudget, categoryBreakdown);
    }

    // ==================== HELPER METHODS ====================

    private User validateUserExists(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private BudgetCategoryDTO convertCategoryToDTO(BudgetCategory category) {
        return new BudgetCategoryDTO(
            category.getId(),
            category.getName(),
            category.getColor(),
            category.getIsPredefined(),
            category.getIsDeleted()
        );
    }

    private TransactionDTO convertTransactionToDTO(Transaction transaction) {
        Long categoryId = null;
        String categoryName = null;
        String categoryColor = null;
        
        if (transaction.getCategory() != null) {
            categoryId = transaction.getCategory().getId();
            categoryName = transaction.getCategory().getName();
            categoryColor = transaction.getCategory().getColor();
        }
        
        return new TransactionDTO(
            transaction.getId(),
            categoryId,
            categoryName,
            categoryColor,
            transaction.getAmount(),
            transaction.getDescription(),
            transaction.getTransactionDate(),
            transaction.getType()
        );
    }

    private BudgetLimitDTO convertLimitToDTO(BudgetLimit limit, Long userId, Integer month, Integer year) {
        LocalDate startDate = LocalDate.of(year, month + 1, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        BigDecimal spent = transactionRepository.sumByUserAndCategoryInDateRange(userId, limit.getCategory().getId(), startDate, endDate);
        BigDecimal remaining = limit.getLimitAmount().subtract(spent);

        return new BudgetLimitDTO(
            limit.getId(),
            limit.getCategory().getId(),
            limit.getCategory().getName(),
            month,
            year,
            limit.getLimitAmount(),
            spent,
            remaining
        );
    }
}
