package com.sap.smart_academic_calendar.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
import org.springframework.web.multipart.MultipartFile;

import com.sap.smart_academic_calendar.dto.CreateUserRequest;
import com.sap.smart_academic_calendar.dto.UpdateUserRequest;
import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.service.AvatarService;
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
    private final AvatarService avatarService;

    public UserController(UserService userService, AvatarService avatarService) {
        this.userService = userService;
        this.avatarService = avatarService;
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

    /**
     * POST endpoint to create a new user.
     * @param request the create user request containing username, email, and password
     * @return ResponseEntity with created user data
     */
    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
        try {
            UserDTO createdUser = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        try {
            UserDTO updatedUser = userService.updateUser(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String avatarUrl = avatarService.uploadAvatar(id, file);
            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<Void> deleteAvatar(@PathVariable Long id) {
        try {
            avatarService.deleteAvatar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
