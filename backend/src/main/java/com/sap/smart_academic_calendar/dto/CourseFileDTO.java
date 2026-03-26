package com.sap.smart_academic_calendar.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for CourseFile responses.
 */
public class CourseFileDTO {

    private Long id;
    private String courseId;
    private String name;
    private String fileType;
    private String category;
    private String fileSize;
    private String fileUrl;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;

    public CourseFileDTO() {
    }

    public CourseFileDTO(Long id, String courseId, String name, String fileType, String category, String fileSize,
            String fileUrl, LocalDateTime uploadedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.courseId = courseId;
        this.name = name;
        this.fileType = fileType;
        this.category = category;
        this.fileSize = fileSize;
        this.fileUrl = fileUrl;
        this.uploadedAt = uploadedAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
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

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
