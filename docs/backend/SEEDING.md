# Database Seeding Documentation

## Project Status Overview

### Current Seeders

#### 1. UserSeeder (Order: 1) - ✅ ACTIVE
**Purpose:** Creates initial user accounts for development and testing

**Data Created:**
- Admin user: `admin` / `admin@example.com` / `admin123`
- Test user: `test` / `test@student.edu` / `test123`

**Dependencies:** UserRepository, User model

**Status:** WORKING - Matches current User model (username, email, password, createdAt)

## System Architecture

### DataSeeder Interface
All seeders implement the `DataSeeder<T>` interface:
- `seed()` - Main method to populate data
- `getOrder()` - Defines execution order (lower numbers execute first)  
- `shouldSeed()` - Conditional logic to determine if seeding should run

### DatabaseSeedingService  
The central service that orchestrates all seeding operations:
- Auto-discovers all `DataSeeder` beans via Spring dependency injection
- Executes seeders in order specified by `getOrder()`
- Provides transaction management and error handling
- Logs seeding progress and completion status

### DatabaseSeedingConfig
Configuration class that manages the seeding process:
- Controls when seeding runs (typically on application startup)
- Provides profile-based conditional seeding
- Can be disabled for production environments

## How It Works

1. **Automatic Discovery**: Spring automatically finds all beans implementing `DataSeeder<T>`
2. **Ordered Execution**: Seeders run in order based on `getOrder()` method
3. **Environment Control**: Seeding only runs in `local` and `dev` profiles by default
4. **Transaction Safety**: Each seeder runs in its own transaction
5. **Error Handling**: If one seeder fails, others continue running

## Running Seeders

### Automatic (Recommended)
Seeders run automatically on application startup when:
- Active profile is `dev` (see `application-dev.properties`)
- Environment variable `ENABLE_SEEDING=true` (optional override)

### Manual Execution
For testing or re-seeding, inject `DatabaseSeedingService` and call `seedAll()`:
```java
@Autowired
private DatabaseSeedingService seedingService;

public void manualSeed() {
    seedingService.seedAll();
}
```

## Configuration Options

### Environment Variables
- `ENABLE_SEEDING=true` - Force enable seeding regardless of profile
- `ENABLE_SEEDING=false` - Force disable seeding

### Profiles
- `local` - No seeding (uses H2 in-memory database)
- `dev` - Seeding enabled (PostgreSQL database)

### Application Properties
```properties
# In application-dev.properties
db.seeding.enabled=true
```

### Environment Control
- **Production**: Seeding is disabled by default
- **Development**: Enable with `app.seeding.enabled=true`
- **Testing**: Use `@TestPropertySource` to control seeding in tests

## Creating New Seeders

### 1. Basic Seeder Template
```java
@Component
public class YourEntitySeeder implements DataSeeder<YourEntity> {
    
    private static final Logger log = LoggerFactory.getLogger(YourEntitySeeder.class);
    
    private final YourEntityRepository repository;
    
    public YourEntitySeeder(YourEntityRepository repository) {
        this.repository = repository;
    }
    
    @Override
    public void seed() throws Exception {
        if (repository.count() > 0) {
            log.info("YourEntity data already exists, skipping seeding");
            return;
        }
        
        log.info("Seeding YourEntity data...");
        
        // Create and save your entities here
        YourEntity entity = new YourEntity();
        // Set properties...
        repository.save(entity);
        
        log.info("Seeded {} entities", 1);
    }
    
    @Override
    public int getOrder() {
        return 50; // Choose appropriate order
    }
    
    @Override
    public boolean shouldSeed() {
        return repository.count() == 0; // Only seed if empty
    }
}
```

### 2. Seeder with Dependencies
```java
@Component
public class DependentEntitySeeder implements DataSeeder<DependentEntity> {
    
    private final DependentEntityRepository repository;
    private final ParentEntityRepository parentRepository;
    
    @Override
    public void seed() throws Exception {
        // Check dependencies exist
        if (parentRepository.count() == 0) {
            log.warn("Parent entities not found, skipping dependent seeding");
            return;
        }
        
        // Your seeding logic...
    }
    
    @Override
    public int getOrder() {
        return 60; // Higher than parent entity order
    }
}
```

## Best Practices

### Creating New Seeders
1. Implement `DataSeeder<YourEntity>` interface
2. Use `@Component` annotation for Spring auto-discovery
3. Inject required repositories via constructor
4. Set appropriate execution order via `getOrder()`
5. Add null/existence checks in `shouldSeed()`

### Seeder Guidelines
- **Idempotent:** Seeders should check if data exists before creating
- **Order-aware:** Use `getOrder()` to manage dependencies between seeders
- **Conditional:** Use `shouldSeed()` for environment-specific logic
- **Descriptive logging:** Log what data is being seeded
- **Error handling:** Let exceptions bubble up for transaction rollback

## Seeding Order Guidelines

| Order Range | Entity Type | Examples |
|------------|-------------|----------|
| 1-9 | Core entities | Users, Roles |
| 10-19 | Reference data | Courses, Categories |
| 20-29 | Dependent entities | CalendarEvents, UserSettings |
| 30-49 | Business entities | Assignments, Notes |
| 50+ | Optional/Test data | Sample content |

## Advanced Usage Patterns

### 1. Check Existing Data
Always check if data exists before seeding:
```java
if (repository.count() > 0) {
    log.info("Data already exists, skipping");
    return;
}
```

### 2. Use Meaningful Test Data
```java
// Good: Realistic test data
User testUser = createUser("john.doe@student.edu", "John Doe", "CS Student");

// Avoid: Generic test data
User user1 = createUser("user1@test.com", "User 1", "Test");
```

### 3. Handle Dependencies
```java
@Override
public boolean shouldSeed() {
    return repository.count() == 0 && 
           dependencyRepository.count() > 0; // Ensure dependencies exist
}
```

### 4. Use Transactions Appropriately
```java
// Don't use @Transactional on the seeder - it's handled by the service
// Each seeder runs in its own transaction for isolation
```

### 5. Provide Useful Logging
```java
log.info("Seeding {} with {} records", getSeederName(), recordCount);
log.debug("Created entity: {}", entity.getId());
```

### Conditional Seeding
```java
@Override
public boolean shouldSeed() {
    // Custom conditions
    return repository.count() == 0 && 
           environment.acceptsProfiles("demo") &&
           !isProductionEnvironment();
}
```

### Environment-Specific Data
```java
@Component
@Profile("demo")
public class DemoDataSeeder implements DataSeeder<Entity> {
    // Only loads in demo profile
}
```

### Large Dataset Seeding
```java
@Override
public void seed() throws Exception {
    // Process in batches
    List<Entity> batch = new ArrayList<>();
    for (int i = 0; i < 1000; i++) {
        batch.add(createEntity(i));
        
        if (batch.size() >= 100) {
            repository.saveAll(batch);
            batch.clear();
        }
    }
    
    if (!batch.isEmpty()) {
        repository.saveAll(batch);
    }
}
```

## Testing Seeders

### Unit Test Template
```java
@ExtendWith(MockitoExtension.class)
class YourEntitySeederTest {
    
    @Mock
    private YourEntityRepository repository;
    
    @InjectMocks
    private YourEntitySeeder seeder;
    
    @Test
    void shouldSeedWhenNoDataExists() throws Exception {
        when(repository.count()).thenReturn(0L);
        
        seeder.seed();
        
        verify(repository, atLeastOnce()).save(any(YourEntity.class));
    }
    
    @Test
    void shouldSkipSeedingWhenDataExists() throws Exception {
        when(repository.count()).thenReturn(5L);
        
        seeder.seed();
        
        verify(repository, never()).save(any(YourEntity.class));
    }
}
```

### Integration Test
```java
@SpringBootTest
@TestPropertySource(properties = "app.seeding.enabled=true")
class SeedingIntegrationTest {
    
    @Autowired
    private DatabaseSeedingService seedingService;
    
    @Test
    void shouldSeedAllData() {
        seedingService.seedAllData();
        
        // Assert data was created
        assertThat(userRepository.count()).isGreaterThan(0);
        assertThat(courseRepository.count()).isGreaterThan(0);
    }
}
```

## Troubleshooting

### Common Issues
1. **Seeder not running:** Check active profile and seeding configuration
2. **Dependency injection fails:** Ensure repository components exist
3. **SQL constraints fail:** Check seeder order and data dependencies
4. **Duplicate data:** Verify idempotency checks in seeders

### Seeding Not Running
1. Check profile: Only runs in `local`/`dev` by default
2. Check property: `app.seeding.enabled=true`
3. Check logs: Look for "Starting database seeding process..."

### Dependency Issues
1. Ensure proper order values
2. Check `shouldSeed()` conditions
3. Verify repository beans are available

### Performance Issues
1. Use batch operations for large datasets
2. Consider using `@Sql` scripts for large static data
3. Profile seeder execution times

### Logging
Seeding logs appear at INFO level:
```
INFO  - Starting database seeding...
INFO  - Executing UserSeeder (order: 1)
INFO  - Seeded 2 users
INFO  - Database seeding completed successfully
```