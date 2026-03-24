package com.sap.smart_academic_calendar.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sap.smart_academic_calendar.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow all CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public authentication endpoints
                .requestMatchers("/api/auth/login", "/api/auth/refresh", "/api/auth/logout").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/verify-email", "/api/auth/resend-verification").permitAll()
                .requestMatchers("/api/auth/request-password-reset", "/api/auth/reset-password").permitAll()
                .requestMatchers("/api/auth/passkey/authenticate/**").permitAll() // Passkey login (passwordless)
                // Public course endpoints (for browsing catalog)
                .requestMatchers(HttpMethod.GET, "/api/courses", "/api/courses/**").permitAll()
                // Public program and semester reference data
                .requestMatchers(HttpMethod.GET, "/api/programs", "/api/programs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/semesters").permitAll()
                // Authenticated endpoints
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/api/auth/passkey/register/**").authenticated() // Passkey registration requires auth
                .requestMatchers("/api/auth/passkeys/**").authenticated() // Passkey management requires auth
                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    /**
     * BCrypt password encoder for secure password hashing.
     * Uses strength 12 for strong security vs performance balance.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
