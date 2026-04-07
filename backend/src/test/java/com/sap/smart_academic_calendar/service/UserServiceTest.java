package com.sap.smart_academic_calendar.service;

import com.sap.smart_academic_calendar.dto.CreateUserRequest;
import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService.
 * Tests business logic using mocked dependencies.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TodoListService todoListService;

    @InjectMocks
    private UserService userService;

    private User testUser1;
    private User testUser2;

    @BeforeEach
    void setUp() {
        testUser1 = createUser(1L, "john_doe", "john@example.com", "password123");
        testUser2 = createUser(2L, "jane_smith", "jane@example.com", "password456");
    }

    // ========================================
    // getAllUsers() Tests
    // ========================================

    @Nested
    @DisplayName("getAllUsers() Tests")
    class GetAllUsersTests {

        @Test
        @DisplayName("Should return all users as DTOs")
        void shouldReturnAllUsers() {
            // Given
            List<User> users = Arrays.asList(testUser1, testUser2);
            when(userRepository.findAll()).thenReturn(users);

            // When
            List<UserDTO> result = userService.getAllUsers();

            // Then
            assertThat(result).hasSize(2);
            assertThat(result).extracting(UserDTO::getUsername)
                .containsExactly("john_doe", "jane_smith");
            assertThat(result).extracting(UserDTO::getEmail)
                .containsExactly("john@example.com", "jane@example.com");
            
            verify(userRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no users exist")
        void shouldReturnEmptyListWhenNoUsers() {
            // Given
            when(userRepository.findAll()).thenReturn(List.of());

            // When
            List<UserDTO> result = userService.getAllUsers();

            // Then
            assertThat(result).isEmpty();
            verify(userRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should not include password in DTOs")
        void shouldNotIncludePasswordInResponse() {
            // Given
            when(userRepository.findAll()).thenReturn(List.of(testUser1));

            // When
            List<UserDTO> result = userService.getAllUsers();

            // Then
            assertThat(result).hasSize(1);
            UserDTO dto = result.get(0);
            assertThat(dto.getId()).isEqualTo(1L);
            assertThat(dto.getUsername()).isEqualTo("john_doe");
            assertThat(dto.getEmail()).isEqualTo("john@example.com");
            assertThat(dto.getCreatedAt()).isNotNull();
            // DTO should not have password field exposed
        }
    }

    // ========================================
    // getUserById() Tests
    // ========================================

    @Nested
    @DisplayName("getUserById() Tests")
    class GetUserByIdTests {

        @Test
        @DisplayName("Should return user by ID when user exists")
        void shouldReturnUserById() {
            // Given
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser1));

            // When
            UserDTO result = userService.getUserById(1L);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getUsername()).isEqualTo("john_doe");
            assertThat(result.getEmail()).isEqualTo("john@example.com");
            
            verify(userRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("Should throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            // Given
            when(userRepository.findById(999L)).thenReturn(Optional.empty());

            // When/Then
            assertThatThrownBy(() -> userService.getUserById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("User not found with id: 999");
            
            verify(userRepository, times(1)).findById(999L);
        }

        @Test
        @DisplayName("Should not include password in returned DTO")
        void shouldNotIncludePassword() {
            // Given
            when(userRepository.findById(1L)).thenReturn(Optional.of(testUser1));

            // When
            UserDTO result = userService.getUserById(1L);

            // Then
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getUsername()).isEqualTo("john_doe");
            assertThat(result.getEmail()).isEqualTo("john@example.com");
            assertThat(result.getCreatedAt()).isNotNull();
        }
    }

    // ========================================
    // createUser() Tests
    // ========================================

    @Nested
    @DisplayName("createUser() Tests")
    class CreateUserTests {

        @Test
        @DisplayName("Should create user with valid data")
        void shouldCreateUserWithValidData() {
            // Given
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(emailService.generateVerificationCode()).thenReturn("VERIFY123");
            
            CreateUserRequest request = new CreateUserRequest("new_user", "new@example.com", "password");
            User savedUser = createUser(3L, "new_user", "new@example.com", "encoded_password");
            
            when(userRepository.existsByUsername("new_user")).thenReturn(false);
            when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(savedUser);

            // When
            UserDTO result = userService.createUser(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(3L);
            assertThat(result.getUsername()).isEqualTo("new_user");
            assertThat(result.getEmail()).isEqualTo("new@example.com");
            
            verify(userRepository, times(1)).existsByUsername("new_user");
            verify(userRepository, times(1)).existsByEmail("new@example.com");
            verify(userRepository, times(1)).save(any(User.class));
        }

        @Test
        @DisplayName("Should save user with correct fields")
        void shouldSaveUserWithCorrectFields() {
            // Given
            when(passwordEncoder.encode("testpass")).thenReturn("encoded_testpass");
            when(emailService.generateVerificationCode()).thenReturn("VERIFY123");
            
            CreateUserRequest request = new CreateUserRequest("test_user", "test@example.com", "testpass");
            when(userRepository.existsByUsername("test_user")).thenReturn(false);
            when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
                User user = invocation.getArgument(0);
                user.setId(10L);
                return user;
            });

            // When
            userService.createUser(request);
            
            // Then
            verify(userRepository).save(argThat(user -> 
                user.getUsername().equals("test_user") &&
                user.getEmail().equals("test@example.com") &&
                user.getPassword().equals("encoded_testpass")  // Password should be encoded
            ));
        }

        @Test
        @DisplayName("Should throw exception when username is null")
        void shouldThrowExceptionWhenUsernameIsNull() {
            // Given
            CreateUserRequest request = new CreateUserRequest(null, "test@example.com", "password");

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username is required");
            
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when username is empty")
        void shouldThrowExceptionWhenUsernameIsEmpty() {
            // Given
            CreateUserRequest request = new CreateUserRequest("   ", "test@example.com", "password");

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username is required");
            
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when email is null")
        void shouldThrowExceptionWhenEmailIsNull() {
            // Given
            CreateUserRequest request = new CreateUserRequest("testuser", null, "password");

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is required");
            
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when email is empty")
        void shouldThrowExceptionWhenEmailIsEmpty() {
            // Given
            CreateUserRequest request = new CreateUserRequest("testuser", "  ", "password");

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is required");
            
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when password is null")
        void shouldThrowExceptionWhenPasswordIsNull() {
            // Given
            CreateUserRequest request = new CreateUserRequest("testuser", "test@example.com", null);

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password is required");
            
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when password is empty")
        void shouldThrowExceptionWhenPasswordIsEmpty() {
            // Given
            CreateUserRequest request = new CreateUserRequest("testuser", "test@example.com", "   ");

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Password is required");
            
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when username already exists")
        void shouldThrowExceptionWhenUsernameExists() {
            // Given
            CreateUserRequest request = new CreateUserRequest("john_doe", "newemail@example.com", "password");
            when(userRepository.existsByUsername("john_doe")).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username already exists: john_doe");
            
            verify(userRepository, times(1)).existsByUsername("john_doe");
            verify(userRepository, never()).existsByEmail(anyString());
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should throw exception when email already exists")
        void shouldThrowExceptionWhenEmailExists() {
            // Given
            CreateUserRequest request = new CreateUserRequest("newuser", "john@example.com", "password");
            when(userRepository.existsByUsername("newuser")).thenReturn(false);
            when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email already exists: john@example.com");
            
            verify(userRepository, times(1)).existsByUsername("newuser");
            verify(userRepository, times(1)).existsByEmail("john@example.com");
            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should check username before email")
        void shouldCheckUsernameBeforeEmail() {
            // Given
            CreateUserRequest request = new CreateUserRequest("john_doe", "john@example.com", "password");
            when(userRepository.existsByUsername("john_doe")).thenReturn(true);

            // When/Then
            assertThatThrownBy(() -> userService.createUser(request))
                .isInstanceOf(RuntimeException.class);
            
            // Verify username check happened first
            verify(userRepository, times(1)).existsByUsername("john_doe");
            verify(userRepository, never()).existsByEmail(anyString());
        }
    }

    // ========================================
    // Helper Methods
    // ========================================

    /**
     * Helper method to create a test user.
     */
    private User createUser(Long id, String username, String email, String password) {
        User user = new User(username, email, password);
        user.setId(id);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }
}
