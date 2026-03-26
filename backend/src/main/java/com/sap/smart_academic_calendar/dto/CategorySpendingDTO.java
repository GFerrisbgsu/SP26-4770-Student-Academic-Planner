package com.sap.smart_academic_calendar.dto;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for category spending breakdown in monthly budget summary
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record CategorySpendingDTO(
    Long categoryId,
    String categoryName,
    String categoryColor,
    BigDecimal budget,
    BigDecimal spent,
    BigDecimal remaining,
    Integer transactionCount,
    Double percentageUsed
) {}
