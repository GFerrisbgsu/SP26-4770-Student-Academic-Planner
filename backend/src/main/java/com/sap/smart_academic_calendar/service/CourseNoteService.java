package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CourseNoteDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseNoteRequest;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.CourseNote;
import com.sap.smart_academic_calendar.repository.CourseNoteRepository;
import com.sap.smart_academic_calendar.repository.CourseRepository;

/**
 * Service layer for course note operations.
 */
@Service
public class CourseNoteService {

    private final CourseNoteRepository courseNoteRepository;
    private final CourseRepository courseRepository;

    public CourseNoteService(CourseNoteRepository courseNoteRepository, CourseRepository courseRepository) {
        this.courseNoteRepository = courseNoteRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public CourseNoteDTO createNote(String courseId, CreateCourseNoteRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        CourseNote note = new CourseNote(course, request.getTitle(), request.getContent());
        CourseNote savedNote = courseNoteRepository.save(note);
        return convertToDTO(savedNote);
    }

    public List<CourseNoteDTO> getNotesByCourse(String courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found: " + courseId);
        }
        return courseNoteRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public CourseNoteDTO getNoteById(Long noteId) {
        CourseNote note = courseNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));
        return convertToDTO(note);
    }

    @Transactional
    public CourseNoteDTO updateNote(Long noteId, CreateCourseNoteRequest request) {
        CourseNote note = courseNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found: " + noteId));

        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            note.setTitle(request.getTitle());
        }

        if (request.getContent() != null && !request.getContent().isEmpty()) {
            note.setContent(request.getContent());
        }

        note.setUpdatedAt(LocalDateTime.now());
        CourseNote updatedNote = courseNoteRepository.save(note);
        return convertToDTO(updatedNote);
    }

    @Transactional
    public void deleteNote(Long noteId) {
        if (!courseNoteRepository.existsById(noteId)) {
            throw new RuntimeException("Note not found: " + noteId);
        }
        courseNoteRepository.deleteById(noteId);
    }

    private CourseNoteDTO convertToDTO(CourseNote note) {
        return new CourseNoteDTO(
                note.getId(),
                note.getCourse().getId(),
                note.getTitle(),
                note.getContent(),
                note.getCreatedAt(),
                note.getUpdatedAt());
    }
}
