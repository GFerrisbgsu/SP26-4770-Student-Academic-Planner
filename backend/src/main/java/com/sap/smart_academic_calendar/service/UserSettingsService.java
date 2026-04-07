package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.UpdateUserSettingsRequest;
import com.sap.smart_academic_calendar.dto.UserSettingsDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.model.UserSettings;
import com.sap.smart_academic_calendar.repository.UserRepository;
import com.sap.smart_academic_calendar.repository.UserSettingsRepository;

@Service
public class UserSettingsService {

    private static final Logger log = LoggerFactory.getLogger(UserSettingsService.class);

    private final UserSettingsRepository userSettingsRepository;
    private final UserRepository userRepository;

    public UserSettingsService(UserSettingsRepository userSettingsRepository, UserRepository userRepository) {
        this.userSettingsRepository = userSettingsRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserSettingsDTO getUserSettings(Long userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElse(null);

        if (settings == null) {
            // Return default settings without persisting
            UserSettingsDTO defaults = new UserSettingsDTO();
            defaults.setUserId(userId);
            defaults.setDefaultCalendarView("week");
            defaults.setThemePreference("light");
            return defaults;
        }

        return convertToDTO(settings);
    }

    @Transactional
    public UserSettingsDTO updateUserSettings(Long userId, UpdateUserSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserSettings newSettings = new UserSettings(user);
                    return newSettings;
                });

        if (request.getPhoneNumber() != null) {
            settings.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getTimeZone() != null) {
            settings.setTimeZone(request.getTimeZone());
        }
        if (request.getDefaultCalendarView() != null) {
            settings.setDefaultCalendarView(request.getDefaultCalendarView());
        }
        if (request.getThemePreference() != null) {
            settings.setThemePreference(request.getThemePreference());
        }

        settings.setUpdatedAt(LocalDateTime.now());
        UserSettings saved = userSettingsRepository.save(settings);
        log.info("Updated settings for user {}", userId);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteUserSettings(Long userId) {
        userSettingsRepository.deleteByUserId(userId);
        log.info("Deleted settings for user {}", userId);
    }

    private UserSettingsDTO convertToDTO(UserSettings settings) {
        UserSettingsDTO dto = new UserSettingsDTO();
        dto.setId(settings.getId());
        dto.setUserId(settings.getUser().getId());
        dto.setPhoneNumber(settings.getPhoneNumber());
        dto.setTimeZone(settings.getTimeZone());
        dto.setDefaultCalendarView(settings.getDefaultCalendarView());
        dto.setThemePreference(settings.getThemePreference());
        dto.setCreatedAt(settings.getCreatedAt());
        dto.setUpdatedAt(settings.getUpdatedAt());
        return dto;
    }
}
