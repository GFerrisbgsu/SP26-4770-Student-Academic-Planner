package com.sap.smart_academic_calendar.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final Path uploadRootPath;

    public CourseFileService(
            CourseFileRepository courseFileRepository,
            CourseRepository courseRepository,
            @Value("${app.files.upload-dir:uploads/course-files}") String uploadDir) {
        this.courseFileRepository = courseFileRepository;
        this.courseRepository = courseRepository;
        this.uploadRootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
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

    @Transactional
    public CourseFileDTO uploadFile(String courseId, MultipartFile multipartFile, String name, String category) {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new RuntimeException("No file was provided for upload.");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        String originalName = sanitizeFileName(multipartFile.getOriginalFilename());
        String displayName = (name == null || name.isBlank()) ? originalName : name.trim();
        String safeFileName = UUID.randomUUID() + "_" + originalName;
        String normalizedCategory = normalizeCategory(category);

        try {
            Files.createDirectories(uploadRootPath);
            Path destination = uploadRootPath.resolve(safeFileName);
            Files.copy(multipartFile.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

            String normalizedFileType = normalizeFileType(multipartFile.getContentType(), originalName);
            String formattedFileSize = formatFileSize(multipartFile.getSize());

            CourseFile file = new CourseFile(
                    course,
                    displayName,
                    normalizedFileType,
                    normalizedCategory,
                    formattedFileSize,
                    null,
                    destination.toString(),
                    multipartFile.getContentType());

            CourseFile savedFile = courseFileRepository.save(file);
            savedFile.setFileUrl("/api/files/" + savedFile.getId() + "/download");
            savedFile.setUpdatedAt(LocalDateTime.now());
            return convertToDTO(courseFileRepository.save(savedFile));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file: " + e.getMessage(), e);
        }
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
        CourseFile file = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (file.getStoragePath() != null && !file.getStoragePath().isBlank()) {
            try {
                Files.deleteIfExists(Paths.get(file.getStoragePath()));
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete file content from storage", e);
            }
        }

        courseFileRepository.deleteById(fileId);
    }

    public FileDownloadData getFileForDownload(Long fileId) {
        CourseFile file = courseFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        if (file.getStoragePath() == null || file.getStoragePath().isBlank()) {
            throw new RuntimeException("No upload content is associated with this file.");
        }

        try {
            Path storagePath = Paths.get(file.getStoragePath()).toAbsolutePath().normalize();
            Resource resource = new UrlResource(storagePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Stored file content was not found.");
            }

            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = Files.probeContentType(storagePath);
            }
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            return new FileDownloadData(resource, file.getName(), contentType);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load stored file content", e);
        }
    }

    private String sanitizeFileName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "uploaded-file";
        }

        String fileName = Paths.get(originalFilename).getFileName().toString().trim();
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return "other";
        }

        String normalized = category.toLowerCase(Locale.ROOT);
        if (normalized.equals("syllabus")
                || normalized.equals("lecture")
                || normalized.equals("assignment")
                || normalized.equals("resource")
                || normalized.equals("other")) {
            return normalized;
        }

        return "other";
    }

    private String normalizeFileType(String contentType, String fileName) {
        String lowerContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        if (lowerContentType.startsWith("image/")) {
            return "image";
        }
        if (lowerContentType.equals("application/pdf")) {
            return "pdf";
        }
        if (!lowerContentType.isBlank()) {
            return "document";
        }

        String lowerName = fileName.toLowerCase(Locale.ROOT);
        if (lowerName.endsWith(".png")
                || lowerName.endsWith(".jpg")
                || lowerName.endsWith(".jpeg")
                || lowerName.endsWith(".gif")
                || lowerName.endsWith(".webp")) {
            return "image";
        }
        if (lowerName.endsWith(".pdf")) {
            return "pdf";
        }
        return "document";
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }

        double kb = bytes / 1024.0;
        if (kb < 1024) {
            return String.format(Locale.ROOT, "%.1f KB", kb);
        }

        double mb = kb / 1024.0;
        return String.format(Locale.ROOT, "%.1f MB", mb);
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

    public static class FileDownloadData {
        private final Resource resource;
        private final String fileName;
        private final String contentType;

        public FileDownloadData(Resource resource, String fileName, String contentType) {
            this.resource = resource;
            this.fileName = fileName;
            this.contentType = contentType;
        }

        public Resource getResource() {
            return resource;
        }

        public String getFileName() {
            return fileName;
        }

        public String getContentType() {
            return contentType;
        }
    }
}
