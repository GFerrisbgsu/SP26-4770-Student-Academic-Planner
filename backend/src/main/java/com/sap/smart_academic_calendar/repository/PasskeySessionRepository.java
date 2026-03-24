package com.sap.smart_academic_calendar.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.model.PasskeySession;

/**
 * Repository interface for PasskeySession entity.
 * Provides CRUD operations and custom query methods for passkey session data access.
 */
@Repository
public interface PasskeySessionRepository extends JpaRepository<PasskeySession, Long> {

    /**
     * Find a passkey session by its challenge string.
     * @param challenge the Base64-encoded challenge
     * @return an Optional containing the session if found
     */
    Optional<PasskeySession> findByChallenge(String challenge);

    /**
     * Find the most recent passkey session for a specific user.
     * Uses explicit JPQL with LIMIT 1 for reliable behaviour in Spring Data JPA 4.0+.
     * @param userId the user's ID
     * @return an Optional containing the most recent session if found
     */
    @Query("SELECT s FROM PasskeySession s WHERE s.userId = :userId ORDER BY s.createdAt DESC LIMIT 1")
    Optional<PasskeySession> findMostRecentByUserId(@Param("userId") Long userId);

    /**
     * Find all sessions for a specific user (for cleanup).
     */
    List<PasskeySession> findAllByUserId(Long userId);

    /**
     * Delete all sessions for a specific user.
     * Uses explicit JPQL @Query with clearAutomatically=true so the L1 cache
     * is invalidated immediately after the bulk DELETE executes.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("DELETE FROM PasskeySession s WHERE s.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /**
     * Delete all expired passkey sessions.
     * This is used by the cleanup scheduler to remove old challenges.
     * @param now the current date/time - sessions expiring before this will be deleted
     * @return the number of deleted sessions
     */
    @Modifying
    @Transactional
    int deleteByExpiresAtBefore(LocalDateTime now);

}
