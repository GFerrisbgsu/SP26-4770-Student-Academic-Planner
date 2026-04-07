package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sap.smart_academic_calendar.dto.CourseFileDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseFileRequest;
import com.sap.smart_academic_calendar.service.CourseFileService;
import com.sap.smart_academic_calendar.service.CourseFileService.FileDownloadData;

/**
 * REST Controller for Course File operations.
 */
@RestController
@RequestMapping("/api/files")
public class CourseFileController {

    private final CourseFileService courseFileService;

    public CourseFileController(CourseFileService courseFileService) {
        this.courseFileService = courseFileService;
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<?> createFile(
            @PathVariable String courseId,
            @RequestBody CreateCourseFileRequest request) {
        try {
            CourseFileDTO createdFile = courseFileService.createFile(courseId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/course/{courseId}/upload")
    public ResponseEntity<?> uploadFile(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category) {
        try {
            CourseFileDTO createdFile = courseFileService.uploadFile(courseId, file, name, category);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdFile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseFileDTO>> getFilesByCourse(
            @PathVariable String courseId,
            @RequestParam(required = false) String category) {
        try {
            List<CourseFileDTO> files;
            if (category != null && !category.isEmpty()) {
                files = courseFileService.getFilesByCourseAndCategory(courseId, category);
            } else {
                files = courseFileService.getFilesByCourse(courseId);
            }
            return ResponseEntity.ok(files);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<CourseFileDTO> getFileById(@PathVariable Long fileId) {
        try {
            CourseFileDTO file = courseFileService.getFileById(fileId);
            return ResponseEntity.ok(file);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{fileId}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        try {
            FileDownloadData fileData = courseFileService.getFileForDownload(fileId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileData.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileData.getFileName() + "\"")
                    .body(fileData.getResource());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{fileId}/preview")
    public ResponseEntity<Resource> previewFile(@PathVariable Long fileId) {
        try {
            FileDownloadData fileData = courseFileService.getFileForDownload(fileId);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileData.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + fileData.getFileName() + "\"")
                    .body(fileData.getResource());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{fileId}")
    public ResponseEntity<CourseFileDTO> updateFile(
            @PathVariable Long fileId,
            @RequestBody CreateCourseFileRequest request) {
        try {
            CourseFileDTO updatedFile = courseFileService.updateFile(fileId, request);
            return ResponseEntity.ok(updatedFile);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        try {
            courseFileService.deleteFile(fileId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
