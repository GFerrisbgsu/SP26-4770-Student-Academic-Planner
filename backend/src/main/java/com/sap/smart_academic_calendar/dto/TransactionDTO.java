package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sap.smart_academic_calendar.model.TransactionType;

/**
 * DTO for transaction data transfer (including category details and transaction type)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record TransactionDTO(
    Long id,
    Long categoryId,
    String categoryName,
    String categoryColor,
    BigDecimal amount,
    String description,
    LocalDate transactionDate,
    TransactionType type
) {}
