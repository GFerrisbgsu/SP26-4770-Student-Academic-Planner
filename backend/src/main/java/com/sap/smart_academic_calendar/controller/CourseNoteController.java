package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.CourseNoteDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseNoteRequest;
import com.sap.smart_academic_calendar.service.CourseNoteService;

/**
 * REST Controller for Course Note operations.
 */
@RestController
@RequestMapping("/api/notes")
public class CourseNoteController {

    private final CourseNoteService courseNoteService;

    public CourseNoteController(CourseNoteService courseNoteService) {
        this.courseNoteService = courseNoteService;
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<CourseNoteDTO> createNote(
            @PathVariable String courseId,
            @RequestBody CreateCourseNoteRequest request) {
        try {
            CourseNoteDTO createdNote = courseNoteService.createNote(courseId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdNote);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseNoteDTO>> getNotesByCourse(@PathVariable String courseId) {
        try {
            List<CourseNoteDTO> notes = courseNoteService.getNotesByCourse(courseId);
            return ResponseEntity.ok(notes);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<CourseNoteDTO> getNoteById(@PathVariable Long noteId) {
        try {
            CourseNoteDTO note = courseNoteService.getNoteById(noteId);
            return ResponseEntity.ok(note);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<CourseNoteDTO> updateNote(
            @PathVariable Long noteId,
            @RequestBody CreateCourseNoteRequest request) {
        try {
            CourseNoteDTO updatedNote = courseNoteService.updateNote(noteId, request);
            return ResponseEntity.ok(updatedNote);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long noteId) {
        try {
            courseNoteService.deleteNote(noteId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
