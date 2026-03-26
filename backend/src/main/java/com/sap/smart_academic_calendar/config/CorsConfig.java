package com.sap.smart_academic_calendar.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * CORS Configuration
 * Enables Cross-Origin Resource Sharing to allow frontend (React app on localhost:5173)
 * to communicate with backend API (Spring Boot on localhost:8080).
 *
 * Exposes a CorsConfigurationSource bean so Spring Security's
 * .cors() picks it up and handles OPTIONS preflight correctly.
 *
 * In production, set CORS_ALLOWED_ORIGINS env var to your deployed frontend URL.
 */
@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${app.cors.allowed-origins:}")
    private String additionalOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);

        // Allow frontend origins for development
        config.addAllowedOrigin("http://localhost:5173");  // Vite dev server
        config.addAllowedOrigin("http://localhost:3000");  // Production/Docker frontend
        config.addAllowedOrigin("http://frontend:3000");   // Docker internal network

        // Railway deployed frontend
        config.addAllowedOrigin("https://student-acadamic-calendar.up.railway.app");

        // Allow additional origins from environment (e.g. Railway deployed frontend)
        if (additionalOrigins != null && !additionalOrigins.isBlank()) {
            for (String origin : additionalOrigins.split(",")) {
                String trimmed = origin.trim();
                log.info("CORS: Adding allowed origin from env: '{}'", trimmed);
                config.addAllowedOrigin(trimmed);
            }
        } else {
            log.warn("CORS: No additional origins configured (CORS_ALLOWED_ORIGINS is empty)");
        }

        // Allow all headers and methods including OPTIONS preflight
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
