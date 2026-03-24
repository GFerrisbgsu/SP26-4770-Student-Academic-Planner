package com.sap.smart_academic_calendar.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sap.smart_academic_calendar.Init;
import com.sap.smart_academic_calendar.dto.CreateUserRequest;
import com.sap.smart_academic_calendar.dto.UserDTO;
import com.sap.smart_academic_calendar.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.junit.jupiter.api.BeforeEach;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for UserController.
 * Tests HTTP endpoints using MockMvc and mocked service layer.
 * Uses @SpringBootTest with manual MockMvc configuration (Spring Boot 4.0+ pattern).
 */
@SpringBootTest(classes = Init.class)
@ActiveProfiles("local")
@DisplayName("UserController Tests")
class UserControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private UserService userService;

    /**
     * Set up MockMvc before each test.
     * Spring Boot 4.0+ removed @AutoConfigureMockMvc, so we manually configure MockMvc.
     */
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    // ========================================
    // GET /api/users Tests
    // ========================================

    @Nested
    @DisplayName("GET /api/users Tests")
    class GetAllUsersTests {

        @Test
        @DisplayName("Should return 200 OK with list of users")
        void shouldReturnAllUsers() throws Exception {
            // Given
            UserDTO user1 = createUserDTO(1L, "john_doe", "john@example.com");
            UserDTO user2 = createUserDTO(2L, "jane_smith", "jane@example.com");
            List<UserDTO> users = Arrays.asList(user1, user2);
            
            when(userService.getAllUsers()).thenReturn(users);

            // When/Then
            mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].username", is("john_doe")))
                .andExpect(jsonPath("$[0].email", is("john@example.com")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].username", is("jane_smith")))
                .andExpect(jsonPath("$[1].email", is("jane@example.com")));

            verify(userService, times(1)).getAllUsers();
        }

        @Test
        @DisplayName("Should return 200 OK with empty list when no users exist")
        void shouldReturnEmptyListWhenNoUsers() throws Exception {
            // Given
            when(userService.getAllUsers()).thenReturn(Collections.emptyList());

            // When/Then
            mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

            verify(userService, times(1)).getAllUsers();
        }

        @Test
        @DisplayName("Should not include password in response")
        void shouldNotIncludePasswordInResponse() throws Exception {
            // Given
            UserDTO user = createUserDTO(1L, "john_doe", "john@example.com");
            when(userService.getAllUsers()).thenReturn(List.of(user));

            // When/Then
            mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist());
        }
    }

    // ========================================
    // GET /api/users/{id} Tests
    // ========================================

    @Nested
    @DisplayName("GET /api/users/{id} Tests")
    class GetUserByIdTests {

        @Test
        @DisplayName("Should return 200 OK with user when user exists")
        void shouldReturnUserById() throws Exception {
            // Given
            UserDTO user = createUserDTO(1L, "john_doe", "john@example.com");
            when(userService.getUserById(1L)).thenReturn(user);

            // When/Then
            mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.username", is("john_doe")))
                .andExpect(jsonPath("$.email", is("john@example.com")))
                .andExpect(jsonPath("$.createdAt").exists());

            verify(userService, times(1)).getUserById(1L);
        }

        @Test
        @DisplayName("Should return 404 Not Found when user does not exist")
        void shouldReturn404WhenUserNotFound() throws Exception {
            // Given
            when(userService.getUserById(999L))
                .thenThrow(new RuntimeException("User not found with id: 999"));

            // When/Then
            mockMvc.perform(get("/api/users/999"))
                .andExpect(status().isNotFound());

            verify(userService, times(1)).getUserById(999L);
        }

        @Test
        @DisplayName("Should not include password in response")
        void shouldNotIncludePassword() throws Exception {
            // Given
            UserDTO user = createUserDTO(1L, "john_doe", "john@example.com");
            when(userService.getUserById(1L)).thenReturn(user);

            // When/Then
            mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist());
        }

        @Test
        @DisplayName("Should handle service exceptions gracefully")
        void shouldHandleServiceExceptions() throws Exception {
            // Given
            when(userService.getUserById(anyLong()))
                .thenThrow(new RuntimeException("Database error"));

            // When/Then
            mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isNotFound());
        }
    }

    // ========================================
    // POST /api/users Tests
    // ========================================

    @Nested
    @DisplayName("POST /api/users Tests")
    class CreateUserTests {

        @Test
        @DisplayName("Should return 201 Created with user when valid request")
        void shouldCreateUserWithValidRequest() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("new_user", "new@example.com", "password123");
            UserDTO createdUser = createUserDTO(1L, "new_user", "new@example.com");
            
            when(userService.createUser(any(CreateUserRequest.class))).thenReturn(createdUser);

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.username", is("new_user")))
                .andExpect(jsonPath("$.email", is("new@example.com")))
                .andExpect(jsonPath("$.password").doesNotExist());

            verify(userService, times(1)).createUser(any(CreateUserRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when username already exists")
        void shouldReturn400WhenUsernameExists() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("existing_user", "new@example.com", "password");
            when(userService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new RuntimeException("Username already exists: existing_user"));

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            verify(userService, times(1)).createUser(any(CreateUserRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when email already exists")
        void shouldReturn400WhenEmailExists() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("new_user", "existing@example.com", "password");
            when(userService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new RuntimeException("Email already exists: existing@example.com"));

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            verify(userService, times(1)).createUser(any(CreateUserRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when validation fails")
        void shouldReturn400WhenValidationFails() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("", "invalid@example.com", "password");
            when(userService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new RuntimeException("Username is required"));

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            verify(userService, times(1)).createUser(any(CreateUserRequest.class));
        }

        @Test
        @DisplayName("Should accept request with all required fields")
        void shouldAcceptRequestWithAllFields() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("testuser", "test@example.com", "testpass123");
            UserDTO createdUser = createUserDTO(10L, "testuser", "test@example.com");
            
            when(userService.createUser(any(CreateUserRequest.class))).thenReturn(createdUser);

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.username", is("testuser")))
                .andExpect(jsonPath("$.email", is("test@example.com")));
        }

        @Test
        @DisplayName("Should handle service exceptions gracefully")
        void shouldHandleServiceExceptions() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("user", "user@example.com", "pass");
            when(userService.createUser(any(CreateUserRequest.class)))
                .thenThrow(new RuntimeException("Unexpected error"));

            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should send request body to service")
        void shouldSendRequestBodyToService() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("testuser", "test@test.com", "testpass");
            UserDTO user = createUserDTO(1L, "testuser", "test@test.com");
            when(userService.createUser(any(CreateUserRequest.class))).thenReturn(user);

            // When
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

            // Then - verify the service was called with a request matching our data
            verify(userService).createUser(argThat(req -> 
                req.getUsername().equals("testuser") &&
                req.getEmail().equals("test@test.com") &&
                req.getPassword().equals("testpass")
            ));
        }
    }

    // ========================================
    // Edge Case Tests
    // ========================================

    @Nested
    @DisplayName("Edge Case Tests")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle malformed JSON in POST request")
        void shouldHandleMalformedJson() throws Exception {
            // When/Then
            mockMvc.perform(post("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{invalid json"))
                .andExpect(status().isBadRequest());

            verify(userService, never()).createUser(any());
        }

        @Test
        @DisplayName("Should handle missing Content-Type header")
        void shouldHandleMissingContentType() throws Exception {
            // Given
            CreateUserRequest request = new CreateUserRequest("user", "user@test.com", "pass");

            // When/Then
            mockMvc.perform(post("/api/users")
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnsupportedMediaType());

            verify(userService, never()).createUser(any());
        }

        @Test
        @DisplayName("Should handle invalid HTTP method on endpoint")
        void shouldHandleInvalidMethod() throws Exception {
            // When/Then - PUT is not supported on /api/users
            mockMvc.perform(put("/api/users")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @DisplayName("Should handle special characters in path variable")
        void shouldHandleSpecialCharactersInPath() throws Exception {
            // When/Then - Invalid ID format
            mockMvc.perform(get("/api/users/abc"))
                .andExpect(status().isBadRequest());

            verify(userService, never()).getUserById(anyLong());
        }
    }

    // ========================================
    // Helper Methods
    // ========================================

    /**
     * Helper method to create a UserDTO for testing.
     */
    private UserDTO createUserDTO(Long id, String username, String email) {
        return new UserDTO(id, username, email, LocalDateTime.now());
    }
}
