package com.sap.smart_academic_calendar.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * CORS Configuration – raw servlet filter approach.
 *
 * Registers a plain {@link Filter} at {@link Ordered#HIGHEST_PRECEDENCE} so it
 * executes <b>before</b> the entire Spring Security filter chain and before any
 * other servlet filters.  This guarantees that every response – including error
 * pages and preflight OPTIONS – carries the correct CORS headers regardless of
 * what happens downstream.
 *
 * In production, set the {@code CORS_ALLOWED_ORIGINS} environment variable to
 * the deployed frontend URL (comma-separated for multiple origins).
 */
@Configuration
public class CorsConfig {

    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);

    @Value("${app.cors.allowed-origins:}")
    private String additionalOrigins;

    @Bean
    public FilterRegistrationBean<Filter> corsFilter() {
        // Build the allowed-origins list once at startup
        List<String> allowedOrigins = new ArrayList<>();
        allowedOrigins.add("http://localhost:5173");   // Vite dev server
        allowedOrigins.add("http://localhost:3000");   // Production / Docker frontend
        allowedOrigins.add("http://frontend:3000");    // Docker internal network

        if (additionalOrigins != null && !additionalOrigins.isBlank()) {
            for (String origin : additionalOrigins.split(",")) {
                String trimmed = origin.trim();
                if (!trimmed.isEmpty()) {
                    log.info("CORS: Adding allowed origin from env: '{}'", trimmed);
                    allowedOrigins.add(trimmed);
                }
            }
        } else {
            log.warn("CORS: No additional origins configured (CORS_ALLOWED_ORIGINS is empty)");
        }

        log.info("CORS: Allowed origins = {}", allowedOrigins);

        Filter filter = new Filter() {
            @Override
            public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
                    throws IOException, ServletException {
                HttpServletRequest request = (HttpServletRequest) req;
                HttpServletResponse response = (HttpServletResponse) res;

                String origin = request.getHeader("Origin");

                if (origin != null && allowedOrigins.contains(origin)) {
                    response.setHeader("Access-Control-Allow-Origin", origin);
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    response.setHeader("Access-Control-Allow-Methods",
                            "GET, POST, PUT, DELETE, PATCH, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers",
                            "Authorization, Content-Type, Accept, X-Requested-With");
                    response.setHeader("Access-Control-Max-Age", "3600");
                }

                // Short-circuit preflight – return 200 immediately
                if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                    response.setStatus(HttpServletResponse.SC_OK);
                    return;
                }

                chain.doFilter(request, response);
            }
        };

        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>(filter);
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        bean.addUrlPatterns("/*");
        return bean;
    }
}
