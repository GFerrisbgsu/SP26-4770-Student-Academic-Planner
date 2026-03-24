package com.sap.smart_academic_calendar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS Configuration
 * Enables Cross-Origin Resource Sharing to allow frontend (React app on localhost:5173)
 * to communicate with backend API (Spring Boot on localhost:8080).
 * 
 * In production, replace "http://localhost:5173" with your actual frontend domain.
 */
@Configuration
public class CorsConfig {

    /**
     * Configure CORS filter to allow requests from frontend origin.
     * Allows all HTTP methods (GET, POST, PUT, DELETE, etc.) and headers.
     * 
     * @return CorsFilter bean that will be applied to all endpoints
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Allow frontend origins for development and production
        config.addAllowedOrigin("http://localhost:5173");  // Vite dev server
        config.addAllowedOrigin("http://localhost:3000");  // Production/Docker frontend
        config.addAllowedOrigin("http://frontend:3000");   // Docker internal network
        
        // In production, you might want to allow your deployed frontend domain:
        // config.addAllowedOrigin("https://yourdomain.com");
        
        // Allow all headers
        config.addAllowedHeader("*");
        
        // Allow all HTTP methods (GET, POST, PUT, DELETE, PATCH, OPTIONS)
        config.addAllowedMethod("*");
        
        // Apply this configuration to all endpoints
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}
