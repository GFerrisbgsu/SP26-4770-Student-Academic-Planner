package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CourseFileDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseFileRequest;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.CourseFile;
import com.sap.smart_academic_calendar.repository.CourseFileRepository;
import com.sap.smart_academic_calendar.repository.CourseRepository;

/**
 * Service layer for course file operations.
 */
@Service
public class CourseFileService {

    private final CourseFileRepository courseFileRepository;
    private final CourseRepository courseRepository;

    public CourseFileService(CourseFileRepository courseFileRepository, CourseRepository courseRepository) {
        this.courseFileRepository = courseFileRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public CourseFileDTO createFile(String courseId, CreateCourseFileRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        CourseFile file = new CourseFile(
                course,
                request.getName(),
                request.getFileType(),
                request.getCategory(),
                request.getFileSize(),
                request.getFileUrl());

        CourseFile savedFile = courseFileRepository.save(file);
        return convertToDTO(savedFile);
    }

    public List<CourseFileDTO> getFilesByCourse(String courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found: " + courseId);
        }
        return courseFileRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<CourseFileDTO> getFilesByCourseAndCategory(String courseId, String category) {
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found: " + courseId);
        }
        return courseFileRepository.findByCourseIdAndCategory(courseId, category).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public CourseFileDTO getFileById(Long fileId) {
        CourseFile file = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        return convertToDTO(file);
    }

    @Transactional
    public CourseFileDTO updateFile(Long fileId, CreateCourseFileRequest request) {
        CourseFile file = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (request.getName() != null && !request.getName().isEmpty()) {
            file.setName(request.getName());
        }

        if (request.getFileType() != null && !request.getFileType().isEmpty()) {
            file.setFileType(request.getFileType());
        }

        if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            file.setCategory(request.getCategory());
        }

        if (request.getFileSize() != null) {
            file.setFileSize(request.getFileSize());
        }

        if (request.getFileUrl() != null) {
            file.setFileUrl(request.getFileUrl());
        }

        file.setUpdatedAt(LocalDateTime.now());
        CourseFile updatedFile = courseFileRepository.save(file);
        return convertToDTO(updatedFile);
    }

    @Transactional
    public void deleteFile(Long fileId) {
        if (!courseFileRepository.existsById(fileId)) {
            throw new RuntimeException("File not found: " + fileId);
        }
        courseFileRepository.deleteById(fileId);
    }

    private CourseFileDTO convertToDTO(CourseFile file) {
        return new CourseFileDTO(
                file.getId(),
                file.getCourse().getId(),
                file.getName(),
                file.getFileType(),
                file.getCategory(),
                file.getFileSize(),
                file.getFileUrl(),
                file.getUploadedAt(),
                file.getUpdatedAt());
    }
}
