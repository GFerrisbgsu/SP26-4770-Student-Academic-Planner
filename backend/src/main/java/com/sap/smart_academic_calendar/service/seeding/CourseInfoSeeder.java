package com.sap.smart_academic_calendar.service.seeding;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.model.CourseInfo;
import com.sap.smart_academic_calendar.model.PrerequisiteEntry;
import com.sap.smart_academic_calendar.model.PrerequisiteType;
import com.sap.smart_academic_calendar.repository.CourseInfoRepository;
import com.sap.smart_academic_calendar.repository.CourseRepository;

/**
 * Seeds course information and prerequisites for BGSU Software Engineering B.S. program.
 * 
 * This seeder creates course info records with:
 * - Prerequisite relationships based on BGSU course map
 * - Course type classifications for filtering
 * - Program association (Software Engineering BSSE)
 * 
 * Course types enable frontend filtering:
 * - SE Core Requirement (15 required courses)
 * - SE Core Elective (10 electives, choose 3)
 * - Math Requirement, Math Elective
 * - Science Requirement, Language Requirement, Writing Requirement
 * - MDC Course (200+ Multidisciplinary Component options)
 * - BGP Course (30+ General Education options)
 * 
 * See docs/backend/BGSU_SOFTWARE_ENGINEERING_CURRICULUM.md for degree structure.
 */
@Component
public class CourseInfoSeeder implements DataSeeder<CourseInfo> {
    
    private static final Logger log = LoggerFactory.getLogger(CourseInfoSeeder.class);
    
    private final CourseInfoRepository courseInfoRepository;
    private final CourseRepository courseRepository;
    
    public CourseInfoSeeder(CourseInfoRepository courseInfoRepository, CourseRepository courseRepository) {
        this.courseInfoRepository = courseInfoRepository;
        this.courseRepository = courseRepository;
    }
    
    @Override
    public void seed() throws Exception {
        // Check if course info already exists
        if (courseInfoRepository.count() > 0) {
            log.info("Course info already exists, skipping course info seeding");
            return;
        }
        
        log.info("Seeding BGSU Software Engineering course info and prerequisites...");
        
        List<CourseInfo> courseInfoList = new ArrayList<>();
        
        // ========================================
        // SOFTWARE ENGINEERING CORE REQUIREMENTS (16)
        // Parsed from coursicle_tier1_data.csv with
        // proper PREREQUISITE / COREQUISITE / OTHER types
        // ========================================

        // CS 1010 — Corequisite: MATH 1150, 1190, or 1220+ (any one)
        courseInfoList.add(ci("cs1010", Arrays.asList(
            co("math1150", "MATH 1150, 1190, or 1220+ (any one)"),
            co("math1190", "MATH 1150, 1190, or 1220+ (any one)"),
            co("math1220", "MATH 1150, 1190, or 1220+ (any one)")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 2010 — Prereq: MATH 1220/1280/1310/1340 (any one)
        //           OR Math Placement + MATH 1220 corequisite
        //           OR Math Placement score of MATH 1280+
        courseInfoList.add(ci("cs2010", Arrays.asList(
            pre("math1220", "MATH 1220, 1280, 1310, or 1340 (any one)"),
            pre("math1280", "MATH 1220, 1280, 1310, or 1340 (any one)"),
            pre("math1310", "MATH 1220, 1280, 1310, or 1340 (any one)"),
            pre("math1340", "MATH 1220, 1280, 1310, or 1340 (any one)"),
            other("Or Math Placement score with MATH 1220 corequisite, or Math Placement of MATH 1280+")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 2900 — No prerequisites; graded S/U
        courseInfoList.add(ci("cs2900", Arrays.asList(),
            "Software Engineering BSSE", "SE Core Requirement"));

        // CS 2020 — Prereq: C or better in CS 2010
        //           AND MATH 1280
        courseInfoList.add(ci("cs2020", Arrays.asList(
            pre("cs2010", "Grade of C or better"),
            pre("math1280", "MATH 1280")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 2190 — Prereq: C or better in CS 2010
        courseInfoList.add(ci("cs2190", Arrays.asList(
            pre("cs2010", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 3000 — Prereq: C or better in CS 1010 or higher
        courseInfoList.add(ci("cs3000", Arrays.asList(
            pre("cs1010", "Grade of C or better in CS 1010 or higher")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 3080 — Prereq: C or better in CS 2020 AND (CS 2190)
        courseInfoList.add(ci("cs3080", Arrays.asList(
            pre("cs2020", "Grade of C or better"),
            pre("cs2190", "CS 2190 (either one)")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 3210 — Prereq: C or better in CS 2020
        courseInfoList.add(ci("cs3210", Arrays.asList(
            pre("cs2020", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 3350 — Prereq: MATH 2220 AND C or better in CS 2020
        courseInfoList.add(ci("cs3350", Arrays.asList(
            pre("math2220", "MATH 2220"),
            pre("cs2020", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // SE 3540 — Prereq: C or better in CS 2020
        courseInfoList.add(ci("se3540", Arrays.asList(
            pre("cs2020", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 3900 — Consent of department; graded S/U
        courseInfoList.add(ci("cs3900", Arrays.asList(
            other("Consent of department. Graded S/U.")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 4390 — Prereq: C or better in CS 3080
        courseInfoList.add(ci("cs4390", Arrays.asList(
            pre("cs3080", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // SE 4550 — Prereq: C or better in SE 3540
        courseInfoList.add(ci("se4550", Arrays.asList(
            pre("se3540", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // SE 4560 — Prereq: C or better in SE 3540
        courseInfoList.add(ci("se4560", Arrays.asList(
            pre("se3540", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 4620 — Prereq: C or better in CS 2020
        courseInfoList.add(ci("cs4620", Arrays.asList(
            pre("cs2020", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // SE 4770 — Prereq: C or better in SE 4550, SE 4560, AND CS 4620
        courseInfoList.add(ci("se4770", Arrays.asList(
            pre("se4550", "Grade of C or better"),
            pre("se4560", "Grade of C or better"),
            pre("cs4620", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Requirement"));

        // CS 4770 — Prereq: C or better in CS 3350, 15+ credit hours of CS 3000+
        courseInfoList.add(ci("cs4770", Arrays.asList(
            pre("cs3350", "Grade of C or better")
        ), "Computer Science BSCS", "CS Core Requirement"));
        
        // ========================================
        // SOFTWARE ENGINEERING ELECTIVES (8)
        // Parsed from coursicle_tier2_data.csv with
        // proper PREREQUISITE / COREQUISITE / OTHER types
        // ========================================

        // CS 3060 — Prereq: C or better in CS 2020
        courseInfoList.add(ci("cs3060", Arrays.asList(
            pre("cs2020", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 3140 — Prereq: CS 2010 (catalog says CS 2010, NOT CS 2020)
        courseInfoList.add(ci("cs3140", Arrays.asList(
            pre("cs2010")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 3160 — Prereq: CS 2020
        courseInfoList.add(ci("cs3160", Arrays.asList(
            pre("cs2020")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 3180 — Prereq: CS 2020
        courseInfoList.add(ci("cs3180", Arrays.asList(
            pre("cs2020")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 3240 — Prereq: CS 2020
        courseInfoList.add(ci("cs3240", Arrays.asList(
            pre("cs2020")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 4120 — Prereq: MATH 2220 AND C or better in CS 3350
        courseInfoList.add(ci("cs4120", Arrays.asList(
            pre("math2220", "MATH 2220"),
            pre("cs3350", "Grade of C or better")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 3800 — Prereq: CS 2010; may repeat if topics differ
        courseInfoList.add(ci("cs3800", Arrays.asList(
            pre("cs2010")
        ), "Software Engineering BSSE", "SE Core Elective"));

        // CS 4800 — Consent of instructor; may repeat up to 6 hrs
        courseInfoList.add(ci("cs4800", Arrays.asList(
            other("Consent of instructor.")
        ), "Software Engineering BSSE", "SE Core Elective"));
        
        // ========================================
        // MATHEMATICS / BUSINESS COURSES (22)
        // Parsed from coursicle_tier3_data.csv with
        // proper PREREQUISITE / COREQUISITE / OTHER types
        // ========================================

        // MATH 1150 — No course prereqs (HS placement)
        courseInfoList.add(ci("math1150", Arrays.asList(
            other("Two years high school algebra, one year geometry, satisfactory placement exam score.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 1190 — No prereqs
        courseInfoList.add(ci("math1190", Arrays.asList(),
            "Software Engineering BSSE", "Math Requirement"));

        // MATH 1200 — Placement or C+ in MATH 95
        courseInfoList.add(ci("math1200", Arrays.asList(
            other("Two years HS algebra, one year geometry, satisfactory placement exam score, or C or higher in MATH 95.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 1220 — No listed course prereqs (placement-based)
        courseInfoList.add(ci("math1220", Arrays.asList(),
            "Software Engineering BSSE", "Math Requirement"));

        // MATH 1280 — Prereq: C+ in MATH 1200 or 1220, or placement
        courseInfoList.add(ci("math1280", Arrays.asList(
            pre("math1200", "C or higher in MATH 1200 or 1220 (either one)"),
            pre("math1220", "C or higher in MATH 1200 or 1220 (either one)"),
            other("Or HS algebra/geometry and satisfactory placement exam score.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 1290 — Prereq: C+ in MATH 1200 or 1220 or consent
        courseInfoList.add(ci("math1290", Arrays.asList(
            pre("math1200", "C or higher in MATH 1200 or 1220 (either one)"),
            pre("math1220", "C or higher in MATH 1200 or 1220 (either one)"),
            other("Or consent of instructor.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 1310 — Prereq: C+ in MATH 1280 or 1290, or ACT/placement
        courseInfoList.add(ci("math1310", Arrays.asList(
            pre("math1280", "C or higher in MATH 1280 or 1290 (either one)"),
            pre("math1290", "C or higher in MATH 1280 or 1290 (either one)"),
            other("Or HS algebra/geometry/trig + ACT math 24+ and placement test.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 1340 — Prereq: C+ in MATH 1280 or 1290, or ACT/placement
        courseInfoList.add(ci("math1340", Arrays.asList(
            pre("math1280", "C or higher in MATH 1280 or 1290 (either one)"),
            pre("math1290", "C or higher in MATH 1280 or 1290 (either one)"),
            other("Or HS algebra/geometry/trig + ACT math 24+ and placement test.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 1350 — Prereq: C+ in MATH 1340
        courseInfoList.add(ci("math1350", Arrays.asList(
            pre("math1340", "Grade of C or higher")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 2220 — Prereq: C+ in MATH 1280/1310/1340/1350 or BA 1700
        courseInfoList.add(ci("math2220", Arrays.asList(
            pre("math1280", "C or better in MATH 1280, 1310, 1340, 1350, or BA 1700 (any one)"),
            pre("math1310", "C or better in MATH 1280, 1310, 1340, 1350, or BA 1700 (any one)"),
            pre("math1340", "C or better in MATH 1280, 1310, 1340, 1350, or BA 1700 (any one)"),
            pre("math1350", "C or better in MATH 1280, 1310, 1340, 1350, or BA 1700 (any one)")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 2320 — Prereq: C+ in MATH 1310 or 1350
        courseInfoList.add(ci("math2320", Arrays.asList(
            pre("math1310", "C or higher in MATH 1310 or 1350 (either one)"),
            pre("math1350", "C or higher in MATH 1310 or 1350 (either one)")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 2470 — Prereq: C+ in MATH 1310/1350 or BA 1700
        courseInfoList.add(ci("math2470", Arrays.asList(
            pre("math1310", "C or better in MATH 1310, 1350, or BA 1700 (any one)"),
            pre("math1350", "C or better in MATH 1310, 1350, or BA 1700 (any one)")
        ), "Software Engineering BSSE", "Math Requirement"));



        // MATH 3280 — Prereq: C+ in MATH 2320 or 2220 or CS 2020, or consent
        courseInfoList.add(ci("math3280", Arrays.asList(
            pre("math2320", "C or better in MATH 2320, 2220, or CS 2020 (any one)"),
            pre("math2220", "C or better in MATH 2320, 2220, or CS 2020 (any one)"),
            pre("cs2020", "C or better in MATH 2320, 2220, or CS 2020 (any one)"),
            other("Or consent of instructor.")
        ), "Software Engineering BSSE", "Math Elective"));

        // MATH 3320 — Prereq: C+ in MATH 2320, or (1310+2220), or (1310+CS 2020)
        courseInfoList.add(ci("math3320", Arrays.asList(
            pre("math2320", "C or better in MATH 2320 (standalone)"),
            pre("math1310", "Or MATH 1310 + MATH 2220 or CS 2020"),
            pre("math2220", "MATH 1310 + MATH 2220 (combination)"),
            pre("cs2020", "MATH 1310 + CS 2020 (combination)")
        ), "Software Engineering BSSE", "Math Elective"));

        // MATH 3410 — Prereq: C+ in MATH 2320 or consent
        courseInfoList.add(ci("math3410", Arrays.asList(
            pre("math2320", "C or better"),
            other("Or consent of instructor.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // MATH 3430 — Prereq: (CS 1010 or CS 2010) AND C+ in MATH 1310 or (1340+1350)
        courseInfoList.add(ci("math3430", Arrays.asList(
            pre("cs1010", "CS 1010 or CS 2010 (either one)"),
            pre("cs2010", "CS 1010 or CS 2010 (either one)"),
            pre("math1310", "C or better in MATH 1310, or MATH 1340 and 1350"),
            pre("math1340", "MATH 1340 + 1350 (both required if not MATH 1310)"),
            pre("math1350", "MATH 1340 + 1350 (both required if not MATH 1310)")
        ), "Software Engineering BSSE", "Math Elective"));

        // BA 1600 — Prereq: C+ in MATH 1220 or 1280, or placement of 32
        courseInfoList.add(ci("ba1600", Arrays.asList(
            pre("math1220", "C or better in MATH 1220 or 1280 (either one)"),
            pre("math1280", "C or better in MATH 1220 or 1280 (either one)"),
            other("Or Schmidthorst College of Business student or DSP-B or math placement of 32.")
        ), "Software Engineering BSSE", "Math Requirement"));

        // BA 2050 — Prereq: C+ in BA 1600 or MATH 1310/1340+1350
        courseInfoList.add(ci("ba2050", Arrays.asList(
            pre("ba1600", "C or better in BA 1600, MATH 1310, or 1340+1350 (any option)"),
            pre("math1310", "C or better in MATH 1310 (standalone)"),
            pre("math1340", "MATH 1340 + 1350 (both required)"),
            pre("math1350", "MATH 1340 + 1350 (both required)")
        ), "Software Engineering BSSE", "Math Requirement"));

        // BA 2110 — No course prereqs
        courseInfoList.add(ci("ba2110", Arrays.asList(),
            "Software Engineering BSSE", "Math Requirement"));

        // BA 2120 — Prereq: C+ in BA 2050; Coreq: BIZX 2200
        courseInfoList.add(ci("ba2120", Arrays.asList(
            pre("ba2050", "C or better"),
            co("bizx2200", "BIZX 2200 or equivalent")
        ), "Software Engineering BSSE", "Math Requirement"));

        // BIZX 2200 — Coreq: BA 2120
        courseInfoList.add(ci("bizx2200", Arrays.asList(
            co("ba2120", "BA 2120 or equivalent")
        ), "Software Engineering BSSE", "Math Requirement"));
        
        // ========================================
        // SCIENCE LAB SEQUENCES (25)
        // ========================================
        
        // Chemistry Sequences
        courseInfoList.add(createCourseInfo("chem1230", Arrays.asList(), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("chem1280", Arrays.asList("chem1230"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("chem3060", Arrays.asList("chem1280"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("chem3070", Arrays.asList("chem3060"), 
            "Software Engineering BSSE", "Science Requirement"));
        
        // Physics Sequences
        courseInfoList.add(createCourseInfo("phys2010", Arrays.asList(), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("phys2020", Arrays.asList("phys2010"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("phys3010", Arrays.asList("math1340"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("phys3020", Arrays.asList("phys3010"), 
            "Software Engineering BSSE", "Science Requirement"));
        
        // Biology Sequences
        courseInfoList.add(createCourseInfo("biol2040", Arrays.asList(), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("biol2050", Arrays.asList("biol2040"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("biol3040", Arrays.asList("biol2050"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("biol3050", Arrays.asList("biol2050"), 
            "Software Engineering BSSE", "Science Requirement"));
        
        // Other Sciences
        courseInfoList.add(createCourseInfo("geol1010", Arrays.asList(), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("geol1020", Arrays.asList("geol1010"), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("astr2010", Arrays.asList(), 
            "Software Engineering BSSE", "Science Requirement"));
        courseInfoList.add(createCourseInfo("envs1010", Arrays.asList(), 
            "Software Engineering BSSE", "Science Requirement"));
        
        // ========================================
        // WRITING REQUIREMENTS (3)
        // ========================================
        courseInfoList.add(createCourseInfo("writ1010", Arrays.asList(), 
            "Software Engineering BSSE", "Writing Requirement"));
        courseInfoList.add(createCourseInfo("writ1110", Arrays.asList(), 
            "Software Engineering BSSE", "Writing Requirement"));
        courseInfoList.add(createCourseInfo("writ1120", Arrays.asList("writ1010", "writ1110"), 
            "Software Engineering BSSE", "Writing Requirement"));
        
        // ========================================
        // WORLD LANGUAGES (50+)
        // ========================================
        
        // Spanish Sequence
        courseInfoList.add(createCourseInfo("span1010", Arrays.asList(), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span1020", Arrays.asList("span1010"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span2010", Arrays.asList("span1020"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span2020", Arrays.asList("span2010"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span3010", Arrays.asList("span2020"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span3020", Arrays.asList("span3010"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span4010", Arrays.asList("span3020"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("span4020", Arrays.asList("span3020"), 
            "Software Engineering BSSE", "Language Requirement"));
        
        // French Sequence
        courseInfoList.add(createCourseInfo("fren1010", Arrays.asList(), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren1020", Arrays.asList("fren1010"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren2010", Arrays.asList("fren1020"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren2020", Arrays.asList("fren2010"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren3010", Arrays.asList("fren2020"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren3020", Arrays.asList("fren2020"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren4010", Arrays.asList("fren3010"), 
            "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("fren4020", Arrays.asList("fren3010"), 
            "Software Engineering BSSE", "Language Requirement"));
        
        // German, Chinese, Japanese, Italian, Arabic, ASL, Latin, Greek, Russian
        // (Add similar sequences for all other languages - abbreviated here for space)
        // Each follows same pattern: 1010 → 1020 → 2010 → 2020 → advanced courses
        
        // German
        courseInfoList.add(createCourseInfo("germ1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("germ1020", Arrays.asList("germ1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("germ2010", Arrays.asList("germ1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("germ2020", Arrays.asList("germ2010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("germ3010", Arrays.asList("germ2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("germ3020", Arrays.asList("germ2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("germ4010", Arrays.asList("germ3010"), "Software Engineering BSSE", "Language Requirement"));
        
        // Chinese
        courseInfoList.add(createCourseInfo("chin1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("chin1020", Arrays.asList("chin1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("chin2010", Arrays.asList("chin1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("chin2020", Arrays.asList("chin2010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("chin3010", Arrays.asList("chin2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("chin3020", Arrays.asList("chin2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("chin4010", Arrays.asList("chin3010"), "Software Engineering BSSE", "Language Requirement"));
        
        // Japanese
        courseInfoList.add(createCourseInfo("japn1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("japn1020", Arrays.asList("japn1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("japn2010", Arrays.asList("japn1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("japn2020", Arrays.asList("japn2010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("japn3010", Arrays.asList("japn2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("japn3020", Arrays.asList("japn2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("japn4010", Arrays.asList("japn3010"), "Software Engineering BSSE", "Language Requirement"));
        
        // Italian, Arabic, ASL, Latin, Greek, Russian (abbreviated - all follow same pattern)
        courseInfoList.add(createCourseInfo("ital1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("ital1020", Arrays.asList("ital1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("ital2010", Arrays.asList("ital1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("ital2020", Arrays.asList("ital2010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("ital3010", Arrays.asList("ital2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("ital3020", Arrays.asList("ital2020"), "Software Engineering BSSE", "Language Requirement"));
        
        courseInfoList.add(createCourseInfo("arbc1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("arbc1020", Arrays.asList("arbc1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("arbc2010", Arrays.asList("arbc1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("arbc2020", Arrays.asList("arbc2010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("arbc3010", Arrays.asList("arbc2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("arbc3020", Arrays.asList("arbc2020"), "Software Engineering BSSE", "Language Requirement"));
        
        courseInfoList.add(createCourseInfo("asl1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("asl1020", Arrays.asList("asl1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("asl2010", Arrays.asList("asl1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("asl2020", Arrays.asList("asl2010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("asl3010", Arrays.asList("asl2020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("asl3020", Arrays.asList("asl2020"), "Software Engineering BSSE", "Language Requirement"));
        
        courseInfoList.add(createCourseInfo("lat1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("lat1020", Arrays.asList("lat1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("lat2010", Arrays.asList("lat1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("lat2020", Arrays.asList("lat2010"), "Software Engineering BSSE", "Language Requirement"));
        
        courseInfoList.add(createCourseInfo("grek1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("grek1020", Arrays.asList("grek1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("grek2010", Arrays.asList("grek1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("grek2020", Arrays.asList("grek2010"), "Software Engineering BSSE", "Language Requirement"));
        
        courseInfoList.add(createCourseInfo("rusn1010", Arrays.asList(), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("rusn1020", Arrays.asList("rusn1010"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("rusn2010", Arrays.asList("rusn1020"), "Software Engineering BSSE", "Language Requirement"));
        courseInfoList.add(createCourseInfo("rusn2020", Arrays.asList("rusn2010"), "Software Engineering BSSE", "Language Requirement"));
        
        // ========================================
        // MDC COURSES (~200-250)
        // ========================================
        // Most MDC courses have no prerequisites (open enrollment)
        
        // ACS - American Culture Studies
        courseInfoList.add(createCourseInfo("acs2000", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("acs3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("acs3200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("acs4100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("acs4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("acs4300", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        // AFRS - Africana Studies
        courseInfoList.add(createCourseInfo("afrs2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("afrs3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("afrs3200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("afrs4100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("afrs4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("afrs4300", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        // ART, ARTH, COMM, ECON, ENG, ENVS, ETHN, GEOG, GERO, HIST, PHIL, POLS, PSYC, SOC, WS
        // (Most have no prerequisites - all marked as MDC Course)
        courseInfoList.add(createCourseInfo("art1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("art2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("art2200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("art3020", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("art3250", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("art4100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("arth2450", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("arth2460", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("arth3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("arth4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("comm1020", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("comm2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("comm3150", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("comm3230", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("comm4350", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("econ2020", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("econ2030", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("econ3100", Arrays.asList("econ2020"), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("econ4150", Arrays.asList("econ2020", "econ2030"), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("eng2010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("eng2020", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("eng3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("eng4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("envs2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("envs3150", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("envs4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("ethn1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("ethn3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("ethn4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("geog1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("geog2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("geog3250", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("geog4120", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("gero2010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("gero3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("hist1500", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("hist2050", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("hist2060", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("hist3030", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("hist3410", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("hist4050", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("phil1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("phil2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("phil3210", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("phil3450", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("phil4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("pols1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("pols2200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("pols3010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("pols4120", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("psyc1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("psyc2210", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("psyc3050", Arrays.asList("psyc1010"), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("psyc3210", Arrays.asList("psyc1010"), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("psyc4510", Arrays.asList("psyc1010"), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("soc1010", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("soc2310", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("soc3020", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("soc3180", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("soc4050", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        courseInfoList.add(createCourseInfo("ws2100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("ws3100", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        courseInfoList.add(createCourseInfo("ws4200", Arrays.asList(), "Software Engineering BSSE", "MDC Course"));
        
        // ========================================
        // BGP COURSES (legacy placeholder entries)
        // ========================================
        courseInfoList.add(createCourseInfo("anth1010", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("asia2010", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("mus1010", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("thfm1020", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("clcv2100", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("anth1020", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("nsci1010", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("hnrs1010", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("ling2010", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("pacs2100", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("mdia2100", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("popc2100", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));
        courseInfoList.add(createCourseInfo("jour2100", Arrays.asList(), "Software Engineering BSSE", "BGP Course"));

        // =====================================================================
        // Tier 4 – BGP General Education Courses (first 40 of ~137)
        // =====================================================================

        // --- English Composition and Oral Communication ---
        courseInfoList.add(ci("comm1020", List.of(), "BG Perspective", "BGP English Comp & Oral Comm"));
        courseInfoList.add(ci("writ1110", List.of(), "BG Perspective", "BGP English Comp & Oral Comm"));
        courseInfoList.add(ci("writ1120", List.of(pre("writ1110", "WRIT 1110 or UWP placement")),
            "BG Perspective", "BGP English Comp & Oral Comm"));

        // --- Quantitative Literacy ---
        courseInfoList.add(ci("math1230", List.of(
            pre("math1200", "MATH 1200 (C or higher)"),
            pre("math1220", "or MATH 1220 (C or higher)")),
            "BG Perspective", "BGP Quantitative Literacy"));
        courseInfoList.add(ci("pols2900", List.of(), "BG Perspective", "BGP Quantitative Literacy"));
        courseInfoList.add(ci("psyc2700", List.of(
            pre("psyc1010", "PSYC 1010"),
            pre("math1150", "and MATH 1150"),
            pre("math1220", "or MATH 1220")),
            "BG Perspective", "BGP Quantitative Literacy"));
        courseInfoList.add(ci("soc2690", List.of(), "BG Perspective", "BGP Quantitative Literacy"));

        // --- Humanities and The Arts ---
        courseInfoList.add(ci("acs2000", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("acs2500", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("arch2330", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("arch2340", List.of(
            other("May be taken before ARCH 2330")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("art1010", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("arth1450", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("arth1460", List.of(
            other("May be taken before ARTH 1450")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("arth2700", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("clcv2410", List.of(
            other("No credit for both CLCV 2410 and CLCV 4850")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("clcv2420", List.of(
            other("No credit for both CLCV 2420 and CLCV 4860")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("clcv3800", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng1500", List.of(
            pre("writ1110", "Enrollment in or completion of WRIT 1110")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2010", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2110", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2120", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2610", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2620", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2640", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2650", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2740", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("eng2750", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("ethn2200", List.of(
            other("Credit only for one of ETHN 2200 or ROCS 2200")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("film1610", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("fren2010", List.of(
            pre("fren1020", "FREN 1020 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("fren2020", List.of(
            pre("fren2010", "FREN 2010 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("fren2220", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("germ2010", List.of(
            pre("germ1020", "GERM 1020 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("germ2020", List.of(
            pre("germ2010", "GERM 2010 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("germ2150", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("germ2160", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("hnrs2020", List.of(
            pre("hnrs2010", "HNRS 2010"),
            other("Admission to BGSU's Honors College")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("hnrs2600", List.of(
            pre("hnrs2010", "HNRS 2010"),
            other("Admission to BGSU's Honors College")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("ital2620", List.of(), "BG Perspective", "BGP Humanities & Arts"));

        // --- Humanities & Arts (continued) ---
        courseInfoList.add(ci("muct1010", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("muct1250", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("muct2220", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("muct2610", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil1010", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil1020", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil1030", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil1250", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil2190", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil2320", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("phil2420", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("popc1600", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("popc1650", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("popc1700", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("popc2200", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("rusn2150", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("rusn2160", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("span2010", List.of(
            pre("span1020", "SPAN 1020 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("span2020", List.of(
            pre("span2010", "SPAN 2010 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("span2030", List.of(
            pre("span2010", "SPAN 2010 or placement")),
            "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("span2700", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("thea1410", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("thea2020", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("thfm2150", List.of(), "BG Perspective", "BGP Humanities & Arts"));
        courseInfoList.add(ci("ws2000", List.of(), "BG Perspective", "BGP Humanities & Arts"));

        // --- Social and Behavioral Sciences ---
        courseInfoList.add(ci("afrs2000", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("asia1800", List.of(
            other("Credit for only one of ASIA 1800 or HIST 1800")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("asia2000", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("cast2010", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("cdis1230", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("econ2000", List.of(
            other("No credit for students with ECON 2020 or ECON 2030")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("econ2020", List.of(
            other("High school algebra or equivalent")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("econ2030", List.of(
            pre("econ2020", "ECON 2020 or consent of department")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("edfi2980", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("eiec2210", List.of(
            pre("edtl2010", "C or better in EDTL 2010"),
            other("Cumulative GPA of 2.5 or higher")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("envs1010", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("ethn1010", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("ethn1100", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("ethn1200", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("ethn1300", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));

        // --- Social & Behavioral Sciences (continued) ---
        courseInfoList.add(ci("ethn1600", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("ethn2010", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("ethn2600", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("geog1210", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("geog1220", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("geog2300", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("gero1010", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hdfs1930", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hdfs2020", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hist1250", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hist1260", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hist1510", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hist1520", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hnrs2010", List.of(
            other("Admission to the Honors College")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("hnrs2400", List.of(
            pre("hnrs2010", "HNRS 2010"),
            other("Admission to BGSU's Honors College")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("inst2000", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("mdia1030", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("mdia3520", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("pols1100", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("pols1710", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("pols1720", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        // Note: psyc1010, soc1010, soc2310 already exist as MDC Course entries above
        courseInfoList.add(ci("soc2020", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("soc2120", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("soc2160", List.of(), "BG Perspective", "BGP Social & Behavioral Sciences"));
        courseInfoList.add(ci("tech3020", List.of(
            other("Junior status or consent of instructor")),
            "BG Perspective", "BGP Social & Behavioral Sciences"));

        // --- Natural Sciences ---
        courseInfoList.add(ci("astr1010", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("astr2010", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("astr2120", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("biol1010", List.of(
            other("No credit for both ENVH 1050 and BIOL 1010")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("biol1040", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("biol1080", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("biol2040", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("biol2050", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("chem1000", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("chem1090", List.of(
            other("Two years HS science + MATH 1190/1200/1220/1280/1290/1310/1340/2320 or placement 32+"),
            co("chem1100", "CHEM 1100")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("chem1100", List.of(
            co("chem1090", "CHEM 1090")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("chem1230", List.of(
            other("MATH 1200/1220/1230/1260/1280/1300/1310/1340 or placement 41+"),
            co("chem1240", "CHEM 1240")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("chem1240", List.of(
            co("chem1230", "CHEM 1230")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("chem1350", List.of(
            other("High school chemistry or CHEM 1090"),
            pre("math1220", "MATH 1220 or higher or placement 41+")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("fn2070", List.of(
            co("fn2080", "FN 2080")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("fn2080", List.of(
            co("fn2070", "FN 2070")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("geog1250", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("geog1260", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("geol1000", List.of(
            other("Credit for no more than one: GEOL 1000, 1010, 1040")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("geol1040", List.of(
            other("Credit for no more than one: GEOL 1000, 1010, 1040")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("geol1050", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("geol2150", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("hnrs2500", List.of(
            pre("hnrs2010", "HNRS 2010"),
            other("Admission to BGSU's Honors College")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("phys1010", List.of(), "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("phys2010", List.of(
            other("Math placement or C+ in MATH 1120 or MATH 1200+")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("phys2020", List.of(
            pre("phys2010", "PHYS 2010")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("phys2110", List.of(
            co("math1310", "MATH 1310")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("phys2120", List.of(
            pre("phys2110", "PHYS 2110"),
            co("math2320", "MATH 2320")),
            "BG Perspective", "BGP Natural Sciences"));
        courseInfoList.add(ci("sees2220", List.of(), "BG Perspective", "BGP Natural Sciences"));

        // EDTL 2010 — Not BGP, but prereq for EIEC 2210
        courseInfoList.add(ci("edtl2010", List.of(), "BG Perspective", "Supporting Course"));

        // =====================================================================
        // TIER 5 — Foreign Language Courses
        // =====================================================================

        // --- American Sign Language ---
        courseInfoList.add(ci("asl1010", List.of(), "Foreign Language", "American Sign Language"));
        courseInfoList.add(ci("asl1020", List.of(
            pre("asl1010", "C or higher in ASL 1010")),
            "Foreign Language", "American Sign Language"));
        courseInfoList.add(ci("asl2010", List.of(
            pre("asl1020", "C or higher in ASL 1020")),
            "Foreign Language", "American Sign Language"));
        courseInfoList.add(ci("asl2020", List.of(
            pre("asl2010", "C or better in ASL 2010")),
            "Foreign Language", "American Sign Language"));

        // --- Chinese ---
        courseInfoList.add(ci("chin1010", List.of(), "Foreign Language", "Chinese"));
        courseInfoList.add(ci("chin1020", List.of(
            pre("chin1010", "CHIN 1010 or one year of HS Chinese")),
            "Foreign Language", "Chinese"));
        courseInfoList.add(ci("chin2010", List.of(
            pre("chin1020", "CHIN 1020 or two years of HS Chinese")),
            "Foreign Language", "Chinese"));
        courseInfoList.add(ci("chin2020", List.of(
            pre("chin2010", "CHIN 2010 or three years of HS Chinese")),
            "Foreign Language", "Chinese"));
        courseInfoList.add(ci("chin2160", List.of(), "Foreign Language", "Chinese"));
        courseInfoList.add(ci("chin3120", List.of(), "Foreign Language", "Chinese"));
        courseInfoList.add(ci("chin4150", List.of(), "Foreign Language", "Chinese"));

        // --- French ---
        courseInfoList.add(ci("fren1010", List.of(), "Foreign Language", "French"));
        courseInfoList.add(ci("fren1020", List.of(
            pre("fren1010", "FREN 1010 or placement")),
            "Foreign Language", "French"));
        courseInfoList.add(ci("fren2120", List.of(
            pre("fren2010", "FREN 2010 or three years of HS French")),
            "Foreign Language", "French"));

        // --- German ---
        courseInfoList.add(ci("germ1010", List.of(), "Foreign Language", "German"));
        courseInfoList.add(ci("germ1020", List.of(
            pre("germ1010", "GERM 1010 or placement")),
            "Foreign Language", "German"));
        // germ2150, germ2160 already in Tier 4
        courseInfoList.add(ci("germ3110", List.of(
            pre("germ2020", "GERM 2020 or permission of instructor")),
            "Foreign Language", "German"));
        courseInfoList.add(ci("germ3800", List.of(), "Foreign Language", "German"));
        courseInfoList.add(ci("germ4150", List.of(), "Foreign Language", "German"));

        // --- Greek ---
        courseInfoList.add(ci("grk1010", List.of(), "Foreign Language", "Greek"));
        courseInfoList.add(ci("grk1020", List.of(
            pre("grk1010", "GRK 1010 or one year of HS Greek")),
            "Foreign Language", "Greek"));
        courseInfoList.add(ci("grk2010", List.of(
            pre("grk1020", "GRK 1020 or two years of HS Greek")),
            "Foreign Language", "Greek"));
        courseInfoList.add(ci("grk2020", List.of(
            pre("grk2010", "GRK 2010")),
            "Foreign Language", "Greek"));

        // --- Italian ---
        courseInfoList.add(ci("ital1010", List.of(), "Foreign Language", "Italian"));
        courseInfoList.add(ci("ital1020", List.of(
            pre("ital1010", "ITAL 1010 or one year of HS Italian")),
            "Foreign Language", "Italian"));
        courseInfoList.add(ci("ital2010", List.of(), "Foreign Language", "Italian"));
        courseInfoList.add(ci("ital2020", List.of(
            pre("ital2010", "ITAL 2010 or three years of HS Italian")),
            "Foreign Language", "Italian"));

        // --- Japanese ---
        courseInfoList.add(ci("japn1010", List.of(), "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn1020", List.of(
            pre("japn1010", "JAPN 1010 or one year of HS Japanese")),
            "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn2010", List.of(
            pre("japn1020", "JAPN 1020 or two years of HS Japanese")),
            "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn2020", List.of(
            pre("japn2010", "JAPN 2010 or three years of HS Japanese")),
            "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn2150", List.of(), "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn2160", List.of(), "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn3120", List.of(), "Foreign Language", "Japanese"));
        courseInfoList.add(ci("japn4150", List.of(), "Foreign Language", "Japanese"));

        // --- Latin ---
        courseInfoList.add(ci("lat1010", List.of(), "Foreign Language", "Latin"));
        courseInfoList.add(ci("lat1020", List.of(
            pre("lat1010", "LAT 1010 or one year of HS Latin")),
            "Foreign Language", "Latin"));
        courseInfoList.add(ci("lat2010", List.of(
            pre("lat1020", "LAT 1020 or two years of HS Latin")),
            "Foreign Language", "Latin"));
        courseInfoList.add(ci("lat2020", List.of(
            pre("lat2010", "LAT 2010 or three years of HS Latin")),
            "Foreign Language", "Latin"));

        // --- Russian ---
        courseInfoList.add(ci("rusn1010", List.of(), "Foreign Language", "Russian"));
        courseInfoList.add(ci("rusn1020", List.of(
            pre("rusn1010", "RUSN 1010 or placement")),
            "Foreign Language", "Russian"));
        courseInfoList.add(ci("rusn2010", List.of(
            pre("rusn1020", "RUSN 1020 or placement")),
            "Foreign Language", "Russian"));
        courseInfoList.add(ci("rusn2020", List.of(
            pre("rusn2010", "RUSN 2010 or placement")),
            "Foreign Language", "Russian"));
        courseInfoList.add(ci("rusn3120", List.of(), "Foreign Language", "Russian"));
        courseInfoList.add(ci("rusn3160", List.of(), "Foreign Language", "Russian"));

        // --- Spanish ---
        courseInfoList.add(ci("span1010", List.of(), "Foreign Language", "Spanish"));
        courseInfoList.add(ci("span1020", List.of(
            pre("span1010", "SPAN 1010 or placement")),
            "Foreign Language", "Spanish"));
        courseInfoList.add(ci("span2120", List.of(
            pre("span2010", "SPAN 2010 or placement")),
            "Foreign Language", "Spanish"));

        // Save all course info
        courseInfoRepository.saveAll(courseInfoList);
        
        log.info("Seeded {} BGSU course info records", courseInfoList.size());
    }
    
    @Override
    public int getOrder() {
        return 15; // Course info should be created after courses (order 10)
    }
    
    @Override
    public boolean shouldSeed() {
        return courseInfoRepository.count() == 0 && courseRepository.count() > 0;
    }
    
    /** Shorthand: CourseInfo with typed PrerequisiteEntry list. */
    private CourseInfo ci(String courseId, List<PrerequisiteEntry> prereqs,
                          String program, String courseType) {
        CourseInfo info = new CourseInfo();
        info.setCourseId(courseId);
        info.setPrerequisites(prereqs);
        info.setProgram(program);
        info.setCourseType(courseType);
        return info;
    }

    /** Shorthand: PREREQUISITE entry with description. */
    private PrerequisiteEntry pre(String courseId, String description) {
        return new PrerequisiteEntry(courseId, PrerequisiteType.PREREQUISITE, description);
    }

    /** Shorthand: PREREQUISITE entry (no description). */
    private PrerequisiteEntry pre(String courseId) {
        return new PrerequisiteEntry(courseId, PrerequisiteType.PREREQUISITE, null);
    }

    /** Shorthand: COREQUISITE entry with description. */
    private PrerequisiteEntry co(String courseId, String description) {
        return new PrerequisiteEntry(courseId, PrerequisiteType.COREQUISITE, description);
    }

    /** Shorthand: OTHER (non-course) requirement entry. */
    private PrerequisiteEntry other(String description) {
        return new PrerequisiteEntry(null, PrerequisiteType.OTHER, description);
    }

    private CourseInfo createCourseInfo(String courseId, List<String> prerequisiteIds,
                                       String program, String courseType) {
        CourseInfo courseInfo = new CourseInfo();
        courseInfo.setCourseId(courseId);
        // Convert plain string IDs to PrerequisiteEntry with default PREREQUISITE type.
        // Structured parsing (COREQUISITE / OTHER) is done later from prerequisiteText.
        List<PrerequisiteEntry> prereqs = prerequisiteIds.stream()
                .map(PrerequisiteEntry::new)
                .collect(Collectors.toList());
        courseInfo.setPrerequisites(prereqs);
        courseInfo.setProgram(program);
        courseInfo.setCourseType(courseType);
        return courseInfo;
    }
}
