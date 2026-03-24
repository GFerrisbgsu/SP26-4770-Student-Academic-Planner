package com.sap.smart_academic_calendar.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of bulk course update operation
 * 
 * Contains:
 * - Number of courses successfully updated
 * - Number of courses that failed to update
 * - List of error messages for debugging
 * 
 * Used by CourseEnhancementService to report batch update results
 * to admin endpoints
 */
public class BulkUpdateResult {
    
    private int successCount;          // Number of courses successfully updated
    private int errorCount;            // Number of failed updates
    private List<String> errors;       // Error messages for each failure
    
    // Constructors
    
    public BulkUpdateResult() {
        this.errors = new ArrayList<>();
    }
    
    public BulkUpdateResult(int successCount, int errorCount, List<String> errors) {
        this.successCount = successCount;
        this.errorCount = errorCount;
        this.errors = errors != null ? errors : new ArrayList<>();
    }
    
    // Getters and Setters
    
    public int getSuccessCount() {
        return successCount;
    }
    
    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }
    
    public int getErrorCount() {
        return errorCount;
    }
    
    public void setErrorCount(int errorCount) {
        this.errorCount = errorCount;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
    
    // Helper methods
    
    public void addError(String error) {
        if (this.errors == null) {
            this.errors = new ArrayList<>();
        }
        this.errors.add(error);
    }
    
    public boolean hasErrors() {
        return errorCount > 0;
    }
    
    @Override
    public String toString() {
        return "BulkUpdateResult{" +
                "successCount=" + successCount +
                ", errorCount=" + errorCount +
                ", errors=" + errors +
                '}';
    }
}
