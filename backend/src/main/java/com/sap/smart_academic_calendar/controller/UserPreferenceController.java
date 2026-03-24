package com.sap.smart_academic_calendar.controller;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.UpsertUserPreferenceRequest;
import com.sap.smart_academic_calendar.dto.UserPreferenceDTO;
import com.sap.smart_academic_calendar.service.UserPreferenceService;

@RestController
@RequestMapping("/api/user-preferences")
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    public UserPreferenceController(UserPreferenceService userPreferenceService) {
        this.userPreferenceService = userPreferenceService;
    }

    @GetMapping("/user/{userId}/key/{preferenceKey}")
    public ResponseEntity<UserPreferenceDTO> getUserPreference(
            @PathVariable Long userId,
            @PathVariable String preferenceKey) {
        try {
            Optional<UserPreferenceDTO> preference = userPreferenceService.getUserPreference(userId, preferenceKey);
            return preference.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/user/{userId}/key/{preferenceKey}")
    public ResponseEntity<UserPreferenceDTO> upsertUserPreference(
            @PathVariable Long userId,
            @PathVariable String preferenceKey,
            @RequestBody UpsertUserPreferenceRequest request) {
        try {
            UserPreferenceDTO updated = userPreferenceService.upsertUserPreference(
                    userId,
                    preferenceKey,
                    request.getPreferenceValue()
            );
            return ResponseEntity.status(HttpStatus.OK).body(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
