package com.sap.smart_academic_calendar.config;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Flyway Configuration
 * Manually configures Flyway for 'dev' and 'docker' profiles.
 * 
 * Profiles:
 * - 'dev': Local development with PostgreSQL in Docker
 * - 'docker': Full stack running in Docker Compose
 * 
 * Both profiles use PostgreSQL and require Flyway migrations.
 */
@Configuration
@Profile({"dev", "docker", "prod"})
public class FlywayConfig {

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        System.out.println("=== Manually Creating Flyway Bean for Profile: " + 
                          System.getProperty("spring.profiles.active", "unknown") + " ===");
        
        return Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
    }
}
