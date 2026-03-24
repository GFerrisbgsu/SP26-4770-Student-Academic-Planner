package com.sap.smart_academic_calendar.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sap.smart_academic_calendar.dto.CreateEventRequest;
import com.sap.smart_academic_calendar.dto.EventDTO;
import com.sap.smart_academic_calendar.dto.TagDTO;
import com.sap.smart_academic_calendar.model.Event;
import com.sap.smart_academic_calendar.model.Tag;
import com.sap.smart_academic_calendar.model.Project;
import com.sap.smart_academic_calendar.model.TodoList;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.EventRepository;
import com.sap.smart_academic_calendar.repository.TagRepository;
import com.sap.smart_academic_calendar.repository.ProjectRepository;
import com.sap.smart_academic_calendar.repository.TodoListRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service class for Event operations.
 * Contains business logic for event management.
 */
@Service
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final TagRepository tagRepository;
    private final TagService tagService;
    private final ProjectRepository projectRepository;
    private final TodoListRepository todoListRepository;

    public EventService(EventRepository eventRepository, 
                       UserRepository userRepository,
                       TagRepository tagRepository, 
                       TagService tagService,
                       ProjectRepository projectRepository,
                       TodoListRepository todoListRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.tagRepository = tagRepository;
        this.tagService = tagService;
        this.projectRepository = projectRepository;
        this.todoListRepository = todoListRepository;
    }

    /**
     * Create a new event for a user.
     * @param userId the user ID
     * @param request the create event request
     * @return the created event as EventDTO
     */
    public EventDTO createEvent(Long userId, CreateEventRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Event event = new Event(
                user,
                request.getTitle(),
                request.getDate(),
                request.getTime(),
                request.getStartTime(),
                request.getEndTime(),
                request.getColor(),
                request.getType(),
                request.getDescription(),
                request.getLocation(),
                request.getTag(),
                request.getCourseId()
        );

        // Handle tag by ID if provided
        if (request.getTagId() != null) {
            Tag tag = tagService.getTagEntityById(request.getTagId(), userId);
            event.setTagEntity(tag);
        } else if (request.getTag() != null && !request.getTag().isEmpty()) {
            // Handle legacy tag string - try to get or create tag by name
            try {
                TagDTO tagDTO = tagService.getOrCreateTag(userId, request.getTag(), null);
                Tag tag = tagRepository.findById(tagDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Tag not found"));
                event.setTagEntity(tag);
            } catch (Exception e) {
                // If tag creation fails, just store the string for backward compatibility
                event.setTag(request.getTag());
            }
        }

        // Set project if projectId is provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));
            event.setProject(project);
        }

        // Set todo list if todoListId is provided
        if (request.getTodoListId() != null) {
            TodoList todoList = todoListRepository.findById(request.getTodoListId())
                    .orElseThrow(() -> new RuntimeException("TodoList not found with id: " + request.getTodoListId()));
            event.setTodoList(todoList);
        }

        Event savedEvent = eventRepository.save(event);
        return convertToDTO(savedEvent);
    }

    /**
     * Get all events for a user.
     * @param userId the user ID
     * @return list of events
     */
    public List<EventDTO> getUserEvents(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Event> events = eventRepository.findByUserId(userId);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get events for a user on a specific date.
     * @param userId the user ID
     * @param date the target date
     * @return list of events on that date
     */
    public List<EventDTO> getUserEventsByDate(Long userId, LocalDate date) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Event> events = eventRepository.findByUserIdAndDate(userId, date);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get events for a user within a date range.
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @return list of events within the range
     */
    public List<EventDTO> getUserEventsByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Event> events = eventRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific event by ID.
     * @param eventId the event ID
     * @return the event as EventDTO
     */
    public EventDTO getEventById(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        return convertToDTO(event);
    }

    /**
     * Update an event.
     * @param eventId the event ID
     * @param request the update request
     * @return the updated event as EventDTO
     */
    public EventDTO updateEvent(Long eventId, CreateEventRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        Long userId = event.getUser().getId();

        event.setTitle(request.getTitle());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setColor(request.getColor());
        event.setType(request.getType());
        event.setDescription(request.getDescription());
        event.setLocation(request.getLocation());
        event.setTag(request.getTag());
        event.setCourseId(request.getCourseId());
        event.setUpdatedAt(LocalDateTime.now());

        // Handle tag by ID if provided
        if (request.getTagId() != null) {
            Tag tag = tagService.getTagEntityById(request.getTagId(), userId);
            event.setTagEntity(tag);
        } else if (request.getTag() != null && !request.getTag().isEmpty()) {
            // Handle legacy tag string - try to get or create tag by name
            try {
                TagDTO tagDTO = tagService.getOrCreateTag(userId, request.getTag(), null);
                Tag tag = tagRepository.findById(tagDTO.getId())
                        .orElseThrow(() -> new RuntimeException("Tag not found"));
                event.setTagEntity(tag);
            } catch (Exception e) {
                // If tag creation fails, clear the tag entity and keep the string
                event.setTagEntity(null);
                event.setTag(request.getTag());
            }
        } else {
            event.setTagEntity(null);
        }

        // Update todo list if todoListId is provided
        if (request.getTodoListId() != null) {
            TodoList todoList = todoListRepository.findById(request.getTodoListId())
                    .orElseThrow(() -> new RuntimeException("TodoList not found with id: " + request.getTodoListId()));
            event.setTodoList(todoList);
        } else {
            event.setTodoList(null);
        }

        // Update project if projectId is provided
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found with id: " + request.getProjectId()));
            event.setProject(project);
        } else {
            event.setProject(null);
        }

        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    /**
     * Delete an event.
     * @param eventId the event ID
     */
    public void deleteEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found with id: " + eventId);
        }
        eventRepository.deleteById(eventId);
    }

    /**
     * Get events for a user by type.
     * @param userId the user ID
     * @param type the event type
     * @return list of events of that type
     */
    public List<EventDTO> getUserEventsByType(Long userId, String type) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Event> events = eventRepository.findByUserIdAndType(userId, type);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get events for a user by tag.
     * @param userId the user ID
     * @param tag the event tag
     * @return list of events with that tag
     */
    public List<EventDTO> getUserEventsByTag(Long userId, String tag) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Event> events = eventRepository.findByUserIdAndTag(userId, tag);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get events for a user by course ID.
     * @param userId the user ID
     * @param courseId the course ID
     * @return list of events for that course
     */
    public List<EventDTO> getUserEventsByCourseId(Long userId, String courseId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Event> events = eventRepository.findByUserIdAndCourseId(userId, courseId);
        return events.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert an Event entity to EventDTO.
     * @param event the event entity
     * @return the event DTO
     */
    private EventDTO convertToDTO(Event event) {
        TagDTO tagDTO = null;
        Long tagId = null;

        if (event.getTagEntity() != null) {
            Tag tag = event.getTagEntity();
            tagId = tag.getId();
            tagDTO = new TagDTO(
                    tag.getId(),
                    tag.getUser().getId(),
                    tag.getName(),
                    tag.getColor(),
                    tag.getCreatedAt(),
                    tag.getUpdatedAt()
            );
        }

        EventDTO dto = new EventDTO();
        dto.setTodoListId(event.getTodoList() != null ? event.getTodoList().getId() : null);
        dto.setId(event.getId());
        dto.setUserId(event.getUser().getId());
        dto.setTitle(event.getTitle());
        dto.setDate(event.getDate());
        dto.setTime(event.getTime());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setColor(event.getColor());
        dto.setType(event.getType());
        dto.setDescription(event.getDescription());
        dto.setLocation(event.getLocation());
        dto.setTag(event.getTag());
        dto.setTagId(tagId);
        dto.setTagObject(tagDTO);
        dto.setCourseId(event.getCourseId());
        dto.setProjectId(event.getProject() != null ? event.getProject().getId() : null);
        dto.setCompleted(event.getCompleted());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;
    }

    /**
     * Mark an event as completed.
     * @param eventId the event ID
     * @return the updated event as EventDTO
     */
    public EventDTO markEventAsCompleted(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        
        event.setCompleted(true);
        event.setUpdatedAt(LocalDateTime.now());
        
        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    /**
     * Mark an event as uncompleted.
     * @param eventId the event ID
     * @return the updated event as EventDTO
     */
    public EventDTO markEventAsUncompleted(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));
        
        event.setCompleted(false);
        event.setUpdatedAt(LocalDateTime.now());
        
        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    /**
     * Delete all events for a user by course ID.
     * @param userId the user ID
     * @param courseId the course ID
     */
    @org.springframework.transaction.annotation.Transactional
    public void deleteUserEventsByCourseId(Long userId, String courseId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        eventRepository.deleteByUserIdAndCourseId(userId, courseId);
    }
}
