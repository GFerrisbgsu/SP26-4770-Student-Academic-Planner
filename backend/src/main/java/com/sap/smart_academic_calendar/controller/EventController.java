package com.sap.smart_academic_calendar.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
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

import com.sap.smart_academic_calendar.dto.CreateEventRequest;
import com.sap.smart_academic_calendar.dto.EventDTO;
import com.sap.smart_academic_calendar.service.EventService;

/**
 * REST Controller for Event operations.
 * Handles HTTP requests related to event management.
 * Contains no business logic - delegates to EventService.
 */
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    // Constructor injection for dependencies
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /**
     * POST endpoint to create a new event for the authenticated user.
     * @param userId the user ID
     * @param request the event creation request
     * @return ResponseEntity with created event data
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<EventDTO> createEvent(
            @PathVariable Long userId,
            @RequestBody CreateEventRequest request) {
        try {
            EventDTO createdEvent = eventService.createEvent(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET endpoint to retrieve all events for a user.
     * @param userId the user ID
     * @return ResponseEntity with list of user's events
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<EventDTO>> getUserEvents(@PathVariable Long userId) {
        try {
            List<EventDTO> events = eventService.getUserEvents(userId);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve events for a user on a specific date.
     * @param userId the user ID
     * @param date the target date
     * @return ResponseEntity with list of events on that date
     */
    @GetMapping("/user/{userId}/date")
    public ResponseEntity<List<EventDTO>> getUserEventsByDate(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<EventDTO> events = eventService.getUserEventsByDate(userId, date);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve events for a user within a date range.
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity with list of events within the range
     */
    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<EventDTO>> getUserEventsByDateRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<EventDTO> events = eventService.getUserEventsByDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve a specific event by ID.
     * @param eventId the event ID
     * @return ResponseEntity with event data
     */
    @GetMapping("/{eventId}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long eventId) {
        try {
            EventDTO event = eventService.getEventById(eventId);
            return ResponseEntity.ok(event);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve events for a user by type.
     * @param userId the user ID
     * @param type the event type
     * @return ResponseEntity with list of events of that type
     */
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<EventDTO>> getUserEventsByType(
            @PathVariable Long userId,
            @PathVariable String type) {
        try {
            List<EventDTO> events = eventService.getUserEventsByType(userId, type);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve events for a user by tag.
     * @param userId the user ID
     * @param tag the event tag
     * @return ResponseEntity with list of events with that tag
     */
    @GetMapping("/user/{userId}/tag/{tag}")
    public ResponseEntity<List<EventDTO>> getUserEventsByTag(
            @PathVariable Long userId,
            @PathVariable String tag) {
        try {
            List<EventDTO> events = eventService.getUserEventsByTag(userId, tag);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve events for a user by course ID.
     * @param userId the user ID
     * @param courseId the course ID
     * @return ResponseEntity with list of events for that course
     */
    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<List<EventDTO>> getUserEventsByCourseId(
            @PathVariable Long userId,
            @PathVariable String courseId) {
        try {
            List<EventDTO> events = eventService.getUserEventsByCourseId(userId, courseId);
            return ResponseEntity.ok(events);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT endpoint to update an event.
     * @param eventId the event ID
     * @param request the update request
     * @return ResponseEntity with updated event data
     */
    @PutMapping("/{eventId}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long eventId,
            @RequestBody CreateEventRequest request) {
        try {
            EventDTO updatedEvent = eventService.updateEvent(eventId, request);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE endpoint to delete an event.
     * @param eventId the event ID
     * @return ResponseEntity indicating success or failure
     */
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        try {
            eventService.deleteEvent(eventId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH endpoint to mark an event as completed.
     * @param eventId the event ID
     * @return ResponseEntity with updated event data
     */
    @PutMapping("/{eventId}/complete")
    public ResponseEntity<EventDTO> markEventAsCompleted(@PathVariable Long eventId) {
        try {
            EventDTO updatedEvent = eventService.markEventAsCompleted(eventId);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PATCH endpoint to mark an event as uncompleted.
     * @param eventId the event ID
     * @return ResponseEntity with updated event data
     */
    @PutMapping("/{eventId}/uncomplete")
    public ResponseEntity<EventDTO> markEventAsUncompleted(@PathVariable Long eventId) {
        try {
            EventDTO updatedEvent = eventService.markEventAsUncompleted(eventId);
            return ResponseEntity.ok(updatedEvent);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE endpoint to delete all events for a user by course ID.
     * Used when unenrolling from a course to remove associated events.
     * @param userId the user ID
     * @param courseId the course ID
     * @return ResponseEntity indicating success or failure
     */
    @DeleteMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<Void> deleteUserEventsByCourseId(
            @PathVariable Long userId,
            @PathVariable String courseId) {
        try {
            eventService.deleteUserEventsByCourseId(userId, courseId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
