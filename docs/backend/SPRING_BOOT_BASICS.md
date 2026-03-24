# Spring Boot for Newcomers

A beginner-friendly guide to understanding Spring Boot concepts used in this project.

## Table of Contents
- [What is Spring Boot?](#what-is-spring-boot)
- [Understanding Annotations (@)](#understanding-annotations-)
- [Dependency Injection & Inversion of Control](#dependency-injection--inversion-of-control)
- [Spring Data JPA & Auto SQL Generation](#spring-data-jpa--auto-sql-generation)
- [Application Layers Explained](#application-layers-explained)
- [Common Patterns](#common-patterns)

---

## What is Spring Boot?

**Spring Boot** is a framework that makes it easy to create production-ready Java applications. It handles a lot of configuration automatically, so you can focus on writing business logic instead of setting up infrastructure.

**Key Features:**
- **Auto-configuration** - Automatically configures your application based on dependencies
- **Embedded server** - Runs Tomcat web server without external setup
- **Dependency management** - Spring Boot manages compatible versions of libraries
- **Production-ready** - Built-in health checks, metrics, and monitoring

**In this project**, Spring Boot:
- Starts a web server on port 8080
- Connects to PostgreSQL database automatically
- Creates REST API endpoints
- Manages database connections
- Handles JSON serialization/deserialization

---

## Understanding Annotations (@)

Annotations are special markers (starting with `@`) that tell Spring Boot how to handle your classes and methods. Think of them as instructions to the framework.

### Core Application Annotations

#### `@SpringBootApplication`
**Location:** Main application class (`Init.java`)

```java
@SpringBootApplication
public class Init {
    public static void main(String[] args) {
        SpringApplication.run(Init.class, args);
    }
}
```

**What it does:**
- Marks the starting point of your application
- Combines three annotations:
  - `@Configuration` - Indicates this class contains configuration
  - `@EnableAutoConfiguration` - Tells Spring Boot to automatically configure based on dependencies
  - `@ComponentScan` - Scans for other Spring components in this package and sub-packages

**When to use:** Only once, on your main application class.

---

### Controller Layer Annotations

#### `@RestController`
**Location:** Controller classes

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    // ...
}
```

**What it does:**
- Marks a class as a REST API controller
- Automatically converts return values to JSON
- Combines `@Controller` + `@ResponseBody`

**When to use:** On classes that handle HTTP requests and return data (not HTML pages).

---

#### `@RequestMapping`
**Location:** Controller classes

```java
@RequestMapping("/api/users")
public class UserController { }
```

**What it does:**
- Sets the base URL path for all endpoints in this controller
- All methods in this controller will have URLs starting with `/api/users`

**When to use:** On controller classes to group related endpoints.

---

#### `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`
**Location:** Controller methods

```java
@GetMapping("/{id}")
public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
    // ...
}

@PostMapping
public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
    // ...
}
```

**What they do:**
- `@GetMapping` - Handles HTTP GET requests (retrieve data)
- `@PostMapping` - Handles HTTP POST requests (create data)
- `@PutMapping` - Handles HTTP PUT requests (update/replace data)
- `@PatchMapping` - Handles HTTP PATCH requests (partial update)
- `@DeleteMapping` - Handles HTTP DELETE requests (remove data)

**When to use:**
- `@GetMapping` - When reading data
- `@PostMapping` - When creating new resources
- `@PutMapping` / `@PatchMapping` - When updating existing resources
- `@DeleteMapping` - When deleting resources

---

#### `@PathVariable`
**Location:** Controller method parameters

```java
@GetMapping("/{id}")
public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
    // 'id' comes from the URL path
}
```

**What it does:**
- Extracts values from the URL path
- Maps `{id}` in URL to method parameter

**Example:** For URL `/api/users/5`, the value `5` is passed as the `id` parameter.

---

#### `@RequestParam`
**Location:** Controller method parameters

```java
@GetMapping
public ResponseEntity<List<CourseDTO>> getCourses(
    @RequestParam(required = false) Long userId) {
    // 'userId' comes from query string
}
```

**What it does:**
- Extracts values from query string parameters
- `required = false` means the parameter is optional

**Example:** For URL `/api/courses?userId=1`, the value `1` is passed as the `userId` parameter.

---

#### `@RequestBody`
**Location:** Controller method parameters

```java
@PostMapping
public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
    // 'request' is populated from JSON in HTTP request body
}
```

**What it does:**
- Automatically converts JSON from the request body into a Java object
- Uses Jackson library for JSON deserialization

**Example:** Converts this JSON:
```json
{
  "username": "johndoe",
  "email": "john@example.com"
}
```
Into a `CreateUserRequest` object with those values.

---

### Service Layer Annotations

#### `@Service`
**Location:** Service classes

```java
@Service
public class UserService {
    // Business logic here
}
```

**What it does:**
- Marks a class as a service component
- Spring Boot automatically creates an instance (bean)
- Makes it available for dependency injection

**When to use:** On classes that contain business logic.

---

#### `@Transactional`
**Location:** Service methods that modify data

```java
@Transactional
public UserDTO createUser(CreateUserRequest request) {
    // Database operations here
}
```

**What it does:**
- Wraps the method in a database transaction
- If method succeeds, changes are committed
- If method throws exception, changes are rolled back (undone)
- Ensures data consistency

**When to use:** On methods that modify database data (CREATE, UPDATE, DELETE).

**Why it matters:** Prevents partial updates if something goes wrong.

---

### Repository Layer Annotations

#### `@Repository`
**Location:** Repository interfaces

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Query methods here
}
```

**What it does:**
- Marks an interface as a data access component
- Enables Spring Data JPA to auto-implement the interface
- Provides exception translation (converts database errors to Spring exceptions)

**When to use:** On interfaces that extend `JpaRepository`.

---

### Model Layer Annotations

#### `@Entity`
**Location:** Model classes

```java
@Entity
@Table(name = "users")
public class User {
    // Fields here
}
```

**What it does:**
- Marks a class as a JPA entity (database table mapping)
- Tells JPA this class should be persisted to the database

**When to use:** On classes that represent database tables.

---

#### `@Table`
**Location:** Model classes (optional)

```java
@Table(name = "users")
public class User { }
```

**What it does:**
- Specifies the exact database table name
- If omitted, JPA uses the class name

**When to use:** When database table name differs from class name.

---

#### `@Id`
**Location:** Model class primary key field

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

**What it does:**
- Marks a field as the primary key
- `@GeneratedValue` tells the database to auto-generate values

**When to use:** On the primary key field of every entity.

---

#### `@Column`
**Location:** Model class fields

```java
@Column(nullable = false, unique = true, length = 255)
private String username;

@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;
```

**What it does:**
- Maps a field to a specific database column
- Configures column properties:
  - `nullable = false` - Field is required (NOT NULL)
  - `unique = true` - Values must be unique
  - `length = 255` - Maximum string length
  - `name = "..."` - Column name (if different from field name)
  - `updatable = false` - Cannot be changed after creation

**When to use:** When you need specific column constraints or names.

---

#### `@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`
**Location:** Model class relationship fields

```java
@ManyToOne
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

**What they do:**
- Define relationships between entities
- `@ManyToOne` - Many courses belong to one user
- `@OneToMany` - One user has many courses
- `@OneToOne` - One-to-one relationship (e.g., User and Profile)
- `@ManyToMany` - Many-to-many (e.g., Students and Courses with enrollment table)

**When to use:** When entities reference each other (foreign keys).

---

### Configuration Annotations

#### `@Configuration`
**Location:** Configuration classes

```java
@Configuration
@Profile("dev")
public class FlywayConfig {
    @Bean
    public Flyway flyway(DataSource dataSource) {
        // Configuration here
    }
}
```

**What it does:**
- Marks a class as a source of bean definitions
- Methods with `@Bean` create objects managed by Spring

---

#### `@Profile`
**Location:** Configuration classes or beans

```java
@Configuration
@Profile("dev")
public class FlywayConfig { }
```

**What it does:**
- Activates this configuration only for specific profiles
- In this example, only loads when `dev` profile is active

**When to use:** To have different configurations for different environments (dev, test, production).

---

#### `@Bean`
**Location:** Configuration class methods

```java
@Bean(initMethod = "migrate")
public Flyway flyway(DataSource dataSource) {
    return Flyway.configure()
            .dataSource(dataSource)
            .load();
}
```

**What it does:**
- Creates a Spring-managed object (bean)
- `initMethod = "migrate"` calls the `migrate()` method after creation

**When to use:** When you need to create custom objects that Spring should manage.

---

## Dependency Injection & Inversion of Control

### What is Dependency Injection?

**Problem:** Classes need other classes to work (dependencies).

**Old way (manual):**
```java
public class UserService {
    private UserRepository userRepository = new UserRepository(); // ❌ Tightly coupled
}
```

**Spring Boot way (dependency injection):**
```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    // Constructor injection - Spring provides the UserRepository
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**Benefits:**
- ✅ Easier to test (can provide mock repositories)
- ✅ Loose coupling (can swap implementations)
- ✅ Spring manages object lifecycle
- ✅ Automatically handles dependencies of dependencies

### Constructor Injection (Recommended)

```java
@Service
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    
    // Spring automatically injects both repositories
    public CourseService(CourseRepository courseRepository, 
                         UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }
}
```

**Why this is better:**
- Fields are `final` (immutable, cannot be changed)
- Dependencies are explicit and clear
- Easier to write unit tests
- No need for `@Autowired` annotation

---

## Spring Data JPA & Auto SQL Generation

Spring Data JPA is "magic" that writes database queries for you based on method names!

### How It Works

**You write:** An interface that extends `JpaRepository`

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA auto-implements these methods!
}
```

**Spring provides:** Implementations for common operations without you writing any code!

**Built-in methods (inherited from JpaRepository):**
- `findAll()` - SELECT * FROM users
- `findById(id)` - SELECT * FROM users WHERE id = ?
- `save(user)` - INSERT or UPDATE
- `deleteById(id)` - DELETE FROM users WHERE id = ?
- `count()` - SELECT COUNT(*) FROM users
- `existsById(id)` - SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)

### Query Method Naming Convention

Spring Data JPA can **automatically generate SQL** based on method names!

#### Basic Patterns

| Method Name | Generated SQL |
|-------------|---------------|
| `findByUsername(String username)` | `SELECT * FROM users WHERE username = ?` |
| `findByEmail(String email)` | `SELECT * FROM users WHERE email = ?` |
| `findByUsernameAndEmail(String username, String email)` | `SELECT * FROM users WHERE username = ? AND email = ?` |
| `findByCreditsGreaterThan(Integer credits)` | `SELECT * FROM courses WHERE credits > ?` |
| `findByCreatedAtBefore(LocalDateTime date)` | `SELECT * FROM users WHERE created_at < ?` |

#### Keywords You Can Use

**Combining conditions:**
- `And` - Both conditions must match
- `Or` - Either condition can match

**Comparison:**
- `GreaterThan`, `GreaterThanEqual` - Greater than (>), (>=)
- `LessThan`, `LessThanEqual` - Less than (<), (<=)
- `Between` - Between two values

**String matching:**
- `Like` - SQL LIKE operator (use with %)
- `StartingWith` - Starts with value
- `EndingWith` - Ends with value
- `Containing` - Contains value anywhere

**Null checks:**
- `IsNull` - Field is NULL
- `IsNotNull` - Field is NOT NULL

**Collection checks:**
- `In` - Value is in a collection
- `NotIn` - Value is not in a collection

**Existence:**
- `Exists` - Exists with condition
- `existsByUsername(String username)` - Returns boolean

**Ordering:**
- `OrderBy...Asc` - Sort ascending
- `OrderBy...Desc` - Sort descending

#### Examples from Our Project

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // SELECT * FROM users WHERE username = ?
    Optional<User> findByUsername(String username);
    
    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);
    
    // SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)
    boolean existsByUsername(String username);
    
    // SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)
    boolean existsByEmail(String email);
}
```

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // SELECT * FROM courses WHERE user_id = ?
    List<Course> findByUserId(Long userId);
    
    // SELECT * FROM courses WHERE course_code = ?
    List<Course> findByCourseCode(String courseCode);
    
    // SELECT EXISTS(SELECT 1 FROM courses WHERE user_id = ? AND course_code = ?)
    boolean existsByUserIdAndCourseCode(Long userId, String courseCode);
    
    // SELECT * FROM courses WHERE credits > ?
    List<Course> findByCreditsGreaterThan(Integer credits);
    
    // SELECT * FROM courses WHERE user_id = ? ORDER BY course_name ASC
    List<Course> findByUserIdOrderByCourseNameAsc(Long userId);
}
```

### Complex Queries with @Query

For complex queries that don't fit the naming convention, use `@Query`:

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // Custom JPQL query
    @Query("SELECT c FROM Course c WHERE c.user.id = :userId AND c.credits > :minCredits")
    List<Course> findCoursesForUserWithMinCredits(
        @Param("userId") Long userId, 
        @Param("minCredits") Integer minCredits
    );
    
    // Native SQL query
    @Query(value = "SELECT * FROM courses WHERE user_id = ?1 AND grade IN ('A', 'A-')", 
           nativeQuery = true)
    List<Course> findTopGradesForUser(Long userId);
}
```

---

## Application Layers Explained

Spring Boot applications typically follow a layered architecture:

```
┌─────────────────────────────────────┐
│   Controller Layer (@RestController)│  ← HTTP Requests/Responses
│   - Handles HTTP                    │
│   - No business logic               │
└──────────────┬──────────────────────┘
               │ calls
               ▼
┌─────────────────────────────────────┐
│   Service Layer (@Service)          │  ← Business Logic
│   - Validation                      │
│   - Business rules                  │
│   - Transaction management          │
└──────────────┬──────────────────────┘
               │ uses
               ▼
┌─────────────────────────────────────┐
│   Repository Layer (@Repository)    │  ← Data Access
│   - Database queries                │
│   - Auto-generated by Spring        │
└──────────────┬──────────────────────┘
               │ reads/writes
               ▼
┌─────────────────────────────────────┐
│   Database (PostgreSQL)             │  ← Data Storage
└─────────────────────────────────────┘
```

### Controller Layer
**Role:** Handle HTTP requests and responses

**Responsibilities:**
- Route requests to correct service methods
- Parse request parameters
- Return appropriate HTTP status codes
- NO business logic

**Example:**
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id); // Delegate to service
        return ResponseEntity.ok(user);
    }
}
```

### Service Layer
**Role:** Business logic and orchestration

**Responsibilities:**
- Validate input
- Enforce business rules
- Coordinate multiple repository calls
- Manage transactions
- Convert entities to DTOs

**Example:**
```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        // Validation
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        
        // Business logic
        User user = new User(request.getUsername(), request.getEmail(), request.getPassword());
        User savedUser = userRepository.save(user);
        
        // Convert to DTO
        return convertToDTO(savedUser);
    }
}
```

### Repository Layer
**Role:** Data access

**Responsibilities:**
- Query the database
- Save/update/delete records
- Auto-generated by Spring Data JPA

**Example:**
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
```

### Model/Entity Layer
**Role:** Represent database tables

**Responsibilities:**
- Map to database schema
- Define relationships between tables

**Example:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    // Getters and setters
}
```

### DTO Layer
**Role:** Transfer data between layers

**Responsibilities:**
- Define API contract
- Hide sensitive data (like passwords)
- Separate API structure from database structure

**Example:**
```java
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    // No password field - kept private!
}
```

---

## Common Patterns

### ResponseEntity Pattern

Use `ResponseEntity` to control HTTP responses:

```java
// 200 OK
return ResponseEntity.ok(userDTO);

// 201 Created
return ResponseEntity.status(HttpStatus.CREATED).body(userDTO);

// 404 Not Found
return ResponseEntity.notFound().build();

// 400 Bad Request
return ResponseEntity.badRequest().build();

// Custom status
return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorMessage);
```

### Optional Pattern

Use `Optional` to handle missing data safely:

```java
// Instead of returning null (bad)
User user = userRepository.findById(id).orElse(null); // ❌

// Throw exception if not found (better)
User user = userRepository.findById(id)
    .orElseThrow(() -> new RuntimeException("User not found")); // ✅

// Use default value
User user = userRepository.findById(id)
    .orElse(new User()); // ✅

// Check if present
Optional<User> userOpt = userRepository.findById(id);
if (userOpt.isPresent()) {
    User user = userOpt.get();
    // Use user
}
```

### DTO Conversion Pattern

Convert entities to DTOs in service layer:

```java
@Service
public class UserService {
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user); // Convert before returning
    }
    
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getCreatedAt()
            // Note: password is NOT included!
        );
    }
}
```

---

## Summary for Beginners

**Key Takeaways:**

1. **Annotations (@) are instructions** - They tell Spring Boot how to handle your code
2. **Dependency Injection is automatic** - Spring creates objects and injects them where needed
3. **Spring Data JPA writes queries for you** - Method names become SQL queries
4. **Layers keep code organized** - Controller → Service → Repository → Database
5. **DTOs protect your data** - Don't expose sensitive information or internal structure

**When you see:**
- `@RestController` - This handles HTTP requests
- `@Service` - This contains business logic
- `@Repository` - This talks to the database
- `@Entity` - This represents a database table
- `findByUsername` - Spring generates `WHERE username = ?`

**Remember:**
- Controllers are thin (no logic)
- Services are thick (all the logic)
- Repositories are auto-generated (you just declare methods)
- Always use constructor injection
- Always use DTOs for API responses
- Always use `@Transactional` for write operations

---

## Additional Resources

- [Spring Boot Official Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Query Methods](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#jpa.query-methods)
- [Baeldung Spring Tutorials](https://www.baeldung.com/spring-tutorial)
