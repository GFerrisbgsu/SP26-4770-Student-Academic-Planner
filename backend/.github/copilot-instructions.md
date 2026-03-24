# Copilot Instructions - Smart Academic Calendar Backend

## Project Overview
A Spring Boot REST API backend for the Student Academic Planner application. Built with **Spring Boot 4.0.2**, **Java 25**, **PostgreSQL** (via Docker), **Flyway** for database migrations, and **Spring Data JPA** for data access.

## Architecture

### Application Structure
The backend follows a standard layered architecture with package-by-feature organization:

```
com.sap.smart_academic_calendar/
├── Init.java                          # @SpringBootApplication entry point
├── controller/                        # REST endpoints (@RestController)
│   └── UserController.java           # Example: User CRUD endpoints
├── service/                           # Business logic (@Service)
│   └── UserService.java              # Example: User business logic
├── repository/                        # Data access (@Repository)
│   └── UserRepository.java           # Example: Spring Data JPA repository
├── model/                             # JPA entities (@Entity)
│   └── User.java                     # Example: User entity
├── dto/                               # Data Transfer Objects
│   ├── UserDTO.java                  # Example: Response DTO
│   └── CreateUserRequest.java        # Example: Request DTO
└── config/                            # Configuration classes
    ├── CorsConfig.java               # CORS configuration
    └── FlywayConfig.java             # Flyway migration config
```

### Layer Responsibilities

**Controller Layer** (`controller/`)
- Handle HTTP requests and responses
- Map endpoints using `@GetMapping`, `@PostMapping`, etc.
- Delegate all business logic to services
- Contains **NO business logic** - pure orchestration
- Return `ResponseEntity<T>` with appropriate HTTP status codes

**Service Layer** (`service/`)
- Contains all business logic
- Annotated with `@Service`
- Stateless and testable
- Use `@Transactional` for write operations
- Inject repositories via constructor
- Convert between entities and DTOs

**Repository Layer** (`repository/`)
- Data access using Spring Data JPA
- Extends `JpaRepository<Entity, ID>`
- Annotated with `@Repository`
- Custom query methods using method naming conventions
- Spring auto-implements CRUD and custom queries

**Model Layer** (`model/`)
- JPA entities representing database tables
- Annotated with `@Entity` and `@Table`
- Use `@Id`, `@Column`, `@GeneratedValue` for field mapping
- Include proper constructors (default + parametrized)
- Map to Flyway-managed tables

**DTO Layer** (`dto/`)
- Data Transfer Objects for API communication
- Request DTOs for incoming data validation
- Response DTOs to hide sensitive entity fields (e.g., passwords)
- Keep DTOs simple - no business logic

## Key Technologies

### Spring Boot 4.0.2
- **Auto-configuration** - Automatically configures based on dependencies in `pom.xml`
- **Embedded Tomcat** - Runs on port 8080 by default
- **Dependency injection** - Uses constructor injection (preferred)
- **Component scanning** - Automatically finds `@Component`, `@Service`, `@Repository`, `@Controller`

### Spring Data JPA
- **Repository pattern** - Extend `JpaRepository<Entity, ID>` for CRUD operations
- **Custom queries** - Use method naming conventions:
  - `findByUsername(String username)` → `SELECT * FROM users WHERE username = ?`
  - `existsByEmail(String email)` → `SELECT COUNT(*) > 0 FROM users WHERE email = ?`
- **No SQL required** - Spring generates SQL from method names
- **Transaction management** - Use `@Transactional` on write operations

### Flyway Database Migrations
Flyway manages database schema versions through versioned SQL migration scripts.

**Migration Files** (`src/main/resources/db/migration/`):
- Naming: `V{version}__{description}.sql` (e.g., `V1__init.sql`, `V2__add_courses.sql`)
- Versioning: Use sequential integers (V1, V2, V3, etc.)
- Immutable: **NEVER modify existing migrations** - create new ones
- Execution: Applied in version order on application startup

**Example Migration** (`V1__init.sql`):
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Creating New Migrations**:
1. Create file: `V{next_number}__{description}.sql`
2. Write SQL for schema changes (CREATE, ALTER, INSERT, etc.)
3. Restart application - Flyway auto-applies new migrations
4. Check Flyway status: Flyway tracks applied migrations in `flyway_schema_history` table

**Best Practices**:
- One logical change per migration
- Test migrations before committing
- Use descriptive names (e.g., `V3__add_courses_table.sql`, `V4__add_user_roles.sql`)
- Include rollback notes in comments if needed
- Never delete or modify applied migrations

### PostgreSQL with Docker
Docker runs PostgreSQL in an isolated container for consistent development environments.

**Docker Compose** (`docker-compose.yml`):
```yaml
services:
  postgres:
    image: postgres:16                           # PostgreSQL 16
    container_name: smart-academic-calendar-db
    environment:
      POSTGRES_DB: appdb                         # Database name
      POSTGRES_USER: appuser                     # Username
      POSTGRES_PASSWORD: apppass                 # Password
    ports:
      - "5432:5432"                             # Host:Container port mapping
    volumes:
      - smart_calendar_data:/var/lib/postgresql/data  # Persist data
  
  pgadmin:
    image: dpage/pgadmin4:latest                # Web UI for PostgreSQL
    container_name: smart-academic-calendar-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"                               # Access at http://localhost:5050
    depends_on:
      - postgres
```

**Docker Commands**:
```powershell
# Start containers
docker-compose up -d

# Stop containers (preserves data)
docker-compose down

# Stop and delete data
docker-compose down -v

# View running containers
docker ps

# View logs
docker-compose logs postgres
docker-compose logs pgadmin
```

**Connecting to Database**:
- **From Spring Boot**: Configured in `application-dev.properties`
- **pgAdmin Web UI**: http://localhost:5050 (admin@example.com / admin)
- **Direct connection**: `postgresql://localhost:5432/appdb` (appuser / apppass)

## Configuration & Profiles

### Application Properties
Located in `src/main/resources/`:
- `application.properties` - Base configuration with placeholders
- `application-local.properties` - Local development (H2 in-memory database)
- `application-dev.properties` - Docker PostgreSQL configuration

**Active Profile**: Set in `application.properties`:
```properties
spring.profiles.active=local  # or 'dev' for Docker PostgreSQL
```

### Profile: `local` (Default)
Uses H2 in-memory database for quick testing without Docker.
```properties
# application-local.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

### Profile: `dev` (Docker PostgreSQL)
Uses PostgreSQL running in Docker for development.
```properties
# application-dev.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/appdb
spring.datasource.username=appuser
spring.datasource.password=apppass
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

**Switching Profiles**:
1. Change `application.properties`: `spring.profiles.active=dev`
2. Restart application
3. Ensure Docker containers running if using `dev` profile

## Code Conventions

### Dependency Injection
**ALWAYS use constructor injection** - no field injection:
```java
@Service
public class UserService {
    private final UserRepository userRepository;  // final = immutable

    // Constructor injection (Spring auto-wires)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### Import Statements
**CRITICAL**: Always use import statements - NEVER use fully-qualified class names:
```java
// ✅ CORRECT
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {
    private List<User> users;
}

// ❌ WRONG - Never do this
public class UserService {
    private java.util.List<com.sap.smart_academic_calendar.model.User> users;
}
```

### Transaction Management
Use `@Transactional` for write operations (POST, PUT, DELETE):
```java
@Service
public class UserService {
    @Transactional  // Ensures atomicity, rollback on exception
    public UserDTO createUser(CreateUserRequest request) {
        // Validate input
        validateInput(request);
        
        // Create and save entity
        User user = new User(request.getUsername(), request.getEmail(), request.getPassword());
        User savedUser = userRepository.save(user);
        
        return convertToDTO(savedUser);
    }
}
```

### Error Handling
Controllers should catch exceptions and return appropriate HTTP status codes:
```java
@PostMapping
public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserRequest request) {
    try {
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().build();
    }
}
```

**Future Enhancement**: Use `@ControllerAdvice` for global exception handling.

### DTO Conversion
Services should convert entities to DTOs to hide sensitive data:
```java
private UserDTO convertToDTO(User user) {
    return new UserDTO(
        user.getId(),
        user.getUsername(),
        user.getEmail(),
        user.getCreatedAt()
        // Note: Password excluded for security
    );
}
```

## Common Patterns

### Creating a New Endpoint
1. **Create Flyway Migration** (if new table needed):
   ```sql
   -- V{N}__create_courses_table.sql
   CREATE TABLE courses (
       id BIGSERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       code VARCHAR(50) NOT NULL UNIQUE,
       credits INT NOT NULL
   );
   ```

2. **Create Entity** (`model/Course.java`):
   ```java
   @Entity
   @Table(name = "courses")
   public class Course {
       @Id
       @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @Column(nullable = false)
       private String name;
       
       @Column(nullable = false, unique = true, length = 50)
       private String code;
       
       @Column(nullable = false)
       private Integer credits;
       
       // Default constructor + parametrized constructor
       // Getters and setters
   }
   ```

3. **Create Repository** (`repository/CourseRepository.java`):
   ```java
   @Repository
   public interface CourseRepository extends JpaRepository<Course, Long> {
       Optional<Course> findByCode(String code);
       List<Course> findByCreditsGreaterThan(int credits);
   }
   ```

4. **Create DTOs** (`dto/CourseDTO.java`, `dto/CreateCourseRequest.java`):
   ```java
   public record CourseDTO(Long id, String name, String code, Integer credits) {}
   
   public record CreateCourseRequest(String name, String code, Integer credits) {}
   ```

5. **Create Service** (`service/CourseService.java`):
   ```java
   @Service
   public class CourseService {
       private final CourseRepository courseRepository;
       
       public CourseService(CourseRepository courseRepository) {
           this.courseRepository = courseRepository;
       }
       
       @Transactional
       public CourseDTO createCourse(CreateCourseRequest request) {
           // Validation + business logic
           Course course = new Course(request.name(), request.code(), request.credits());
           Course saved = courseRepository.save(course);
           return convertToDTO(saved);
       }
       
       public List<CourseDTO> getAllCourses() {
           return courseRepository.findAll().stream()
               .map(this::convertToDTO)
               .toList();
       }
       
       private CourseDTO convertToDTO(Course course) {
           return new CourseDTO(course.getId(), course.getName(), 
                               course.getCode(), course.getCredits());
       }
   }
   ```

6. **Create Controller** (`controller/CourseController.java`):
   ```java
   @RestController
   @RequestMapping("/api/courses")
   public class CourseController {
       private final CourseService courseService;
       
       public CourseController(CourseService courseService) {
           this.courseService = courseService;
       }
       
       @GetMapping
       public ResponseEntity<List<CourseDTO>> getAllCourses() {
           return ResponseEntity.ok(courseService.getAllCourses());
       }
       
       @PostMapping
       public ResponseEntity<CourseDTO> createCourse(@RequestBody CreateCourseRequest request) {
           try {
               CourseDTO course = courseService.createCourse(request);
               return ResponseEntity.status(HttpStatus.CREATED).body(course);
           } catch (RuntimeException e) {
               return ResponseEntity.badRequest().build();
           }
       }
   }
   ```

### Custom Repository Queries
Spring Data JPA generates SQL from method names:

```java
@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    // SELECT * FROM courses WHERE code = ?
    Optional<Course> findByCode(String code);
    
    // SELECT * FROM courses WHERE credits > ?
    List<Course> findByCreditsGreaterThan(int credits);
    
    // SELECT * FROM courses WHERE name LIKE %?%
    List<Course> findByNameContaining(String keyword);
    
    // SELECT COUNT(*) > 0 FROM courses WHERE code = ?
    boolean existsByCode(String code);
    
    // SELECT * FROM courses WHERE credits BETWEEN ? AND ?
    List<Course> findByCredits Between(int min, int max);
}
```

**Query Method Keywords**: `findBy`, `existsBy`, `countBy`, `deleteBy`, `GreaterThan`, `LessThan`, `Between`, `Like`, `Containing`, `OrderBy`, etc.

## Running the Application

### Prerequisites
- **Java 25** (JDK 25.0.2+) - Set `JAVA_HOME` environment variable
- **Maven** - Included via Maven wrapper (`mvnw`)
- **Docker Desktop** - For PostgreSQL (only needed for `dev` profile)

### Startup Steps

**Using Local Profile (No Docker)**:
1. Set profile in `application.properties`: `spring.profiles.active=local`
2. Run application:
   ```powershell
   ./mvnw spring-boot:run
   ```
3. Access API: http://localhost:8080/api/users

**Using Dev Profile (Docker PostgreSQL)**:
1. Start Docker Desktop
2. Start containers:
   ```powershell
   docker-compose up -d
   ```
3. Set profile: `spring.profiles.active=dev` in `application.properties`
4. Run application:
   ```powershell
   ./mvnw spring-boot:run
   ```
5. Access API: http://localhost:8080/api/users
6. Access pgAdmin: http://localhost:5050 (admin@example.com / admin)

**Verify Application**:
```powershell
# Windows PowerShell
curl http://localhost:8080/api/users
```

**Stop Application**: `Ctrl+C` in terminal

**Stop Docker**:
```powershell
docker-compose down      # Preserves data
docker-compose down -v   # Deletes data
```

## Maven Commands
```powershell
./mvnw spring-boot:run      # Run application
./mvnw clean                # Clean build artifacts
./mvnw compile              # Compile Java files
./mvnw test                 # Run tests
./mvnw package              # Create JAR file (target/)
```

## Testing
Unit tests use JUnit 5 and Spring Boot Test:
```java
@SpringBootTest
class UserServiceTest {
    @Autowired
    private UserService userService;
    
    @Test
    void testCreateUser() {
        CreateUserRequest request = new CreateUserRequest("test", "test@example.com", "pass");
        UserDTO user = userService.createUser(request);
        assertNotNull(user.getId());
        assertEquals("test", user.getUsername());
    }
}
```

## Important Files

### Backend Core
- [Init.java](src/main/java/com/sap/smart_academic_calendar/Init.java) - `@SpringBootApplication` entry point
- [pom.xml](pom.xml) - Maven dependencies and build configuration
- [application.properties](src/main/resources/application.properties) - Base configuration with profile selection

### Configuration
- [application-local.properties](src/main/resources/application-local.properties) - H2 in-memory database
- [application-dev.properties](src/main/resources/application-dev.properties) - PostgreSQL configuration
- [CorsConfig.java](src/main/java/com/sap/smart_academic_calendar/config/CorsConfig.java) - CORS settings for frontend
- [FlywayConfig.java](src/main/java/com/sap/smart_academic_calendar/config/FlywayConfig.java) - Database migration config

### Database
- [docker-compose.yml](docker-compose.yml) - PostgreSQL and pgAdmin container setup
- [V1__init.sql](src/main/resources/db/migration/V1__init.sql) - Initial schema migration
- [V2__admin.sql](src/main/resources/db/migration/V2__admin.sql) - Admin user seed data

### Example Code
- [UserController.java](src/main/java/com/sap/smart_academic_calendar/controller/UserController.java) - REST endpoints example
- [UserService.java](src/main/java/com/sap/smart_academic_calendar/service/UserService.java) - Business logic example
- [UserRepository.java](src/main/java/com/sap/smart_academic_calendar/repository/UserRepository.java) - Data access example
- [User.java](src/main/java/com/sap/smart_academic_calendar/model/User.java) - JPA entity example

## CORS Configuration
Backend allows requests from frontend running on `http://localhost:5173`:
```java
// CorsConfig.java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")  // Vite dev server
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

## Frontend Integration
The React frontend (port 5173) communicates with this backend via REST API:
- Frontend service files in `sp26-4770-student-academic-planner/app/services/`
- API base URL: `http://localhost:8080/api`
- Endpoints return JSON (auto-serialization via `@RestController`)

## Additional Resources
- [SPRING_BOOT_BASICS.md](docs/SPRING_BOOT_BASICS.md) - Beginner guide to Spring Boot concepts
- [DATABASE.md](docs/DATABASE.md) - Detailed Docker, PostgreSQL, and Flyway guide
- [CREATING_ENDPOINTS.md](docs/CREATING_ENDPOINTS.md) - Step-by-step endpoint creation guide
- [HOW_TO_RUN.md](docs/HOW_TO_RUN.md) - Detailed startup instructions
- [Spring Boot Generic Instructions](.github/instructions/Spring-Boot-Generic.instructions.md) - General Spring Boot best practices
