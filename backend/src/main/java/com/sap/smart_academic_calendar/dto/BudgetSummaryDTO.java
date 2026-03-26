package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for monthly budget summary with spending breakdown by category
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record BudgetSummaryDTO(
    Integer month,
    Integer year,
    BigDecimal totalBudget,
    BigDecimal totalSpent,
    BigDecimal remainingBudget,
    List<CategorySpendingDTO> categoryBreakdown
) {}
