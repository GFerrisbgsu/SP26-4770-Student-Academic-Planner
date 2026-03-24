package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.UserPreferenceDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.model.UserPreference;
import com.sap.smart_academic_calendar.repository.UserPreferenceRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

@Service
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;
    private final UserRepository userRepository;

    public UserPreferenceService(UserPreferenceRepository userPreferenceRepository, UserRepository userRepository) {
        this.userPreferenceRepository = userPreferenceRepository;
        this.userRepository = userRepository;
    }

    public Optional<UserPreferenceDTO> getUserPreference(Long userId, String preferenceKey) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userPreferenceRepository.findByUserIdAndPreferenceKey(userId, preferenceKey)
                .map(this::convertToDTO);
    }

    @Transactional
    public UserPreferenceDTO upsertUserPreference(Long userId, String preferenceKey, String preferenceValue) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreference preference = userPreferenceRepository.findByUserIdAndPreferenceKey(userId, preferenceKey)
                .orElseGet(() -> {
                    UserPreference created = new UserPreference();
                    created.setUser(user);
                    created.setPreferenceKey(preferenceKey);
                    return created;
                });

        preference.setPreferenceValue(preferenceValue);
        preference.setUpdatedAt(LocalDateTime.now());

        UserPreference saved = userPreferenceRepository.save(preference);
        return convertToDTO(saved);
    }

    private UserPreferenceDTO convertToDTO(UserPreference userPreference) {
        UserPreferenceDTO dto = new UserPreferenceDTO();
        dto.setId(userPreference.getId());
        dto.setUserId(userPreference.getUser().getId());
        dto.setPreferenceKey(userPreference.getPreferenceKey());
        dto.setPreferenceValue(userPreference.getPreferenceValue());
        dto.setCreatedAt(userPreference.getCreatedAt());
        dto.setUpdatedAt(userPreference.getUpdatedAt());
        return dto;
    }
}
