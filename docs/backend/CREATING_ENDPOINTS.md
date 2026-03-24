# Creating New REST Endpoints

This guide explains how to create new REST endpoints following the project's architecture patterns.

## Architecture Overview

The application follows a layered architecture:

1. **Controller Layer** - Handles HTTP requests/responses, no business logic
2. **Service Layer** - Contains business logic, validation, and orchestration
3. **Repository Layer** - Data access using Spring Data JPA
4. **Model Layer** - JPA entities representing database tables
5. **DTO Layer** - Data Transfer Objects for API requests/responses

## Step-by-Step Guide

### Example: Creating a "Course" Endpoint

We'll create endpoints to manage courses with GET and POST operations.

---

## Step 1: Create the Database Table (Migration)

Create a new Flyway migration file:

**File:** `src/main/resources/db/migration/V2__create_courses_table.sql`

```sql
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    credits INTEGER NOT NULL,
    grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Rebuild and restart the application to apply the migration.**

---

## Step 2: Create the JPA Entity (Model)

**File:** `src/main/java/com/sap/smart_academic_calendar/model/Course.java`

```java
package com.sap.smart_academic_calendar.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Entity representing a course in the system.
 * Maps to the 'courses' table in the database.
 */
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "course_name", nullable = false, length = 255)
    private String courseName;

    @Column(name = "course_code", nullable = false, length = 50)
    private String courseCode;

    @Column(nullable = false)
    private Integer credits;

    @Column(length = 5)
    private String grade;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Default constructor required by JPA
    public Course() {
        this.createdAt = LocalDateTime.now();
    }

    public Course(User user, String courseName, String courseCode, Integer credits) {
        this.user = user;
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.credits = credits;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
```

**Key Points:**
- Use `@Entity` to mark as JPA entity
- Use `@Table(name = "...")` to specify database table name
- Use `@Id` and `@GeneratedValue` for primary key
- Use `@ManyToOne` for foreign key relationships
- Use `@Column` to specify column properties

---

## Step 3: Create the Repository

**File:** `src/main/java/com/sap/smart_academic_calendar/repository/CourseRepository.java`

```java
package com.sap.smart_academic_calendar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sap.smart_academic_calendar.model.Course;

/**
 * Repository interface for Course entity.
 * Provides CRUD operations and custom query methods.
 */
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    /**
     * Find all courses for a specific user.
     * @param userId the user ID
     * @return List of courses
     */
    List<Course> findByUserId(Long userId);

    /**
     * Find a course by course code.
     * @param courseCode the course code
     * @return List of courses with that code
     */
    List<Course> findByCourseCode(String courseCode);

    /**
     * Check if a course exists with the given code for a user.
     * @param userId the user ID
     * @param courseCode the course code
     * @return true if exists
     */
    boolean existsByUserIdAndCourseCode(Long userId, String courseCode);
}
```

**Key Points:**
- Extend `JpaRepository<EntityType, IdType>`
- Spring Data JPA auto-generates implementations
- Method names follow conventions for automatic query generation
- Use `@Repository` annotation

---

## Step 4: Create DTOs

### Response DTO

**File:** `src/main/java/com/sap/smart_academic_calendar/dto/CourseDTO.java`

```java
package com.sap.smart_academic_calendar.dto;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Course.
 * Used to transfer course data in API responses.
 */
public class CourseDTO {

    private Long id;
    private Long userId;
    private String courseName;
    private String courseCode;
    private Integer credits;
    private String grade;
    private LocalDateTime createdAt;

    public CourseDTO() {
    }

    public CourseDTO(Long id, Long userId, String courseName, String courseCode, 
                     Integer credits, String grade, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.credits = credits;
        this.grade = grade;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
```

### Request DTO

**File:** `src/main/java/com/sap/smart_academic_calendar/dto/CreateCourseRequest.java`

```java
package com.sap.smart_academic_calendar.dto;

/**
 * Request DTO for creating a new course.
 * Contains required fields for course creation.
 */
public class CreateCourseRequest {

    private Long userId;
    private String courseName;
    private String courseCode;
    private Integer credits;
    private String grade;

    public CreateCourseRequest() {
    }

    public CreateCourseRequest(Long userId, String courseName, String courseCode, 
                               Integer credits, String grade) {
        this.userId = userId;
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.credits = credits;
        this.grade = grade;
    }

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }
}
```

**Key Points:**
- DTOs separate API contracts from internal models
- Use DTOs to hide sensitive data (like passwords)
- Create separate DTOs for requests and responses

---

## Step 5: Create the Service

**File:** `src/main/java/com/sap/smart_academic_calendar/service/CourseService.java`

```java
package com.sap.smart_academic_calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CourseDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseRequest;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.CourseRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Service layer for Course operations.
 * Handles business logic for course management.
 */
@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // Constructor injection for dependencies
    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    /**
     * Retrieve all courses from the database.
     * @return List of CourseDTO objects
     */
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve courses for a specific user.
     * @param userId the user ID
     * @return List of CourseDTO objects
     */
    public List<CourseDTO> getCoursesByUserId(Long userId) {
        return courseRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve a course by ID.
     * @param id the course ID
     * @return CourseDTO if found
     * @throws RuntimeException if course not found
     */
    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return convertToDTO(course);
    }

    /**
     * Create a new course in the database.
     * Validates required fields and checks for duplicate course codes.
     * @param request the course creation request
     * @return CourseDTO of the created course
     * @throws RuntimeException if validation fails
     */
    @Transactional
    public CourseDTO createCourse(CreateCourseRequest request) {
        // Validate input
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }
        if (request.getCourseName() == null || request.getCourseName().trim().isEmpty()) {
            throw new RuntimeException("Course name is required");
        }
        if (request.getCourseCode() == null || request.getCourseCode().trim().isEmpty()) {
            throw new RuntimeException("Course code is required");
        }
        if (request.getCredits() == null || request.getCredits() <= 0) {
            throw new RuntimeException("Credits must be a positive number");
        }

        // Verify user exists
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getUserId()));

        // Check for duplicate course code for this user
        if (courseRepository.existsByUserIdAndCourseCode(request.getUserId(), request.getCourseCode())) {
            throw new RuntimeException("Course with code " + request.getCourseCode() + 
                                     " already exists for this user");
        }

        // Create and save new course
        Course course = new Course(
                user,
                request.getCourseName(),
                request.getCourseCode(),
                request.getCredits()
        );
        course.setGrade(request.getGrade());

        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }

    /**
     * Convert Course entity to CourseDTO.
     * @param course the Course entity
     * @return CourseDTO
     */
    private CourseDTO convertToDTO(Course course) {
        return new CourseDTO(
                course.getId(),
                course.getUser().getId(),
                course.getCourseName(),
                course.getCourseCode(),
                course.getCredits(),
                course.getGrade(),
                course.getCreatedAt()
        );
    }
}
```

**Key Points:**
- Use `@Service` annotation
- Use constructor injection for dependencies
- Use `@Transactional` for write operations
- Perform validation in service layer
- Convert entities to DTOs before returning

---

## Step 6: Create the Controller

**File:** `src/main/java/com/sap/smart_academic_calendar/controller/CourseController.java`

```java
package com.sap.smart_academic_calendar.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sap.smart_academic_calendar.dto.CourseDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseRequest;
import com.sap.smart_academic_calendar.service.CourseService;

/**
 * REST Controller for Course operations.
 * Handles HTTP requests related to course management.
 * Contains no business logic - delegates to CourseService.
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    // Constructor injection for dependencies
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    /**
     * GET endpoint to retrieve all courses or courses by user ID.
     * @param userId optional user ID filter
     * @return ResponseEntity with list of courses
     */
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getCourses(
            @RequestParam(required = false) Long userId) {
        List<CourseDTO> courses;
        if (userId != null) {
            courses = courseService.getCoursesByUserId(userId);
        } else {
            courses = courseService.getAllCourses();
        }
        return ResponseEntity.ok(courses);
    }

    /**
     * GET endpoint to retrieve a course by ID.
     * @param id the course ID
     * @return ResponseEntity with course data
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        try {
            CourseDTO course = courseService.getCourseById(id);
            return ResponseEntity.ok(course);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST endpoint to create a new course.
     * @param request the course creation request
     * @return ResponseEntity with created course data
     */
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseRequest request) {
        try {
            CourseDTO createdCourse = courseService.createCourse(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCourse);
        } catch (RuntimeException e) {
            // In production, use proper exception handling with @ControllerAdvice
            return ResponseEntity.badRequest().build();
        }
    }
}
```

**Key Points:**
- Use `@RestController` and `@RequestMapping` annotations
- Controllers contain NO business logic
- Delegate all work to service layer
- Use `@GetMapping`, `@PostMapping`, etc. for HTTP methods
- Use `@PathVariable` for URL parameters
- Use `@RequestParam` for query parameters
- Use `@RequestBody` for request body
- Return `ResponseEntity` for proper HTTP status codes

---

## Step 7: Build and Test

### Rebuild the Project
```powershell
./mvnw clean compile
```

### Restart the Application
Restart your debugger or Maven process.

### Test the Endpoints

**Get All Courses:**
```bash
curl http://localhost:8080/api/courses
```

**Get Courses by User ID:**
```bash
curl http://localhost:8080/api/courses?userId=1
```

**Get Course by ID:**
```bash
curl http://localhost:8080/api/courses/1
```

**Create a New Course:**
```bash
curl -X POST http://localhost:8080/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "courseName": "Introduction to Computer Science",
    "courseCode": "CS101",
    "credits": 3,
    "grade": "A"
  }'
```

---

## Quick Reference Checklist

When creating a new endpoint:

- [ ] Create Flyway migration file (if new table needed)
- [ ] Create JPA Entity in `model/`
- [ ] Create Repository interface in `repository/`
- [ ] Create Response DTO in `dto/`
- [ ] Create Request DTO in `dto/` (if needed)
- [ ] Create Service class in `service/`
- [ ] Create Controller class in `controller/`
- [ ] Rebuild: `./mvnw clean compile`
- [ ] Restart application
- [ ] Test endpoints with curl or Postman

---

## Testing Endpoints with Postman

Postman is a powerful tool for testing REST APIs. Here's how to set it up for this project.

### Step 1: Install Postman

Download and install Postman from: https://www.postman.com/downloads/

Alternatively, use the web version at: https://web.postman.com/

### Step 2: Create a Collection

1. Open Postman
2. Click **"New"** → **"Collection"**
3. Name it: `Smart Academic Planner`
4. Add a description: `API endpoints for Smart Academic Calendar backend`
5. Click **"Create"**

### Step 3: Set Up Environment Variables (Optional but Recommended)

1. Click the gear icon (⚙️) in the top right → **"Manage Environments"**
2. Click **"Add"**
3. Environment name: `Local Development`
4. Add variables:
   - Variable: `base_url`, Initial Value: `http://localhost:8080`, Current Value: `http://localhost:8080`
   - Variable: `user_id`, Initial Value: `1`, Current Value: `1`
5. Click **"Add"**
6. Select **"Local Development"** from the environment dropdown in the top right

Now you can use `{{base_url}}` and `{{user_id}}` in your requests!

### Step 4: Create Requests for User Endpoints

#### GET All Users

1. In your collection, click **"Add request"**
2. Request name: `Get All Users`
3. Method: **GET**
4. URL: `{{base_url}}/api/users`
5. Click **"Send"**

**Expected Response:**
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "createdAt": "2026-02-01T16:19:45.023"
  }
]
```

#### GET User by ID

1. Add new request: `Get User by ID`
2. Method: **GET**
3. URL: `{{base_url}}/api/users/{{user_id}}`
4. Click **"Send"**

#### POST Create User

1. Add new request: `Create User`
2. Method: **POST**
3. URL: `{{base_url}}/api/users`
4. Go to **"Body"** tab
5. Select **"raw"** and choose **"JSON"** from dropdown
6. Enter request body:
```json
{
  "username": "janedoe",
  "email": "janedoe@example.com",
  "password": "securePassword456"
}
```
7. Click **"Send"**

**Expected Response (201 Created):**
```json
{
  "id": 2,
  "username": "janedoe",
  "email": "janedoe@example.com",
  "createdAt": "2026-02-01T16:25:30.123"
}
```

### Step 5: Create Requests for Course Endpoints

#### GET All Courses

1. Add new request: `Get All Courses`
2. Method: **GET**
3. URL: `{{base_url}}/api/courses`
4. Click **"Send"**

#### GET Courses by User ID

1. Add new request: `Get Courses by User`
2. Method: **GET**
3. URL: `{{base_url}}/api/courses?userId={{user_id}}`
4. Click **"Send"**

#### GET Course by ID

1. Add new request: `Get Course by ID`
2. Method: **GET**
3. URL: `{{base_url}}/api/courses/1`
4. Click **"Send"**

#### POST Create Course

1. Add new request: `Create Course`
2. Method: **POST**
3. URL: `{{base_url}}/api/courses`
4. Go to **"Body"** tab
5. Select **"raw"** and choose **"JSON"**
6. Enter request body:
```json
{
  "userId": 1,
  "courseName": "Introduction to Computer Science",
  "courseCode": "CS101",
  "credits": 3,
  "grade": "A"
}
```
7. Click **"Send"**

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "userId": 1,
  "courseName": "Introduction to Computer Science",
  "courseCode": "CS101",
  "credits": 3,
  "grade": "A",
  "createdAt": "2026-02-01T16:30:15.456"
}
```

### Step 6: Organize Your Requests

Create folders in your collection to organize endpoints:

1. Right-click collection → **"Add Folder"**
2. Create folders:
   - `Users`
   - `Courses`
3. Drag and drop requests into appropriate folders

### Step 7: Save and Share

1. Click **"Save"** on each request
2. To share the collection:
   - Right-click collection → **"Export"**
   - Choose **"Collection v2.1"**
   - Save the JSON file
   - Commit to your repository (e.g., `postman/Smart_Academic_Planner.postman_collection.json`)

### Postman Testing Tips

#### Test Scripts
Add tests to automatically validate responses:

1. Go to **"Tests"** tab in a request
2. Add test scripts:

```javascript
// Test for successful response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test for response body structure
pm.test("Response has id field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
});

// Save response data to environment variable
var jsonData = pm.response.json();
pm.environment.set("user_id", jsonData.id);
```

#### Pre-request Scripts
Automatically generate data before sending:

```javascript
// Generate random username
pm.environment.set("random_username", "user_" + Math.random().toString(36).substring(7));
```

Then use in body: `{{random_username}}`

#### Common HTTP Status Codes

- **200 OK** - GET request successful
- **201 Created** - POST request successful
- **400 Bad Request** - Validation error
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server error

### Troubleshooting Postman Issues

**Issue: Connection Refused**
- Solution: Ensure the Spring Boot application is running on port 8080

**Issue: 404 Not Found**
- Solution: Double-check the URL path (e.g., `/api/users` not `/users`)

**Issue: 400 Bad Request**
- Solution: Verify JSON syntax in body, check Content-Type header is `application/json`

**Issue: Environment variables not working**
- Solution: Ensure environment is selected in top-right dropdown

---

## Best Practices

1. **Always use constructor injection** for dependencies
2. **Keep controllers thin** - no business logic
3. **Put validation in services** - validate all inputs
4. **Use DTOs** - don't expose entities directly
5. **Use @Transactional** for write operations
6. **Handle exceptions properly** - consider using @ControllerAdvice
7. **Add comments** explaining business logic
8. **Follow naming conventions** - clear, descriptive names
9. **Test your endpoints** - use curl, Postman, or automated tests
10. **Document your APIs** - consider adding Swagger/OpenAPI

---

## CORS Configuration for Frontend Integration

If your frontend (React, Angular, Vue, etc.) runs on a different port than your backend, you need to enable CORS (Cross-Origin Resource Sharing).

### Why CORS is Needed

By default, browsers block requests from one origin (e.g., `http://localhost:5173` - Vite dev server) to another origin (e.g., `http://localhost:8080` - Spring Boot). This is a security feature.

### CORS Already Configured

This project includes CORS configuration in `config/CorsConfig.java` that allows:
- ✅ Requests from `http://localhost:5173` (Vite/React dev server)
- ✅ All HTTP methods (GET, POST, PUT, DELETE, etc.)
- ✅ All headers
- ✅ Credentials (cookies, authorization headers)

**File:** `src/main/java/com/sap/smart_academic_calendar/config/CorsConfig.java`

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:5173"); // Frontend dev server
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Adding Additional Origins

To allow requests from other domains (e.g., production frontend), add more origins:

```java
config.addAllowedOrigin("http://localhost:5173");
config.addAllowedOrigin("https://yourdomain.com");
config.addAllowedOrigin("https://app.yourdomain.com");
```

### Environment-Specific CORS

For better security, use environment variables:

```java
@Value("${app.cors.allowed-origins}")
private String[] allowedOrigins;

@Bean
public CorsFilter corsFilter() {
    // ... configuration
    for (String origin : allowedOrigins) {
        config.addAllowedOrigin(origin);
    }
    // ...
}
```

**In `application.properties`:**
```properties
app.cors.allowed-origins=http://localhost:5173,https://yourdomain.com
```

### Testing CORS

After restarting your backend, test that CORS is working:

1. Open your frontend app in browser (http://localhost:5173)
2. Open browser DevTools (F12) → Console tab
3. Run a test fetch:
```javascript
fetch('http://localhost:8080/api/users')
  .then(r => r.json())
  .then(data => console.log('Success:', data))
  .catch(err => console.error('CORS Error:', err));
```

If CORS is working correctly, you'll see the data in console. If not, you'll see a CORS error message.
