package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;

/**
 * Request DTO for creating or updating a budget limit
 */
public record CreateBudgetLimitRequest(
    Long categoryId,
    BigDecimal limitAmount
) {}
