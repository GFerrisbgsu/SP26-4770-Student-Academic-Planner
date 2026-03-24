package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.TagDTO;
import com.sap.smart_academic_calendar.service.TagService;

/**
 * REST Controller for Tag operations.
 * Handles HTTP requests related to tag management.
 * Contains no business logic - delegates to TagService.
 */
@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    /**
     * POST endpoint to create a new tag for a user.
     * @param userId the user ID
     * @param name the tag name
     * @param color the tag color (optional)
     * @return ResponseEntity with created tag data
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<TagDTO> createTag(
            @PathVariable Long userId,
            @RequestParam String name,
            @RequestParam(required = false) String color) {
        try {
            TagDTO createdTag = tagService.createTag(userId, name, color);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTag);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET endpoint to retrieve all tags for a user.
     * @param userId the user ID
     * @return ResponseEntity with list of user's tags
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TagDTO>> getUserTags(@PathVariable Long userId) {
        try {
            List<TagDTO> tags = tagService.getUserTags(userId);
            return ResponseEntity.ok(tags);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET endpoint to retrieve a specific tag by ID.
     * @param userId the user ID
     * @param tagId the tag ID
     * @return ResponseEntity with tag data
     */
    @GetMapping("/{tagId}/user/{userId}")
    public ResponseEntity<TagDTO> getTag(
            @PathVariable Long tagId,
            @PathVariable Long userId) {
        try {
            TagDTO tag = tagService.getTagById(tagId, userId);
            return ResponseEntity.ok(tag);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT endpoint to update a tag.
     * @param tagId the tag ID
     * @param userId the user ID
     * @param name the new tag name
     * @param color the new tag color
     * @return ResponseEntity with updated tag data
     */
    @PutMapping("/{tagId}/user/{userId}")
    public ResponseEntity<TagDTO> updateTag(
            @PathVariable Long tagId,
            @PathVariable Long userId,
            @RequestParam String name,
            @RequestParam(required = false) String color) {
        try {
            TagDTO updatedTag = tagService.updateTag(tagId, userId, name, color);
            return ResponseEntity.ok(updatedTag);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * DELETE endpoint to delete a tag.
     * @param tagId the tag ID
     * @param userId the user ID
     * @return ResponseEntity with no content
     */
    @DeleteMapping("/{tagId}/user/{userId}")
    public ResponseEntity<Void> deleteTag(
            @PathVariable Long tagId,
            @PathVariable Long userId) {
        try {
            tagService.deleteTag(tagId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
