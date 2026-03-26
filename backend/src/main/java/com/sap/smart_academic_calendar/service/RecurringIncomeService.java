package com.sap.smart_academic_calendar.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CreateRecurringIncomeRequest;
import com.sap.smart_academic_calendar.dto.RecurringIncomeDTO;
import com.sap.smart_academic_calendar.model.BudgetCategory;
import com.sap.smart_academic_calendar.model.RecurringIncome;
import com.sap.smart_academic_calendar.model.RecurringIncomeFrequency;
import com.sap.smart_academic_calendar.model.Transaction;
import com.sap.smart_academic_calendar.model.TransactionType;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.BudgetCategoryRepository;
import com.sap.smart_academic_calendar.repository.RecurringIncomeRepository;
import com.sap.smart_academic_calendar.repository.TransactionRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service for managing recurring income.
 * Handles creation, updates, deletion, and automatic application of recurring income transactions.
 */
@Service
public class RecurringIncomeService {
    private static final Logger log = LoggerFactory.getLogger(RecurringIncomeService.class);

    private final RecurringIncomeRepository recurringIncomeRepository;
    private final UserRepository userRepository;
    private final BudgetCategoryRepository budgetCategoryRepository;
    private final TransactionRepository transactionRepository;

    public RecurringIncomeService(
        RecurringIncomeRepository recurringIncomeRepository,
        UserRepository userRepository,
        BudgetCategoryRepository budgetCategoryRepository,
        TransactionRepository transactionRepository
    ) {
        this.recurringIncomeRepository = recurringIncomeRepository;
        this.userRepository = userRepository;
        this.budgetCategoryRepository = budgetCategoryRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Create a new recurring income for a user.
     * Validates user exists. Category is optional.
     * If the start date is today or in the past, applies the income immediately.
     */
    @Transactional
    public RecurringIncomeDTO createRecurringIncome(Long userId, CreateRecurringIncomeRequest request) {
        log.info("Creating recurring income for user {} with amount {}", userId, request.amount());

        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Validate category if provided
        BudgetCategory category = null;
        if (request.categoryId() != null) {
            category = budgetCategoryRepository.findByIdAndUserId(request.categoryId(), userId)
                .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user"));
        }

        // Create recurring income entity (category is optional)
        RecurringIncome recurringIncome = new RecurringIncome(
            user,
            category,
            request.amount(),
            request.frequency(),
            request.nextDate()
        );
        recurringIncome.setDescription(request.description());

        // Save to database
        RecurringIncome saved = recurringIncomeRepository.save(recurringIncome);
        log.info("Recurring income created with ID {} for user {}", saved.getId(), userId);

        // Apply immediately if the start date is today or in the past
        LocalDate today = LocalDate.now();
        if (!request.nextDate().isAfter(today)) {
            log.info("Start date {} is today or in the past. Applying recurring income immediately.", request.nextDate());
            applyRecurringIncome(saved);
        }

        return convertToDTO(saved);
    }

    /**
     * Get all recurring incomes for a user (active and inactive).
     */
    @Transactional(readOnly = true)
    public List<RecurringIncomeDTO> getRecurringIncomes(Long userId) {
        return recurringIncomeRepository.findByUserId(userId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all active recurring incomes for a user.
     */
    @Transactional(readOnly = true)
    public List<RecurringIncomeDTO> getActiveRecurringIncomes(Long userId) {
        return recurringIncomeRepository.findByUserIdAndIsActiveTrue(userId)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Update an existing recurring income.
     * Validates user ownership before updating.
     */
    @Transactional
    public RecurringIncomeDTO updateRecurringIncome(Long userId, Long id, CreateRecurringIncomeRequest request) {
        log.info("Updating recurring income {} for user {}", id, userId);

        // Verify ownership
        RecurringIncome recurringIncome = recurringIncomeRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new RuntimeException("Recurring income not found or unauthorized"));

        // Update category if provided and different
        if (request.categoryId() != null) {
            if (recurringIncome.getCategory() == null || !recurringIncome.getCategory().getId().equals(request.categoryId())) {
                BudgetCategory category = budgetCategoryRepository.findByIdAndUserId(request.categoryId(), userId)
                    .orElseThrow(() -> new RuntimeException("Category not found or does not belong to user"));
                recurringIncome.setCategory(category);
            }
        } else {
            // Clear category if null is provided
            recurringIncome.setCategory(null);
        }

        // Update fields
        recurringIncome.setAmount(request.amount());
        recurringIncome.setDescription(request.description());
        recurringIncome.setFrequency(request.frequency());
        recurringIncome.setNextDate(request.nextDate());
        recurringIncome.setUpdatedAt(LocalDateTime.now());

        RecurringIncome updated = recurringIncomeRepository.save(recurringIncome);
        log.info("Recurring income {} updated", id);

        return convertToDTO(updated);
    }

    /**
     * Disable a recurring income (soft delete).
     */
    @Transactional
    public void disableRecurringIncome(Long userId, Long id) {
        log.info("Disabling recurring income {} for user {}", id, userId);

        RecurringIncome recurringIncome = recurringIncomeRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new RuntimeException("Recurring income not found or unauthorized"));

        recurringIncome.setIsActive(false);
        recurringIncome.setUpdatedAt(LocalDateTime.now());
        recurringIncomeRepository.save(recurringIncome);

        log.info("Recurring income {} disabled", id);
    }

    /**
     * Enable a previously disabled recurring income.
     */
    @Transactional
    public void enableRecurringIncome(Long userId, Long id) {
        log.info("Enabling recurring income {} for user {}", id, userId);

        RecurringIncome recurringIncome = recurringIncomeRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new RuntimeException("Recurring income not found or unauthorized"));

        recurringIncome.setIsActive(true);
        recurringIncome.setUpdatedAt(LocalDateTime.now());
        recurringIncomeRepository.save(recurringIncome);

        log.info("Recurring income {} enabled", id);
    }

    /**
     * Delete a recurring income permanently.
     */
    @Transactional
    public void deleteRecurringIncome(Long userId, Long id) {
        log.info("Deleting recurring income {} for user {}", id, userId);

        RecurringIncome recurringIncome = recurringIncomeRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new RuntimeException("Recurring income not found or unauthorized"));

        recurringIncomeRepository.delete(recurringIncome);
        log.info("Recurring income {} deleted", id);
    }

    /**
     * Scheduled job: Apply all due recurring incomes (creates income transactions).
     * Should be called daily by a scheduled task.
     */
    @Transactional
    public void applyDueRecurringIncomes() {
        LocalDate today = LocalDate.now();
        log.info("Running scheduled job to apply due recurring incomes for date: {}", today);

        List<RecurringIncome> dueIncomes = recurringIncomeRepository.findDueRecurringIncomes(today);
        log.info("Found {} recurring incomes due for application", dueIncomes.size());

        for (RecurringIncome recurringIncome : dueIncomes) {
            try {
                applyRecurringIncome(recurringIncome);
            } catch (Exception e) {
                log.error("Error applying recurring income {}: {}", recurringIncome.getId(), e.getMessage(), e);
                // Continue processing other recurring incomes even if one fails
            }
        }

        log.info("Completed scheduled recurring income application task");
    }

    /**
     * Apply a specific recurring income (create income transaction and update next date).
     */
    @Transactional
    private void applyRecurringIncome(RecurringIncome recurringIncome) {
        log.info("Applying recurring income {} for user {}", recurringIncome.getId(), recurringIncome.getUser().getId());

        // Create income transaction without category (auto-generated from recurring income)
        Transaction transaction = new Transaction(
            recurringIncome.getUser(),
            recurringIncome.getAmount(),
            recurringIncome.getNextDate(),
            TransactionType.INCOME
        );
        transaction.setDescription(recurringIncome.getDescription() != null ? 
            recurringIncome.getDescription() : "Recurring income");
        // Link transaction to source recurring income for history tracking
        transaction.setRecurringIncome(recurringIncome);
        transactionRepository.save(transaction);

        // Calculate next occurrence date
        LocalDate nextDate = calculateNextOccurrenceDate(recurringIncome.getNextDate(), recurringIncome.getFrequency());
        recurringIncome.setNextDate(nextDate);
        recurringIncome.setUpdatedAt(LocalDateTime.now());
        recurringIncomeRepository.save(recurringIncome);

        log.info("Applied recurring income {}: created transaction, next date set to {}", 
                 recurringIncome.getId(), nextDate);
    }

    /**
     * Calculate the next occurrence date based on frequency.
     * Handles edge cases like month-end dates.
     * 
     * @param currentDate The date to calculate from
     * @param frequency The recurrence frequency
     * @return The next occurrence date
     */
    public LocalDate calculateNextOccurrenceDate(LocalDate currentDate, RecurringIncomeFrequency frequency) {
        return switch (frequency) {
            case WEEKLY -> currentDate.plusDays(7);
            case BIWEEKLY -> currentDate.plusDays(14);
            case MONTHLY -> addOneMonth(currentDate);
        };
    }

    /**
     * Add one month to a date, handling edge cases like month-end dates.
     * For example, January 31 + 1 month = February 28/29 (not March 3).
     */
    private LocalDate addOneMonth(LocalDate date) {
        YearMonth currentMonth = YearMonth.from(date);
        YearMonth nextMonth = currentMonth.plusMonths(1);
        int dayOfMonth = date.getDayOfMonth();
        int lastDayOfNextMonth = nextMonth.lengthOfMonth();
        
        // If current day is greater than last day of next month, use last day of next month
        int dayToUse = Math.min(dayOfMonth, lastDayOfNextMonth);
        return nextMonth.atDay(dayToUse);
    }

    /**
     * Convert RecurringIncome entity to DTO.
     * Handles optional category (null for uncategorized recurring income).
     */
    private RecurringIncomeDTO convertToDTO(RecurringIncome recurringIncome) {
        Long categoryId = null;
        String categoryName = null;
        String categoryColor = null;
        
        if (recurringIncome.getCategory() != null) {
            categoryId = recurringIncome.getCategory().getId();
            categoryName = recurringIncome.getCategory().getName();
            categoryColor = recurringIncome.getCategory().getColor();
        }
        
        return new RecurringIncomeDTO(
            recurringIncome.getId(),
            categoryId,
            categoryName,
            categoryColor,
            recurringIncome.getAmount(),
            recurringIncome.getDescription(),
            recurringIncome.getFrequency(),
            recurringIncome.getNextDate(),
            recurringIncome.getIsActive(),
            recurringIncome.getCreatedAt(),
            recurringIncome.getUpdatedAt()
        );
    }

    // ==================== BULK OPERATIONS ====================

    /**
     * Disable (pause) multiple recurring incomes in bulk.
     * Only updates incomes that belong to the user.
     */
    @Transactional
    public int disableBulkRecurringIncomes(Long userId, List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        log.info("Disabling {} recurring incomes for user {}", ids.size(), userId);
        int updated = recurringIncomeRepository.disableBulk(userId, ids);
        log.info("Disabled {} recurring incomes", updated);
        return updated;
    }

    /**
     * Enable (resume) multiple recurring incomes in bulk.
     * Only updates incomes that belong to the user.
     */
    @Transactional
    public int enableBulkRecurringIncomes(Long userId, List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        log.info("Enabling {} recurring incomes for user {}", ids.size(), userId);
        int updated = recurringIncomeRepository.enableBulk(userId, ids);
        log.info("Enabled {} recurring incomes", updated);
        return updated;
    }

    /**
     * Delete multiple recurring incomes in bulk.
     * Only deletes incomes that belong to the user.
     */
    @Transactional
    public int deleteBulkRecurringIncomes(Long userId, List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        log.info("Deleting {} recurring incomes for user {}", ids.size(), userId);
        int deleted = recurringIncomeRepository.deleteBulk(userId, ids);
        log.info("Deleted {} recurring incomes", deleted);
        return deleted;
    }
}
