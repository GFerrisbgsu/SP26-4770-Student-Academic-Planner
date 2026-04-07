package com.sap.smart_academic_calendar.config;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Flyway Configuration
 * Manually configures Flyway for all profiles that use PostgreSQL.
 * Runs migrations on startup, handles out-of-order and baseline scenarios.
 */
@Configuration
public class FlywayConfig {

    private static final Logger log = LoggerFactory.getLogger(FlywayConfig.class);

    @Bean(initMethod = "migrate")
    public Flyway flyway(DataSource dataSource) {
        log.info("=== Configuring Flyway bean ===");

        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .outOfOrder(true)
                .validateOnMigrate(false)
                .load();

        // Repair checksum mismatches before migrating
        flyway.repair();

        return flyway;
    }
}
