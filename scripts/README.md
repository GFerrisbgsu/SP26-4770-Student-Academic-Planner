# Coursicle Enhancement Scripts

This directory contains scripts for Phase 2A: Enhancing BGSU course data with real instructor names and schedules from Coursicle.com.

## Overview

These scripts replace placeholder data (`instructor="Staff"`, `schedule="TBA"`) with real data scraped from Coursicle.

**Workflow:**
1. Test CSS selectors → 2. Scrape Coursicle → 3. Import to backend → 4. Verify updates

---

## Prerequisites

### Python Dependencies
```bash
pip install beautifulsoup4 requests
```

### Backend Requirements
- Backend running on http://localhost:8080
- Database seeded with 215 BGSU courses

---

## Script Descriptions

### 1. `test_coursicle_selector.py`
**Purpose:** Verify CSS selectors work before batch scraping

**Usage:**
```bash
python scripts/test_coursicle_selector.py
```

**What it does:**
- Scrapes a single test course (CS 2010)
- Tests multiple CSS selector patterns
- Prints raw HTML sample
- Identifies working selectors

**Why run this first:**
- Coursicle's HTML structure may change over time
- Prevents wasting time scraping 15+ courses with wrong selectors
- Takes 5 seconds to verify

**Expected output:**
```
✓ FOUND with '.instructor': Dr. Emily Carter
✓ FOUND with '.schedule': MWF 10:00-10:50 AM
```

**Action if selectors fail:**
1. Open https://www.coursicle.com/bgsu/courses/CS/2010/ in browser
2. Right-click on instructor name → Inspect Element
3. Note the CSS class (e.g., `class="prof-name"`)
4. Update selector in `scrape_coursicle.py` and `CoursicleScraperService.java`

---

### 2. `scrape_coursicle.py`
**Purpose:** Batch scrape Tier 1 courses (15 SE core requirements)

**Usage:**
```bash
python scripts/scrape_coursicle.py
```

**What it does:**
- Scrapes 15 SE Core Requirement courses
- Implements 3-second rate limiting (prevents 429 errors)
- Exports to `coursicle_tier1_data.csv`

**Execution time:** ~1-2 minutes (15 courses × 3 seconds + scraping)

**Expected output:**
```
[1/15] Scraping CS 2010... ✓ Dr. Emily Carter            | MWF 10:00-10:50 AM
[2/15] Scraping CS 2900... ✓ Dr. John Smith             | F 2:00-2:50 PM
...
✓ Successfully scraped: 15/15 courses
✓ Saved to: coursicle_tier1_data.csv
```

**CSV format:**
```csv
code,instructor,schedule
CS 2010,Dr. Emily Carter,MWF 10:00-10:50 AM
CS 2020,Dr. John Smith,TuTh 2:00-3:15 PM
```

**Rate limiting details:**
- 3-second delay between requests (moderate strategy)
- Handles HTTP 429 (rate limit) by waiting 60 seconds
- Max 10 requests per 10 seconds to avoid ban

**Troubleshooting:**
- **429 error:** Script auto-waits 60 seconds and retries
- **Selector not found:** Run `test_coursicle_selector.py` to verify selectors
- **Network timeout:** Increase timeout in script (currently 10 seconds)

---

### 3. `import_coursicle_data.py`
**Purpose:** Upload scraped data to backend database

**Usage (recommended method):**
```bash
python scripts/import_coursicle_data.py
```

This triggers the backend to **re-scrape Coursicle** (ensures fresh data)

**Usage (alternative - direct CSV):**
```bash
python scripts/import_coursicle_data.py --direct
```

This reads CSV and updates database directly (faster but uses CSV data as-is)

**What it does:**
- Reads `coursicle_tier1_data.csv`
- Sends course codes to admin endpoint: `PUT /api/admin/courses/enhance-from-coursicle`
- Backend re-scrapes Coursicle (default method)
- Or directly updates from CSV (--direct flag)
- Verifies sample courses updated successfully

**Execution time:**
- Backend scraper method: ~1-2 minutes (re-scrapes all courses)
- Direct CSV method: ~5 seconds (no scraping)

**Expected output:**
```
✓ Import complete!
  Success count: 15
  Error count: 0

Verification: Checking Sample Courses
CS 2010    | Instructor: Dr. Emily Carter           | Schedule: MWF 10:00-10:50 AM
CS 2020    | Instructor: Dr. John Smith             | Schedule: TuTh 2:00-3:15 PM
SE 3540    | Instructor: Dr. Sarah Johnson          | Schedule: MWF 1:00-1:50 PM
```

**Troubleshooting:**
- **Backend error:** Check backend is running: `curl http://localhost:8080/api/courses`
- **Network timeout:** Increase timeout (300 seconds for 15 courses)
- **Partial failures:** Check error messages, re-run for failed courses only

---

## Complete Workflow Example

### Step 1: Test Selectors (5 seconds)
```bash
cd C:\CodingProjects\SE4770\sp26-4770-student-academic-planner
python scripts/test_coursicle_selector.py
```

**Look for:**
- ✓ marks showing selectors found data
- Update selectors if needed

---

### Step 2: Scrape Coursicle (1-2 minutes)
```bash
python scripts/scrape_coursicle.py
```

**Look for:**
- All 15 courses show ✓ check marks
- CSV file created: `coursicle_tier1_data.csv`

**Review CSV:**
```bash
type coursicle_tier1_data.csv
```

Verify instructor names and schedules look correct (not all "Staff" or "TBA")

---

### Step 3: Import to Backend (1-2 minutes)
```bash
python scripts/import_coursicle_data.py
```

**Look for:**
- Success count: 15
- Error count: 0
- Verification shows real instructor names

---

### Step 4: Verify in Database
```sql
-- PostgreSQL (via pgAdmin at http://localhost:5050)
SELECT code, instructor, schedule 
FROM courses 
WHERE instructor != 'Staff' 
ORDER BY code;
```

**Expected:** 15 courses with real instructor names and schedules

---

### Step 5: Verify in Frontend
Open browser:
- http://localhost:5173/course/cs2010
- http://localhost:5173/course/se4770

**Check:** Instructor shows real name (not "Staff"), schedule shows real times (not "TBA")

---

## Tier 1 Courses (15 SE Core Requirements)

| Course | Title |
|--------|-------|
| CS 2010 | Programming Fundamentals |
| CS 2900 | CS Freshman Seminar |
| CS 2020 | Data Structures |
| CS 2420 | Discrete Structures I |
| CS 3040 | Computer Organization |
| CS 3350 | Algorithms and Complexity |
| CS 3450 | Intro to Software Engineering |
| SE 3540 | Software Engineering I |
| CS 4210 | Operating Systems I |
| CS 4250 | Computer Networks |
| SE 4510 | Software Project Management |
| SE 4550 | Software Architecture |
| SE 4560 | Software Quality Assurance |
| SE 4770 | Software Engineering Capstone |
| CS 4900 | Professional Practice Seminar |

---

## Next Steps: Tier 2 Enhancement

After successfully enhancing Tier 1 courses, expand to Tier 2:

**Tier 2: 25 High-Value Courses**
- 10 SE Core Electives (CS 3060, CS 3140, CS 3240, CS 4110, CS 4140, CS 4240, CS 4310, CS 4340, CS 4440, CS 4540)
- 15 Math courses (MATH 1280, MATH 1340, MATH 1350, MATH 2220, MATH 2470, MATH 3410, + 9 electives)

**To add Tier 2:**
1. Update `TIER_1_COURSES` list in `scrape_coursicle.py` to include Tier 2 courses
2. Change output filename to `coursicle_tier2_data.csv`
3. Run scraping workflow again (estimated time: 25 courses × 3 sec = 1.5 minutes)

---

## Troubleshooting

### Problem: All courses show "Staff" and "TBA" after import

**Cause:** CSS selectors don't match Coursicle HTML

**Solution:**
1. Run `python scripts/test_coursicle_selector.py`
2. Look for ✗ marks (selectors not found)
3. Open Coursicle URL in browser, inspect element
4. Update selectors in `scrape_coursicle.py`
5. Re-run scraping

---

### Problem: HTTP 429 (Too Many Requests)

**Cause:** Scraping too fast, Coursicle rate limiting

**Solution:**
1. Script auto-waits 60 seconds when 429 occurs
2. If persistent, increase `RATE_LIMIT_DELAY` to 5 seconds
3. Wait 30 minutes before retrying

---

### Problem: Backend endpoint returns 404

**Cause:** Backend not running or admin endpoint not configured

**Solution:**
1. Check backend: `curl http://localhost:8080/api/courses`
2. Verify `CourseAdminController.java` compiled successfully
3. Restart backend: `docker-compose up --build`

---

### Problem: CSV created but empty or all "Staff"/"TBA"

**Cause:** Coursicle page structure changed or selectors incorrect

**Solution:**
1. Run `test_coursicle_selector.py` and review HTML sample
2. Visit https://www.coursicle.com/bgsu/courses/CS/2010/ manually
3. Verify page loads and shows instructor/schedule
4. If Coursicle is down, wait and retry later
5. Update selectors based on current HTML structure

---

## Rate Limiting Best Practices

### Coursicle Rate Limits (Observed)
- **10 requests in 10 seconds** → HTTP 429 (Too Many Requests)
- **100 requests in 1 hour** → Temporary IP ban (30 minutes)

### Recommended Strategies

| Strategy | Delay | Time for 15 courses | Risk |
|----------|-------|-------------------|------|
| Conservative | 5 seconds | 1.5 minutes | Very Low |
| Moderate | 3 seconds | 1 minute | Low ✓ (default) |
| Aggressive | 2 seconds | 40 seconds | Medium |
| Too Fast | 1 second | 20 seconds | High (banned) |

**Current setting:** 3 seconds (moderate) - balances speed and safety

---

## Security Note

### Admin Endpoints (Currently Unsecured)

The admin endpoint `/api/admin/courses/enhance-from-coursicle` is **currently not authenticated**.

**Current status:** Internal-only use (do not expose to public)

**Future enhancement:** Add Spring Security
```java
@PreAuthorize("hasRole('ADMIN')")
@PutMapping("/enhance-from-coursicle")
```

**For now:**
- Only run scripts on localhost
- Do not deploy backend publicly without authentication
- Treat admin endpoints as internal tools

---

## Documentation References

- **Phase 2 Plan:** [docs/backend/COURSICLE_DATA_ENHANCEMENT.md](../docs/backend/COURSICLE_DATA_ENHANCEMENT.md)
- **Curriculum Guide:** [docs/backend/BGSU_SOFTWARE_ENGINEERING_CURRICULUM.md](../docs/backend/BGSU_SOFTWARE_ENGINEERING_CURRICULUM.md)
- **Backend Service:** [backend/src/main/java/com/sap/smart_academic_calendar/service/CoursicleScraperService.java](../backend/src/main/java/com/sap/smart_academic_calendar/service/CoursicleScraperService.java)

---

## Success Metrics

After completing Tier 1 enhancement:

**Database Coverage:**
```sql
SELECT 
    ROUND(100.0 * COUNT(*) FILTER (WHERE instructor != 'Staff') / COUNT(*), 1) AS percent_enhanced
FROM courses;
```
**Target:** 7% (15/215 courses enhanced)

**Frontend Verification:**
- Visit http://localhost:5173/course-list
- Filter by "SE Core Requirement"
- Verify all 15 core courses show real instructor names

**API Test:**
```bash
curl http://localhost:8080/api/courses/cs2010 | jq '{code, instructor, schedule}'
```
**Expected:** Real instructor name and schedule (not "Staff" or "TBA")

---

**Last Updated:** February 22, 2026  
**Status:** Phase 2A Single-Section Implementation
