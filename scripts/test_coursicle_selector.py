#!/usr/bin/env python3
"""
Test Coursicle Selector Script - Updated for Text-Based Section Parsing

Purpose: Find the correct HTML structure for Coursicle by searching for
         section headings visible on the page (Recent Professors, Usually
         Offered, Credits, Description, Recent Semesters).

This script:
1. Scrapes CS 2010 and prints ALL heading elements found
2. Searches for known section titles by text content
3. Extracts and prints the content following each section heading
4. Dumps relevant body HTML for manual inspection

Run: python scripts/test_coursicle_selector.py

Dependencies: pip install beautifulsoup4 requests
"""

import re
import requests
from bs4 import BeautifulSoup, NavigableString

# Test with CS 2010 (Programming Fundamentals)
TEST_SUBJECT = "CS"
TEST_NUMBER = "2010"

# Section headings visible on Coursicle course pages
KNOWN_SECTIONS = [
    "Recent Professors",
    "Recent Semesters",
    "Credits",
    "Description",
    "Usually Offered",
    "Professor Reviews",
]

def find_section_content(soup, heading_text):
    """Find a section by its heading text and return the following content."""
    # Search all heading-level tags and common label tags
    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'strong', 'p', 'div', 'span']):
        if tag.get_text(strip=True) == heading_text:
            # Try next sibling
            sibling = tag.find_next_sibling()
            if sibling:
                return sibling.get_text(separator=' ', strip=True)
            # Try parent's next sibling
            parent = tag.parent
            if parent:
                parent_sibling = parent.find_next_sibling()
                if parent_sibling:
                    return parent_sibling.get_text(separator=' ', strip=True)
    return None

def find_all_headings(soup):
    """Return all heading-level elements with their text."""
    headings = []
    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
        text = tag.get_text(strip=True)
        if text:
            headings.append((tag.name, text, str(tag)[:200]))
    return headings

def find_professor_links(soup):
    """Find all links that look like professor profile links."""
    prof_links = soup.find_all('a', href=re.compile(r'/bgsu/professor/'))
    return [a.get_text(strip=True) for a in prof_links]

def test_coursicle_selectors():
    url = f"https://www.coursicle.com/bgsu/courses/{TEST_SUBJECT}/{TEST_NUMBER}/"
    
    print(f"Testing Coursicle selectors for {TEST_SUBJECT} {TEST_NUMBER}")
    print(f"URL: {url}")
    print("-" * 80)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print(f"HTTP Status: {response.status_code}")
        print(f"Total HTML length: {len(response.text)} characters")
        
        if response.status_code != 200:
            print(f"Error: Received status code {response.status_code}")
            return
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        title = soup.find('title')
        if title:
            print(f"Page Title: {title.text.strip()}")
        
        # ====================================================================
        print("\n" + "=" * 80)
        print("ALL HEADING TAGS FOUND ON PAGE (h1-h6)")
        print("=" * 80)
        headings = find_all_headings(soup)
        if headings:
            for tag_name, text, html_sample in headings:
                print(f"  <{tag_name}>: {text}")
                print(f"    HTML: {html_sample}")
        else:
            print("  NO heading tags found - content may be JavaScript-rendered")
        
        # ====================================================================
        print("\n" + "=" * 80)
        print("SEARCHING FOR KNOWN SECTION HEADINGS (by text content)")
        print("=" * 80)
        for section_name in KNOWN_SECTIONS:
            content = find_section_content(soup, section_name)
            if content:
                print(f"  ✓ FOUND '{section_name}':")
                print(f"    → {content[:300]}")
            else:
                print(f"  ✗ NOT FOUND: '{section_name}'")
        
        # ====================================================================
        print("\n" + "=" * 80)
        print("PROFESSOR LINKS (/bgsu/professor/... hrefs)")
        print("=" * 80)
        profs = find_professor_links(soup)
        if profs:
            print(f"  ✓ FOUND {len(profs)} professor link(s):")
            for p in profs[:10]:
                print(f"    - {p}")
        else:
            print("  ✗ No /bgsu/professor/ links found")
        
        # ====================================================================
        print("\n" + "=" * 80)
        print("ALL BODY TEXT BLOCKS (>20 chars, not scripts/styles)")
        print("=" * 80)
        body = soup.find('body')
        body_has_text = False
        if body:
            texts = []
            for elem in body.find_all(string=True):
                if elem.parent.name in ['script', 'style', 'meta']:
                    continue
                text = elem.strip()
                if len(text) > 20:
                    texts.append(text)
            if texts:
                body_has_text = True
                print(f"  Found {len(texts)} text blocks. Showing first 30:")
                for t in texts[:30]:
                    print(f"    | {t[:120]}")
            else:
                print("  NO body text found - page is JavaScript-rendered")
                print("  → Jsoup will NOT work. Need Playwright or Selenium.")
        else:
            print("  NO <body> tag found in parsed HTML")
        
        # ====================================================================
        print("\n" + "=" * 80)
        print("BODY HTML SAMPLE (chars 2000-6000)")
        print("=" * 80)
        print(response.text[2000:6000])
        
        print("\n" + "=" * 80)
        print("DIAGNOSIS")
        print("=" * 80)
        if body_has_text:
            print("  ✓ Content IS in initial HTML (server-side rendered)")
            print("  → Jsoup scraping will work - use section heading approach above")
        else:
            print("  ✗ Content NOT in initial HTML (JavaScript-rendered SPA)")
            print("  → Jsoup will NOT work for this approach")
            print("  → Options:")
            print("     1. Use Playwright (pip install playwright)")
            print("     2. Find Coursicle's internal API endpoint")
            print("     3. Manually curate course data in a JSON/CSV file")
            print("     4. Use a headless browser (Selenium + ChromeDriver)")
        
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    test_coursicle_selectors()
