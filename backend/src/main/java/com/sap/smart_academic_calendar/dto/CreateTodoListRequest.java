package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for creating or updating a to-do list.
 */
public class CreateTodoListRequest {

    private String name;
    private String description;
    private String color;
    private Boolean isDefault;
    private Integer listOrder;

    // Default constructor
    public CreateTodoListRequest() {
    }

    // Full constructor
    public CreateTodoListRequest(String name, String description, String color, 
                                 Boolean isDefault, Integer listOrder) {
        this.name = name;
        this.description = description;
        this.color = color;
        this.isDefault = isDefault;
        this.listOrder = listOrder;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Integer getListOrder() {
        return listOrder;
    }

    public void setListOrder(Integer listOrder) {
        this.listOrder = listOrder;
    }
}
