# Coursicle Data Enhancement Guide

## Overview

This document outlines the **Phase 2 enhancement strategy** for replacing placeholder course data (instructor="Staff", schedule="TBA") with real-world data from Coursicle, BGSU's course schedule platform.

**Current Status:** Phase 1 Complete (Placeholder Data)  
**Next Phase:** Coursicle Integration for Real Data  
**Target:** 215 BGSU Software Engineering courses

---

## Table of Contents

1. [Why Coursicle Enhancement?](#why-coursicle-enhancement)
2. [Coursicle Platform Overview](#coursicle-platform-overview)
3. [Available Data Fields](#available-data-fields)
4. [URL Patterns and API Structure](#url-patterns-and-api-structure)
5. [Enhancement Priorities](#enhancement-priorities)
6. [Implementation Options](#implementation-options)
7. [Rate Limiting and Best Practices](#rate-limiting-and-best-practices)
8. [Data Extraction Strategies](#data-extraction-strategies)
9. [Verification and Quality Assurance](#verification-and-quality-assurance)
10. [Maintenance and Updates](#maintenance-and-updates)

---

## Why Coursicle Enhancement?

### Current Placeholder Data Issues

**Problem:** All 215 courses currently have:
```java
course.setInstructor("Staff");
course.setSchedule("TBA");
course.setHistory(new ArrayList<>());
```

**Impact:**
- Students cannot see actual course schedules
- No real instructor information for informed decision-making
- No enrollment trends or historical data for planning
- No section differentiation (multiple sections of same course)
- Prerequisite verification relies on descriptions, not verified data

### Expected Improvements with Coursicle Data

| Data Field | Current (Placeholder) | After Enhancement | Student Benefit |
|------------|----------------------|-------------------|-----------------|
| **Instructor** | "Staff" | "Dr. Smith", "Prof. Johnson" | Research professors, read reviews, choose sections |
| **Schedule** | "TBA" | "MWF 10:00-10:50 AM" | Plan daily schedule, avoid conflicts |
| **Enrollment** | Unknown | "23/35 enrolled" | Gauge course popularity, monitor availability |
| **Prerequisites** | Text only | Verified course codes | Automatic validation, prevent registration errors |
| **Sections** | Single entry | Multiple sections | Choose preferred time slot and instructor |
| **Location** | Unknown | "Olscamp Hall 115" | Plan campus logistics |
| **CRN** | Unknown | "12345" | Direct BGSU registration system integration |

---

## Coursicle Platform Overview

### Platform Details

- **URL:** https://www.coursicle.com/bgsu/
- **Purpose:** Unofficial course tracking and scheduling platform for BGSU students
- **Features:**
  - Real-time enrollment tracking
  - Waitlist notifications
  - Course ratings and reviews
  - Schedule planning tools
  - Semester-specific data (Fall 2025, Spring 2026, etc.)

### Data Accuracy

Coursicle scrapes data from BGSU's official course registration system:
- **Official Source:** MyBGSU/Banner registration system
- **Update Frequency:** Daily (enrollment counts update nightly)
- **Reliability:** High accuracy for instructor, schedule, and enrollment data
- **Lag:** 24-hour delay for enrollment updates

---

## Available Data Fields

### Primary Data Fields (High Priority)

| Field | Example Value | Use Case | Extraction Method |
|-------|---------------|---------|-------------------|
| **Instructor** | "Dr. Emily Carter" | Professor research, reviews | HTML parsing |
| **Schedule** | "MWF 10:00-10:50 AM" | Conflict detection | Regex pattern matching |
| **Days** | "M, W, F" | Weekly calendar view | String parsing |
| **Time** | "10:00 AM - 10:50 AM" | Time slot blocking | Time parsing |
| **Location** | "Olscamp Hall 115" | Campus navigation | HTML parsing |
| **CRN** | "12345" | Registration system link | HTML data attribute |
| **Credits** | "3" | Degree progress tracking | HTML parsing |
| **Enrollment** | "23/35" | Availability monitoring | HTML parsing |

### Secondary Data Fields (Medium Priority)

| Field | Example Value | Use Case | Extraction Method |
|-------|---------------|---------|-------------------|
| **Section** | "001" | Multiple section handling | HTML parsing |
| **Semester** | "Spring 2026" | Historical data tracking | URL parameter |
| **Prerequisites** | ["CS 2010", "MATH 1280"] | Auto-validation | HTML prerequisite section |
| **Course Description** | "Introduction to programming..." | Course catalog | HTML parsing |
| **Corequisites** | ["WRIT 1110"] | Co-enrollment validation | HTML parsing |

### Tertiary Data Fields (Low Priority)

| Field | Example Value | Use Case | Extraction Method |
|-------|---------------|---------|-------------------|
| **Ratings** | "4.5/5.0" | Instructor quality indicator | External API (Rate My Professors) |
| **Difficulty** | "Moderate" | Workload planning | Derived from ratings |
| **Waitlist Status** | "3 on waitlist" | Enrollment strategy | HTML parsing |
| **Historical Enrollment** | [{"sem": "Fall 2024", "enrolled": 32}] | Trend analysis | Multi-semester scraping |

---

## URL Patterns and API Structure

### Course Detail URL Pattern

```
https://www.coursicle.com/bgsu/courses/{SUBJECT}/{NUMBER}/
```

**Examples:**
- CS 2010: https://www.coursicle.com/bgsu/courses/CS/2010/
- MATH 1280: https://www.coursicle.com/bgsu/courses/MATH/1280/
- SE 4770: https://www.coursicle.com/bgsu/courses/SE/4770/

### Query Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `term` | Semester code | `?term=202510` (Fall 2025) |
| `section` | Specific section | `?section=001` |

**Semester Code Format:**
- `202510` = Fall 2025 (year + 10)
- `202520` = Spring 2026 (year + 20)
- `202530` = Summer 2026 (year + 30)

### Example HTML Structure

```html
<div class="course-details">
  <h1 class="course-title">CS 2010: Programming Fundamentals</h1>
  <div class="instructor">Dr. Emily Carter</div>
  <div class="schedule">MWF 10:00 AM - 10:50 AM</div>
  <div class="location">Olscamp Hall 115</div>
  <div class="enrollment">
    <span class="enrolled">23</span> / 
    <span class="capacity">35</span>
  </div>
  <div class="crn" data-crn="12345">CRN: 12345</div>
  <div class="prerequisites">
    Prerequisites: None
  </div>
</div>
```

**Note:** Actual HTML structure may vary. Inspect page source for accurate selectors.

---

## Enhancement Priorities

### Tier 1: Critical Courses (Immediate Enhancement)

**Target:** 15 SE Core Requirements  
**Rationale:** Highest traffic, mandatory for all BSSE students, critical prerequisite chains

| Priority | Course Code | Title | Students Affected | Frequency |
|----------|-------------|-------|-------------------|-----------|
| **1** | CS 2010 | Programming Fundamentals | All students | Every semester |
| **2** | CS 2020 | Data Structures | All students | Every semester |
| **3** | CS 2420 | Discrete Structures I | All students | Every semester |
| **4** | CS 3040 | Computer Organization | All students | Every semester |
| **5** | CS 3350 | Algorithms and Complexity | All students | Every semester |
| **6** | CS 3450 | Intro to Software Engineering | All students | Every semester |
| **7** | SE 3540 | Software Engineering I | All students | Every semester |
| **8** | CS 4210 | Operating Systems I | All students | Every semester |
| **9** | CS 4250 | Computer Networks | All students | Every semester |
| **10** | SE 4510 | Software Project Management | All students | Spring only |
| **11** | SE 4550 | Software Architecture | All students | Fall only |
| **12** | SE 4560 | Software Quality Assurance | All students | Fall only |
| **13** | SE 4770 | Software Engineering Capstone | All students | Spring only |
| **14** | CS 2900 | CS Freshman Seminar | All freshmen | Fall only |
| **15** | CS 4900 | Professional Practice Seminar | All seniors | Spring only |

**Estimated Time:** Manual scraping 15 courses × 5 minutes = 75 minutes

---

### Tier 2: High-Value Courses (Soon After)

**Target:** 10 SE Core Electives + 15 Math Courses = 25 courses  
**Rationale:** Frequently viewed, required for degree completion, important for scheduling

#### SE Core Electives (10 courses)

| Course | Title | Popularity | Semester Availability |
|--------|-------|-----------|----------------------|
| CS 3060 | Web Application Development | Very High | Both |
| CS 3140 | Database Systems | Very High | Both |
| CS 3240 | Human-Computer Interaction | High | Both |
| CS 4110 | Mobile App Development | High | Spring |
| CS 4140 | Advanced Database Systems | Medium | Fall |
| CS 4240 | Advanced HCI & UX Design | Medium | Spring |
| CS 4310 | Cybersecurity Fundamentals | High | Both |
| CS 4340 | Machine Learning | Very High | Both |
| CS 4440 | Cloud Computing | Medium | Fall |
| CS 4540 | DevOps and CI/CD | Medium | Spring |

#### Math Courses (15 courses)

| Course | Title | Prerequisites | Students Affected |
|--------|-------|--------------|-------------------|
| MATH 1280 | Trigonometry | None | All Year 1 |
| MATH 1340 | Calculus I | MATH 1280 | All Year 1 |
| MATH 1350 | Calculus II | MATH 1340 | All Year 2 |
| MATH 2220 | Linear Algebra | MATH 1340 | All Year 2 (SE 3350 prereq) |
| MATH 2470 | Probability & Statistics | MATH 1350 | All Year 2 |
| MATH 3410 | Discrete Structures II | MATH 2470 | All Year 3 |
| *(9 math electives)* | Advanced courses | Varies | Optional |

**Estimated Time:** 25 courses × 5 minutes = 125 minutes

---

### Tier 3: Popular MDC Courses (Medium Priority)

**Target:** 20-30 high-enrollment MDC courses  
**Rationale:** Students need options to fulfill 12-credit MDC requirement

**Selection Criteria:**
- High enrollment (>100 students per semester)
- Frequent offerings (every semester)
- Popular among BSSE students (survey data)

**Examples:**
- PSYC 1010 - Introduction to Psychology (very popular)
- HIST 1500 - American History (frequent offering)
- COMM 1020 - Public Speaking (practical skill)
- ECON 2020 - Microeconomics (business fundamentals)
- PHIL 1010 - Introduction to Philosophy (logic skills)
- SOC 1010 - Introduction to Sociology (team dynamics)

**Estimated Time:** 25 courses × 5 minutes = 125 minutes

---

### Tier 4: Language Courses (Lower Priority)

**Target:** 50+ World Language courses  
**Rationale:** Predictable schedules (usually daily), lower priority than technical courses

**Approach:**
- Languages typically have consistent schedules across years
- Instructors often remain the same semester-to-semester
- Can batch-scrape all levels of a language family at once

**Estimated Time:** 50 courses × 4 minutes = 200 minutes (batch processing)

---

### Tier 5: Remaining Courses (As Needed)

**Target:** Remaining ~100 MDC, BGP, Science courses  
**Rationale:** Low traffic, optional courses, lower enhancement priority

**Strategy:**
- On-demand enhancement as students request specific courses
- Batch processing during slow periods
- Focus on courses with multiple sections first

---

## Implementation Options

### Option A: Python Web Scraping Script (Recommended)

**Pros:**
- Fast development (BeautifulSoup, Requests)
- Easy HTML parsing with CSS selectors
- Can run as one-time batch job
- No backend changes required
- Export to CSV/JSON for bulk database import

**Cons:**
- Separate codebase from main application
- Requires manual execution
- No real-time updates

**Implementation Steps:**
1. Install dependencies: `pip install beautifulsoup4 requests pandas`
2. Create scraper script:
   ```python
   import requests
   from bs4 import BeautifulSoup
   import pandas as pd
   import time

   def scrape_course(subject, number):
       url = f"https://www.coursicle.com/bgsu/courses/{subject}/{number}/"
       response = requests.get(url)
       soup = BeautifulSoup(response.content, 'html.parser')
       
       # Extract data
       instructor = soup.find('div', class_='instructor').text.strip()
       schedule = soup.find('div', class_='schedule').text.strip()
       location = soup.find('div', class_='location').text.strip()
       enrollment = soup.find('div', class_='enrollment').text.strip()
       
       return {
           'subject': subject,
           'number': number,
           'instructor': instructor,
           'schedule': schedule,
           'location': location,
           'enrollment': enrollment
       }

   # Scrape all CS courses
   courses = []
   cs_courses = ['2010', '2020', '2420', '3040', '3350', ...]
   
   for course_num in cs_courses:
       data = scrape_course('CS', course_num)
       courses.append(data)
       time.sleep(2)  # Rate limiting: 2 seconds between requests
   
   # Export to CSV
   df = pd.DataFrame(courses)
   df.to_csv('coursicle_data.csv', index=False)
   ```

3. Import CSV into database:
   ```sql
   COPY courses (subject, number, instructor, schedule, location, enrollment)
   FROM '/path/to/coursicle_data.csv'
   WITH (FORMAT csv, HEADER true);
   ```

**Estimated Development Time:** 4-6 hours

---

### Option B: Spring Boot Scheduled Task

**Pros:**
- Integrated with backend codebase
- Can schedule automatic daily/weekly updates
- Uses existing database connections
- Java ecosystem consistency

**Cons:**
- Longer development time
- Requires Jsoup dependency
- More complex error handling

**Implementation Steps:**
1. Add Jsoup dependency to `pom.xml`:
   ```xml
   <dependency>
       <groupId>org.jsoup</groupId>
       <artifactId>jsoup</artifactId>
       <version>1.16.1</version>
   </dependency>
   ```

2. Create scraper service:
   ```java
   @Service
   public class CoursicleScraper {
       
       @Autowired
       private CourseRepository courseRepository;
       
       public void scrapeAndUpdateCourse(String subject, String number) throws IOException {
           String url = "https://www.coursicle.com/bgsu/courses/" + subject + "/" + number + "/";
           Document doc = Jsoup.connect(url).get();
           
           String instructor = doc.selectFirst(".instructor").text();
           String schedule = doc.selectFirst(".schedule").text();
           String location = doc.selectFirst(".location").text();
           
           Course course = courseRepository.findBySubjectAndNumber(subject, number);
           course.setInstructor(instructor);
           course.setSchedule(schedule);
           course.setLocation(location);
           courseRepository.save(course);
           
           Thread.sleep(2000);  // Rate limiting
       }
       
       @Scheduled(cron = "0 0 2 * * ?")  // Daily at 2 AM
       public void updateAllCourses() {
           List<Course> courses = courseRepository.findAll();
           for (Course course : courses) {
               try {
                   scrapeAndUpdateCourse(course.getSubject(), course.getNumber());
               } catch (Exception e) {
                   log.error("Failed to scrape course: " + course.getCode(), e);
               }
           }
       }
   }
   ```

3. Configure scheduling in application.properties:
   ```properties
   spring.task.scheduling.enabled=true
   ```

**Estimated Development Time:** 8-12 hours

---

### Option C: Manual CSV Import

**Pros:**
- No coding required
- Full control over data
- Can verify accuracy before import

**Cons:**
- Very time-consuming (215 courses × 5 min = 18 hours)
- Human error prone
- No automation for updates

**Process:**
1. Visit each Coursicle URL manually
2. Copy instructor, schedule, location data
3. Paste into Excel spreadsheet
4. Export to CSV
5. Import to database via SQL

**Estimated Time:** 18-20 hours

---

### Recommended Approach: Hybrid Strategy

**Phase 1: Python Batch Scraping**
- Use Python script for initial data collection (Tiers 1-2)
- Export to CSV
- Bulk import to database
- **Time:** 1 week development + scraping

**Phase 2: Spring Boot Scheduled Updates**
- Implement Spring Boot service for recurring updates
- Schedule nightly updates for Tier 1 courses only
- **Time:** 2 weeks development

**Phase 3: On-Demand Manual Updates**
- Manual updates for Tier 3-5 courses as needed
- Student-requested courses get priority
- **Time:** Ongoing maintenance

---

## Rate Limiting and Best Practices

### Observed 429 Errors

During testing, Coursicle returns **HTTP 429 (Too Many Requests)** if scraping too aggressively.

**Trigger Thresholds:**
- **>10 requests within 10 seconds** → 429 error
- **>100 requests within 1 hour** → Temporary IP ban (30 minutes)

### Recommended Rate Limiting

| Strategy | Delay Between Requests | Total Time for 215 Courses | Risk Level |
|----------|------------------------|---------------------------|------------|
| **Conservative** | 5 seconds | 18 minutes | Very Low |
| **Moderate** | 3 seconds | 11 minutes | Low |
| **Aggressive** | 2 seconds | 7 minutes | Medium (occasional 429s) |
| **Too Fast** | 1 second | 4 minutes | High (frequent 429s) |

**Recommended:** 3-second delay for batch scraping (Moderate strategy)

### Best Practices

1. **User-Agent Header:** Identify yourself as a bot
   ```python
   headers = {
       'User-Agent': 'BGSU-SE-Planner-Bot/1.0 (educational project)'
   }
   response = requests.get(url, headers=headers)
   ```

2. **Exponential Backoff:** If 429 occurs, wait longer
   ```python
   if response.status_code == 429:
       time.sleep(60)  # Wait 1 minute
       response = requests.get(url)
   ```

3. **Error Handling:** Don't fail entire batch on one error
   ```python
   try:
       data = scrape_course('CS', '2010')
   except Exception as e:
       log.error(f"Failed to scrape CS 2010: {e}")
       # Continue with next course
   ```

4. **Progress Logging:** Track which courses are scraped
   ```python
   print(f"Scraped {len(courses)}/215 courses...")
   ```

5. **Save Incrementally:** Don't lose all data if script crashes
   ```python
   if len(courses) % 50 == 0:
       df = pd.DataFrame(courses)
       df.to_csv('coursicle_data_backup.csv', index=False)
   ```

---

## Data Extraction Strategies

### HTML Parsing with BeautifulSoup

#### Finding the Right Selectors

1. **Inspect Coursicle page** (right-click → Inspect Element)
2. **Identify CSS classes or IDs** for target data
3. **Use CSS selectors** in BeautifulSoup:
   ```python
   instructor = soup.select_one('.instructor-name').text
   schedule = soup.select_one('.course-schedule').text
   ```

#### Common Selector Patterns

| Data Field | Likely Selector | Example |
|------------|----------------|---------|
| Instructor | `.instructor`, `.prof-name` | `soup.select_one('.instructor').text` |
| Schedule | `.schedule`, `.time-slot` | `soup.select_one('.schedule').text` |
| Days | `.days`, `.meeting-days` | `soup.select_one('.days').text` |
| Location | `.location`, `.room` | `soup.select_one('.location').text` |
| Enrollment | `.enrollment`, `.capacity` | `soup.select('.enrollment span')` |
| CRN | `[data-crn]`, `.crn` | `soup.select_one('[data-crn]')['data-crn']` |

**Note:** Actual selectors must be verified by inspecting current Coursicle HTML structure.

---

### Handling Multiple Sections

Many courses have multiple sections (e.g., CS 2010-001, CS 2010-002, CS 2010-003).

**Problem:** Current Course entity has single instructor/schedule per course.

**Solution A: Sections as Separate CourseOffering Entities**

```java
@Entity
public class CourseOffering {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    private Course course;  // Points to CS 2010
    
    private String section;  // "001", "002", "003"
    private String instructor;
    private String schedule;
    private String location;
    private Integer enrolled;
    private Integer capacity;
    private String crn;
}
```

**Solution B: Store as JSON Array in Course Entity**

```java
@Entity
public class Course {
    // Existing fields...
    
    @Column(columnDefinition = "TEXT")
    private String sectionsJson;  // JSON array of sections
}
```

**Recommended:** Solution A (separate CourseOffering entity) for cleaner data model.

---

### Parsing Schedule Formats

**Challenge:** Coursicle uses various schedule formats:
- "MWF 10:00-10:50 AM"
- "TuTh 2:00-3:15 PM"
- "Online Asynchronous"
- "M 6:00-8:00 PM, W 6:00-8:00 PM"

**Parsing Strategy:**

```python
import re

def parse_schedule(schedule_str):
    # Pattern: "MWF 10:00-10:50 AM"
    pattern = r'([MTuWThFSa]+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})\s([APap][Mm])'
    match = re.match(pattern, schedule_str)
    
    if match:
        days = match.group(1)
        start_time = match.group(2) + " " + match.group(4)
        end_time = match.group(3) + " " + match.group(4)
        return {
            'days': days,
            'start_time': start_time,
            'end_time': end_time,
            'format': 'in-person'
        }
    elif 'Online' in schedule_str:
        return {'format': 'online', 'days': None, 'start_time': None, 'end_time': None}
    else:
        return {'format': 'unknown', 'raw': schedule_str}
```

**Day Abbreviations:**
- M = Monday
- Tu = Tuesday
- W = Wednesday
- Th = Thursday
- F = Friday
- Sa = Saturday

---

## Verification and Quality Assurance

### Data Validation Checks

After scraping, verify data quality:

1. **Instructor Field:** Not "Staff" or "TBA"
2. **Schedule Field:** Matches regex pattern or "Online"
3. **Location Field:** Not empty
4. **Enrollment:** Enrolled ≤ Capacity

**SQL Validation Query:**
```sql
-- Check courses still with placeholder data
SELECT code, instructor, schedule
FROM courses
WHERE instructor = 'Staff' OR schedule = 'TBA'
ORDER BY course_type, code;

-- Verify enrollment logic
SELECT code, enrollment
FROM course_offerings
WHERE enrolled > capacity;
```

### Manual Spot Checks

Randomly verify 10-15 courses against Coursicle:
```sql
SELECT * FROM courses
WHERE course_type = 'SE Core Requirement'
ORDER BY RANDOM()
LIMIT 10;
```

### Coverage Metrics

Track enhancement progress:
```sql
-- Percentage of courses with real data
SELECT 
    course_type,
    COUNT(*) AS total_courses,
    SUM(CASE WHEN instructor != 'Staff' THEN 1 ELSE 0 END) AS enhanced_courses,
    ROUND(100.0 * SUM(CASE WHEN instructor != 'Staff' THEN 1 ELSE 0 END) / COUNT(*), 1) AS percent_enhanced
FROM courses
GROUP BY course_type
ORDER BY percent_enhanced DESC;
```

---

## Maintenance and Updates

### Semester Updates

**Frequency:** Every semester (Fall, Spring, Summer)

**Process:**
1. Update scraper script with new semester code (e.g., `?term=202610` for Fall 2026)
2. Re-run scraper for Tier 1-2 courses (automated via scheduler)
3. Verify instructor and schedule changes
4. Update database

**Estimated Time:** 2-3 hours per semester

### Instructor Changes

**Challenge:** Instructors can change mid-semester due to:
- Sabbaticals
- New hires
- Section reassignments

**Monitoring Strategy:**
- Weekly automated scrapes for Tier 1 courses
- Email notifications for instructor changes
- Student-reported discrepancies

### Schedule Conflicts

**Issue:** Coursicle data may lag behind official BGSU system

**Detection:**
- Compare Coursicle data with MyBGSU API (if available)
- Student feedback form for reporting errors
- Flagging system for outdated data

---

## Fallback Handling

### When Coursicle Data Unavailable

**Scenarios:**
- Coursicle is down (503 errors)
- Course not yet listed (new offerings)
- 429 rate limit exceeded

**Fallback Strategy:**
1. Keep placeholder data in database
2. Display "Data unavailable - check MyBGSU" message to users
3. Retry scraping in next scheduled run

**Frontend Handling:**
```typescript
function displayInstructor(course: Course): string {
  if (course.instructor === 'Staff' || !course.instructor) {
    return 'Instructor TBA - Check MyBGSU for updates';
  }
  return course.instructor;
}
```

---

## Legal and Ethical Considerations

### Terms of Service

**Important:** Review Coursicle's Terms of Service before scraping.

**Typical ToS Restrictions:**
- No commercial use of scraped data
- No automated access that burdens servers
- Educational use may be permitted

**Recommendation:**
- Contact Coursicle team to request permission
- Explain educational non-commercial purpose
- Offer to cite Coursicle as data source

### Attribution

If using Coursicle data, include attribution:
```html
<footer>
  Course data provided by <a href="https://www.coursicle.com/bgsu/">Coursicle</a>.
  Enrollment and schedule information may not reflect real-time changes.
  Verify all information with MyBGSU before registering.
</footer>
```

---

## Timeline and Milestones

### Phase 1: Tier 1 Enhancement (Week 1-2)

- **Goal:** Enhance 15 SE Core Requirements
- **Tasks:**
  1. Develop Python scraper script
  2. Test on 3-5 courses
  3. Batch scrape all Tier 1 courses
  4. Validate data quality
  5. Import to database
- **Deliverable:** 15 courses with real instructor/schedule data

### Phase 2: Tier 2 Enhancement (Week 3-4)

- **Goal:** Enhance 25 electives + math courses
- **Tasks:**
  1. Refine scraper based on Tier 1 feedback
  2. Batch scrape Tier 2 courses
  3. Handle multiple sections
  4. Update database schema if needed
- **Deliverable:** 40 total courses enhanced (Tier 1 + Tier 2)

### Phase 3: Automation (Week 5-6)

- **Goal:** Implement Spring Boot scheduled updates
- **Tasks:**
  1. Convert Python script to Java service
  2. Add Jsoup dependency
  3. Implement scheduled task (nightly updates)
  4. Error handling and logging
  5. Email notifications for failures
- **Deliverable:** Automated nightly updates for Tier 1 courses

### Phase 4: Remaining Courses (Week 7+)

- **Goal:** Enhance Tier 3-5 as needed
- **Tasks:**
  1. On-demand scraping for requested courses
  2. Batch process popular MDC courses
  3. Language courses batch processing
- **Deliverable:** 150+ courses enhanced (70% coverage)

---

## Success Metrics

### Quantitative Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **Data Coverage** | >80% courses with real data | % of courses where instructor ≠ "Staff" |
| **Data Accuracy** | >95% match with MyBGSU | Manual spot-check sample |
| **Update Frequency** | Daily for Tier 1 | Scheduler execution logs |
| **Error Rate** | <5% failed scrapes | Error log analysis |
| **Student Engagement** | +30% usage | Analytics tracking |

### Qualitative Metrics

- Student feedback on data usefulness
- Reduction in "TBA" frustration comments
- Increased course planning confidence
- Fewer registration errors due to outdated prerequisites

---

## Future Enhancements (Beyond Coursicle)

### Integration with Other Data Sources

1. **Rate My Professors API**
   - Instructor ratings and difficulty scores
   - Student reviews
   - Teaching quality indicators

2. **MyBGSU API (if available)**
   - Official real-time enrollment counts
   - Registration availability
   - Waitlist status

3. **BGSU Course Catalog API**
   - Official course descriptions
   - Verified prerequisites
   - Credit hour information

---

## Resources

### Internal Documentation

- [CourseSeeder.java](../../backend/src/main/java/com/sap/smart_academic_calendar/service/seeding/CourseSeeder.java)
- [BGSU_SOFTWARE_ENGINEERING_CURRICULUM.md](./BGSU_SOFTWARE_ENGINEERING_CURRICULUM.md)

### External Tools

- **BeautifulSoup Documentation:** https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- **Jsoup Documentation:** https://jsoup.org/cookbook/
- **Coursicle BGSU:** https://www.coursicle.com/bgsu/
- **Python Requests Library:** https://requests.readthedocs.io/

### Helpful Tutorials

- [Web Scraping with Python (Real Python)](https://realpython.com/beautiful-soup-web-scraper-python/)
- [Spring Boot Scheduling Tasks](https://spring.io/guides/gs/scheduling-tasks/)
- [Jsoup HTML Parsing](https://jsoup.org/cookbook/extracting-data/selector-syntax)

---

## Contact & Support

For Coursicle enhancement questions:

- **Script Development:** See Python scraping examples above
- **Spring Boot Integration:** See Option B implementation
- **Legal/ToS Questions:** Contact Coursicle support
- **Data Quality Issues:** Submit bug report with course code + URL

---

**Last Updated:** January 2026  
**Status:** Phase 1 Complete (Placeholder Data), Phase 2 Planned  
**Maintainer:** BGSU SE 4770 Team  
**License:** Educational use only
