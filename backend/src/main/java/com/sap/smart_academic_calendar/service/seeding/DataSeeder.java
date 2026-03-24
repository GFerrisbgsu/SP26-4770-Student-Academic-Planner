package com.sap.smart_academic_calendar.service.seeding;

/**
 * Base interface for all database seeding implementations.
 * Each entity that needs seeding should have a corresponding seeder that implements this interface.
 * 
 * @param <T> The entity type being seeded
 */
public interface DataSeeder<T> {
    
    /**
     * Performs the seeding operation for this entity type.
     * Should check if data already exists before creating new records.
     * 
     * @throws Exception if seeding fails
     */
    void seed() throws Exception;
    
    /**
     * Returns the order in which this seeder should run.
     * Lower numbers run first. Use this to handle dependencies between entities.
     * 
     * Default order:
     * - Users: 1
     * - Courses: 10  
     * - CalendarEvents: 20
     * - UserSettings: 30
     * - Other entities: 100+
     * 
     * @return execution order (lower = earlier)
     */
    default int getOrder() {
        return 100;
    }
    
    /**
     * Returns the name of this seeder for logging purposes.
     * 
     * @return seeder name
     */
    default String getSeederName() {
        return this.getClass().getSimpleName();
    }
    
    /**
     * Checks if seeding should run for this entity.
     * Override to add custom conditions.
     * 
     * @return true if seeding should proceed
     */
    default boolean shouldSeed() {
        return true;
    }
}