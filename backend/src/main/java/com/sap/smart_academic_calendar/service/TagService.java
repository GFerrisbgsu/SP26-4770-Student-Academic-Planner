package com.sap.smart_academic_calendar.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sap.smart_academic_calendar.dto.TagDTO;
import com.sap.smart_academic_calendar.model.Tag;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.TagRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service class for Tag operations.
 * Contains business logic for tag management.
 */
@Service
public class TagService {

    private final TagRepository tagRepository;
    private final UserRepository userRepository;

    public TagService(TagRepository tagRepository, UserRepository userRepository) {
        this.tagRepository = tagRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new tag for a user.
     * @param userId the user ID
     * @param name the tag name
     * @param color the tag color (optional)
     * @return the created tag as TagDTO
     */
    public TagDTO createTag(Long userId, String name, String color) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if tag already exists for this user
        if (tagRepository.existsByUserIdAndName(userId, name)) {
            throw new RuntimeException("Tag '" + name + "' already exists for this user");
        }

        Tag tag = new Tag(user, name, color);
        Tag savedTag = tagRepository.save(tag);
        return convertToDTO(savedTag);
    }

    /**
     * Get all tags for a user.
     * @param userId the user ID
     * @return list of tags
     */
    public List<TagDTO> getUserTags(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        List<Tag> tags = tagRepository.findByUserId(userId);
        return tags.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a tag by ID, verifying it belongs to the user.
     * @param tagId the tag ID
     * @param userId the user ID
     * @return TagDTO if found and belongs to user
     */
    public TagDTO getTagById(Long tagId, Long userId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + tagId));

        if (!tag.getUser().getId().equals(userId)) {
            throw new RuntimeException("Tag does not belong to this user");
        }

        return convertToDTO(tag);
    }

    /**
     * Get or create a tag by name for a user.
     * @param userId the user ID
     * @param name the tag name
     * @param color the tag color (optional)
     * @return the tag as TagDTO
     */
    public TagDTO getOrCreateTag(Long userId, String name, String color) {
        Optional<Tag> existingTag = tagRepository.findByUserIdAndName(userId, name);
        
        if (existingTag.isPresent()) {
            return convertToDTO(existingTag.get());
        }

        return createTag(userId, name, color);
    }

    /**
     * Update a tag.
     * @param tagId the tag ID
     * @param userId the user ID
     * @param name the new tag name
     * @param color the new tag color
     * @return the updated tag as TagDTO
     */
    public TagDTO updateTag(Long tagId, Long userId, String name, String color) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + tagId));

        if (!tag.getUser().getId().equals(userId)) {
            throw new RuntimeException("Tag does not belong to this user");
        }

        // Check if new name already exists for this user (if name is different)
        if (!tag.getName().equals(name) && tagRepository.existsByUserIdAndName(userId, name)) {
            throw new RuntimeException("Tag '" + name + "' already exists for this user");
        }

        tag.setName(name);
        tag.setColor(color);
        tag.setUpdatedAt(LocalDateTime.now());

        Tag updatedTag = tagRepository.save(tag);
        return convertToDTO(updatedTag);
    }

    /**
     * Delete a tag.
     * @param tagId the tag ID
     * @param userId the user ID
     */
    public void deleteTag(Long tagId, Long userId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + tagId));

        if (!tag.getUser().getId().equals(userId)) {
            throw new RuntimeException("Tag does not belong to this user");
        }

        tagRepository.deleteById(tagId);
    }

    /**
     * Get a tag entity by ID and user ID (internal use).
     * @param tagId the tag ID
     * @param userId the user ID
     * @return the tag entity
     */
    public Tag getTagEntityById(Long tagId, Long userId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found with id: " + tagId));

        if (!tag.getUser().getId().equals(userId)) {
            throw new RuntimeException("Tag does not belong to this user");
        }

        return tag;
    }

    /**
     * Convert Tag entity to TagDTO.
     * @param tag the tag entity
     * @return the tag DTO
     */
    private TagDTO convertToDTO(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setUserId(tag.getUser().getId());
        dto.setName(tag.getName());
        dto.setColor(tag.getColor());
        dto.setCreatedAt(tag.getCreatedAt());
        dto.setUpdatedAt(tag.getUpdatedAt());
        return dto;
    }
}
