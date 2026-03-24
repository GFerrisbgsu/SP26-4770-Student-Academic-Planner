package com.sap.smart_academic_calendar.scheduler;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.repository.TokenBlacklistRepository;

/**
 * Scheduled task to clean up expired tokens from the blacklist.
 * Runs daily at 3:00 AM to remove tokens that have already expired.
 */
@Component
public class TokenCleanupScheduler {
    
    private static final Logger log = LoggerFactory.getLogger(TokenCleanupScheduler.class);
    
    private final TokenBlacklistRepository tokenBlacklistRepository;

    public TokenCleanupScheduler(TokenBlacklistRepository tokenBlacklistRepository) {
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    /**
     * Deletes expired tokens from the blacklist.
     * Scheduled to run daily at 3:00 AM.
     * Cron expression: "0 0 3 * * *" = second minute hour day month weekday
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredTokens() {
        log.info("Starting scheduled cleanup of expired blacklisted tokens");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            int deletedCount = tokenBlacklistRepository.deleteByExpiryDateBefore(now);
            
            log.info("Cleanup complete: {} expired tokens removed from blacklist", deletedCount);
        } catch (Exception e) {
            log.error("Error during token cleanup: {}", e.getMessage(), e);
        }
    }
}
