package com.sap.smart_academic_calendar.service.seeding;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.Program;
import com.sap.smart_academic_calendar.model.RequirementCategory;
import com.sap.smart_academic_calendar.model.RequirementCourse;
import com.sap.smart_academic_calendar.model.RequirementGroup;
import com.sap.smart_academic_calendar.model.RequirementOption;
import com.sap.smart_academic_calendar.model.SelectionRule;
import com.sap.smart_academic_calendar.repository.CourseRepository;
import com.sap.smart_academic_calendar.repository.ProgramRepository;

/**
 * Seeds the BGSU Software Engineering B.S. degree program with its full requirement hierarchy.
 *
 * <p>Source: <a href="https://catalog.bgsu.edu/preview_program.php?catoid=23&poid=8676">
 * BGSU 2025-2026 Undergraduate Catalog</a></p>
 *
 * <p>Categories seeded (matching catalog sections):</p>
 * <ol>
 *   <li>BG Perspective (BGP) Requirements</li>
 *   <li>Arts &amp; Sciences Requirements (WLC, Lab Science, QL, MDC)</li>
 *   <li>Major Requirements (SE Core, Internship, SE Electives)</li>
 *   <li>Additional Requirements (Math &amp; Science — 30 credits)</li>
 *   <li>Minor Requirements</li>
 *   <li>Graduation Requirements</li>
 * </ol>
 *
 * <p>Runs after CourseSeeder (order 10) and CourseInfoSeeder (order 11).</p>
 */
@Component
public class ProgramSeeder implements DataSeeder<Program> {

    private static final Logger log = LoggerFactory.getLogger(ProgramSeeder.class);

    private final ProgramRepository programRepository;
    private final CourseRepository courseRepository;

    /** Cached courses keyed by lowercase ID for fast lookup during seeding. */
    private Map<String, Course> courseCache;

    public ProgramSeeder(ProgramRepository programRepository, CourseRepository courseRepository) {
        this.programRepository = programRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public int getOrder() {
        return 12; // After CourseSeeder (10) and CourseInfoSeeder (11)
    }

    @Override
    public boolean shouldSeed() {
        return !programRepository.existsByName("Software Engineering, B.S.");
    }

    @Override
    public void seed() throws Exception {
        if (!shouldSeed()) {
            log.info("Program 'Software Engineering, B.S.' already exists — skipping.");
            return;
        }

        // Build a lookup cache from all seeded courses
        courseCache = new HashMap<>();
        courseRepository.findAll().forEach(c -> courseCache.put(c.getId(), c));
        log.info("Loaded {} courses into cache for program seeding", courseCache.size());

        Program program = buildProgram();
        programRepository.save(program);
        log.info("Seeded program '{}' with {} categories",
                program.getName(), program.getCategories().size());
    }

    // ═══════════════════════════════════════════════════════════════
    //  Build the full program hierarchy
    // ═══════════════════════════════════════════════════════════════

    private Program buildProgram() {
        Program p = new Program("Software Engineering, B.S.", "B.S.");
        p.setTotalCreditsRequired(120);
        p.setMinGpa(2.00);
        p.setCatalogYear("2025-2026");
        p.setCatalogUrl("https://catalog.bgsu.edu/preview_program.php?catoid=23&poid=8676");
        p.setDescription(
            "Software engineers are in high demand in a wide variety of fields, including "
            + "business, communications, health care, and government. Graduates are well suited "
            + "to work on diverse software engineering teams, designing and building complex and "
            + "high-quality software systems.");
        p.setAdmissionRequirements(
            "SAT Math 550+ (post-March 2016), or ACT Math 22+, or Math Placement of MATH 1220+, "
            + "or prior completion of MATH 1220/1280/1310/1340 or equivalent.");
        p.setGraduationNotes(
            "Minimum 120 credits, 2.00 GPA, 30 BGSU credits, 40 credits at 3000/4000 level, "
            + "completion of all degree requirements including BGP Core. "
            + "One departmentally approved internship required.");

        // Category 1: BGP
        p.addCategory(buildBgpCategory());
        // Category 2: Arts & Sciences
        p.addCategory(buildArtsSciencesCategory());
        // Category 3: Major Requirements
        p.addCategory(buildMajorCategory());
        // Category 4: Additional Requirements
        p.addCategory(buildAdditionalCategory());
        // Category 5: Minor Requirements
        p.addCategory(buildMinorCategory());
        // Category 6: Graduation Requirements
        p.addCategory(buildGraduationCategory());

        return p;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 1 — BG Perspective (BGP) Requirements
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildBgpCategory() {
        RequirementCategory cat = new RequirementCategory(
                "BG Perspective (BGP) Requirements", 36, 1);
        cat.setDescription(
            "The BGSU General Education Program requires at least 36 total BGP credits "
            + "across multiple domains. Some courses overlap with A&S and major requirements.");

        int sort = 0;

        // 1. English Composition & Oral Communication (at least 1)
        RequirementGroup engComp = group("English Composition and Oral Communication",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        engComp.setMinCoursesRequired(1);
        addOptionWithCourses(engComp, "Default", 0, "comm1020", "writ1110", "writ1120");
        cat.addGroup(engComp);

        // 2. Quantitative Literacy (at least 1)
        RequirementGroup ql = group("Quantitative Literacy",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        ql.setMinCoursesRequired(1);
        ql.setConstraintNotes("Satisfied by MATH courses in the major.");
        addOptionWithCourses(ql, "Default", 0,
                "math1150", "math1190", "math1200", "math1220", "math1280",
                "math1310", "math1340");
        cat.addGroup(ql);

        // 3. Humanities and the Arts (at least 2)
        RequirementGroup hum = group("Humanities and the Arts",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        hum.setMinCoursesRequired(2);
        addOptionWithCourses(hum, "Default", 0,
                "arth1450", "arth1460", "arth2700",
                "clcv2410", "clcv2420", "clcv3800",
                "eng1500", "eng2010", "eng2110", "eng2120",
                "eng2610", "eng2620", "eng2640", "eng2650", "eng2740", "eng2750",
                "film1610",
                "muct1010", "muct1250", "muct2220", "muct2610",
                "phil1010", "phil1020", "phil1030", "phil1250", "phil2190", "phil2320", "phil2420",
                "popc1600", "popc1650", "popc1700", "popc2200",
                "thea1410", "thea2020", "thfm2150",
                "hnrs2020", "hnrs2600",
                "rusn2150", "rusn2160",
                "ital2620",
                "fren2010", "fren2020", "fren2220",
                "germ2010", "germ2020", "germ2150", "germ2160",
                "span2010", "span2020", "span2030", "span2700",
                "ws2000", "afrs2000");
        cat.addGroup(hum);

        // 4. Natural Sciences (at least 2, at least 1 lab)
        RequirementGroup natSci = group("Natural Sciences",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        natSci.setMinCoursesRequired(2);
        natSci.setConstraintNotes("At least one lab science required.");
        addOptionWithCourses(natSci, "Default", 0,
                "astr1010", "astr2010", "astr2120",
                "biol1010", "biol1040", "biol1080", "biol2040", "biol2050",
                "chem1000", "chem1090", "chem1100", "chem1230", "chem1240", "chem1350",
                "envs1010",
                "geog1250", "geog1260",
                "geol1000", "geol1040", "geol1050", "geol2150",
                "phys1010", "phys2010", "phys2020", "phys2110", "phys2120",
                "sees2220");
        cat.addGroup(natSci);

        // 5. Social and Behavioral Sciences (at least 2)
        RequirementGroup social = group("Social and Behavioral Sciences",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        social.setMinCoursesRequired(2);
        addOptionWithCourses(social, "Default", 0,
                "econ2000", "econ2020", "econ2030",
                "ethn1010", "ethn1100", "ethn1200", "ethn1300", "ethn1600",
                "ethn2010", "ethn2200", "ethn2600",
                "geog1210", "geog1220", "geog2300",
                "gero1010",
                "hdfs1930", "hdfs2020",
                "hist1250", "hist1260", "hist1510", "hist1520",
                "pols1100", "pols1710", "pols1720", "pols2900",
                "psyc1010", "psyc2700",
                "soc1010", "soc2020", "soc2120", "soc2160", "soc2310", "soc2690");
        cat.addGroup(social);

        // 6. Cultural Diversity in the US (at least 1)
        RequirementGroup cultDiv = group("Cultural Diversity in the US",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        cultDiv.setMinCoursesRequired(1);
        cultDiv.setConstraintNotes(
            "Designated courses in Humanities/Social Sciences domains may satisfy both BGP and this requirement.");
        addOptionWithCourses(cultDiv, "Default", 0,
                "ethn1010", "ethn2200", "afrs2000", "ws2000", "soc2690");
        cat.addGroup(cultDiv);

        // 7. International Perspective (at least 1)
        RequirementGroup intlPersp = group("International Perspective",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        intlPersp.setMinCoursesRequired(1);
        addOptionWithCourses(intlPersp, "Default", 0,
                "asia1800", "asia2000", "cast2010", "inst2000",
                "pols1710", "pols1720", "geog2300", "hist1250", "hist1260");
        cat.addGroup(intlPersp);

        // 8. Composition Requirement (WRIT 1120 required)
        RequirementGroup comp = group("Composition Requirement",
                SelectionRule.ALL_REQUIRED, ++sort);
        addOptionWithCourses(comp, "Default", 0, "writ1120");
        cat.addGroup(comp);

        // 9. Additional BGP Credits (fill to 36)
        RequirementGroup addBgp = group("Additional BGP Credits",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        addBgp.setMinCreditsRequired(36);
        addBgp.setConstraintNotes(
            "Select additional courses from any BGP category to reach 36 total BGP credits.");
        // Link a broad set of BGP-eligible courses (includes all MDC-approved courses)
        addOptionWithCourses(addBgp, "Any BGP-eligible courses", 0,
                "comm1020", "writ1110", "writ1120", "math1310",
                "arth1450", "eng1500", "eng2010", "phil1010", "phil1020", "phil1030",
                "muct1010",
                "biol2040", "chem1230",
                "psyc1010", "psyc2700", "soc1010", "soc2020", "soc2120",
                "econ2000", "econ2020", "hist1250", "hist1260", "hist1510", "hist1520",
                "ethn1010", "ethn2200", "pols1100", "pols2900", "geog1210", "geog1220",
                "gero1010", "hdfs1930", "hdfs2020", "ws2000",
                "acs2000", "acs2500", "arch2330", "arch2340", "art1010",
                "cdis1230", "edfi2980", "eiec2210", "edtl2010",
                "mdia1030", "mdia3520", "tech3020");
        cat.addGroup(addBgp);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 2 — Arts & Sciences Requirements
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildArtsSciencesCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Arts & Sciences Requirements", null, 2);
        cat.setDescription(
            "Requirements specific to the College of Arts & Sciences, including "
            + "World Languages and Cultures, Lab Science, Quantitative Literacy, "
            + "and the Multidisciplinary Component (MDC).");

        int sort = 0;

        // 1. World Languages and Cultures — CHOOSE_SEQUENCE (one language, 4 courses)
        RequirementGroup wlc = group("World Languages and Cultures",
                SelectionRule.CHOOSE_SEQUENCE, ++sort);
        wlc.setMinCoursesRequired(4);
        wlc.setConstraintNotes(
            "Complete a 4-course sequence through the 2020 level in one language. "
            + "Students with prior experience may place into higher-level courses.");

        // One option per language (only languages with full 4-course seeded sequence)
        addSequenceOption(wlc, "Spanish",  0, "span1010", "span1020", "span2010", "span2020");
        addSequenceOption(wlc, "French",   1, "fren1010", "fren1020", "fren2010", "fren2020");
        addSequenceOption(wlc, "German",   2, "germ1010", "germ1020", "germ2010", "germ2020");
        addSequenceOption(wlc, "Chinese",  3, "chin1010", "chin1020", "chin2010", "chin2020");
        addSequenceOption(wlc, "Japanese", 4, "japn1010", "japn1020", "japn2010", "japn2020");
        addSequenceOption(wlc, "Italian",  5, "ital1010", "ital1020", "ital2010", "ital2020");
        addSequenceOption(wlc, "Russian",  6, "rusn1010", "rusn1020", "rusn2010", "rusn2020");
        addSequenceOption(wlc, "ASL",      7, "asl1010",  "asl1020",  "asl2010",  "asl2020");
        addSequenceOption(wlc, "Greek",    8, "grk1010",  "grk1020",  "grk2010",  "grk2020");
        addSequenceOption(wlc, "Latin",    9, "lat1010",  "lat1020",  "lat2010",  "lat2020");
        cat.addGroup(wlc);

        // 2. A&S Lab Science (1 additional)
        RequirementGroup labSci = group("Lab Science",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        labSci.setMinCoursesRequired(1);
        labSci.setConstraintNotes("One additional lab science course beyond the science sequence in Additional Requirements.");
        addOptionWithCourses(labSci, "Default", 0,
                "biol2040", "biol2050",
                "chem1230", "chem1240",
                "phys2010", "phys2020",
                "geol1040", "geol1050",
                "envs1010");
        cat.addGroup(labSci);

        // 3. Quantitative Literacy — CHOOSE_ONE_OPTION
        RequirementGroup asQl = group("Quantitative Literacy",
                SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        asQl.setConstraintNotes("MATH 1310 alone, OR MATH 1340 + MATH 1350 together.");
        addOptionWithCourses(asQl, "Option A: MATH 1310", 0, "math1310");
        addOptionWithCourses(asQl, "Option B: MATH 1340 + 1350", 1, "math1340", "math1350");
        cat.addGroup(asQl);

        // 4. Multidisciplinary Component (MDC) — 4 courses, different prefixes, 2 at 3000/4000
        RequirementGroup mdc = group("Multidisciplinary Component (MDC)",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        mdc.setMinCoursesRequired(4);
        mdc.setMinCreditsRequired(12);
        mdc.setConstraintNotes(
            "Four courses, each with a different subject prefix. "
            + "At least two courses at 3000/4000 level. "
            + "Cannot be used for other A&S, major, minor, or BGP requirements.");
        // Seed representative MDC courses that exist in the course table
        addOptionWithCourses(mdc, "Approved MDC Courses", 0,
                "acs2000", "acs2500",
                "arch2330", "arch2340",
                "art1010",
                "cdis1230",
                "comm1020",
                "econ2000", "econ2020",
                "edfi2980", "eiec2210", "edtl2010",
                "eng1500", "eng2010",
                "ethn1010", "ethn2200",
                "geog1210", "geog1220",
                "gero1010",
                "hdfs1930", "hdfs2020",
                "hist1250", "hist1260", "hist1510", "hist1520",
                "mdia1030", "mdia3520",
                "phil1010", "phil1020", "phil1030",
                "pols1100", "pols2900",
                "psyc1010", "psyc2700",
                "soc1010", "soc2020", "soc2120",
                "tech3020",
                "ws2000");
        cat.addGroup(mdc);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 3 — Major Requirements (53 credits)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildMajorCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Major Requirements", 53, 3);
        cat.setDescription(
            "Core software engineering courses, internship, and electives. "
            + "A \"general science\" minor is offered in place of a conventional minor.");

        int sort = 0;

        // 1. SE Core Courses — ALL_REQUIRED
        RequirementGroup core = group("SE Core Courses", SelectionRule.ALL_REQUIRED, ++sort);
        addOptionWithCourses(core, "Required Core", 0,
                "cs2010", "cs2020", "cs2190", "cs2900",
                "cs3000", "cs3080", "cs3210", "cs3350",
                "se3540",
                "cs4390",
                "se4550", "se4560", "cs4620", "se4770");
        cat.addGroup(core);

        // 2. Internship — CHOOSE_ONE_OPTION (CS 3900 OR CS 3901)
        // Note: cs3901 is not in the seeded courses, so we only include cs3900
        RequirementGroup internship = group("Internship", SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        internship.setConstraintNotes(
            "One departmentally approved internship (Fall, Spring, or Summer). "
            + "CS 3900 or CS 3901.");
        addOptionWithCourses(internship, "CS 3900", 0, "cs3900");
        // cs3901 is not currently seeded — add when available
        cat.addGroup(internship);

        // 3. SE Electives — CHOOSE_N_COURSES (3 of 8)
        RequirementGroup electives = group("SE Electives",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        electives.setMinCoursesRequired(3);
        electives.setConstraintNotes(
            "Three Software Engineering Electives from among the listed courses, "
            + "or approved CS 3800 / CS 4800 sections.");
        addOptionWithCourses(electives, "Elective Pool", 0,
                "cs3060", "cs3140", "cs3160", "cs3180",
                "cs3240", "cs4120", "cs3800", "cs4800");
        cat.addGroup(electives);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 4 — Additional Requirements (30 credits)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildAdditionalCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Additional Requirements", 30, 4);
        cat.setDescription(
            "Mathematics (at least 15 credits) and Science requirements. "
            + "Students with a minor or joint major in MATH need not complete MATH courses listed here.");

        int sort = 0;

        // 1. Calculus — CHOOSE_ONE_OPTION
        RequirementGroup calc = group("Calculus", SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        calc.setConstraintNotes("MATH 1310 alone, OR MATH 1340 + MATH 1350.");
        addOptionWithCourses(calc, "MATH 1310", 0, "math1310");
        addOptionWithCourses(calc, "MATH 1340 + 1350", 1, "math1340", "math1350");
        cat.addGroup(calc);

        // 2. Discrete Math
        RequirementGroup discrete = group("Discrete Mathematics",
                SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        discrete.setConstraintNotes("MATH 2220.");
        addOptionWithCourses(discrete, "MATH 2220", 0, "math2220");
        cat.addGroup(discrete);

        // 3. Statistics — CHOOSE_ONE_OPTION
        RequirementGroup stats = group("Statistics", SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        stats.setConstraintNotes(
            "MATH 2470 + MATH 3410, OR BA 2110 + BA 2120.");
        addOptionWithCourses(stats, "MATH 2470 + MATH 3410", 0, "math2470", "math3410");
        addOptionWithCourses(stats, "BA 2110 + BA 2120", 1, "ba2110", "ba2120");
        cat.addGroup(stats);

        // 4. Math Elective — CHOOSE_N_COURSES (1)
        RequirementGroup mathElective = group("Math Elective",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        mathElective.setMinCoursesRequired(1);
        mathElective.setConstraintNotes(
            "Choose from approved math electives.");
        addOptionWithCourses(mathElective, "Math Elective Pool", 0,
                "math2320", "math3280", "math3320", "math3430");
        cat.addGroup(mathElective);

        // 5. Lab Science Sequence — CHOOSE_ONE_OPTION
        RequirementGroup labSeq = group("Lab Science Sequence",
                SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        labSeq.setConstraintNotes(
            "Complete one approved two-course lab science sequence.");
        addOptionWithCourses(labSeq, "Chemistry: CHEM 1230 + 1240", 0, "chem1230", "chem1240");
        addOptionWithCourses(labSeq, "Physics: PHYS 2010 + 2020",   1, "phys2010", "phys2020");
        addOptionWithCourses(labSeq, "Biology: BIOL 2040 + 2050",   2, "biol2040", "biol2050");
        addOptionWithCourses(labSeq, "Geology: GEOL 1040 + 1050",   3, "geol1040", "geol1050");
        cat.addGroup(labSeq);

        // 6. Additional approved Natural Science & Math courses
        RequirementGroup addMathSci = group("Additional Natural Science and Math",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        addMathSci.setMinCreditsRequired(30);
        addMathSci.setConstraintNotes(
            "Select additional A&S approved Natural Science and Math courses to reach 30 total credits for this category.");
        addOptionWithCourses(addMathSci, "Approved courses", 0,
                "math1280", "math1310", "math1340", "math1350", "math2220", "math2320",
                "math2470", "math3280", "math3320", "math3410", "math3430",
                "ba2110", "ba2120",
                "chem1230", "chem1240",
                "phys2010", "phys2020",
                "biol2040", "biol2050",
                "geol1040", "geol1050",
                "astr1010", "astr2010",
                "fn2070", "fn2080");
        cat.addGroup(addMathSci);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 5 — Minor Requirements
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildMinorCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Minor Requirements", null, 5);
        cat.setDescription(
            "A \"general science\" minor is offered to students in place of a conventional minor. "
            + "Consult your Faculty Advisor. A conventional minor may also be chosen, usually 21 hours.");

        RequirementGroup minor = group("Minor Selection",
                SelectionRule.CHOOSE_MIN_CREDITS, 1);
        minor.setMinCreditsRequired(21);
        minor.setConstraintNotes(
            "General science minor or any conventional minor (usually 21 hours). "
            + "Consult Faculty Advisor for approved options.");
        // No specific courses seeded — minor options vary widely
        cat.addGroup(minor);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 6 — Graduation Requirements
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildGraduationCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Graduation Requirements", null, 6);
        cat.setDescription("University and program requirements for graduation.");

        int sort = 0;

        RequirementGroup totalCreds = group("Total Credits",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        totalCreds.setMinCreditsRequired(120);
        totalCreds.setConstraintNotes("University minimum of 120 credit hours.");
        cat.addGroup(totalCreds);

        RequirementGroup gpa = group("Minimum GPA",
                SelectionRule.ALL_REQUIRED, ++sort);
        gpa.setConstraintNotes("Minimum GPA 2.00.");
        cat.addGroup(gpa);

        RequirementGroup bgsuCreds = group("BGSU Course Work",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        bgsuCreds.setMinCreditsRequired(30);
        bgsuCreds.setConstraintNotes("At least 30 credit hours of BGSU course work.");
        cat.addGroup(bgsuCreds);

        RequirementGroup upperLevel = group("Upper-Level Credits",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        upperLevel.setMinCreditsRequired(40);
        upperLevel.setConstraintNotes("A minimum of 40 credit hours at the 3000/4000 level.");
        cat.addGroup(upperLevel);

        RequirementGroup degreeReqs = group("Degree Completion",
                SelectionRule.ALL_REQUIRED, ++sort);
        degreeReqs.setConstraintNotes(
            "Completion of all degree requirements, including the BG Perspective Core. "
            + "A major, and if required, a minor, specialization or emphasis.");
        cat.addGroup(degreeReqs);

        RequirementGroup internReq = group("Internship Completion",
                SelectionRule.ALL_REQUIRED, ++sort);
        internReq.setConstraintNotes(
            "One departmentally approved internship (Fall, Spring, or Summer) is required.");
        cat.addGroup(internReq);

        return cat;
    }

    // ═══════════════════════════════════════════════════════════════
    //  Helper methods
    // ═══════════════════════════════════════════════════════════════

    /** Creates a RequirementGroup with name, selection rule, and sort order. */
    private RequirementGroup group(String name, SelectionRule rule, int sortOrder) {
        return new RequirementGroup(name, rule, sortOrder);
    }

    /**
     * Creates a RequirementOption with the given courses and adds it to the group.
     * Silently skips course IDs that don't exist in the cache (not seeded yet).
     */
    private void addOptionWithCourses(RequirementGroup group, String optionName,
                                      int optionSort, String... courseIds) {
        RequirementOption option = new RequirementOption(optionName, optionSort);
        int courseSort = 0;
        for (String cid : courseIds) {
            Course course = courseCache.get(cid);
            if (course != null) {
                option.addCourse(new RequirementCourse(course, courseSort++));
            } else {
                log.warn("Course '{}' not found in cache — skipped for option '{}'", cid, optionName);
            }
        }
        group.addOption(option);
    }

    /**
     * Creates a language sequence option and adds it to the group.
     */
    private void addSequenceOption(RequirementGroup group, String languageName,
                                   int optionSort, String... courseIds) {
        addOptionWithCourses(group, languageName + " Sequence", optionSort, courseIds);
    }
}
