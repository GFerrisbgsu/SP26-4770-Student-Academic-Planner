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

import com.sap.smart_academic_calendar.dto.CreateTodoListRequest;
import com.sap.smart_academic_calendar.dto.TodoListDTO;
import com.sap.smart_academic_calendar.service.TodoListService;

/**
 * REST Controller for TodoList operations.
 * Handles HTTP requests related to to-do list management.
 * Contains no business logic - delegates to TodoListService.
 */
@RestController
@RequestMapping("/api/todo-lists")
public class TodoListController {

    private final TodoListService todoListService;

    // Constructor injection for dependencies
    public TodoListController(TodoListService todoListService) {
        this.todoListService = todoListService;
    }

    /**
     * POST endpoint to create a new to-do list for the authenticated user.
     * @param userId the user ID
     * @param request the list creation request
     * @return ResponseEntity with created list data
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<TodoListDTO> createTodoList(
            @PathVariable Long userId,
            @RequestBody CreateTodoListRequest request) {
        try {
            TodoListDTO createdList = todoListService.createTodoList(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdList);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET endpoint to retrieve all to-do lists for a user.
     * @param userId the user ID
     * @return ResponseEntity with list of user's to-do lists
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TodoListDTO>> getUserTodoLists(@PathVariable Long userId) {
        try {
            List<TodoListDTO> lists = todoListService.getUserTodoLists(userId);
            return ResponseEntity.ok(lists);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve a specific to-do list by ID.
     * @param listId the list ID
     * @return ResponseEntity with the list data
     */
    @GetMapping("/{listId}")
    public ResponseEntity<TodoListDTO> getTodoListById(@PathVariable Long listId) {
        try {
            TodoListDTO list = todoListService.getTodoListById(listId);
            return ResponseEntity.ok(list);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT endpoint to update a to-do list.
     * @param userId the user ID
     * @param listId the list ID
     * @param request the update request
     * @return ResponseEntity with updated list data
     */
    @PutMapping("/user/{userId}/list/{listId}")
    public ResponseEntity<TodoListDTO> updateTodoList(
            @PathVariable Long userId,
            @PathVariable Long listId,
            @RequestBody CreateTodoListRequest request) {
        try {
            TodoListDTO updatedList = todoListService.updateTodoList(userId, listId, request);
            return ResponseEntity.ok(updatedList);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE endpoint to delete a to-do list.
     * @param userId the user ID
     * @param listId the list ID
     * @return ResponseEntity with no content
     */
    @DeleteMapping("/user/{userId}/list/{listId}")
    public ResponseEntity<Void> deleteTodoList(
            @PathVariable Long userId,
            @PathVariable Long listId) {
        try {
            todoListService.deleteTodoList(userId, listId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST endpoint to create default to-do lists for a new user.
     * @param userId the user ID
     * @return ResponseEntity with no content
     */
    @PostMapping("/user/{userId}/defaults")
    public ResponseEntity<Void> createDefaultLists(@PathVariable Long userId) {
        try {
            todoListService.createDefaultLists(userId);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
