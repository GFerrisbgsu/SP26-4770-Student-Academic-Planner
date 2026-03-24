package com.sap.smart_academic_calendar.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.model.Passkey;

/**
 * Repository interface for Passkey entity.
 * Provides CRUD operations and custom query methods for passkey data access.
 */
@Repository
public interface PasskeyRepository extends JpaRepository<Passkey, Long> {

    /**
     * Find a passkey by its credential ID.
     * @param credentialId the Base64-encoded credential ID
     * @return an Optional containing the passkey if found
     */
    Optional<Passkey> findByCredentialId(String credentialId);

    /**
     * Find all passkeys registered to a specific user.
     * @param userId the user's ID
     * @return list of passkeys belonging to the user
     */
    List<Passkey> findByUserId(Long userId);

    /**
     * Check if a credential ID already exists.
     * @param credentialId the Base64-encoded credential ID
     * @return true if the credential ID exists, false otherwise
     */
    boolean existsByCredentialId(String credentialId);

    /**
     * Delete all passkeys for a specific user.
     * @param userId the user's ID
     * @return the number of deleted passkeys
     */
    @Modifying
    @Transactional
    int deleteByUserId(Long userId);

    /**
     * Count the number of passkeys a user has registered.
     * @param userId the user's ID
     * @return the count of passkeys
     */
    long countByUserId(Long userId);
}
