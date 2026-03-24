#!/usr/bin/env python3
"""
Coursicle Data Import Script

Purpose: Upload scraped Coursicle data to backend via admin API

This script:
1. Reads coursicle_tier1_data.csv
2. Sends course codes to /api/admin/courses/enhance-from-coursicle endpoint
3. Backend re-scrapes and updates database (ensures data freshness)
4. Prints success/error summary

Run: python scripts/import_coursicle_data.py

Prerequisites:
- Backend running on http://localhost:8080
- coursicle_tier1_data.csv exists (created by scrape_coursicle.py)

Alternative: Direct CSV import (faster, but uses possibly stale data)
- Manual option if backend scraper has issues
- Reads CSV and directly updates database via individual PUT requests

Dependencies: pip install requests pandas
"""

import requests
import csv
import json
from datetime import datetime

BACKEND_URL = "http://localhost:8080"
ADMIN_ENDPOINT = "/api/admin/courses/enhance-from-coursicle"
CSV_FILE = "coursicle_tier1_data.csv"

def import_via_backend_scraper():
    """
    Import by triggering backend to re-scrape Coursicle
    
    This method:
    - Sends list of course codes to admin endpoint
    - Backend scrapes Coursicle directly (ensures fresh data)
    - Returns comprehensive success/error report
    
    Advantage: Data is re-scraped, ensuring accuracy
    Disadvantage: Slower (3 seconds per course)
    """
    print("=" * 80)
    print("Coursicle Data Import - Backend Scraper Method")
    print("=" * 80)
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Read CSV to get course codes
    course_codes = []
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                course_codes.append(row['code'])
    except FileNotFoundError:
        print(f"Error: {CSV_FILE} not found. Run scrape_coursicle.py first.")
        return
    
    print(f"Found {len(course_codes)} courses in CSV")
    print(f"Backend URL: {BACKEND_URL}{ADMIN_ENDPOINT}")
    print(f"Estimated time: {len(course_codes) * 3 / 60:.1f} minutes (3 sec per course)")
    print("-" * 80)
    
    # Send to backend
    url = f"{BACKEND_URL}{ADMIN_ENDPOINT}"
    headers = {'Content-Type': 'application/json'}
    
    try:
        print("Sending request to backend...")
        response = requests.put(url, json=course_codes, headers=headers, timeout=300)
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ Import complete!")
            print(f"  Success count: {result['successCount']}")
            print(f"  Error count: {result['errorCount']}")
            
            if result['errors']:
                print("\nErrors encountered:")
                for error in result['errors']:
                    print(f"  - {error}")
        else:
            print(f"\n✗ Backend error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
    
    except requests.exceptions.RequestException as e:
        print(f"\n✗ Network error: {e}")
        print("Is the backend running on http://localhost:8080?")
    
    print("-" * 80)
    print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def import_csv_directly(csv_file=CSV_FILE):
    """
    Import by reading CSV and updating courses individually.

    Strategy: GET each course first to retrieve all current fields, then
    merge the CSV data on top and PUT the full payload back.  This prevents
    the PUT endpoint from nulling out fields (name, code, color, etc.) that
    are not in the CSV.

    New fields supported (added alongside instructor/schedule):
    - description  (plain text)
    - credits      (integer)
    - semesters    (pipe-separated in CSV, sent as list to backend)

    Use this method if:
    - Backend scraper is rate-limited by Coursicle
    - You filled in coursicle_tier1_data.csv via manual_course_entry.py
    - You edited the CSV manually and want those exact values

    Advantage: Fast, uses exact CSV values, preserves all existing DB fields
    Disadvantage: Requires backend to be up for the initial GET per course
    """
    print("=" * 80)
    print("Coursicle Data Import - Direct CSV Method")
    print("=" * 80)
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            courses = list(reader)
    except FileNotFoundError:
        print(f"Error: {csv_file} not found. Run manual_course_entry.py (or scrape_coursicle.py) first.")
        return

    print(f"Found {len(courses)} courses in CSV")
    print("-" * 80)

    success_count = 0
    errors = []

    for i, course in enumerate(courses, 1):
        code = course['code']
        # Convert "CS 2010" → "cs2010" for URL path
        course_id = code.lower().replace(' ', '')
        url = f"{BACKEND_URL}/api/courses/{course_id}"
        headers = {'Content-Type': 'application/json'}

        # ── Step 1: GET current course data so we don't lose existing fields ──
        try:
            get_resp = requests.get(url, timeout=10)
        except requests.exceptions.RequestException as e:
            error_msg = f"{code}: GET failed – {e}"
            print(f"[{i}/{len(courses)}] ✗ {error_msg}")
            errors.append(error_msg)
            continue

        if get_resp.status_code != 200:
            error_msg = f"{code}: GET returned HTTP {get_resp.status_code}"
            print(f"[{i}/{len(courses)}] ✗ {error_msg}")
            errors.append(error_msg)
            continue

        current = get_resp.json()

        # ── Step 2: Merge CSV fields on top of current data ──────────────────
        # Always update instructor and schedule
        current['instructor'] = course['instructor']
        current['schedule'] = course['schedule']

        # Update description if present in CSV
        if course.get('description', '').strip():
            current['description'] = course['description'].strip()

        # Update credits if present and numeric
        if course.get('credits', '').strip():
            try:
                current['credits'] = int(course['credits'].strip())
            except ValueError:
                print(f"  Warning: non-numeric credits '{course['credits']}' for {code} – skipping credits")

        # Update semesters if present (pipe-separated in CSV → list for API)
        if course.get('semesters', '').strip():
            semester_list = [s.strip() for s in course['semesters'].split('|') if s.strip()]
            if semester_list:
                current['semesters'] = semester_list

        # Update raw prerequisite text if present
        if course.get('prerequisite_text', '').strip():
            current['prerequisiteText'] = course['prerequisite_text'].strip()

        # ── Step 3: PUT the full merged payload back ──────────────────────────
        try:
            put_resp = requests.put(url, json=current, headers=headers, timeout=10)

            if put_resp.status_code == 200:
                updated = put_resp.json()
                print(
                    f"[{i}/{len(courses)}] ✓ {code}"
                    f" | instructor={updated.get('instructor')}"
                    f" | credits={updated.get('credits')}"
                )
                success_count += 1
            else:
                error_msg = f"{code}: PUT returned HTTP {put_resp.status_code} – {put_resp.text[:100]}"
                print(f"[{i}/{len(courses)}] ✗ {error_msg}")
                errors.append(error_msg)
                continue  # don't attempt prerequisites if course update failed

        except requests.exceptions.RequestException as e:
            error_msg = f"{code}: PUT failed – {e}"
            print(f"[{i}/{len(courses)}] ✗ {error_msg}")
            errors.append(error_msg)
            continue

        # ── Step 4: PUT prerequisites to CourseInfo (separate entity) ─────────
        # Send typed PrerequisiteEntry JSON so the backend can store type
        # (PREREQUISITE / COREQUISITE / OTHER) alongside each course ID.
        if course.get('prerequisites', '').strip():
            prereq_list = [p.strip() for p in course['prerequisites'].split('|') if p.strip()]
            if prereq_list:
                prereq_payload = [{"courseId": p, "type": "PREREQUISITE"} for p in prereq_list]
                prereq_url = f"{BACKEND_URL}/api/admin/courses/course-info/{course_id}/prerequisites"
                try:
                    prereq_resp = requests.put(
                        prereq_url,
                        json=prereq_payload,
                        headers=headers,
                        timeout=10
                    )
                    if prereq_resp.status_code == 200:
                        print(f"           → prerequisites updated: {prereq_list}")
                    elif prereq_resp.status_code == 404:
                        print(f"           → ⚠ No CourseInfo record for {course_id} – prerequisites skipped")
                    else:
                        print(f"           → ⚠ Prerequisites HTTP {prereq_resp.status_code}: {prereq_resp.text[:80]}")
                except requests.exceptions.RequestException as e:
                    print(f"           → ⚠ Prerequisites PUT failed: {e}")

    print("-" * 80)
    print(f"✓ Successfully updated: {success_count}/{len(courses)} courses")
    if errors:
        print(f"✗ Errors: {len(errors)}")
        for error in errors:
            print(f"  - {error}")

    print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def verify_updates():
    """
    Verify that courses were updated successfully.

    Checks a few sample courses and prints instructor, schedule, credits,
    and description (truncated) to confirm the import worked.
    """
    print("\n" + "=" * 80)
    print("Verification: Checking Sample Courses")
    print("=" * 80)

    sample_courses = ['cs2010', 'cs2020', 'se3540']

    for course_id in sample_courses:
        try:
            url = f"{BACKEND_URL}/api/courses/{course_id}"
            response = requests.get(url, timeout=5)

            if response.status_code == 200:
                c = response.json()
                desc_preview = (c.get('description') or '')[:60].replace('\n', ' ')
                print(
                    f"{c.get('code', course_id):10}"
                    f" | {(c.get('instructor') or 'n/a'):25}"
                    f" | credits={c.get('credits', 'n/a')}"
                    f" | {(c.get('schedule') or 'n/a'):30}"
                    f" | desc={desc_preview!r}"
                )
            else:
                print(f"{course_id:10} | ✗ HTTP {response.status_code}")

        except requests.exceptions.RequestException as e:
            print(f"{course_id:10} | ✗ Error: {e}")

if __name__ == "__main__":
    import sys

    # Optional --file <path> to specify a different CSV (default: tier 1)
    # Usage examples:
    #   python scripts/import_coursicle_data.py --direct
    #   python scripts/import_coursicle_data.py --direct --file coursicle_tier2_data.csv
    if "--file" in sys.argv:
        idx = sys.argv.index("--file")
        if idx + 1 < len(sys.argv):
            CSV_FILE = sys.argv[idx + 1]
            print(f"Using CSV file: {CSV_FILE}")

    # Default: Use backend scraper method (recommended)
    if len(sys.argv) > 1 and sys.argv[1] == '--direct':
        print("Using DIRECT CSV import method (no re-scraping)")
        import_csv_directly(csv_file=CSV_FILE)
    else:
        print("Using BACKEND SCRAPER method (re-scrapes Coursicle)")
        print("(Use --direct flag for direct CSV import)")
        print()
        import_via_backend_scraper()
    
    # Always verify
    verify_updates()
    
    print("\n✓ Import complete!")
    print("\nNext steps:")
    print("1. Check frontend: http://localhost:5173/course/cs2010")
    print("2. Run SQL verification: SELECT code, instructor, schedule FROM courses WHERE instructor != 'Staff';")
    print("3. Continue with Tier 2 courses or monitor for errors")
