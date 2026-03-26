package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for creating or updating a course file entry.
 */
public class CreateCourseFileRequest {

    private String name;
    private String fileType;
    private String category;
    private String fileSize;
    private String fileUrl;

    public CreateCourseFileRequest() {
    }

    public CreateCourseFileRequest(String name, String fileType, String category, String fileSize, String fileUrl) {
        this.name = name;
        this.fileType = fileType;
        this.category = category;
        this.fileSize = fileSize;
        this.fileUrl = fileUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}
