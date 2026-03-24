package com.sap.smart_academic_calendar.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.model.TokenBlacklist;

/**
 * Repository interface for TokenBlacklist entity.
 * Provides CRUD operations and custom query methods for token blacklist data access.
 */
@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    /**
     * Check if a token exists in the blacklist.
     * @param token the JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    boolean existsByToken(String token);

    /**
     * Delete all blacklisted tokens that have expired.
     * This is used by the cleanup scheduler to remove old entries.
     * @param dateTime the cutoff date/time - tokens expiring before this will be deleted
     * @return the number of deleted records
     */
    @Modifying
    @Transactional
    int deleteByExpiryDateBefore(LocalDateTime dateTime);
}
