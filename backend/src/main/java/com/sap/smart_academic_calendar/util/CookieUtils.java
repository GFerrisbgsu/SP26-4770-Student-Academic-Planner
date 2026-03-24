package com.sap.smart_academic_calendar.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;

/**
 * Utility class for managing HTTP cookies.
 * Handles creation of secure HttpOnly cookies for JWT tokens.
 */
@Component
public class CookieUtils {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private final boolean isProduction;
    private final String sameSitePolicy;

    public CookieUtils(@Value("${spring.profiles.active:local}") String activeProfile) {
        // Set Secure flag only in dev, docker, and prod profiles (not local)
        this.isProduction = !activeProfile.equals("local");
        // Cross-origin deployments (e.g. Railway) need SameSite=None so cookies are sent;
        // local dev uses Strict for CSRF protection.
        this.sameSitePolicy = activeProfile.equals("prod") ? "None" : "Strict";
    }

    /**
     * Creates an HttpOnly cookie for the access token.
     * Short-lived cookie (15 minutes default).
     * 
     * @param token the JWT access token
     * @param maxAgeSeconds the cookie expiration in seconds
     * @return configured Cookie instance
     */
    public Cookie createAccessTokenCookie(String token, int maxAgeSeconds) {
        Cookie cookie = new Cookie(ACCESS_TOKEN_COOKIE_NAME, token);
        cookie.setHttpOnly(true);  // Prevents JavaScript access (XSS protection)
        cookie.setSecure(isProduction);  // HTTPS only in production
        cookie.setPath("/");  // Available to entire application
        cookie.setMaxAge(maxAgeSeconds);  // Cookie expiration
        cookie.setAttribute("SameSite", sameSitePolicy);
        return cookie;
    }

    /**
     * Creates an HttpOnly cookie for the refresh token.
     * Long-lived cookie (7 or 30 days based on rememberMe).
     * 
     * @param token the JWT refresh token
     * @param maxAgeSeconds the cookie expiration in seconds
     * @return configured Cookie instance
     */
    public Cookie createRefreshTokenCookie(String token, int maxAgeSeconds) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, token);
        cookie.setHttpOnly(true);  // Prevents JavaScript access (XSS protection)
        cookie.setSecure(isProduction);  // HTTPS only in production
        cookie.setPath("/");  // Available to entire application
        cookie.setMaxAge(maxAgeSeconds);  // Cookie expiration
        cookie.setAttribute("SameSite", sameSitePolicy);
        return cookie;
    }

    /**
     * Creates a cookie with maxAge=0 to delete an existing cookie.
     * 
     * @param name the name of the cookie to delete
     * @return configured Cookie instance that will delete the existing cookie
     */
    public Cookie deleteCookie(String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(isProduction);
        cookie.setPath("/");
        cookie.setMaxAge(0);  // Deletes the cookie immediately
        cookie.setAttribute("SameSite", sameSitePolicy);
        return cookie;
    }

    /**
     * Extracts a cookie value from an array of cookies.
     * 
     * @param cookies array of cookies from the request
     * @param name the name of the cookie to extract
     * @return the cookie value, or null if not found
     */
    public static String extractCookieValue(Cookie[] cookies, String name) {
        if (cookies == null) {
            return null;
        }
        
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        
        return null;
    }

    /**
     * Converts minutes to seconds for cookie maxAge.
     */
    public static int minutesToSeconds(long minutes) {
        return (int) (minutes * 60);
    }

    /**
     * Converts days to seconds for cookie maxAge.
     */
    public static int daysToSeconds(long days) {
        return (int) (days * 24 * 60 * 60);
    }
}
