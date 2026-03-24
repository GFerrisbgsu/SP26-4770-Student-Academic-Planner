---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Spring Boot Development Guidelines

## General Instructions

- Make only high confidence suggestions when reviewing code changes.
- Write code with good maintainability practices, including comments explaining business rules and complex logic.
- For libraries or external dependencies, mention their usage and purpose in comments.
- **CRITICAL: Always use import statements** - Never reference fully-qualified class names (e.g., `java.util.List`, `org.springframework.stereotype.Service`) directly in code. Always add proper import statements at the top of the file. This rule is frequently violated - be vigilant about enforcing it.

## Architecture Patterns

### Reader/Writer Service Separation
This pattern separates read and write operations for better code organization:
- **Reader services** (`*Reader`): Handle GET operations, authorization checks, DTO assembly
- **Writer services** (`*Writer`): Handle POST/PATCH/DELETE, validation, state changes, transactional updates
- Controllers delegate to Reader/Writer services and contain **no business logic**

Alternative patterns: Consider using standard service naming conventions if this separation doesn't fit your architecture.

### Dependency Injection

- **Always use constructor injection** for all required dependencies.
- Declare dependency fields as `private final`.
- List dependencies in a logical order (repositories, utilities, clients, etc.).

### Configuration

- **Use `.properties` or `.yml` files** for configuration.
- **Profiles**: Use `application-{profile}.properties` for environment-specific config (e.g., `application-local.properties`, `application-dev.properties`).
- Set active profile via `spring.profiles.active` or environment variable `SPRING_PROFILES_ACTIVE`.
- **Secrets**: Externalize via environment variables or secure secret management systems.
- **External URLs**: Use environment variables for service endpoints.

### Package Organization

- **Package by feature/domain**: `api/service/feature1/`, `api/service/feature2/`
- **Standard structure**:
  - `api/controller/` - REST controllers
  - `api/service/` - Business logic
  - `api/repository/` - Spring Data JPA repositories
  - `api/util/` - Utility classes
  - `common/model/` - JPA entities and DTOs
  - `common/enums/` - Enumerations with business logic
  - `common/exception/` - Custom exception classes
  - `common/converter/` - JPA attribute converters
  - `client/` - External service clients

### Service Layer Best Practices

- Place business logic in `@Service`-annotated classes.
- Services should be **stateless** and testable.
- Inject repositories via constructor (never field injection).
- **Reader services**: Return DTOs, handle authorization, assemble complex responses.
- **Writer services**: Validate input, update entities, use `@Transactional` for writes.
- Use instance variables sparingly - only for collecting errors or when absolutely necessary.

#### External Service Calls After Database Operations (Transaction Race Condition Pattern)

When a service method needs to call external services that depend on committed database state, **use the controller to orchestrate the workflow** to avoid transaction race conditions:

**Problem**: Spring's `@Transactional` uses proxy-based AOP. Calling a transactional method from within the same class bypasses the proxy, so the transaction doesn't commit until the outermost method completes. If you call an external service within a wrapper method, the transaction hasn't committed yet, causing referential integrity errors when the external service tries to access the data.

**Solution**: Move external service calls to the controller layer, which calls the service methods sequentially:

1. **Service layer**: Keep `@Transactional` methods focused on business logic only
2. **Controller layer**: Orchestrate the workflow - call service method, wait for transaction to commit, then call external services
3. **Optional helper method**: Create a separate public service method for external service calls if needed

Example pattern:
```java
// Service Layer - focused on business logic only
@Service
public class EntityWriter {
    @Transactional
    public EntityDTO createEntity(CreateRequest request) {
        // Core business logic and database operations
        Entity entity = new Entity();
        // ... set fields, validate, save
        return toDTO(entity);
    }

    // Optional: Helper method for controller to call external services
    public void notifyExternalService(Long entityId) {
        externalServiceClient.notifyCreation(entityId);
    }
}

// Controller Layer - orchestrates workflow
@RestController
public class EntityController {
    private final EntityWriter entityWriter;

    @PostMapping("/entities")
    public ResponseEntity<EntityDTO> createEntity(@RequestBody CreateRequest request) {
        // Create entity - transaction commits when this method returns
        EntityDTO dto = entityWriter.createEntity(request);

        // Call external service after transaction commits and data is visible in DB
        entityWriter.notifyExternalService(dto.getId());

        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }
}
```

**Why this works**: The service method completes and its transaction commits before the controller calls the external service. The external service can now see the committed data in the database.

**Key Points**:
- Never call `@Transactional` methods from within the same class expecting transaction boundaries to work
- Controllers should orchestrate multi-step workflows that span transaction boundaries
- Service methods should focus on single responsibility (business logic OR external calls, not both)
- This pattern prevents referential integrity constraint violations when external services depend on committed data

### Logging

- Use **SLF4J** for all logging: `private static final Logger log = LoggerFactory.getLogger(MyClass.class);`.
- Use parameterized logging: `log.info("User {} logged in with ID {}", username, userId);`.
- Log levels: `ERROR` for exceptions, `WARN` for recoverable issues, `INFO` for business events, `DEBUG` for detailed flow.
- Never use `System.out.println()` or concrete logger implementations.

### Security & Authorization

- Implement authorization checks before write operations.
- Use Spring Security's authentication context to get the current user.
- Configure OAuth2 Resource Server with JWT validation as appropriate for your security requirements.
- Always validate user permissions before modifying data.

### Input Validation

- Use **JSR-380** annotations (`@NotNull`, `@Size`, `@Min`, `@Max`) on model fields.
- Use **validation groups** for scenario-based validation when different contexts require different rules.
- Collect validation errors in a list and throw appropriate exceptions with all errors at once.
- Always use Spring Data JPA - parameterized queries are automatic (no SQL injection risk).

### JPA Entity Patterns

#### Audit Fields
- Use `@PrePersist` to set `createdDate` and `createdBy` on entity creation.
- Use `@PreUpdate` to auto-set `updatedDate` on entity modification.
- **Important**: Set `updatedBy` manually in service layer before saving (use authenticated user ID).
- **Spring Boot 4.0+**: Audit date fields (`createdDate`, `modifiedDate`, `updatedDate`) using `OffsetDateTime` **must** include `@JsonFormat` annotation:
  ```java
  @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
  @Column(name = "CREATED_DATE", nullable = false)
  private OffsetDateTime createdDate;
  ```

#### Entity Lifecycle Hooks
- `@PostLoad`: Use for correcting data mappings after loading from DB.
- `@PrePersist`: Set audit fields, default values, or generate IDs.
- `@PreUpdate`: Update modification timestamps automatically.

#### Custom Type Converters
- Use JPA `@Convert` for custom enum mappings or type conversions.
- Define converters in a dedicated converter package.
- Apply with `@Convert(converter = MyConverter.class)` on entity fields.

#### Entity Best Practices
- Use `@JsonInclude(JsonInclude.Include.NON_NULL)` to exclude null fields from JSON responses.
- Use `@JsonProperty` to map Java field names to different JSON property names.
- Use `BigDecimal` for financial calculations (never `double` or `float`).
- Use `Long` for currency values stored as cents/pennies in the database.
- Set `columnDefinition` in `@Column` to match database types exactly when needed.

### DTOs and Data Transfer

- Organize DTOs in a way that makes sense for your project structure.
- Use **builder pattern** for test data.
- When assembling complex DTOs:
  1. Populate basic fields via direct setters or builder
  2. Fetch related data from repositories
  3. Batch-fetch related entities when possible to avoid N+1 queries
  4. Assemble nested DTOs with fetched data

### Transaction Management

- Use `@Transactional` on **Writer service methods** that modify data.
- Keep transactions as short as possible - fetch data first, then start transaction for updates.
- Don't use `@Transactional` on Reader services unless explicitly needed.
- Let Spring manage transaction lifecycle - avoid manual transaction control.

### Exception Handling

- Use **custom exceptions** for business logic errors:
  - `ObjectNotFoundException` - Resource not found (404)
  - `InsufficientAuthorizationException` - User lacks permissions (403)
  - `InvalidRequestException` - Bad request data (400)
  - `ValidationException` - Validation failures (400)
- Throw exceptions with descriptive messages.
- Use `@ControllerAdvice` for global exception handling.

## Testing Patterns

### Unit Test Pattern (Preferred for Most Classes)
- **Use `@Mock` and `@InjectMocks` for service layer tests** (Reader/Writer services, utilities, etc.).
- `@InjectMocks` - Applied to the class under test (automatically injects mocked dependencies).
- `@Mock` - Applied to dependencies that the class pulls in.
- Add `@ExtendWith(MockitoExtension.class)` to the test class.
- **Fast execution** - No Spring context needed, pure unit tests.
- Example:
  ```java
  @ExtendWith(MockitoExtension.class)
  class MyServiceTest {
      @InjectMocks
      private MyService myService;  // Class under test

      @Mock
      private MyRepository repository;  // Dependency

      @Mock
      private ExternalClient client;  // Dependency
  }
  ```

### Controller Test Pattern (Spring Integration Required)
- **Use `@Autowired` and `@MockitoBean` for controller tests** - requires Spring context for MockMvc.
- `@SpringBootTest` - Load full application context.
- `@AutoConfigureMockMvc` or custom MockMvc configuration - Configure MockMvc with Spring Security.
- `@Autowired MockMvc mockMvc` - Inject configured MockMvc instance.
- `@MockitoBean` - Mock services (controller dependencies).
- Example:
  ```java
  @SpringBootTest
  @AutoConfigureMockMvc
  class MyControllerTest {
      @Autowired
      private MockMvc mockMvc;

      @MockitoBean
      private MyReader myReader;  // Mocked service

      @MockitoBean
      private MyWriter myWriter;  // Mocked service
  }
  ```

### Test Organization
- **Controller tests**: Use `@Autowired`/`@MockitoBean` pattern, test HTTP layer and Spring Security integration.
- **Service tests (Reader/Writer)**: Use `@Mock`/`@InjectMocks` pattern, test business logic with mocked repositories.
- **Utility/Helper tests**: Use `@Mock`/`@InjectMocks` pattern for pure unit tests.
- **Repository tests**: Use `@DataJpaTest` to test JPA queries against in-memory database.

### Test Data Builders
- Follow builder pattern: fluent interface with method chaining.
- Provide sensible defaults for all fields.
- Allow overriding specific fields for test variations.

### Assertions (Recommended)
- Prefer AssertJ for all assertions: `assertThat`, `assertThatThrownBy`, `assertThatExceptionOfType`.
- Avoid mixing multiple assertion libraries (JUnit assertions, Hamcrest matchers) for consistency.
- Examples:
  ```java
  // Equality
  assertThat(actual).isEqualTo(expected);

  // Null/empties
  assertThat(obj).isNull();
  assertThat(list).isEmpty();

  // Booleans
  assertThat(flag).isTrue();

  // Collections
  assertThat(items).hasSize(3).containsExactlyInAnyOrder("a", "b", "c");

  // Exceptions
  assertThatThrownBy(() -> service.call()).isInstanceOf(MyException.class)
      .hasMessageContaining("bad input");
  ```
- When comparing complex objects, prefer `usingRecursiveComparison()` with field ignores where needed.

## Financial Calculation Patterns

### BigDecimal Usage
- **Always use `BigDecimal`** for financial calculations to avoid floating-point errors.
- Convert to/from primitives only at boundaries (database, API responses).
- Specify precision and rounding mode: `.setScale(4, RoundingMode.HALF_UP)`.
- Example:
  ```java
  BigDecimal amount = BigDecimal.valueOf(100.00);
  BigDecimal rate = BigDecimal.valueOf(0.05);
  BigDecimal result = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
  ```

### Basis Points Conversion
- Basis points are commonly stored as integers (e.g., `150` = 1.50%).
- Convert to decimal: `decimalValue = basisPoints / 10000`.
- Convert from decimal: `basisPoints = decimalValue × 10000`.

## Spring Boot 4.0 / Spring Security 7 Considerations

**⚠️ IMPORTANT: This section applies ONLY to Spring Boot 4.0+ projects.**
- **Do NOT assume** a project is using Spring Boot 4.0 unless explicitly confirmed via `pom.xml` or `build.gradle`.
- **Do NOT apply** these patterns (Spring Security 7, Jackson 3.0, etc.) to Spring Boot 3.x projects.
- **Check dependency versions** before applying any guidance from this section.
- Most projects are still on Spring Boot 3.x - only apply these guidelines during an active Spring Boot 4.0 upgrade or in a confirmed Spring Boot 4.0 environment.

### MockMvc Test Configuration (CRITICAL)
- **Spring Boot 4.0 changed MockMvc auto-configuration behavior**.
- `@AutoConfigureMockMvc` **no longer applies Spring Security filters** by default.
- **MANDATORY**: Create custom MockMvc configuration with `.apply(springSecurity())` for SecurityContext to work:
  ```java
  @Bean
  public MockMvc mockMvc(WebApplicationContext ctx) {
      return MockMvcBuilders.webAppContextSetup(ctx)
          .apply(springSecurity())  // REQUIRED for Spring Security 7
          .build();
  }
  ```
- Without this, `@WithMockUser` is ignored and SecurityContext remains null.

### HTTP Status Code Changes
- **Spring Security 7** returns **401 Unauthorized** (not 400 Bad Request) for unauthenticated requests.
- Update test expectations: `.andExpect(status().isUnauthorized())` for secured endpoints without auth.

### OffsetDateTime JSON Serialization
- **Recommended pattern**: `@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")`
- **Pattern explanation**:
  - `.SSS` = milliseconds (3 digits), matches typical database precision
  - `XXX` = timezone offset (e.g., `-05:00`, `Z` for UTC)
  - Never use `'Z'` in quotes - it's treated as literal text
- **ObjectMapper configuration**:
  ```java
  mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);      // ISO-8601 strings, not epoch
  mapper.disable(SerializationFeature.WRITE_DATES_WITH_ZONE_ID);       // No timezone suffix
  mapper.disable(DeserializationFeature.ADJUST_DATES_TO_CONTEXT_TIME_ZONE); // Preserve original offset
  ```
- **Test assertions**: Compare at millisecond precision using `.truncatedTo(ChronoUnit.MILLIS)`:
  ```java
  .withComparatorForType(
      (a, b) -> a.truncatedTo(ChronoUnit.MILLIS).equals(b.truncatedTo(ChronoUnit.MILLIS)) ? 0 : -1,
      OffsetDateTime.class
  )
  ```
- **Why**: JSON loses nanosecond precision; databases typically store milliseconds; Jackson 3.0 is stricter.

### Jackson 3.0 Requirements
- **Must register JavaTimeModule** explicitly: `mapper.registerModule(new JavaTimeModule());`
- Jackson 3.0 does NOT auto-register time modules (breaking change from Jackson 2.x).

### Test Annotation Changes
- Replace `@MockBean` with `@MockitoBean` (Spring Boot 4.0 deprecation).
- Add `MockitoAnnotations.openMocks(this)` in `@BeforeEach` for `@Mock`/`@InjectMocks` to work.
- Repository tests: Use `@ExtendWith(MockitoExtension.class)` instead of `@SpringBootTest` for faster execution.

### Hibernate 6 ID Generator Migration
- `@GenericGenerator` is **deprecated** in Hibernate 6.
- Use `@IdGeneratorType` with custom annotation pattern:
  ```java
  @IdGeneratorType(CustomIdGenerator.Generator.class)
  @Retention(RetentionPolicy.RUNTIME)  // REQUIRED for Hibernate reflection
  public @interface CustomIdGenerator {
      class Generator implements IdentifierGenerator { ... }
  }
  ```
- Apply to entities: `@GeneratedValue @CustomIdGenerator private String id;`

### Transient Field Handling in Tests
- Fields marked `@Transient` are **lost during JSON serialization**.
- Always exclude transient fields in test assertions: `.ignoringFields("transientField1", "transientField2")`

## Build and Verification

- **Maven** or **Gradle** build systems are commonly used.
- Build: `mvn clean package` / `./mvnw clean package` or `gradle build` / `./gradlew build`.
- Run tests: `mvn test` / `./mvnw test` or `gradle test` / `./gradlew test`.
- Run locally: `mvn spring-boot:run` / `./mvnw spring-boot:run` or `gradle bootRun` / `./gradlew bootRun`.
- Code coverage: JaCoCo or similar tools for coverage reports.
- Ensure all tests pass before committing.

## Useful Maven Commands

| Maven Command                     | Description                                   |
|:----------------------------------|:----------------------------------------------|
| `./mvnw spring-boot:run`          | Run the application locally.                  |
| `./mvnw clean package`            | Build the application.                        |
| `./mvnw test`                     | Run all tests.                                |
| `./mvnw spring-boot:repackage`    | Package as executable JAR.                    |
| `./mvnw spring-boot:build-image`  | Package as container image.                   |

## Useful Gradle Commands

| Gradle Command                    | Description                                   |
|:----------------------------------|:----------------------------------------------|
| `./gradlew bootRun`               | Run the application locally.                  |
| `./gradlew clean build`           | Build the application.                        |
| `./gradlew test`                  | Run all tests.                                |
| `./gradlew bootJar`               | Package as executable JAR.                    |
| `./gradlew bootBuildImage`        | Package as container image.                   |

## Environment-Specific Configuration

### Local Development (Profile: `local`)
- Use in-memory database (H2) for rapid development.
- Auto-create schema on startup for quick prototyping.
- Configure appropriate logging levels for development.

### Remote Environments (Profiles: `dev`, `test`, `staging`, `prod`)
- Use production-grade databases (PostgreSQL, MySQL, Oracle, etc.).
- Configure via environment variables for security:
  - Database credentials, connection URLs
  - External service endpoints
  - API keys and secrets
- Implement appropriate logging (structured logging, centralized log aggregation).

### Setting Profile
- Environment variable: `SPRING_PROFILES_ACTIVE=dev`
- JVM argument: `-Dspring.profiles.active=dev`
- Properties file: `spring.profiles.active=dev`

## Common Gotchas

1. **Validation Groups**: Use scenario-based validation groups when different contexts require different validation rules.
2. **Null Handling**: Null fields in requests may be intentional - understand the business context before rejecting nulls.
3. **Audit Fields**: Some audit fields require manual setting, others are automatic - know which is which.
4. **BigDecimal**: Use for all financial math; specify scale and rounding mode to avoid precision issues.
5. **DTO Assembly**: Avoid N+1 query problems by batch-fetching related entities.
6. **Authorization**: Always check permissions before writes - implement proper authorization checks.
7. **MockMvc + Security**: Spring Boot 4.0 requires explicit security filter configuration in tests.
8. **OffsetDateTime Precision**: JSON serialization may lose precision - compare at appropriate level in tests.
9. **Date Format Patterns**: Use consistent, ISO-8601 compatible patterns across your application.
10. **Framework Upgrades**: Major version upgrades can break tests, security, and serialization - test thoroughly.
