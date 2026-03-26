package com.sap.smart_academic_calendar.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for budget category data transfer
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record BudgetCategoryDTO(
    Long id,
    String name,
    String color,
    Boolean isPredefined,
    Boolean isDeleted
) {}
