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
 * Seeds the BGSU Computer Science B.S. degree program with its full requirement hierarchy.
 *
 * <p>Runs after ProgramSeeder (order 12).</p>
 */
@Component
public class CSProgramSeeder implements DataSeeder<Program> {

    private static final Logger log = LoggerFactory.getLogger(CSProgramSeeder.class);

    private final ProgramRepository programRepository;
    private final CourseRepository courseRepository;

    private Map<String, Course> courseCache;

    public CSProgramSeeder(ProgramRepository programRepository, CourseRepository courseRepository) {
        this.programRepository = programRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public int getOrder() {
        return 13;
    }

    @Override
    public boolean shouldSeed() {
        return !programRepository.existsByName("Computer Science, B.S.");
    }

    @Override
    public void seed() throws Exception {
        if (!shouldSeed()) {
            log.info("Program 'Computer Science, B.S.' already exists — skipping.");
            return;
        }

        courseCache = new HashMap<>();
        courseRepository.findAll().forEach(c -> courseCache.put(c.getId(), c));
        log.info("Loaded {} courses into cache for CS program seeding", courseCache.size());

        Program program = buildProgram();
        programRepository.save(program);
        log.info("Seeded program '{}' with {} categories",
                program.getName(), program.getCategories().size());
    }

    private Program buildProgram() {
        Program p = new Program("Computer Science, B.S.", "B.S.");
        p.setTotalCreditsRequired(122);
        p.setMinGpa(2.00);
        p.setCatalogYear("2025-2026");
        p.setCatalogUrl("https://catalog.bgsu.edu/preview_program.php?catoid=23&poid=8625");
        p.setDescription(
            "The Computer Science program prepares students for careers in software development, "
            + "systems programming, algorithm design, and a wide range of computing fields.");

        // Category 1: BGP (same as SE)
        p.addCategory(buildBgpCategory());
        // Category 2: Arts & Sciences (same as SE)
        p.addCategory(buildArtsSciencesCategory());
        // Category 3: Major Requirements (CS-specific)
        p.addCategory(buildMajorCategory());
        // Category 4: Additional Requirements (same as SE)
        p.addCategory(buildAdditionalCategory());
        // Category 5: Minor Requirements
        p.addCategory(buildMinorCategory());
        // Category 6: Graduation Requirements (122 credits)
        p.addCategory(buildGraduationCategory());

        return p;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 1 — BG Perspective (BGP) Requirements (same as SE)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildBgpCategory() {
        RequirementCategory cat = new RequirementCategory(
                "BG Perspective (BGP) Requirements", 36, 1);
        cat.setDescription(
            "The BGSU General Education Program requires at least 36 total BGP credits "
            + "across multiple domains.");

        int sort = 0;

        RequirementGroup engComp = group("English Composition and Oral Communication",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        engComp.setMinCoursesRequired(1);
        addOptionWithCourses(engComp, "Default", 0, "comm1020", "writ1110", "writ1120");
        cat.addGroup(engComp);

        RequirementGroup ql = group("Quantitative Literacy",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        ql.setMinCoursesRequired(1);
        addOptionWithCourses(ql, "Default", 0,
                "math1150", "math1190", "math1200", "math1220", "math1280",
                "math1310", "math1340");
        cat.addGroup(ql);

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

        RequirementGroup cultDiv = group("Cultural Diversity in the US",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        cultDiv.setMinCoursesRequired(1);
        addOptionWithCourses(cultDiv, "Default", 0,
                "ethn1010", "ethn2200", "afrs2000", "ws2000", "soc2690");
        cat.addGroup(cultDiv);

        RequirementGroup intlPersp = group("International Perspective",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        intlPersp.setMinCoursesRequired(1);
        addOptionWithCourses(intlPersp, "Default", 0,
                "asia1800", "asia2000", "cast2010", "inst2000",
                "pols1710", "pols1720", "geog2300", "hist1250", "hist1260");
        cat.addGroup(intlPersp);

        RequirementGroup comp = group("Composition Requirement",
                SelectionRule.ALL_REQUIRED, ++sort);
        addOptionWithCourses(comp, "Default", 0, "writ1120");
        cat.addGroup(comp);

        RequirementGroup addBgp = group("Additional BGP Credits",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        addBgp.setMinCreditsRequired(36);
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
    //  Category 2 — Arts & Sciences Requirements (same as SE)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildArtsSciencesCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Arts & Sciences Requirements", null, 2);
        cat.setDescription(
            "Requirements specific to the College of Arts & Sciences, including "
            + "World Languages and Cultures, Lab Science, Quantitative Literacy, "
            + "and the Multidisciplinary Component (MDC).");

        int sort = 0;

        RequirementGroup wlc = group("World Languages and Cultures",
                SelectionRule.CHOOSE_SEQUENCE, ++sort);
        wlc.setMinCoursesRequired(4);
        wlc.setConstraintNotes(
            "Complete a 4-course sequence through the 2020 level in one language.");
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

        RequirementGroup labSci = group("Lab Science",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        labSci.setMinCoursesRequired(1);
        addOptionWithCourses(labSci, "Default", 0,
                "biol2040", "biol2050",
                "chem1230", "chem1240",
                "phys2010", "phys2020",
                "geol1040", "geol1050",
                "envs1010");
        cat.addGroup(labSci);

        RequirementGroup asQl = group("Quantitative Literacy",
                SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        addOptionWithCourses(asQl, "Option A: MATH 1310", 0, "math1310");
        addOptionWithCourses(asQl, "Option B: MATH 1340 + 1350", 1, "math1340", "math1350");
        cat.addGroup(asQl);

        RequirementGroup mdc = group("Multidisciplinary Component (MDC)",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        mdc.setMinCoursesRequired(4);
        mdc.setMinCreditsRequired(12);
        mdc.setConstraintNotes(
            "Four courses, each with a different subject prefix. "
            + "At least two courses at 3000/4000 level.");
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
    //  Category 3 — Major Requirements (CS-specific)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildMajorCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Major Requirements", 48, 3);
        cat.setDescription(
            "Core computer science courses, internship, and electives.");

        int sort = 0;

        // 1. CS Core Courses — ALL_REQUIRED (12 courses)
        RequirementGroup core = group("CS Core Courses", SelectionRule.ALL_REQUIRED, ++sort);
        addOptionWithCourses(core, "Required Core", 0,
                "cs2010", "cs2020", "cs2190", "cs2900",
                "cs3000", "cs3060", "cs3080", "cs3350",
                "se3540",
                "cs4120", "cs4390", "cs4770");
        cat.addGroup(core);

        // 2. Internship — CHOOSE_ONE_OPTION (CS 3900 OR CS 3901)
        RequirementGroup internship = group("Internship", SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        internship.setConstraintNotes(
            "One departmentally approved internship (Fall, Spring, or Summer).");
        addOptionWithCourses(internship, "CS 3900", 0, "cs3900");
        cat.addGroup(internship);

        // 3. CS 3000-level Elective — CHOOSE_N_COURSES (1)
        RequirementGroup elect3k = group("CS 3000-level Elective",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        elect3k.setMinCoursesRequired(1);
        elect3k.setConstraintNotes("One CS course at the 3000 level.");
        addOptionWithCourses(elect3k, "3000-level Pool", 0,
                "cs3140", "cs3160", "cs3180", "cs3210", "cs3240", "cs3800");
        cat.addGroup(elect3k);

        // 4. CS 4000-level Electives — CHOOSE_N_COURSES (3)
        RequirementGroup elect4k = group("CS 4000-level Electives",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        elect4k.setMinCoursesRequired(3);
        elect4k.setConstraintNotes("Three CS courses at the 4000 level.");
        addOptionWithCourses(elect4k, "4000-level Pool", 0,
                "cs4620", "cs4800", "se4550", "se4560");
        cat.addGroup(elect4k);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 4 — Additional Requirements (same as SE)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildAdditionalCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Additional Requirements", 30, 4);
        cat.setDescription(
            "Mathematics (at least 15 credits) and Science requirements.");

        int sort = 0;

        RequirementGroup calc = group("Calculus", SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        addOptionWithCourses(calc, "MATH 1310", 0, "math1310");
        addOptionWithCourses(calc, "MATH 1340 + 1350", 1, "math1340", "math1350");
        cat.addGroup(calc);

        RequirementGroup discrete = group("Discrete Mathematics",
                SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        addOptionWithCourses(discrete, "MATH 2220", 0, "math2220");
        cat.addGroup(discrete);

        RequirementGroup stats = group("Statistics", SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        stats.setConstraintNotes("MATH 2470 + MATH 3410, OR BA 2110 + BA 2120.");
        addOptionWithCourses(stats, "MATH 2470 + MATH 3410", 0, "math2470", "math3410");
        addOptionWithCourses(stats, "BA 2110 + BA 2120", 1, "ba2110", "ba2120");
        cat.addGroup(stats);

        RequirementGroup mathElective = group("Math Elective",
                SelectionRule.CHOOSE_N_COURSES, ++sort);
        mathElective.setMinCoursesRequired(1);
        addOptionWithCourses(mathElective, "Math Elective Pool", 0,
                "math2320", "math3280", "math3320", "math3430");
        cat.addGroup(mathElective);

        RequirementGroup labSeq = group("Lab Science Sequence",
                SelectionRule.CHOOSE_ONE_OPTION, ++sort);
        addOptionWithCourses(labSeq, "Chemistry: CHEM 1230 + 1240", 0, "chem1230", "chem1240");
        addOptionWithCourses(labSeq, "Physics: PHYS 2010 + 2020",   1, "phys2010", "phys2020");
        addOptionWithCourses(labSeq, "Biology: BIOL 2040 + 2050",   2, "biol2040", "biol2050");
        addOptionWithCourses(labSeq, "Geology: GEOL 1040 + 1050",   3, "geol1040", "geol1050");
        cat.addGroup(labSeq);

        RequirementGroup addMathSci = group("Additional Natural Science and Math",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        addMathSci.setMinCreditsRequired(30);
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
            "A \"general science\" minor is offered in place of a conventional minor. "
            + "Consult your Faculty Advisor.");

        RequirementGroup minor = group("Minor Selection",
                SelectionRule.CHOOSE_MIN_CREDITS, 1);
        minor.setMinCreditsRequired(21);
        cat.addGroup(minor);

        return cat;
    }

    // ───────────────────────────────────────────────────────────────
    //  Category 6 — Graduation Requirements (122 credits)
    // ───────────────────────────────────────────────────────────────

    private RequirementCategory buildGraduationCategory() {
        RequirementCategory cat = new RequirementCategory(
                "Graduation Requirements", null, 6);
        cat.setDescription("University and program requirements for graduation.");

        int sort = 0;

        RequirementGroup totalCreds = group("Total Credits",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        totalCreds.setMinCreditsRequired(122);
        totalCreds.setConstraintNotes("Minimum of 122 credit hours for Computer Science, B.S.");
        cat.addGroup(totalCreds);

        RequirementGroup gpa = group("Minimum GPA",
                SelectionRule.ALL_REQUIRED, ++sort);
        gpa.setConstraintNotes("Minimum GPA 2.00.");
        cat.addGroup(gpa);

        RequirementGroup bgsuCreds = group("BGSU Course Work",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        bgsuCreds.setMinCreditsRequired(30);
        cat.addGroup(bgsuCreds);

        RequirementGroup upperLevel = group("Upper-Level Credits",
                SelectionRule.CHOOSE_MIN_CREDITS, ++sort);
        upperLevel.setMinCreditsRequired(40);
        cat.addGroup(upperLevel);

        RequirementGroup degreeReqs = group("Degree Completion",
                SelectionRule.ALL_REQUIRED, ++sort);
        cat.addGroup(degreeReqs);

        RequirementGroup internReq = group("Internship Completion",
                SelectionRule.ALL_REQUIRED, ++sort);
        cat.addGroup(internReq);

        return cat;
    }

    // ═══════════════════════════════════════════════════════════════
    //  Helper methods
    // ═══════════════════════════════════════════════════════════════

    private RequirementGroup group(String name, SelectionRule rule, int sortOrder) {
        return new RequirementGroup(name, rule, sortOrder);
    }

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

    private void addSequenceOption(RequirementGroup group, String languageName,
                                   int optionSort, String... courseIds) {
        addOptionWithCourses(group, languageName + " Sequence", optionSort, courseIds);
    }
}
