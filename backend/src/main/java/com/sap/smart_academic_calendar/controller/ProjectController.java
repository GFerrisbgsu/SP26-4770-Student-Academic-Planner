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

import com.sap.smart_academic_calendar.dto.CreateProjectRequest;
import com.sap.smart_academic_calendar.dto.ProjectDTO;
import com.sap.smart_academic_calendar.service.ProjectService;

/**
 * REST Controller for Project operations.
 * Handles HTTP requests related to project management.
 * Contains no business logic - delegates to ProjectService.
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    // Constructor injection for dependencies
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * POST endpoint to create a new project for the authenticated user.
     * @param userId the user ID
     * @param request the project creation request
     * @return ResponseEntity with created project data
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<ProjectDTO> createProject(
            @PathVariable Long userId,
            @RequestBody CreateProjectRequest request) {
        try {
            ProjectDTO createdProject = projectService.createProject(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET endpoint to retrieve all projects for a user.
     * @param userId the user ID
     * @return ResponseEntity with list of user's projects
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectDTO>> getUserProjects(@PathVariable Long userId) {
        try {
            List<ProjectDTO> projects = projectService.getUserProjects(userId);
            return ResponseEntity.ok(projects);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve a specific project by ID.
     * @param projectId the project ID
     * @return ResponseEntity with the project data
     */
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long projectId) {
        try {
            ProjectDTO project = projectService.getProjectById(projectId);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT endpoint to update a project.
     * @param projectId the project ID
     * @param request the update request
     * @return ResponseEntity with updated project data
     */
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long projectId,
            @RequestBody CreateProjectRequest request) {
        try {
            ProjectDTO updatedProject = projectService.updateProject(projectId, request);
            return ResponseEntity.ok(updatedProject);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE endpoint to delete a project.
     * @param projectId the project ID
     * @return ResponseEntity with no content
     */
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        try {
            projectService.deleteProject(projectId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
