package com.sap.smart_academic_calendar.service.seeding;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * Main service that orchestrates all database seeding operations.
 * Automatically discovers all DataSeeder beans and executes them in order.
 */
@Service
public class DatabaseSeedingService {
    
    private static final Logger log = LoggerFactory.getLogger(DatabaseSeedingService.class);
    
    private final List<DataSeeder<?>> seeders;
    
    public DatabaseSeedingService(List<DataSeeder<?>> seeders) {
        this.seeders = seeders;
    }
    
    /**
     * Runs all registered seeders in order.
     * Each seeder runs in its own transaction for isolation.
     */
    public void seedAllData() {
        if (seeders.isEmpty()) {
            log.info("No data seeders found");
            return;
        }
        
        // Sort seeders by order
        List<DataSeeder<?>> sortedSeeders = seeders.stream()
            .sorted(Comparator.comparingInt(DataSeeder::getOrder))
            .toList();
        
        log.info("Found {} seeders to execute", sortedSeeders.size());
        
        for (DataSeeder<?> seeder : sortedSeeders) {
            seedWithSeeder(seeder);
        }
    }
    
    /**
     * Executes a single seeder with error handling and logging.
     */
    @Transactional
    protected void seedWithSeeder(DataSeeder<?> seeder) {
        String seederName = seeder.getSeederName();
        
        try {
            if (!seeder.shouldSeed()) {
                log.info("Skipping seeder: {} (conditions not met)", seederName);
                return;
            }
            
            log.info("Running seeder: {} (order: {})", seederName, seeder.getOrder());
            long startTime = System.currentTimeMillis();
            
            seeder.seed();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Completed seeder: {} in {}ms", seederName, duration);
            
        } catch (Exception e) {
            log.error("Seeder failed: {}", seederName, e);
            // Continue with other seeders even if one fails
        }
    }
}