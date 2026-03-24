package com.sap.smart_academic_calendar.repository;

import com.sap.smart_academic_calendar.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Persistence tests for UserRepository.
 * Tests database operations and JPA query methods.
 */
@SpringBootTest
@ActiveProfiles("local") // Use H2 in-memory database for tests
@Transactional // Auto-rollback after each test
@DisplayName("UserRepository Persistence Tests")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    private User testUser1;
    private User testUser2;

    @BeforeEach
    void setUp() {
        // Clear any existing data
        userRepository.deleteAll();
        entityManager.flush();
        entityManager.clear();

        // Create test users (not persisted yet)
        testUser1 = createUser("john_doe", "john@example.com", "password123");
        testUser2 = createUser("jane_smith", "jane@example.com", "password456");
    }

    // ========================================
    // CRUD Operations Tests
    // ========================================

    @Test
    @DisplayName("Should save user and generate ID")
    void testSaveUser() {
        // When
        User savedUser = userRepository.save(testUser1);

        // Then
        assertThat(savedUser).isNotNull();
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("john_doe");
        assertThat(savedUser.getEmail()).isEqualTo("john@example.com");
        assertThat(savedUser.getPassword()).isEqualTo("password123");
        assertThat(savedUser.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should find user by ID")
    void testFindById() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();
        Long userId = testUser1.getId();

        // When
        Optional<User> found = userRepository.findById(userId);

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("john_doe");
    }

    @Test
    @DisplayName("Should return empty when user ID not found")
    void testFindByIdNotFound() {
        // When
        Optional<User> found = userRepository.findById(999L);

        // Then
        assertThat(found).isNotPresent();
    }

    @Test
    @DisplayName("Should find all users")
    void testFindAll() {
        // Given
        entityManager.persist(testUser1);
        entityManager.persist(testUser2);
        entityManager.flush();

        // When
        List<User> users = userRepository.findAll();

        // Then
        assertThat(users).hasSize(2);
        assertThat(users).extracting(User::getUsername)
            .containsExactlyInAnyOrder("john_doe", "jane_smith");
    }

    @Test
    @DisplayName("Should count users")
    void testCount() {
        // Given
        entityManager.persist(testUser1);
        entityManager.persist(testUser2);
        entityManager.flush();

        // When
        long count = userRepository.count();

        // Then
        assertThat(count).isEqualTo(2);
    }

    @Test
    @DisplayName("Should delete user by ID")
    void testDeleteById() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();
        Long userId = testUser1.getId();

        // When
        userRepository.deleteById(userId);
        entityManager.flush();

        // Then
        Optional<User> found = userRepository.findById(userId);
        assertThat(found).isNotPresent();
    }

    @Test
    @DisplayName("Should delete user entity")
    void testDelete() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When
        userRepository.delete(testUser1);
        entityManager.flush();

        // Then
        long count = userRepository.count();
        assertThat(count).isZero();
    }

    @Test
    @DisplayName("Should update user")
    void testUpdateUser() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();
        Long userId = testUser1.getId();

        // When
        testUser1.setEmail("newemail@example.com");
        testUser1.setPassword("newpassword");
        userRepository.save(testUser1);
        entityManager.flush();
        entityManager.clear();

        // Then
        User updatedUser = userRepository.findById(userId).orElseThrow();
        assertThat(updatedUser.getEmail()).isEqualTo("newemail@example.com");
        assertThat(updatedUser.getPassword()).isEqualTo("newpassword");
        assertThat(updatedUser.getUsername()).isEqualTo("john_doe"); // Unchanged
    }

    // ========================================
    // Custom Query Method Tests
    // ========================================

    @Test
    @DisplayName("Should find user by username")
    void testFindByUsername() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByUsername("john_doe");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("john@example.com");
    }

    @Test
    @DisplayName("Should return empty when username not found")
    void testFindByUsernameNotFound() {
        // When
        Optional<User> found = userRepository.findByUsername("nonexistent");

        // Then
        assertThat(found).isNotPresent();
    }

    @Test
    @DisplayName("Should find user by email")
    void testFindByEmail() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByEmail("john@example.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("john_doe");
    }

    @Test
    @DisplayName("Should return empty when email not found")
    void testFindByEmailNotFound() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@example.com");

        // Then
        assertThat(found).isNotPresent();
    }

    @Test
    @DisplayName("Should check if username exists")
    void testExistsByUsername() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When
        boolean exists = userRepository.existsByUsername("john_doe");
        boolean notExists = userRepository.existsByUsername("nonexistent");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should check if email exists")
    void testExistsByEmail() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When
        boolean exists = userRepository.existsByEmail("john@example.com");
        boolean notExists = userRepository.existsByEmail("nonexistent@example.com");

        // Then
        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    // ========================================
    // Constraint Validation Tests
    // ========================================

    @Test
    @DisplayName("Should fail when saving duplicate username")
    void testDuplicateUsername() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When/Then
        User duplicateUser = createUser("john_doe", "different@example.com", "password");
        
        assertThatThrownBy(() -> {
            userRepository.save(duplicateUser);
            entityManager.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should fail when saving duplicate email")
    void testDuplicateEmail() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When/Then
        User duplicateUser = createUser("different_user", "john@example.com", "password");
        
        assertThatThrownBy(() -> {
            userRepository.save(duplicateUser);
            entityManager.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should fail when username is null")
    void testNullUsername() {
        // Given
        User invalidUser = new User();
        invalidUser.setUsername(null);
        invalidUser.setEmail("test@example.com");
        invalidUser.setPassword("password");

        // When/Then
        assertThatThrownBy(() -> {
            userRepository.save(invalidUser);
            entityManager.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should fail when email is null")
    void testNullEmail() {
        // Given
        User invalidUser = new User();
        invalidUser.setUsername("testuser");
        invalidUser.setEmail(null);
        invalidUser.setPassword("password");

        // When/Then
        assertThatThrownBy(() -> {
            userRepository.save(invalidUser);
            entityManager.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Should fail when password is null")
    void testNullPassword() {
        // Given
        User invalidUser = new User();
        invalidUser.setUsername("testuser");
        invalidUser.setEmail("test@example.com");
        invalidUser.setPassword(null);

        // When/Then
        assertThatThrownBy(() -> {
            userRepository.save(invalidUser);
            entityManager.flush();
        }).isInstanceOf(DataIntegrityViolationException.class);
    }

    // ========================================
    // Edge Case Tests
    // ========================================

    @Test
    @DisplayName("Should handle empty database")
    void testEmptyDatabase() {
        // When
        List<User> users = userRepository.findAll();
        long count = userRepository.count();

        // Then
        assertThat(users).isEmpty();
        assertThat(count).isZero();
    }

    @Test
    @DisplayName("Should preserve createdAt timestamp")
    void testCreatedAtTimestamp() {
        // Given
        LocalDateTime beforeSave = LocalDateTime.now().minusSeconds(1);
        
        // When
        User savedUser = userRepository.save(testUser1);
        entityManager.flush();
        
        LocalDateTime afterSave = LocalDateTime.now().plusSeconds(1);

        // Then
        assertThat(savedUser.getCreatedAt()).isNotNull();
        assertThat(savedUser.getCreatedAt()).isAfter(beforeSave);
        assertThat(savedUser.getCreatedAt()).isBefore(afterSave);
    }

    @Test
    @DisplayName("Should handle long username")
    void testLongUsername() {
        // Given - Max length is 255
        String longUsername = "a".repeat(255);
        User user = createUser(longUsername, "long@example.com", "password");

        // When
        User savedUser = userRepository.save(user);
        entityManager.flush();

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).hasSize(255);
    }

    @Test
    @DisplayName("Should handle special characters in fields")
    void testSpecialCharacters() {
        // Given
        User user = createUser("user_123-test", "user+tag@sub.example.com", "p@$$w0rd!");

        // When
        User savedUser = userRepository.save(user);
        entityManager.flush();

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("user_123-test");
        assertThat(savedUser.getEmail()).isEqualTo("user+tag@sub.example.com");
        assertThat(savedUser.getPassword()).isEqualTo("p@$$w0rd!");
    }

    @Test
    @DisplayName("Should query users case-sensitively")
    void testCaseSensitiveQueries() {
        // Given
        entityManager.persist(testUser1);
        entityManager.flush();

        // When
        Optional<User> found1 = userRepository.findByUsername("john_doe");
        Optional<User> found2 = userRepository.findByUsername("JOHN_DOE");

        // Then
        assertThat(found1).isPresent();
        assertThat(found2).isNotPresent(); // Different case
    }

    // ========================================
    // Helper Methods
    // ========================================

    /**
     * Helper method to create a test user.
     */
    private User createUser(String username, String email, String password) {
        return new User(username, email, password);
    }
}
