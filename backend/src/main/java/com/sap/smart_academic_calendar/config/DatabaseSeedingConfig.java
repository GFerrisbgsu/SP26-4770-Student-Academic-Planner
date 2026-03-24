package com.sap.smart_academic_calendar.config;

import com.sap.smart_academic_calendar.service.seeding.DatabaseSeedingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;

/**
 * Configuration class that handles database seeding after application startup.
 * Seeding only runs in development and local environments by default.
 */
@Configuration
public class DatabaseSeedingConfig {
    
    private static final Logger log = LoggerFactory.getLogger(DatabaseSeedingConfig.class);
    
    private final DatabaseSeedingService seedingService;
    
    @Value("${app.seeding.enabled:true}")
    private boolean seedingEnabled;
    
    @Value("${spring.profiles.active:local}")
    private String activeProfile;
    
    public DatabaseSeedingConfig(DatabaseSeedingService seedingService) {
        this.seedingService = seedingService;
    }
    
    /**
     * Runs database seeding after the application is fully started.
     * Only runs in local/dev environments unless explicitly enabled.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Order(100) // Run after other initialization
    public void seedDatabase() {
        if (!shouldRunSeeding()) {
            log.info("Database seeding skipped (profile: {}, enabled: {})", activeProfile, seedingEnabled);
            return;
        }
        
        log.info("Starting database seeding process...");
        try {
            seedingService.seedAllData();
            log.info("Database seeding completed successfully");
        } catch (Exception e) {
            log.error("Database seeding failed", e);
            // Don't throw exception - let app continue running
        }
    }
    
    private boolean shouldRunSeeding() {
        // Only seed in development environments by default
        boolean isDevelopmentProfile = "local".equals(activeProfile) 
            || "dev".equals(activeProfile)
            || "docker".equals(activeProfile);
        return seedingEnabled && isDevelopmentProfile;
    }
}