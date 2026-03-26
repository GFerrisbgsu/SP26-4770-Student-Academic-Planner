package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.sap.smart_academic_calendar.model.RecurringIncomeFrequency;

/**
 * Request DTO for creating or updating recurring income.
 */
public record CreateRecurringIncomeRequest(
    Long categoryId,
    BigDecimal amount,
    String description,
    RecurringIncomeFrequency frequency,
    LocalDate nextDate
) {}
