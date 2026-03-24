package com.sap.smart_academic_calendar.service.seeding;

import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Seeds initial user data for development and testing.
 * Only active in non-production profiles.
 */
@Component
@Profile({"local", "dev", "docker"})
public class UserSeeder implements DataSeeder<User> {
    
    private static final Logger log = LoggerFactory.getLogger(UserSeeder.class);
    
    private final UserRepository userRepository;
    
    public UserSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public void seed() throws Exception {
        // Check if users already exist
        if (userRepository.count() > 1) {
            log.info("Users already exist, skipping user seeding");
            return;
        }
        
        log.info("Seeding initial users...");
        
        // Create test user1
        User testUser1 = createUser(
            "test",
            "test@student.edu", 
            "Test",
            "User",
            "test234"
        );
        userRepository.save(testUser1);
        
        // Create test user2
        User testUser2 = createUser(
            "test2",
            "test2@student.edu",
            "Test",
            "User2",
            "test234"
        );
        userRepository.save(testUser2);
        
        log.info("Seeded {} users", 2);
    }
    
    @Override
    public int getOrder() {
        return 1; // Users should be created first
    }
    
    @Override
    public boolean shouldSeed() {
        // Only seed if no users exist
        return userRepository.count() <= 1;
    }
    
    private User createUser(String username, String email, String firstName, String lastName, String password) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPassword(password); // Note: In real app, should be encrypted
        user.setCreatedAt(LocalDateTime.now());
        
        return user;
    }
}