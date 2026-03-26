package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sap.smart_academic_calendar.model.RecurringIncomeFrequency;

/**
 * Response DTO for RecurringIncome data.
 * Records are immutable and suitable for JSON serialization.
 * Category fields are optional (null for uncategorized recurring income).
 */
public record RecurringIncomeDTO(
    Long id,
    Long categoryId,
    String categoryName,
    String categoryColor,
    BigDecimal amount,
    String description,
    RecurringIncomeFrequency frequency,
    LocalDate nextDate,
    Boolean isActive,
    @JsonProperty("created_at")
    LocalDateTime createdAt,
    @JsonProperty("updated_at")
    LocalDateTime updatedAt
) {}
