#!/usr/bin/env python3
"""
Coursicle Data Scraper - Tier 1 Courses

Purpose: Scrape real course data from Coursicle.com for BGSU courses.

Approach: Coursicle pages are server-side rendered PHP with no meaningful CSS classes
          on data fields. We find data by locating known section-heading labels
          (e.g., "Recent Professors", "Usually Offered") and reading the text of
          the immediately following sibling element. JSON-LD structured data is used
          as the primary source for description and credits.

Fields extracted per course:
  - instructor  : first name from "Recent Professors" section
  - schedule    : text from "Usually Offered" section
  - description : from JSON-LD (most reliable)
  - credits     : from JSON-LD numberOfCredits
  - semesters   : comma-list from "Recent Semesters" section

Run: python scripts/scrape_coursicle.py

Output: coursicle_tier1_data.csv

Dependencies: pip install beautifulsoup4 requests
"""

import json
import re
import requests
from bs4 import BeautifulSoup
import csv
import time
from datetime import datetime

# Tier 1: 15 SE Core Requirements (highest priority)
TIER_1_COURSES = [
    ("CS", "2010"),   # Programming Fundamentals
    ("CS", "2900"),   # CS Freshman Seminar
    ("CS", "2020"),   # Data Structures
    ("CS", "2420"),   # Discrete Structures I
    ("CS", "3040"),   # Computer Organization
    ("CS", "3350"),   # Algorithms and Complexity
    ("CS", "3450"),   # Intro to Software Engineering
    ("SE", "3540"),   # Software Engineering I
    ("CS", "4210"),   # Operating Systems I
    ("CS", "4250"),   # Computer Networks
    ("SE", "4510"),   # Software Project Management
    ("SE", "4550"),   # Software Architecture
    ("SE", "4560"),   # Software Quality Assurance
    ("SE", "4770"),   # Software Engineering Capstone
    ("CS", "4900"),   # Professional Practice Seminar
]

COURSICLE_BASE_URL = "https://www.coursicle.com/bgsu/courses"
# Use a real browser user-agent – Coursicle may reject bot user-agents
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
RATE_LIMIT_DELAY = 3  # seconds between requests


# ---------------------------------------------------------------------------
# Parsing helpers — mirror the Java CoursicleScraperService logic
# ---------------------------------------------------------------------------

def find_section_content(soup, heading_text):
    """
    Locate a section by its exact heading text and return the text content
    of the immediately following sibling element.

    Coursicle renders sections as:
        <b>Recent Professors</b>
        <div>Tianyi Song , Rob Green , ...</div>
    or occasionally with an extra wrapper div. We check both the direct next
    sibling and the parent element's next sibling.
    """
    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                               'b', 'strong', 'p', 'div', 'span']):
        if tag.get_text(strip=True) == heading_text:
            # Try next element sibling
            sibling = tag.find_next_sibling()
            if sibling:
                text = sibling.get_text(separator=' ', strip=True)
                if text:
                    return text
            # Try parent's next sibling (heading wrapped in container)
            parent = tag.parent
            if parent:
                parent_sib = parent.find_next_sibling()
                if parent_sib:
                    text = parent_sib.get_text(separator=' ', strip=True)
                    if text:
                        return text
    return None


def extract_json_ld(soup):
    """Return the parsed JSON-LD object from the page, or None."""
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            return json.loads(script.string or script.get_text())
        except Exception:
            pass
    return None


def parse_course_data(soup, code):
    """Extract all available fields from a parsed Coursicle page."""
    json_ld = extract_json_ld(soup)

    # --- instructor ---
    instructor = 'Staff'
    raw = find_section_content(soup, 'Recent Professors')
    if raw:
        first = raw.split(',')[0].strip()
        if first:
            instructor = first

    # --- schedule ---
    schedule = 'TBA'
    raw = find_section_content(soup, 'Usually Offered')
    if raw:
        schedule = raw

    # --- description (JSON-LD primary, section fallback) ---
    description = None
    if json_ld and json_ld.get('description'):
        description = json_ld['description'].strip()
    if not description:
        description = find_section_content(soup, 'Description')

    # --- credits (JSON-LD primary, section fallback) ---
    credits = None
    if json_ld and json_ld.get('numberOfCredits'):
        try:
            credits = int(json_ld['numberOfCredits'])
        except (ValueError, TypeError):
            pass
    if credits is None:
        raw = find_section_content(soup, 'Credits')
        if raw:
            try:
                credits = int(raw.strip())
            except (ValueError, TypeError):
                pass

    # --- semesters ---
    semesters = []
    raw = find_section_content(soup, 'Recent Semesters')
    if raw:
        semesters = [s.strip() for s in raw.split(',') if s.strip()]

    return {
        'code': code,
        'instructor': instructor,
        'schedule': schedule,
        'description': description or '',
        'credits': credits,
        'semesters': '|'.join(semesters),  # pipe-separated for CSV
    }


# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

def scrape_coursicle(subject, number):
    """Scrape a single course. Returns a data dict or None on failure."""
    url = f"{COURSICLE_BASE_URL}/{subject}/{number}/"
    code = f"{subject} {number}"

    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)

        if response.status_code == 429:
            wait_sec = 180  # 3-minute backoff
            print(f"  ⚠ Rate limited (429)! Waiting {wait_sec}s before retry...", flush=True)
            time.sleep(wait_sec)
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code == 429:
                print("  ✗ Still rate-limited after backoff — skipping")
                return None

        if response.status_code != 200:
            print(f"  ✗ HTTP {response.status_code}")
            return None

        soup = BeautifulSoup(response.content, 'html.parser')
        return parse_course_data(soup, code)

    except requests.exceptions.RequestException as e:
        print(f"  ✗ Network error: {e}")
        return None
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def main():
    """Main scraping workflow"""
    print("=" * 80)
    print("Coursicle Data Scraper - Tier 1 SE Core Courses")
    print("=" * 80)
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Courses to scrape: {len(TIER_1_COURSES)}")
    print(f"Rate limit delay: {RATE_LIMIT_DELAY} seconds")
    print(f"Estimated time: ~{len(TIER_1_COURSES) * RATE_LIMIT_DELAY // 60 + 1} minutes")
    print("Fields captured: instructor, schedule, description, credits, semesters")
    print()
    print("⚠ NOTE: If you just ran a test script, wait 5 minutes before running")
    print("  this scraper to avoid Coursicle rate-limiting (HTTP 429).")
    print("-" * 80)
    # Small startup delay to ensure we're clear of any recent burst
    time.sleep(2)

    enhanced_data = []
    success_count = 0

    for i, (subject, number) in enumerate(TIER_1_COURSES, 1):
        code = f"{subject} {number}"
        print(f"[{i:2}/{len(TIER_1_COURSES)}] Scraping {code}...", end=" ", flush=True)

        data = scrape_coursicle(subject, number)

        if data and data.get('instructor') != 'Staff':
            enhanced_data.append(data)
            success_count += 1
            credits_label = f"{data['credits']}cr" if data['credits'] else "?cr"
            sems_count = len(data['semesters'].split('|')) if data['semesters'] else 0
            print(f"✓ {data['instructor'][:28]:28} | {data['schedule'][:30]:30} | {credits_label} | {sems_count} semesters")
        elif data:
            # Scraped OK but no instructor found
            enhanced_data.append(data)
            print(f"⚠ No instructor found — instructor='Staff', schedule='{data['schedule']}'")
        else:
            print("✗ FAILED — using placeholders")
            enhanced_data.append({
                'code': code,
                'instructor': 'Staff',
                'schedule': 'TBA',
                'description': '',
                'credits': None,
                'semesters': '',
            })

        # Rate limiting (don't wait after last course)
        if i < len(TIER_1_COURSES):
            time.sleep(RATE_LIMIT_DELAY)

    # Export to CSV
    output_file = 'coursicle_tier1_data.csv'
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['code', 'instructor', 'schedule', 'description', 'credits', 'semesters']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(enhanced_data)

    # Summary
    print("-" * 80)
    print(f"End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"✓ Successfully scraped with real data: {success_count}/{len(TIER_1_COURSES)} courses")
    print(f"✓ Saved to: {output_file}")
    print()
    print("Next steps:")
    print("1. Review the CSV:    type coursicle_tier1_data.csv")
    print("2. Import to backend: python scripts/import_coursicle_data.py")
    print("3. Verify endpoint:   curl http://localhost:8080/api/courses/cs2010")

if __name__ == "__main__":
    main()
