package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for creating or updating a course note.
 */
public class CreateCourseNoteRequest {

    private String title;
    private String content;

    public CreateCourseNoteRequest() {
    }

    public CreateCourseNoteRequest(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
