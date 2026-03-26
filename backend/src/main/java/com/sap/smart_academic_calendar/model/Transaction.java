package com.sap.smart_academic_calendar.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing an expense transaction in the budget system.
 */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private BudgetCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recurring_income_id")
    private RecurringIncome recurringIncome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TransactionType type;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Transaction() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.type = TransactionType.EXPENSE;  // Default to expense
    }

    public Transaction(User user, BudgetCategory category, BigDecimal amount, LocalDate transactionDate) {
        this();
        this.user = user;
        this.category = category;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.type = TransactionType.EXPENSE;  // Default to expense
    }

    public Transaction(User user, BudgetCategory category, BigDecimal amount, LocalDate transactionDate, TransactionType type) {
        this();
        this.user = user;
        this.category = category;
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.type = type;
    }

    /**
     * Constructor for transactions without a category (used for auto-generated recurring income).
     */
    public Transaction(User user, BigDecimal amount, LocalDate transactionDate, TransactionType type) {
        this();
        this.user = user;
        this.category = null;  // No category for auto-generated income
        this.amount = amount;
        this.transactionDate = transactionDate;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public BudgetCategory getCategory() {
        return category;
    }

    public void setCategory(BudgetCategory category) {
        this.category = category;
    }

    public RecurringIncome getRecurringIncome() {
        return recurringIncome;
    }

    public void setRecurringIncome(RecurringIncome recurringIncome) {
        this.recurringIncome = recurringIncome;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDate transactionDate) {
        this.transactionDate = transactionDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }
}
