package com.sap.smart_academic_calendar.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;

@Service
public class AvatarService {

    private static final Logger log = LoggerFactory.getLogger(AvatarService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    private final UserRepository userRepository;
    private final Path uploadDir;

    public AvatarService(UserRepository userRepository,
                         @Value("${app.avatar.upload-dir:uploads/avatars}") String uploadDirPath) {
        this.userRepository = userRepository;
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            log.error("Could not create avatar upload directory: {}", this.uploadDir, e);
        }
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 5MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new RuntimeException("Invalid file type. Allowed: JPEG, PNG, GIF, WebP");
        }

        // Delete old avatar file if exists
        deleteAvatarFile(user.getAvatarUrl());

        // Generate unique filename
        String extension = getExtension(file.getOriginalFilename());
        String filename = userId + "_" + UUID.randomUUID() + extension;
        Path targetPath = uploadDir.resolve(filename).normalize();

        // Security: ensure target is within upload dir
        if (!targetPath.startsWith(uploadDir)) {
            throw new RuntimeException("Invalid file path");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String avatarUrl = "/uploads/avatars/" + filename;
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        log.info("Avatar uploaded for user {}: {}", userId, avatarUrl);
        return avatarUrl;
    }

    @Transactional
    public void deleteAvatar(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        deleteAvatarFile(user.getAvatarUrl());
        user.setAvatarUrl(null);
        userRepository.save(user);
        log.info("Avatar deleted for user {}", userId);
    }

    private void deleteAvatarFile(String avatarUrl) {
        if (avatarUrl == null) {
            return;
        }
        try {
            String filename = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
            Path filePath = uploadDir.resolve(filename).normalize();
            if (filePath.startsWith(uploadDir)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            log.warn("Could not delete old avatar file: {}", avatarUrl, e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null) {
            return ".jpg";
        }
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".jpg";
    }
}
