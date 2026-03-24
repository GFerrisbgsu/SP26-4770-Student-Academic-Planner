package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.service.UserService;

/**
 * REST Controller for User operations.
 * Handles HTTP requests related to user management.
 * Contains no business logic - delegates to UserService.
 * 
 * NOTE: These endpoints should be restricted to admin users only.
 * TODO: Add @PreAuthorize("hasRole('ADMIN')") when role-based auth is implemented.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Constructor injection for dependencies
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET endpoint to retrieve all users.
     * @return ResponseEntity with list of users
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * GET endpoint to retrieve a user by ID.
     * @param id the user ID
     * @return ResponseEntity with user data
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        try {
            UserDTO user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
