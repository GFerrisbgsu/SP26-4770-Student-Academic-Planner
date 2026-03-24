package com.sap.smart_academic_calendar.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sap.smart_academic_calendar.service.JwtService;
import com.sap.smart_academic_calendar.util.CookieUtils;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT Authentication Filter that runs on every request.
 * Extracts access token from HttpOnly cookie, validates it, and sets authentication context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        // Skip JWT validation for specific public authentication endpoints
        // /login - no token needed (logging in)
        // /refresh - uses refresh token (validated in controller)
        // /logout - uses refresh token (validated in controller)
        // /passkey/authenticate/** - passwordless login (no access token yet)
        String requestPath = request.getRequestURI();
        if (requestPath.equals("/api/auth/login") || 
            requestPath.equals("/api/auth/refresh") || 
            requestPath.equals("/api/auth/logout") ||
            requestPath.startsWith("/api/auth/passkey/authenticate/")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extract access token from Authorization header or cookie
        String token = null;
        
        // First, check Authorization header for Bearer token
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Remove "Bearer " prefix
        }
        
        // If not in header, check HttpOnly cookie
        if (token == null) {
            Cookie[] cookies = request.getCookies();
            token = CookieUtils.extractCookieValue(cookies, CookieUtils.ACCESS_TOKEN_COOKIE_NAME);
        }
        
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Validate access token
        if (!jwtService.isAccessTokenValid(token)) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired access token");
            return;
        }

        // Set authentication context if not already set
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            Claims claims = jwtService.parseClaims(token);
            String username = claims.get("username", String.class);
            if (username == null || username.isBlank()) {
                username = claims.getSubject();
            }

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(username, null, List.of());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }
}
