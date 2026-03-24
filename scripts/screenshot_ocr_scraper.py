#!/usr/bin/env python3
"""
Screenshot + OCR Course Data Scraper

Workflow per course:
  1. Opens the Coursicle page in your browser
  2. You solve the CAPTCHA (if shown), then scroll to see all sections
  3. Press Enter → script takes a full-screen screenshot
  4. Tesseract OCR extracts the text automatically
  5. Script parses: instructor, schedule, credits, semesters,
                    description (content only), prerequisite codes
  6. You review the parsed values and correct any OCR errors
  7. Saved to CSV; script moves to the next course

Resume: re-run the script — already-entered courses are skipped.
Import: python scripts/import_coursicle_data.py --direct

Dependencies (install once):
    pip install pytesseract Pillow pyautogui

Tesseract binary (install once on Windows):
    winget install UB-Mannheim.TesseractOCR
    — or download from https://github.com/UB-Mannheim/tesseract/wiki
    Default path: C:\\Program Files\\Tesseract-OCR\\tesseract.exe
"""

import csv
import os
import re
import shutil
import sys
import time
import webbrowser
from pathlib import Path

# ── Readline pre-fill (edit-in-place for prompts) ───────────────────────────
# On Linux/Mac 'readline' is built in. On Windows install pyreadline3:
#   pip install pyreadline3
try:
    import readline as _readline
    _READLINE = True
except ImportError:
    _READLINE = False

# ── Tesseract path setup ────────────────────────────────────────────────────
try:
    import pytesseract
    from PIL import Image

    # Auto-detect Tesseract on PATH; fall back to common Windows install path
    if not shutil.which("tesseract"):
        fallback = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.exists(fallback):
            pytesseract.pytesseract.tesseract_cmd = fallback
        else:
            print("ERROR: Tesseract not found.")
            print("Install it: winget install UB-Mannheim.TesseractOCR")
            print("Then re-run this script.")
            sys.exit(1)
    OCR_AVAILABLE = True

except ImportError:
    OCR_AVAILABLE = False
    print("WARNING: pytesseract or Pillow not installed.")
    print("Falling back to manual entry (no screenshot/OCR).")
    print("To enable OCR: pip install pytesseract Pillow pyautogui")
    print()

try:
    import pyautogui
    SCREENSHOT_AVAILABLE = True
except ImportError:
    SCREENSHOT_AVAILABLE = False

# ── Course list ──────────────────────────────────────────────────────────────
TIER_1_COURSES = [
    ("CS", "1010", "Introduction to Python Programming"),
    ("CS", "2010", "Programming Fundamentals"),
    ("CS", "2020", "Intermediate Programming"),
    ("CS", "2190", "Computer Organization"),
    ("CS", "2900", "Career Preparation in Computing Fields"),
    ("CS", "3000", "Professional and Societal Issues in Computing"),
    ("CS", "3080", "Operating Systems"),
    ("CS", "3210", "Introduction to Software Security"),
    ("CS", "3350", "Data Structures"),
    ("SE", "3540", "Introduction to Software Engineering"),
    ("CS", "3900", "Internship in Computer Science"),
    ("CS", "4390", "Network Architecture and Applications"),
    ("SE", "4550", "Software Architecture and Design"),
    ("SE", "4560", "Software Testing and Quality Assurance"),
    ("CS", "4620", "Database Management Systems"),
    ("SE", "4770", "Software Engineering Capstone Experience"),
]

# Tier 2: SE Electives (choose 3 from this list)
TIER_2_COURSES = [
    ("CS", "3060", "Programming Languages"),
    ("CS", "3140", "Web Application Development"),
    ("CS", "3160", "Windows Application Development"),
    ("CS", "3180", "Mobile Application Development"),
    ("CS", "3240", "Usability Engineering"),
    ("CS", "4120", "Design and Analysis of Algorithms"),
    ("CS", "3800", "Special Topics in Computer Science"),
    ("CS", "4800", "Seminar in Computer Applications"),
]

TIER_OUTPUT = {
    1: "coursicle_tier1_data.csv",
    2: "coursicle_tier2_data.csv",
    3: "coursicle_tier3_data.csv",
    4: "coursicle_tier4_data.csv",
    5: "coursicle_tier5_data.csv",
}

# Tier 3: Mathematics and Science requirements
TIER_3_COURSES = [
    # Entry-level math (prerequisites for Calculus I)
    ("MATH", "1150", "Introduction to Statistics"),
    ("MATH", "1190", "Real World Math Skills"),
    ("MATH", "1220", "College Algebra"),
    ("MATH", "1280", "Pre-Calculus Mathematics"),
    ("MATH", "1290", "Trigonometry"),
    # Calculus I (one or the other path)
    ("MATH", "1310", "Calculus and Analytic Geometry"),
    ("MATH", "1340", "Calculus and Analytic Geometry IA"),
    ("MATH", "1350", "Calculus and Analytic Geometry IB"),
    # Discrete Mathematics (one or the other)
    ("MATH", "2220", "Discrete Mathematics"),
    ("MATH", "3220", "Discrete Mathematics"),
    # Statistics (one path or both BA courses)
    ("MATH", "2470", "Fundamentals of Statistics"),
    ("MATH", "3410", "Principles of Probability and Statistics"),
    ("BA",   "1600", "Business Mathematics and Computational Calculus"),
    ("BA",   "2050", "Data Computing and Numerical Literacy"),
    ("BA",   "2110", "Business Analytics III: Descriptive Analytics"),
    ("BA",   "2120", "Business Statistics"),
    ("BIZX", "2200", "Applied Business Statistics Experience"),
    # Additional Math electives
    ("MATH", "2320", "Calculus and Analytic Geometry II"),
    ("MATH", "3280", "Mathematical Foundations and Techniques"),
    ("MATH", "3320", "Elementary Linear Algebra"),
    ("MATH", "3430", "Computing with Data"),
]

# Tier 4: BG Perspective (general education) courses
TIER_4_COURSES = [
    # ── English Composition and Oral Communication ──────────────────────────
    ("COMM", "1020", "Introduction to Public Speaking"),
    ("WRIT", "1110", "Seminar in Academic Writing"),
    ("WRIT", "1120", "Seminar in Research Writing"),

    # ── Quantitative Literacy (not already in Tier 3) ───────────────────────
    ("MATH", "1230", "Mathematics for Architecture/Construction"),
    ("POLS", "2900", "Statistics and Research Methods"),
    ("PSYC", "2700", "Quantitative Methods I"),
    ("SOC",  "2690", "Introductory Statistics"),

    # ── Humanities and the Arts ─────────────────────────────────────────────
    ("ACS",  "2000", "Introduction to American Culture Studies"),
    ("ACS",  "2500", "Cultural Pluralism in the United States"),
    ("ARCH", "2330", "History of Architecture I"),
    ("ARCH", "2340", "History of Architecture II"),
    ("ART",  "1010", "Introduction to Art"),
    ("ARTH", "1450", "Western Art I"),
    ("ARTH", "1460", "Western Art II"),
    ("ARTH", "2700", "Survey of World Art"),
    ("CLCV", "2410", "Great Greek Minds"),
    ("CLCV", "2420", "Great Roman Minds"),
    ("CLCV", "3800", "Classical Mythology"),
    ("ENG",  "1500", "Literature and Culture"),
    ("ENG",  "2010", "Introduction to Literature"),
    ("ENG",  "2110", "African-American Literature"),
    ("ENG",  "2120", "Native American and Indigenous Literatures"),
    ("ENG",  "2610", "World Literature from Ancient Times to 1700"),
    ("ENG",  "2620", "World Literature from 1700 to Present"),
    ("ENG",  "2640", "British Literature Survey to 1660"),
    ("ENG",  "2650", "British Literature Survey, 1660-Present"),
    ("ENG",  "2740", "Survey of American Literature to 1865"),
    ("ENG",  "2750", "Survey of American Literature, 1865-Present"),
    ("ETHN", "2200", "Introduction to African Literature"),
    ("FILM", "1610", "Introduction to Film"),
    ("FREN", "2010", "Intermediate French I"),
    ("FREN", "2020", "Intermediate French II"),
    ("FREN", "2220", "French Culture"),
    ("GERM", "2010", "Intermediate German I"),
    ("GERM", "2020", "Intermediate German II"),
    ("GERM", "2150", "German Culture and Civilization"),
    ("GERM", "2160", "Contemporary Germany"),
    ("HNRS", "2020", "Critical Thinking in Humanities and the Arts"),
    ("HNRS", "2600", "Critical Thinking for the Public Good"),
    ("ITAL", "2620", "Italian-American Experience: Mafia, Migration, and the Movies"),
    ("MUCT", "1010", "Exploring Music"),
    ("MUCT", "1250", "Exploring Music of World Cultures"),
    ("MUCT", "2220", "Turning Points: Arts and Humanities in Context"),
    ("MUCT", "2610", "Music History I"),
    ("PHIL", "1010", "Introduction to Philosophy"),
    ("PHIL", "1020", "Introduction to Ethics"),
    ("PHIL", "1030", "Introduction to Logic"),
    ("PHIL", "1250", "Contemporary Moral Issues"),
    ("PHIL", "2190", "Philosophy of Death and Dying"),
    ("PHIL", "2320", "Environmental Ethics"),
    ("PHIL", "2420", "Medical Ethics"),
    ("POPC", "1600", "Introduction to Popular Culture"),
    ("POPC", "1650", "Popular Culture and Media"),
    ("POPC", "1700", "Black Popular Culture"),
    ("POPC", "2200", "Introduction to Folklore and Folklife"),
    ("RUSN", "2150", "Russian Culture"),
    ("RUSN", "2160", "Post-Communist Russia"),
    ("SPAN", "2010", "Intermediate Spanish I"),
    ("SPAN", "2020", "Intermediate Spanish II"),
    ("SPAN", "2030", "Intermediate Spanish for the Professions"),
    ("SPAN", "2700", "Hispanic Culture"),
    ("THEA", "1410", "The Theatre Experience"),
    ("THEA", "2020", "Performance in Life & on Stage"),
    ("THFM", "2150", "Exploring Cultural Diversity Through Performance"),
    ("WS",   "2000", "Introduction to Women's Studies: Perspectives on Gender, Class and Ethnicity"),

    # ── Social and Behavioral Sciences ──────────────────────────────────────
    ("AFRS", "2000", "Introduction to Africana Studies"),
    ("ASIA", "1800", "Asian Civilizations"),
    ("ASIA", "2000", "Introduction to Asian Religion"),
    ("CAST", "2010", "Introduction to Canadian Studies"),
    ("CDIS", "1230", "Introduction to Communication Disorders"),
    ("ECON", "2000", "Introduction to Economics"),
    ("ECON", "2020", "Principles of Microeconomics"),
    ("ECON", "2030", "Principles of Macroeconomics"),
    ("EDFI", "2980", "Schools, Society, and Cultural Diversity"),
    ("EIEC", "2210", "Cultural and Linguistic Diversity in Early Childhood Education"),
    ("ENVS", "1010", "Introduction to Environmental Studies"),
    ("ETHN", "1010", "Introduction to Ethnic Studies"),
    ("ETHN", "1100", "Introduction to Latina/o Studies"),
    ("ETHN", "1200", "Introduction to African American Studies"),
    ("ETHN", "1300", "Introduction to Asian American Studies"),
    ("ETHN", "1600", "Introduction to Native American Studies"),
    ("ETHN", "2010", "Ethnicity and Social Movements"),
    ("ETHN", "2600", "Contemporary Issues in Native America"),
    ("GEOG", "1210", "World Geography: Eurasia and Africa"),
    ("GEOG", "1220", "World Geography: Americas and the Pacific"),
    ("GEOG", "2300", "Cultural Geography"),
    ("GERO", "1010", "Aging, the Individual and Society"),
    ("HDFS", "1930", "Lifespan Human Development"),
    ("HDFS", "2020", "Contemporary Marriages and Families"),
    ("HIST", "1250", "Early America"),
    ("HIST", "1260", "Modern America"),
    ("HIST", "1510", "World Civilizations"),
    ("HIST", "1520", "The Modern World"),
    ("HNRS", "2010", "Introduction to Critical Thinking"),
    ("HNRS", "2400", "Critical Thinking in Business and the Workforce"),
    ("INST", "2000", "Introduction to International Studies"),
    ("MDIA", "1030", "Media and the Information Society"),
    ("MDIA", "3520", "Social Media and Society"),
    ("POLS", "1100", "American Government: Processes and Structure"),
    ("POLS", "1710", "Introduction to Comparative Government"),
    ("POLS", "1720", "Introduction to International Relations"),
    ("PSYC", "1010", "General Psychology"),
    ("SOC",  "1010", "Principles of Sociology"),
    ("SOC",  "2020", "Social Problems"),
    ("SOC",  "2120", "Population and Society"),
    ("SOC",  "2160", "Race, Ethnicity & Inequality"),
    ("SOC",  "2310", "Cultural Anthropology"),
    ("TECH", "3020", "Technology Systems in Societies"),
    ("EDTL", "2010", "Introduction to Teaching and Learning"),

    # ── Natural Sciences ─────────────────────────────────────────────────────
    ("ASTR", "1010", "Experimental Astronomy"),
    ("ASTR", "2010", "Modern Astronomy"),
    ("ASTR", "2120", "The Solar System"),
    ("BIOL", "1010", "Environment of Life"),
    ("BIOL", "1040", "Introduction to Biology"),
    ("BIOL", "1080", "Life in the Sea"),
    ("BIOL", "2040", "Concepts in Biology I"),
    ("BIOL", "2050", "Concepts in Biology II"),
    ("CHEM", "1000", "Introduction to Chemistry"),
    ("CHEM", "1090", "Elementary Chemistry"),
    ("CHEM", "1100", "Elementary Chemistry Laboratory"),
    ("CHEM", "1230", "General Chemistry I"),
    ("CHEM", "1240", "General Chemistry I Laboratory"),
    ("CHEM", "1350", "General Chemistry"),
    ("FN",   "2070", "Introduction to Human Nutrition"),
    ("FN",   "2080", "Introduction to Human Nutrition Laboratory"),
    ("GEOG", "1250", "Weather and Climate"),
    ("GEOG", "1260", "Weather Studies Laboratory"),
    ("GEOL", "1000", "Introduction to Geology"),
    ("GEOL", "1040", "Earth Environments"),
    ("GEOL", "1050", "Life Through Time"),
    ("GEOL", "2150", "Geologic History of Dinosaurs"),
    ("HNRS", "2500", "Critical Thinking in STEM"),
    ("PHYS", "1010", "Basic Physics"),
    ("PHYS", "2010", "College Physics I"),
    ("PHYS", "2020", "College Physics II"),
    ("PHYS", "2110", "University Physics I"),
    ("PHYS", "2120", "University Physics II"),
    ("SEES", "2220", "Water Resources and Issues"),
]

# Tier 5: Foreign Language requirements
# NOTE: courses marked (in T4) are also listed in Tier 4 and already scraped.
TIER_5_COURSES = [
    # ── American Sign Language ────────────────────────────────────────────
    ("ASL",  "1010", "American Sign Language I"),
    ("ASL",  "1020", "American Sign Language II"),
    ("ASL",  "2010", "American Sign Language III"),
    ("ASL",  "2020", "American Sign Language IV"),

    # ── Chinese ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
    ("CHIN", "1010", "Elementary Language and Culture I"),
    ("CHIN", "1020", "Elementary Language and Culture II"),
    ("CHIN", "2010", "Intermediate Chinese I"),
    ("CHIN", "2020", "Intermediate Chinese II"),
    ("CHIN", "2160", "Contemporary Chinese Culture"),
    ("CHIN", "3120", "Introduction to Chinese Literature"),
    ("CHIN", "4150", "Chinese Film"),

    # ── French ────────────────────────────────────────────────────────────
    ("FREN", "1010", "Elementary French I"),
    ("FREN", "1020", "Elementary French II"),
    # FREN 2010, 2020 already in Tier 4 (Humanities/IP)
    ("FREN", "2120", "French for the 21st Century"),

    # ── German ────────────────────────────────────────────────────────────
    ("GERM", "1010", "Elementary Language and Culture I"),
    ("GERM", "1020", "Elementary Language and Culture II"),
    # GERM 2010, 2020, 2150, 2160 already in Tier 4 (Humanities/IP)
    ("GERM", "2150", "German Culture and Civilization"),
    ("GERM", "2160", "Contemporary Germany"),
    ("GERM", "3110", "Introduction to German Literature"),
    ("GERM", "3800", "Topics in German Language, Thought, or Culture"),
    ("GERM", "4150", "The German Film"),

    # ── Greek ─────────────────────────────────────────────────────────────
    ("GRK",  "1010", "Elementary Greek I"),
    ("GRK",  "1020", "Elementary Greek II"),
    ("GRK",  "2010", "Intermediate Greek I"),
    ("GRK",  "2020", "Intermediate Greek II"),

    # ── Italian ───────────────────────────────────────────────────────────
    ("ITAL", "1010", "Elementary Italian I"),
    ("ITAL", "1020", "Elementary Italian II"),
    ("ITAL", "2010", "Intermediate Italian I"),
    ("ITAL", "2020", "Intermediate Italian II"),
    # ITAL 2620 already in Tier 4 (Humanities/CD)

    # ── Japanese ──────────────────────────────────────────────────────────
    ("JAPN", "1010", "Elementary Language and Culture I"),
    ("JAPN", "1020", "Elementary Language and Culture II"),
    ("JAPN", "2010", "Intermediate Japanese I"),
    ("JAPN", "2020", "Intermediate Japanese II"),
    ("JAPN", "2150", "Japanese Culture "),
    ("JAPN", "2160", "Contemporary Japanese Society"),
    ("JAPN", "3120", "Introduction to Japanese Literature"),
    ("JAPN", "4150", "Japanese Film"),

    # ── Latin ─────────────────────────────────────────────────────────────
    ("LAT",  "1010", "Elementary Language and Culture I"),
    ("LAT",  "1020", "Elementary Language and Culture II"),
    ("LAT",  "2010", "Intermediate Latin I"),
    ("LAT",  "2020", "Intermediate Latin II"),

    # ── Russian ───────────────────────────────────────────────────────────
    ("RUSN", "1010", "Elementary Language and Culture I"),
    ("RUSN", "1020", "Elementary Language and Culture II"),
    # RUSN 2010 listed below (not in T4)
    ("RUSN", "2010", "Intermediate Russian I"),
    ("RUSN", "2020", "Intermediate Russian II"),
    # RUSN 2150, 2160 already in Tier 4 (Humanities/IP)
    ("RUSN", "3120", "Introduction to Russian Literature"),
    ("RUSN", "3160", "Contemporary European Societies and Culture"),

    # ── Spanish ───────────────────────────────────────────────────────────
    ("SPAN", "1010", "Elementary Spanish I"),
    ("SPAN", "1020", "Elementary Spanish II"),
    # SPAN 2010, 2020, 2030 already in Tier 4 (Humanities/IP)
    ("SPAN", "2120", "Spanish Cultural Readings IV"),
]
COURSICLE_BASE = "https://www.coursicle.com/bgsu/courses"
CSV_FIELDS = ["code", "instructor", "schedule", "description",
              "credits", "semesters", "prerequisites", "prerequisite_text"]

# ── OCR text parsing ─────────────────────────────────────────────────────────

# These map Coursicle section headings (lowercased) → dict key
SECTION_HEADINGS = {
    "recent professors": "professors_text",
    "usually offered":   "schedule_text",
    "credits":           "credits_text",
    "recent semesters":  "semesters_text",
    "description":       "description_text",
    "prerequisite":      "prereq_text",      # catches "Prerequisite:" lines too
    "corequisite":       "prereq_text",
}


def take_screenshot(delay: int = 5) -> "Image.Image | None":
    """
    Countdown then take a full-screen screenshot.

    The countdown gives you time to Alt+Tab to the browser window
    so the screenshot captures the Coursicle page, not the terminal.
    """
    if not SCREENSHOT_AVAILABLE or not OCR_AVAILABLE:
        return None
    try:
        print(f"  📷  Switch to your browser NOW — screenshot in {delay} seconds...")
        for i in range(delay, 0, -1):
            print(f"      {i}...", end="\r", flush=True)
            time.sleep(1)
        print("      📸 Capturing!          ")
        img = pyautogui.screenshot()
        print("  ✓  Screenshot captured. You can switch back to the terminal.")
        return img
    except Exception as e:
        print(f"  ⚠  Screenshot failed: {e}")
        return None


def ocr_image(img: "Image.Image") -> str:
    """Run Tesseract OCR on a PIL Image and return the raw text."""
    if not OCR_AVAILABLE or img is None:
        return ""
    try:
        # Scale up slightly helps Tesseract accuracy on 1080p screens
        w, h = img.size
        img_resized = img.resize((w * 2, h * 2), Image.LANCZOS)
        text = pytesseract.image_to_string(img_resized, lang="eng")
        return text
    except Exception as e:
        print(f"  ⚠  OCR failed: {e}")
        return ""


def parse_ocr_sections(text: str) -> dict:
    """
    Split OCR text into named sections using Coursicle heading keywords.

    Key rules:
    - A heading starts a new section ONLY if its key differs from the current key.
    - If the new heading maps to the SAME key (e.g. both 'prerequisite' and
      'corequisite' map to 'prereq_text'), keep appending to the current section
      so the full multi-sentence paragraph is preserved.
    - Content that appears before a heading on the same line is saved to the
      current section first.
    - The heading word itself is kept when appending within the same section
      so the full sentence (e.g. '...together with a COREQUISITE of MATH 1220')
      remains intact.
    """
    sections: dict[str, str] = {}
    current_key: str | None = None
    current_lines: list[str] = []

    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if not line:
            continue

        line_lower = line.lower()
        matched_key = None
        matched_heading = None
        for heading, key in SECTION_HEADINGS.items():
            if heading in line_lower:
                matched_key = key
                matched_heading = heading
                break

        if matched_key and matched_heading:
            heading_pos    = line_lower.find(matched_heading)
            before_heading = line[:heading_pos].strip()
            # Text that follows the heading keyword on the same line:
            # - after_content: heading word stripped (used when opening a new section)
            # - after_heading: heading word kept   (used when appending within same section,
            #   because the keyword may be mid-sentence, e.g. "...COREQUISITE of MATH 1220")
            after_content = line[heading_pos + len(matched_heading):].strip(" :")
            after_heading = line[heading_pos:].strip(" :")

            if matched_key == current_key:
                # Same logical section (e.g. 'corequisite' inside the prereq
                # paragraph) — keep appending so we don't lose earlier content.
                if before_heading:
                    current_lines.append(before_heading)
                if after_heading:
                    current_lines.append(after_heading)
            else:
                # Genuinely new section — strip heading word from the content.
                if before_heading and current_key is not None:
                    current_lines.append(before_heading)
                if current_key is not None:
                    sections[current_key] = " ".join(current_lines).strip()
                current_key   = matched_key
                current_lines = [after_content] if after_content else []
        elif current_key is not None:
            current_lines.append(line)

    if current_key is not None:
        sections[current_key] = " ".join(current_lines).strip()

    return sections


def extract_instructor(sections: dict) -> str:
    """First name from 'Recent Professors' — comma-separated list, take first."""
    raw = sections.get("professors_text", "")
    if not raw:
        return "Staff"
    first = raw.split(",")[0].strip()
    return first if first else "Staff"


def extract_schedule(sections: dict) -> str:
    """
    Extract schedule and truncate at the last valid time token.

    Valid endings: "minutes)" or "hours)" or "hour)"
    This prevents OCR taskbar garbage (clock, system tray) from
    being included when it appears on the same screen region.
    """
    raw = sections.get("schedule_text", "").strip()
    if not raw:
        return "TBA"
    # Find the last occurrence of a closing time token
    # e.g. "MWF (50 minutes), TuTh (1 hour 15 minutes) <garbage>"
    m = re.search(r".*?((?:minutes|hours?)\))", raw, re.IGNORECASE | re.DOTALL)
    if m:
        return raw[:m.end()].strip()
    return raw


def extract_credits(sections: dict) -> int | None:
    raw = sections.get("credits_text", "").strip()
    # OCR might give "3" or "3 credits" or "Credits 3"
    m = re.search(r"\d+", raw)
    return int(m.group()) if m else None


def extract_semesters(sections: dict) -> str:
    """Pipe-separated semesters string for CSV storage."""
    raw = sections.get("semesters_text", "")
    semesters = [s.strip() for s in raw.split(",") if s.strip()]
    return "|".join(semesters)


def extract_description(sections: dict) -> str:
    """
    Course content text only — everything up to the first Prerequisite /
    Corequisite sentence.

    Strategy: truncate at the first occurrence of 'Prerequisite:' or
    'Corequisite:' in the raw text rather than filtering sentence-by-sentence.
    This preserves content sentences that immediately precede the prereq line.
    """
    raw = sections.get("description_text", "").strip()
    if not raw:
        return ""
    # Truncate at the first prereq/coreq/approved marker
    cutoff = re.search(
        r"\b(prerequisite|corequisite|approved for)\b",
        raw, re.IGNORECASE
    )
    if cutoff:
        raw = raw[:cutoff.start()].strip().rstrip(".")
        raw = raw + "." if raw else ""
    return raw.strip()


def extract_prerequisites(sections: dict) -> list[str]:
    """
    Extract course codes (SUBJECT NNNN) from prerequisite/corequisite text.
    Returns list of lowercase IDs like ["cs2010", "math1280"].
    Also scans description for any spill-over prereq text.
    """
    raw = (
        sections.get("prereq_text", "") + " " +
        sections.get("description_text", "")
    )
    # Find patterns like CS 2010, MATH 1280, SE 3540
    matches = re.findall(r"\b([A-Z]{2,5})\s+(\d{4})\b", raw.upper())
    codes_lower = [f"{subj.lower()}{num}" for subj, num in matches]
    # Deduplicate while preserving order
    seen: set[str] = set()
    result = []
    for c in codes_lower:
        if c not in seen:
            seen.add(c)
            result.append(c)
    return result


def extract_prerequisite_text(sections: dict) -> str:
    """
    Return the full raw prerequisite/corequisite sentence verbatim.

    The parser keeps the heading word itself (e.g. 'Prerequisite(s):') in the
    accumulated text, so the raw sentence should be complete.
    Also appends any prereq sentence that OCR placed inside the description
    block (spill-over from the two-column layout).
    """
    parts = []
    prereq_section = sections.get("prereq_text", "").strip()
    if prereq_section:
        parts.append(prereq_section)

    # Pull any prereq sentence out of description if it spilled over
    desc_raw = sections.get("description_text", "")
    m = re.search(
        r"((?:prerequisite|corequisite)[^.]*\.)",
        desc_raw, re.IGNORECASE
    )
    if m:
        sentence = m.group(1).strip()
        # Only append if it's not already covered by prereq_section
        if sentence.lower() not in " ".join(parts).lower():
            parts.append(sentence)

    combined = " ".join(parts).strip()
    # Strip leading heading like "Prerequisite(s):", "Prerequisites:", "Corequisite:"
    # Pattern handles optional 's', optional parenthetical like '(s)', and trailing ':'/'-'
    combined = re.sub(
        r"^(?:pre|co)requisite[s]?\s*(?:\([^)]*\))?\s*[:\-]?\s*",
        "",
        combined,
        flags=re.IGNORECASE,
    ).strip()
    # Clean up any double-spaces from joining
    combined = re.sub(r" {2,}", " ", combined)
    return combined


# ── CSV helpers ──────────────────────────────────────────────────────────────

def load_existing(path: str) -> dict:
    existing: dict[str, dict] = {}
    if os.path.exists(path):
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing[row["code"]] = row
    return existing


def save_all(path: str, rows: list[dict]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


# ── Interactive prompt ───────────────────────────────────────────────────────

def prompt(label: str, default: str = "") -> str:
    """
    Show a prompt, pre-filling the input buffer with *default* so the user
    can edit it in place (backspace / arrow keys work).

    Falls back to the '[default]' bracket style if readline is not available.
    """
    if _READLINE and default:
        def _hook():
            _readline.insert_text(default)
            _readline.redisplay()
        _readline.set_pre_input_hook(_hook)
        try:
            value = input(f"  {label}: ").strip()
        finally:
            _readline.set_pre_input_hook(None)
        return value if value else default
    elif default:
        # Fallback: show default in brackets, Enter accepts as-is
        value = input(f"  {label} [{default}]: ").strip()
        return value if value else default
    return input(f"  {label}: ").strip()


def confirm_and_correct(parsed: dict, existing_row: dict) -> dict | None:
    """
    Show OCR-parsed (or existing) values and let the user correct them.
    Returns a corrected dict, or None if the user skips the course.
    """
    print()
    print("  Parsed values (press Enter to accept, type to overwrite, 's' to skip):")
    print()

    def get(key: str, fallback: str = "") -> str:
        v = parsed.get(key, "") or existing_row.get(key, "")
        return v if v else fallback

    instructor = prompt("Instructor", get("instructor", "Staff"))
    if instructor.lower() == "s":
        return None

    schedule = prompt("Schedule", get("schedule", "TBA"))
    if schedule.lower() == "s":
        return None

    credits_default = str(get("credits", "3"))
    credits_raw = prompt("Credits", credits_default)
    try:
        credits_val: int | None = int(credits_raw)
    except ValueError:
        credits_val = None

    semesters_default = get("semesters", "").replace("|", ", ")
    semesters_input = prompt("Recent Semesters (comma-separated)", semesters_default)
    semesters_stored = "|".join(s.strip() for s in semesters_input.split(",") if s.strip())

    print()
    print("  Description — content text ONLY.")
    print("  ⚠  Do NOT include Prerequisite/Corequisite lines — stored separately.")
    description = prompt("Description", get("description", ""))

    print()
    prereqs_default = get("prerequisites", "")
    print("  Prerequisites — lowercase IDs extracted from page, pipe-separated.")
    print(f"  Detected: {prereqs_default or '(none)'}")
    prereqs_input = prompt("Prerequisites (pipe-separated IDs, e.g. cs2010|math1280)", prereqs_default)
    # Normalise to lowercase, no spaces
    prereqs_stored = "|".join(
        p.strip().lower().replace(" ", "")
        for p in prereqs_input.split("|") if p.strip()
    )

    print()
    print("  Prerequisite text — full sentence from page (edit or press Enter to accept).")
    prereq_text = prompt("Prerequisite text", get("prerequisite_text", ""))

    return {
        "instructor":       instructor or "Staff",
        "schedule":         schedule or "TBA",
        "credits":          credits_val,
        "semesters":        semesters_stored,
        "description":      description,
        "prerequisites":    prereqs_stored,
        "prerequisite_text": prereq_text,
    }


# ── Per-course entry ─────────────────────────────────────────────────────────

def enter_course(subject: str, number: str, title: str,
                 existing: dict) -> dict | None:
    code = f"{subject} {number}"
    url = f"{COURSICLE_BASE}/{subject}/{number}/"

    print()
    print("─" * 70)
    print(f"  {code}  —  {title}")
    print(f"  URL: {url}")
    print("─" * 70)

    try:
        webbrowser.open(url)
        print("  ✓ Opened in browser.")
    except Exception:
        print(f"  ⚠ Could not open browser. Visit: {url}")

    if OCR_AVAILABLE and SCREENSHOT_AVAILABLE:
        print()
        print("  1. Solve any CAPTCHA and scroll so ALL sections are visible.")
        print("  2. Press Enter here → you'll get a 5-second countdown.")
        print("  3. Alt+Tab to your browser DURING the countdown.")
        print("  4. Stay on the browser — screenshot fires automatically.")
        print("  (Type 'm' then Enter for manual entry without screenshot)")
        choice = input("  > ").strip().lower()
        use_ocr = choice != "m"
    else:
        print()
        print("  Solve any CAPTCHA, then press Enter to fill fields manually.")
        input("  > ")
        use_ocr = False

    parsed: dict = {}

    if use_ocr:
        img = take_screenshot()
        if img:
            print("  Running OCR... (this takes a few seconds)")
            raw_text = ocr_image(img)
            if raw_text:
                sections = parse_ocr_sections(raw_text)
                parsed = {
                    "instructor":        extract_instructor(sections),
                    "schedule":          extract_schedule(sections),
                    "credits":           extract_credits(sections),
                    "semesters":         extract_semesters(sections),
                    "description":       extract_description(sections),
                    "prerequisites":     "|".join(extract_prerequisites(sections)),
                    "prerequisite_text": extract_prerequisite_text(sections),
                }
                print(f"  OCR complete. Detected {len(raw_text)} chars of text.")
            else:
                print("  ⚠ OCR returned no text. Switching to manual entry.")
        else:
            print("  ⚠ Screenshot failed. Switching to manual entry.")

    existing_row = existing.get(code, {})
    result = confirm_and_correct(parsed, existing_row)
    if result is None:
        print("  ⟶ Skipped.")
        return None

    result["code"] = code
    return result


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("  Screenshot + OCR Course Scraper — BGSU SE Courses")
    print("=" * 70)
    print()
    if OCR_AVAILABLE and SCREENSHOT_AVAILABLE:
        print("  ✓ OCR mode active (pytesseract + pyautogui detected)")
    elif OCR_AVAILABLE:
        print("  ⚠ pytesseract found but pyautogui missing — install pyautogui for screenshots")
    else:
        print("  ⚠ OCR unavailable — running in manual entry mode")
    print()
    print("  Which course tier do you want to scrape?")
    print("    1 — SE Core Required Courses (Tier 1)")
    print("    2 — SE Electives (Tier 2)")
    print("    3 — Mathematics & Science Requirements (Tier 3)")
    print("    4 — BG Perspective General Education (Tier 4)")
    print("    5 — Foreign Language Requirements (Tier 5)")
    tier_input = input("  > ").strip()
    if tier_input == "2":
        tier = 2
        course_list = TIER_2_COURSES
    elif tier_input == "3":
        tier = 3
        course_list = TIER_3_COURSES
    elif tier_input == "4":
        tier = 4
        course_list = TIER_4_COURSES
    elif tier_input == "5":
        tier = 5
        course_list = TIER_5_COURSES
    else:
        tier = 1
        course_list = TIER_1_COURSES

    output_file = TIER_OUTPUT[tier]
    print()
    print(f"  Output file : {output_file}")
    print(f"  Courses     : {len(course_list)}")
    print()

    existing = load_existing(output_file)
    if existing:
        done_codes = [c for c in course_list if f"{c[0]} {c[1]}" in existing]
        remaining  = [c for c in course_list if f"{c[0]} {c[1]}" not in existing]
        print(f"  ✓ Resuming — {len(existing)} course(s) already entered.")
        print(f"    Done     : {', '.join(f'{c[0]} {c[1]}' for c in done_codes)}")
        print(f"    Remaining: {len(remaining)} course(s)")
    else:
        remaining = course_list

    if not remaining:
        print("  All courses already entered. Delete the CSV to start fresh.")
        return

    print()
    print("  Press Enter to start. Ctrl+C at any time to save progress and exit.")
    input("  > ")

    rows_by_code: dict[str, dict] = dict(existing)

    try:
        for subject, number, title in remaining:
            result = enter_course(subject, number, title, existing)
            if result:
                rows_by_code[result["code"]] = result
                save_all(output_file, list(rows_by_code.values()))
                print(f"  ✓ Saved {result['code']}")

    except KeyboardInterrupt:
        print("\n\n  Interrupted — progress saved.")

    save_all(output_file, list(rows_by_code.values()))
    print()
    print(f"  Done. {output_file} has {len(rows_by_code)} course(s).")
    print()
    print("  Next step:")
    print("    python scripts/import_coursicle_data.py --direct")


if __name__ == "__main__":
    main()
