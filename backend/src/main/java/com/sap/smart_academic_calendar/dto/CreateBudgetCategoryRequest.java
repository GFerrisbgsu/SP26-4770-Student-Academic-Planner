package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for creating or updating a budget category
 */
public record CreateBudgetCategoryRequest(
    String name,
    String color
) {}
