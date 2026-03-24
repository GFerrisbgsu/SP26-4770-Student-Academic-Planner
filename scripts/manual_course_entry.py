#!/usr/bin/env python3
"""
Manual Course Data Entry Tool

Purpose: Interactively collect real course data for Tier 1 BGSU SE courses
         by opening each Coursicle page in your browser and prompting you to
         type in the relevant fields.

This avoids web scraping rate-limit problems entirely.

Run:    python scripts/manual_course_entry.py
Output: coursicle_tier1_data.csv  (ready for import_coursicle_data.py)

Resume: If you stop mid-way, re-run the script — already-entered courses
        are loaded from the CSV and skipped automatically.

Dependencies: None (stdlib only)
"""

import csv
import os
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

# ──────────────────────────────────────────────────────────────
# Tier 1: 15 SE Core Requirement courses
# ──────────────────────────────────────────────────────────────
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
    ("CHIN", "1010", "Elementary Chinese I"),
    ("CHIN", "1020", "Elementary Chinese II"),
    ("CHIN", "2010", "Intermediate Chinese I"),
    ("CHIN", "2020", "Intermediate Chinese II"),
    ("CHIN", "2150", "Chinese Language and Culture I"),
    ("CHIN", "2160", "Chinese Language and Culture II"),
    ("CHIN", "3120", "Advanced Chinese I"),
    ("CHIN", "4150", "Advanced Chinese II"),

    # ── French ────────────────────────────────────────────────────────────
    ("FREN", "1010", "Elementary French I"),
    ("FREN", "1020", "Elementary French II"),
    # FREN 2010, 2020 already in Tier 4 (Humanities/IP)
    ("FREN", "2120", "Advanced French Grammar and Composition"),

    # ── German ────────────────────────────────────────────────────────────
    ("GERM", "1010", "Elementary German I"),
    ("GERM", "1020", "Elementary German II"),
    # GERM 2010, 2020, 2150, 2160 already in Tier 4 (Humanities/IP)
    ("GERM", "2170", "German for Reading Knowledge I"),
    ("GERM", "2180", "German for Reading Knowledge II"),
    ("GERM", "2310", "German Conversation and Composition"),
    ("GERM", "2600", "German Culture and Society"),
    ("GERM", "3310", "Advanced German Conversation and Composition"),
    ("GERM", "3600", "Advanced German Culture and Society"),
    ("GERM", "4150", "Advanced German Grammar and Stylistics"),

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
    ("ITAL", "2610", "Italian Literature in Translation"),
    # ITAL 2620 already in Tier 4 (Humanities/CD)

    # ── Japanese ──────────────────────────────────────────────────────────
    ("JAPN", "1010", "Elementary Japanese I"),
    ("JAPN", "1020", "Elementary Japanese II"),
    ("JAPN", "2010", "Intermediate Japanese I"),
    ("JAPN", "2020", "Intermediate Japanese II"),
    ("JAPN", "2150", "Japanese Language and Culture I"),
    ("JAPN", "2160", "Japanese Language and Culture II"),
    ("JAPN", "3120", "Advanced Japanese I"),
    ("JAPN", "4150", "Advanced Japanese II"),

    # ── Latin ─────────────────────────────────────────────────────────────
    ("LAT",  "1010", "Elementary Latin I"),
    ("LAT",  "1020", "Elementary Latin II"),
    ("LAT",  "2010", "Intermediate Latin I"),
    ("LAT",  "2020", "Intermediate Latin II"),

    # ── Russian ───────────────────────────────────────────────────────────
    ("RUSN", "1010", "Elementary Russian I"),
    ("RUSN", "1020", "Elementary Russian II"),
    ("RUSN", "2010", "Intermediate Russian I"),
    ("RUSN", "2020", "Intermediate Russian II"),
    # RUSN 2150, 2160 already in Tier 4 (Humanities/IP)
    ("RUSN", "3120", "Advanced Russian I"),
    ("RUSN", "3130", "Advanced Russian II"),

    # ── Spanish ───────────────────────────────────────────────────────────
    ("SPAN", "1010", "Elementary Spanish I"),
    ("SPAN", "1020", "Elementary Spanish II"),
    # SPAN 2010, 2020, 2030 already in Tier 4 (Humanities/IP)
    ("SPAN", "2120", "Spanish for Heritage Speakers"),
]
COURSICLE_BASE = "https://www.coursicle.com/bgsu/courses"
CSV_FIELDS = ["code", "instructor", "schedule", "description", "credits", "semesters", "prerequisites", "prerequisite_text"]


def load_existing(path: str) -> dict:
    """Load already-entered courses from CSV so we can resume."""
    existing = {}
    if os.path.exists(path):
        with open(path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing[row["code"]] = row
    return existing


def prompt(label: str, default: str = "") -> str:
    """Prompt for a value, pre-filling the input buffer with *default*
    so the user can edit it in place (arrow keys / backspace work).
    Falls back to bracket-style display if readline is unavailable.
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
        value = input(f"  {label} [{default}]: ").strip()
        return value if value else default
    return input(f"  {label}: ").strip()


def enter_course(subject: str, number: str, title: str, existing: dict) -> dict:
    """Open Coursicle page and collect data interactively for one course."""
    code = f"{subject} {number}"
    url = f"{COURSICLE_BASE}/{subject}/{number}/"

    print()
    print("─" * 70)
    print(f"  {code}  —  {title}")
    print(f"  URL: {url}")
    print("─" * 70)

    # Auto-open in browser
    try:
        webbrowser.open(url)
        print("  ✓ Opened in browser. Fill in the fields from the Coursicle page.")
    except Exception:
        print(f"  ⚠ Could not open browser. Visit manually: {url}")

    print()
    print("  Fields to look at on the page:")
    print("   'Recent Professors'  → copy the first/most-recent professor name")
    print("   'Usually Offered'    → e.g. 'MWF (50 minutes)' or 'TBA'")
    print("   'Credits'            → number of credit hours")
    print("   'Recent Semesters'   → e.g. 'Fall 2025, Spring 2025, ...'")
    print("   'Description'        → course content text ONLY")
    print("                          ⚠ SKIP any lines that start with:")
    print("                            'Prerequisite:', 'Corequisite:', or 'Approved for...'")
    print("                          Those are stored separately in the database.")
    print()
    print("  Press Enter to accept defaults (if any). Type 's' to skip this course.")
    print()

    existing_row = existing.get(code, {})

    instructor = prompt("Instructor (first name in 'Recent Professors')",
                        existing_row.get("instructor", ""))
    if instructor.lower() == "s":
        print("  ⟶ Skipped.")
        return None

    schedule = prompt("Schedule ('Usually Offered')",
                      existing_row.get("schedule", ""))
    if schedule.lower() == "s":
        print("  ⟶ Skipped.")
        return None

    credits_raw = prompt("Credits",
                         existing_row.get("credits", "3"))
    try:
        credits_val = int(credits_raw) if credits_raw else None
    except ValueError:
        credits_val = None

    semesters = prompt("Recent Semesters (comma-separated)",
                       existing_row.get("semesters", "").replace("|", ", "))
    # Normalise to pipe-separated for storage
    semesters_stored = "|".join(s.strip() for s in semesters.split(",") if s.strip())

    print()
    print("  Description — paste the course content text ONLY.")
    print("  ⚠  Do NOT include lines starting with 'Prerequisite:', 'Corequisite:'")
    print("     or 'Approved for ...' — those go in the Prerequisite text field below.")
    description = prompt("Description (content text only, or Enter to skip)",
                         existing_row.get("description", ""))

    prereq_text = prompt(
        "Prerequisite text (full sentence from page, or Enter to skip)",
        existing_row.get("prerequisite_text", "")
    )

    return {
        "code": code,
        "instructor": instructor or "Staff",
        "schedule": schedule or "TBA",
        "description": description,
        "credits": credits_val,
        "semesters": semesters_stored,
        "prerequisites": "",
        "prerequisite_text": prereq_text,
    }


def save_all(path: str, rows: list[dict]) -> None:
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main():
    print("=" * 70)
    print("  Manual Course Data Entry Tool — BGSU SE Courses")
    print("=" * 70)
    print()
    print("  This tool opens each Coursicle page in your browser and collects")
    print("  course data interactively — no scraping, no rate-limits.")
    print()
    print("  Which course tier do you want to enter?")
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
        print(f"  ✓ Resuming — {len(existing)} course(s) already entered.")
        already_done = [c for c in course_list if f"{c[0]} {c[1]}" in existing]
        remaining    = [c for c in course_list if f"{c[0]} {c[1]}" not in existing]
        print(f"    Done     : {', '.join(f'{c[0]} {c[1]}' for c in already_done)}")
        print(f"    Remaining: {len(remaining)} course(s)")
    else:
        remaining = course_list

    print()
    print("  Press Enter to start. Ctrl+C at any time to save progress and exit.")
    input("  > ")

    rows_by_code: dict[str, dict] = dict(existing)

    try:
        for i, (subject, number, title) in enumerate(remaining, 1):
            code = f"{subject} {number}"
            print(f"\n  [{i}/{len(remaining)} remaining]")

            result = enter_course(subject, number, title, existing)
            if result is not None:
                rows_by_code[code] = result
                save_all(output_file, list(rows_by_code.values()))
                print(f"  ✓ Saved {code} → {output_file}")

    except KeyboardInterrupt:
        print("\n\n  Interrupted — progress saved.")

    print()
    print("=" * 70)
    total = len(rows_by_code)
    real  = sum(1 for r in rows_by_code.values() if r.get("instructor") not in ("", "Staff"))
    print(f"  Done. {total} courses saved ({real} with real instructor data).")
    print()
    print("  Next steps:")
    print(f"    1. Review : type {output_file}")
    print(f"    2. Import : python scripts/import_coursicle_data.py --direct")
    print("=" * 70)


if __name__ == "__main__":
    main()
