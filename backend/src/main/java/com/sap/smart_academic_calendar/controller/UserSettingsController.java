package com.sap.smart_academic_calendar.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.UpdateUserSettingsRequest;
import com.sap.smart_academic_calendar.dto.UserSettingsDTO;
import com.sap.smart_academic_calendar.service.UserSettingsService;

@RestController
@RequestMapping("/api/user-settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<UserSettingsDTO> getUserSettings(@PathVariable Long userId) {
        try {
            UserSettingsDTO settings = userSettingsService.getUserSettings(userId);
            return ResponseEntity.ok(settings);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/user/{userId}")
    public ResponseEntity<UserSettingsDTO> updateUserSettings(
            @PathVariable Long userId,
            @RequestBody UpdateUserSettingsRequest request) {
        try {
            UserSettingsDTO settings = userSettingsService.updateUserSettings(userId, request);
            return ResponseEntity.ok(settings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteUserSettings(@PathVariable Long userId) {
        try {
            userSettingsService.deleteUserSettings(userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
