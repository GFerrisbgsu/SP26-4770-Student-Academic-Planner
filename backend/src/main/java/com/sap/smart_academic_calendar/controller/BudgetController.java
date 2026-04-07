package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.BudgetCategoryDTO;
import com.sap.smart_academic_calendar.dto.BudgetLimitDTO;
import com.sap.smart_academic_calendar.dto.BudgetSummaryDTO;
import com.sap.smart_academic_calendar.dto.CreateBudgetCategoryRequest;
import com.sap.smart_academic_calendar.dto.CreateBudgetLimitRequest;
import com.sap.smart_academic_calendar.dto.CreateRecurringIncomeRequest;
import com.sap.smart_academic_calendar.dto.CreateTransactionRequest;
import com.sap.smart_academic_calendar.dto.RecurringIncomeDTO;
import com.sap.smart_academic_calendar.dto.TransactionDTO;
import com.sap.smart_academic_calendar.service.BudgetService;
import com.sap.smart_academic_calendar.service.RecurringIncomeService;

/**
 * REST Controller for Budget operations.
 * Handles HTTP requests for budget management, transactions, categories, and limits.
 * All operations are user-specific (per authenticated user).
 */
@RestController
@RequestMapping("/api/budget")
public class BudgetController {
    private static final Logger log = LoggerFactory.getLogger(BudgetController.class);

    private final BudgetService budgetService;
    private final RecurringIncomeService recurringIncomeService;

    public BudgetController(BudgetService budgetService, RecurringIncomeService recurringIncomeService) {
        this.budgetService = budgetService;
        this.recurringIncomeService = recurringIncomeService;
    }

    // ==================== HELPER METHOD ====================
    private Long getCurrentUserId(Authentication authentication) {
        // SecurityConfig enforces authentication, but check defensively
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        // JWT token stores user ID as the subject
        return Long.parseLong(authentication.getName());
    }

    // ==================== CATEGORY ENDPOINTS ====================

    /**
     * GET all budget categories for the current user
     */
    @GetMapping("/categories")
    public ResponseEntity<List<BudgetCategoryDTO>> getCategories(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Fetching categories for user ID: {}", userId);
            List<BudgetCategoryDTO> categories = budgetService.getUserCategories(userId);
            log.debug("Found {} categories", categories.size());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error fetching categories", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET a specific budget category
     */
    @GetMapping("/categories/{categoryId}")
    public ResponseEntity<BudgetCategoryDTO> getCategory(
        @PathVariable Long categoryId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            BudgetCategoryDTO category = budgetService.getCategory(userId, categoryId);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST create a new budget category
     */
    @PostMapping("/categories")
    public ResponseEntity<BudgetCategoryDTO> createCategory(
        @RequestBody CreateBudgetCategoryRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Creating category for user ID: {}", userId);
            BudgetCategoryDTO category = budgetService.createCategory(userId, request);
            log.debug("Created category: {}", category.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(category);
        } catch (Exception e) {
            log.error("Error creating category", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT update a budget category
     */
    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<BudgetCategoryDTO> updateCategory(
        @PathVariable Long categoryId,
        @RequestBody CreateBudgetCategoryRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            BudgetCategoryDTO category = budgetService.updateCategory(userId, categoryId, request);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * DELETE a budget category
     */
    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
        @PathVariable Long categoryId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            budgetService.deleteCategory(userId, categoryId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ==================== TRANSACTION ENDPOINTS ====================

    /**
     * GET transactions for a month
     * @param month 0-11 (January=0, December=11)
     * @param year 4-digit year
     */
    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionDTO>> getTransactions(
        @RequestParam Integer month,
        @RequestParam Integer year,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<TransactionDTO> transactions = budgetService.getTransactionsByMonth(userId, month, year);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET transactions for a specific category
     */
    @GetMapping("/transactions/category/{categoryId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByCategory(
        @PathVariable Long categoryId,
        @RequestParam Integer month,
        @RequestParam Integer year,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<TransactionDTO> transactions = budgetService.getTransactionsByCategory(userId, categoryId, month, year);
            return ResponseEntity.ok(transactions);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET a specific transaction
     */
    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<TransactionDTO> getTransaction(
        @PathVariable Long transactionId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            TransactionDTO transaction = budgetService.getTransaction(userId, transactionId);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST create a new transaction
     */
    @PostMapping("/transactions")
    public ResponseEntity<TransactionDTO> createTransaction(
        @RequestBody CreateTransactionRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            TransactionDTO transaction = budgetService.createTransaction(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT update a transaction
     */
    @PutMapping("/transactions/{transactionId}")
    public ResponseEntity<TransactionDTO> updateTransaction(
        @PathVariable Long transactionId,
        @RequestBody CreateTransactionRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            TransactionDTO transaction = budgetService.updateTransaction(userId, transactionId, request);
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * DELETE a transaction
     */
    @DeleteMapping("/transactions/{transactionId}")
    public ResponseEntity<Void> deleteTransaction(
        @PathVariable Long transactionId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            budgetService.deleteTransaction(userId, transactionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ==================== BUDGET LIMIT ENDPOINTS ====================

    /**
     * GET budget limits for a month
     */
    @GetMapping("/limits")
    public ResponseEntity<List<BudgetLimitDTO>> getBudgetLimits(
        @RequestParam Integer month,
        @RequestParam Integer year,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<BudgetLimitDTO> limits = budgetService.getBudgetLimits(userId, month, year);
            return ResponseEntity.ok(limits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET a specific budget limit
     */
    @GetMapping("/limits/{limitId}")
    public ResponseEntity<BudgetLimitDTO> getBudgetLimit(
        @PathVariable Long limitId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            BudgetLimitDTO limit = budgetService.getBudgetLimit(userId, limitId);
            return ResponseEntity.ok(limit);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST set or update a budget limit for a category in a month
     */
    @PostMapping("/limits")
    public ResponseEntity<BudgetLimitDTO> setBudgetLimit(
        @RequestParam Integer month,
        @RequestParam Integer year,
        @RequestBody CreateBudgetLimitRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            BudgetLimitDTO limit = budgetService.setBudgetLimit(userId, month, year, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(limit);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT update a budget limit
     */
    @PutMapping("/limits/{limitId}")
    public ResponseEntity<BudgetLimitDTO> updateBudgetLimit(
        @PathVariable Long limitId,
        @RequestBody CreateBudgetLimitRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            BudgetLimitDTO limit = budgetService.updateBudgetLimit(userId, limitId, request);
            return ResponseEntity.ok(limit);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * DELETE a budget limit
     */
    @DeleteMapping("/limits/{limitId}")
    public ResponseEntity<Void> deleteBudgetLimit(
        @PathVariable Long limitId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            budgetService.deleteBudgetLimit(userId, limitId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST copy budget limits from the previous month to the current month
     * Useful for month-to-month rollover of budget limits.
     * Skips categories that already have limits in the target month.
     */
    @PostMapping("/limits/copy-from-previous")
    public ResponseEntity<List<BudgetLimitDTO>> copyLimitsFromPreviousMonth(
        @RequestParam Integer month,
        @RequestParam Integer year,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<BudgetLimitDTO> copiedLimits = budgetService.copyLimitsFromPreviousMonth(userId, month, year);
            return ResponseEntity.ok(copiedLimits);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    // ==================== BUDGET SUMMARY ENDPOINT ====================

    /**
     * GET monthly budget summary with spending breakdown
     */
    @GetMapping("/summary")
    public ResponseEntity<BudgetSummaryDTO> getBudgetSummary(
        @RequestParam Integer month,
        @RequestParam Integer year,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            BudgetSummaryDTO summary = budgetService.getBudgetSummary(userId, month, year);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== RECURRING INCOME ENDPOINTS ====================

    /**
     * GET all recurring incomes for the current user
     */
    @GetMapping("/recurring-income")
    public ResponseEntity<List<RecurringIncomeDTO>> getRecurringIncomes(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Fetching recurring incomes for user ID: {}", userId);
            List<RecurringIncomeDTO> recurringIncomes = recurringIncomeService.getRecurringIncomes(userId);
            log.debug("Found {} recurring incomes", recurringIncomes.size());
            return ResponseEntity.ok(recurringIncomes);
        } catch (Exception e) {
            log.error("Error fetching recurring incomes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST create a new recurring income
     */
    @PostMapping("/recurring-income")
    public ResponseEntity<RecurringIncomeDTO> createRecurringIncome(
        @RequestBody CreateRecurringIncomeRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Creating recurring income for user ID: {}", userId);
            RecurringIncomeDTO recurringIncome = recurringIncomeService.createRecurringIncome(userId, request);
            log.debug("Created recurring income: {}", recurringIncome.id());
            return ResponseEntity.status(HttpStatus.CREATED).body(recurringIncome);
        } catch (RuntimeException e) {
            log.error("Error creating recurring income", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * PUT update a recurring income
     */
    @PutMapping("/recurring-income/{id}")
    public ResponseEntity<RecurringIncomeDTO> updateRecurringIncome(
        @PathVariable Long id,
        @RequestBody CreateRecurringIncomeRequest request,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Updating recurring income {} for user ID: {}", id, userId);
            RecurringIncomeDTO recurringIncome = recurringIncomeService.updateRecurringIncome(userId, id, request);
            log.debug("Updated recurring income: {}", id);
            return ResponseEntity.ok(recurringIncome);
        } catch (RuntimeException e) {
            log.error("Error updating recurring income", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * DELETE a recurring income
     */
    @DeleteMapping("/recurring-income/{id}")
    public ResponseEntity<Void> deleteRecurringIncome(
        @PathVariable Long id,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Deleting recurring income {} for user ID: {}", id, userId);
            recurringIncomeService.deleteRecurringIncome(userId, id);
            log.debug("Deleted recurring income: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting recurring income", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST disable (pause) a recurring income
     */
    @PostMapping("/recurring-income/{id}/disable")
    public ResponseEntity<Void> disableRecurringIncome(
        @PathVariable Long id,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Disabling recurring income {} for user ID: {}", id, userId);
            recurringIncomeService.disableRecurringIncome(userId, id);
            log.debug("Disabled recurring income: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error disabling recurring income", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST enable (resume) a recurring income
     */
    @PostMapping("/recurring-income/{id}/enable")
    public ResponseEntity<Void> enableRecurringIncome(
        @PathVariable Long id,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Enabling recurring income {} for user ID: {}", id, userId);
            recurringIncomeService.enableRecurringIncome(userId, id);
            log.debug("Enabled recurring income: {}", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error enabling recurring income", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // ==================== BULK RECURRING INCOME OPERATIONS ====================

    /**
     * POST disable (pause) multiple recurring incomes in bulk
     */
    @PostMapping("/recurring-income/bulk/disable")
    public ResponseEntity<Void> disableBulkRecurringIncomes(
        @RequestBody List<Long> incomeIds,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Bulk disabling {} recurring incomes for user ID: {}", incomeIds.size(), userId);
            recurringIncomeService.disableBulkRecurringIncomes(userId, incomeIds);
            log.debug("Bulk disabled recurring incomes");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error bulk disabling recurring incomes", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST enable (resume) multiple recurring incomes in bulk
     */
    @PostMapping("/recurring-income/bulk/enable")
    public ResponseEntity<Void> enableBulkRecurringIncomes(
        @RequestBody List<Long> incomeIds,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Bulk enabling {} recurring incomes for user ID: {}", incomeIds.size(), userId);
            recurringIncomeService.enableBulkRecurringIncomes(userId, incomeIds);
            log.debug("Bulk enabled recurring incomes");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error bulk enabling recurring incomes", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST delete multiple recurring incomes in bulk
     */
    @PostMapping("/recurring-income/bulk/delete")
    public ResponseEntity<Void> deleteBulkRecurringIncomes(
        @RequestBody List<Long> incomeIds,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Bulk deleting {} recurring incomes for user ID: {}", incomeIds.size(), userId);
            recurringIncomeService.deleteBulkRecurringIncomes(userId, incomeIds);
            log.debug("Bulk deleted recurring incomes");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error bulk deleting recurring incomes", e);
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== TRANSACTION HISTORY ====================

    /**
     * Get transaction history for a specific recurring income
     * Shows all auto-generated transactions from this recurring income source
     */
    @GetMapping("/recurring-income/{recurringIncomeId}/history")
    public ResponseEntity<List<TransactionDTO>> getRecurringIncomeTransactionHistory(
        @PathVariable Long recurringIncomeId,
        Authentication authentication
    ) {
        try {
            Long userId = getCurrentUserId(authentication);
            log.debug("Fetching transaction history for recurring income {} for user {}", recurringIncomeId, userId);
            List<TransactionDTO> history = budgetService.getRecurringIncomeTransactionHistory(userId, recurringIncomeId);
            log.debug("Retrieved {} transactions for recurring income", history.size());
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            log.error("Error fetching transaction history", e);
            return ResponseEntity.notFound().build();
        }
    }
}
