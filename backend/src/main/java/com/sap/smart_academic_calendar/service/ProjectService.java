package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CreateProjectRequest;
import com.sap.smart_academic_calendar.dto.ProjectDTO;
import com.sap.smart_academic_calendar.model.Project;
import com.sap.smart_academic_calendar.model.TodoList;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.EventRepository;
import com.sap.smart_academic_calendar.repository.ProjectRepository;
import com.sap.smart_academic_calendar.repository.TodoListRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service class for Project operations.
 * Contains business logic for project management.
 */
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TodoListRepository todoListRepository;

    public ProjectService(ProjectRepository projectRepository, 
                          UserRepository userRepository,
                          EventRepository eventRepository,
                          TodoListRepository todoListRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.todoListRepository = todoListRepository;
    }

    /**
     * Create a new project for a user.
     * @param userId the user ID
     * @param request the create project request
     * @return the created project as ProjectDTO
     */
    public ProjectDTO createProject(Long userId, CreateProjectRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Project project = new Project(
                user,
                request.getName(),
                request.getDescription(),
                request.getColor(),
                request.getDeadline(),
                request.getDeadlineTime()
        );

        // Set todo list if todoListId is provided
        if (request.getTodoListId() != null) {
            TodoList todoList = todoListRepository.findById(request.getTodoListId())
                    .orElseThrow(() -> new RuntimeException("TodoList not found with id: " + request.getTodoListId()));
            project.setTodoList(todoList);
        }

        Project savedProject = projectRepository.save(project);
        return convertToDTO(savedProject);
    }

    /**
     * Get all projects for a user.
     * @param userId the user ID
     * @return list of projects
     */
    public List<ProjectDTO> getUserProjects(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific project by ID.
     * @param projectId the project ID
     * @return the project as ProjectDTO
     */
    public ProjectDTO getProjectById(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        return convertToDTO(project);
    }

    /**
     * Update a project.
     * @param projectId the project ID
     * @param request the update request
     * @return the updated project as ProjectDTO
     */
    public ProjectDTO updateProject(Long projectId, CreateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColor(request.getColor());
        project.setDeadline(request.getDeadline());
        project.setDeadlineTime(request.getDeadlineTime());
        if (request.getCompleted() != null) {
            project.setCompleted(request.getCompleted());
        }
        
        // Update todo list if todoListId is provided
        if (request.getTodoListId() != null) {
            TodoList todoList = todoListRepository.findById(request.getTodoListId())
                    .orElseThrow(() -> new RuntimeException("TodoList not found with id: " + request.getTodoListId()));
            project.setTodoList(todoList);
        } else {
            project.setTodoList(null);
        }
        
        project.setUpdatedAt(LocalDateTime.now());

        Project updatedProject = projectRepository.save(project);
        return convertToDTO(updatedProject);
    }

    /**
     * Delete a project and all its associated tasks/events.
     * @param projectId the project ID
     */
    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
        
        // First, delete all events associated with this project
        eventRepository.deleteByProjectId(projectId);
        
        // Then delete the project itself
        projectRepository.delete(project);
    }

    /**
     * Convert Project entity to ProjectDTO.
     * @param project the project entity
     * @return ProjectDTO
     */
    private ProjectDTO convertToDTO(Project project) {
        // Get task counts for this project
        Long totalTasks = eventRepository.countByProjectId(project.getId());
        Long completedTasks = eventRepository.countByProjectIdAndCompleted(project.getId(), true);

        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setUserId(project.getUser().getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setColor(project.getColor());
        dto.setDeadline(project.getDeadline());
        dto.setDeadlineTime(project.getDeadlineTime());
        dto.setCompleted(project.getCompleted());
        dto.setTodoListId(project.getTodoList() != null ? project.getTodoList().getId() : null);
        dto.setTotalTasks(totalTasks.intValue());
        dto.setCompletedTasks(completedTasks.intValue());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());
        return dto;
    }
}
