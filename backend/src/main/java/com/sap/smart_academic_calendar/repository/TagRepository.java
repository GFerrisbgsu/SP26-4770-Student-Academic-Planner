package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Tag;

/**
 * Repository interface for Tag entity.
 * Provides database access methods for tags.
 */
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    /**
     * Find all tags for a specific user.
     * @param userId the user ID
     * @return list of tags for the user
     */
    List<Tag> findByUserId(Long userId);

    /**
     * Find a tag by user ID and tag name.
     * @param userId the user ID
     * @param name the tag name
     * @return Optional containing the tag if found
     */
    Optional<Tag> findByUserIdAndName(Long userId, String name);

    /**
     * Check if a tag exists for a user with the given name.
     * @param userId the user ID
     * @param name the tag name
     * @return true if tag exists, false otherwise
     */
    boolean existsByUserIdAndName(Long userId, String name);
}
