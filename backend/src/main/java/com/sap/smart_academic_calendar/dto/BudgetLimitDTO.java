package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for budget limit data transfer and creation
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record BudgetLimitDTO(
    Long id,
    Long categoryId,
    String categoryName,
    Integer month,
    Integer year,
    BigDecimal limitAmount,
    BigDecimal spent,
    BigDecimal remaining
) {}
