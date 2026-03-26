package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.sap.smart_academic_calendar.model.TransactionType;

/**
 * Request DTO for creating or updating a transaction
 */
public record CreateTransactionRequest(
    Long categoryId,  // Optional - null means uncategorized
    BigDecimal amount,
    String description,
    LocalDate transactionDate,
    TransactionType type
) {}
