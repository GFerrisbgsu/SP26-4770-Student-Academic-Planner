package com.sap.smart_academic_calendar.service.seeding;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.repository.CourseRepository;

/**
 * Seeds the BGSU course catalog with real data translated from Coursicle CSV exports.
 *
 * <p>Each entry is hand-translated from the CSV, preserving the exact catalog prerequisite
 * text (which may describe prerequisites, corequisites, consent requirements, grade
 * minimums, or combinations thereof).</p>
 *
 * <p>Tiers:</p>
 * <ul>
 *   <li>Tier 1 – CS/SE core courses (16 courses)</li>
 *   <li>Tier 2 – CS/SE elective courses (to be added)</li>
 *   <li>Tier 3 – Mathematics courses (to be added)</li>
 *   <li>Tier 4 – BGP general education courses (to be added)</li>
 *   <li>Tier 5 – Foreign language courses (to be added)</li>
 * </ul>
 */
@Component
public class CourseSeeder implements DataSeeder<Course> {
    
    private static final Logger log = LoggerFactory.getLogger(CourseSeeder.class);
    
    private final CourseRepository courseRepository;
    
    public CourseSeeder(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }
    
    @Override
    public void seed() throws Exception {
        if (courseRepository.count() > 0) {
            log.info("Courses already exist, skipping course seeding");
            return;
        }
        log.info("Seeding BGSU course catalog...");
        List<Course> courses = new ArrayList<>();

        // ======================================================
        // TIER 1 — CS/SE CORE REQUIRED COURSES (16 courses)
        // Source: coursicle_tier1_data.csv
        // prereqText preserves the exact catalog requirement
        // string, which may be a prereq, coreq, consent, or mix.
        // ======================================================

        // CS 1010 — Corequisite: MATH 1150, 1190, or 1220+
        courses.add(c("cs1010", "Introduction to Python Programming", "CS 1010", "CS", "1010",
            "bg-blue-500", "Ronald Conway", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introductory Python programming for problem solving and algorithm development. Basic programming topics include data types, control structures, file operations, arrays, functions, programming style, testing and debugging strategies. Does not apply to the computer science major.",
            "Corequisite(s): MATH 1150, MATH 1190, MATH 1220 or higher."));

        // CS 2010 — Prereq: MATH 1220/1280/1310/1340; OR Math Placement score + Corequisite MATH 1220;
        //           OR Math Placement score of MATH 1280 or higher
        courses.add(c("cs2010", "Programming Fundamentals", "CS 2010", "CS", "2010",
            "bg-blue-500", "Tianyi Song", "MWF (50 min) / M (50 min)", 3,
            list("Fall", "Spring"),
            "Problem solving and algorithm development. Basic programming concepts including elementary data types, arrays, strings, files, control structures, and functions. Searching and sorting algorithms. Testing and debugging strategies.",
            "Prerequisites: MATH 1220, MATH 1280, MATH 1310, or MATH 1340; or an appropriate Math Placement score with a Corequisite of MATH 1220; or a Math Placement score of MATH 1280 or higher."));

        // CS 2900 — No prerequisites; graded S/U
        courses.add(c("cs2900", "Career Preparation in Computing Fields", "CS 2900", "CS", "2900",
            "bg-blue-500", "Venu Dasigi", "MW (50 min) / TuTh (50 min)", 2,
            list("Fall", "Spring"),
            "Introduction to computing fields and careers in IT. Career exploration and planning. Introduction to the Co-op/internship experience. Job search preparation and strategies including resumes, interview preparation, and job fair participation. Professional ethics and etiquette. Graded S/U.",
            ""));

        // CS 2020 — Prereq: MATH 1280 (Precalculus) or higher AND C or better in CS 2010
        courses.add(c("cs2020", "Intermediate Programming", "CS 2020", "CS", "2020",
            "bg-blue-500", "Ronald Conway", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to object-oriented programming techniques. Constructors, destructors, operator overloading. Inheritance and polymorphism. Elementary data structures including linked lists. Dynamic storage allocation concepts.",
            "Prerequisites: MATH 1280 (Precalculus) or higher and grade of C or better in CS 2010."));

        // CS 2190 — Prereq: C or better in CS 2010
        //           Note: no credit for CS 2190
        courses.add(c("cs2190", "Computer Organization", "CS 2190", "CS", "2190",
            "bg-blue-500", "Tianyi Song", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Overview of computer design. Data and instruction representations. Assembly language. Logic design. Control and data flow. Introduction to instruction-level parallelism. Memory hierarchy fundamentals. Multiple processor systems. Students cannot get credits for CS 2190.",
            "Prerequisites: Grade of C or better in CS 2010."));

        // CS 3000 — Prereq: C or better in CS 1010 or higher
        courses.add(c("cs3000", "Professional and Societal Issues in Computing", "CS 3000", "CS", "3000",
            "bg-blue-500", "Jadwiga Carlson", "TBA", 3,
            list("Fall", "Spring"),
            "Impact of computers, the Internet, data, artificial intelligence (AI), machine learning (ML), and related computer technology on society. Explores personal privacy, intellectual property, legislative and constitutional issues, changing labor force composition, and professional ethics.",
            "Prerequisites: Grade of C or better in CS 1010 or higher."));

        // CS 3080 — Prereq: C or better in CS 2020 AND (CS 2190)
        //           Note: no credit for both CS 3080 and CS 3270
        courses.add(c("cs3080", "Operating Systems", "CS 3080", "CS", "3080",
            "bg-blue-500", "Hassan Rajaei", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Features of modern multiprocessing operating systems. Threads and processes; resource management; scheduling, concurrency, and communication; virtual memory management; secondary storage management. Students cannot get credits for both CS 3080 and CS 3270.",
            "Prerequisites: Grade of C or better in CS 2020 and CS 2190."));

        // CS 3210 — Prereq: C or better in CS 2020
        courses.add(c("cs3210", "Introduction to Software Security", "CS 3210", "CS", "3210",
            "bg-blue-500", "Yan Wu", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to software vulnerabilities. Major types of software vulnerabilities and attacks. Hands-on experience with attacks and countermeasures. Security issues of programming languages, and secure programming guidelines.",
            "Prerequisites: Grade of C or better in CS 2020."));

        // CS 3350 — Prereq: MATH 2220 AND C or better in CS 2020
        courses.add(c("cs3350", "Data Structures", "CS 3350", "CS", "3350",
            "bg-blue-500", "Ruinian Li", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Abstract data types including stacks, queues, lists, trees and graphs. Introduction to analysis of algorithms. Recursive searching and sorting algorithms. Adaptation and use of generic data structures and types. Functional concepts.",
            "Prerequisites: MATH 2220 and grade of C or better in CS 2020."));

        // SE 3540 — Prereq: C or better in CS 2020
        courses.add(c("se3540", "Introduction to Software Engineering", "SE 3540", "SE", "3540",
            "bg-indigo-500", "Abbas Heydarnoori", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Overview of software engineering as a discipline. Software life-cycle models and phases of the software development process. Introduction to Human Computer Interaction (HCI) user-centered development, teams and project management.",
            "Prerequisites: Grade of C or better in CS 2020."));

        // CS 3900 — Prereq: Consent of department (CSV prereq field showed cs3900 — OCR self-ref noise)
        //           Spring only; may be repeated up to 6 hours; graded S/U
        courses.add(c("cs3900", "Internship in Computer Science", "CS 3900", "CS", "3900",
            "bg-blue-500", "Hassan Rajaei", "TBA", 3,
            list("Spring"),
            "For students working in internship. Students must be registered for CS 3900 during completion of internship. Written reports and supervisor evaluation required. Does not apply to minor in Computer Science. May be repeated up to six hours.",
            "Prerequisites: Consent of department. Graded S/U."));

        // CS 4390 — Prereq: C or better in CS 3080
        //           Note: no credit for both CS 3270 and CS 4390 or CS 5390
        courses.add(c("cs4390", "Network Architecture and Applications", "CS 4390", "CS", "4390",
            "bg-blue-500", "Hassan Rajaei", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Layered architectures and protocols. TCP/IP protocol suite. Client-server communication paradigm. Application architectures such as push and pull technologies, web services, cloud and microservices, multimedia. Scalability and performance. Credit cannot be earned for both CS 3270 and CS 4390 or CS 5390.",
            "Prerequisites: Grade of C or better in CS 3080."));

        // SE 4550 — Prereq: C or better in SE 3540; Fall only
        //           Note: no credit for both SE 4550 and SE 5550
        courses.add(c("se4550", "Software Architecture and Design", "SE 4550", "SE", "4550",
            "bg-indigo-500", "Michael Decker", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Fall"),
            "Principles and concepts of analyzing and designing large software systems. Analysis of software systems. Designing software systems using design patterns and object-oriented techniques.",
            "Prerequisites: Grade of C or better in SE 3540. Credit cannot be received for both SE 4550 and SE 5550."));

        // SE 4560 — Prereq: C or better in SE 3540; primarily Spring (also some Fall offerings)
        //           Note: no credit for both SE 4560 and SE 5560
        courses.add(c("se4560", "Software Testing and Quality Assurance", "SE 4560", "SE", "4560",
            "bg-indigo-500", "Mehdi Keshani", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Spring", "Fall"),
            "Measurement of software quality. Verification and validation of software projects using various testing techniques. Integration of testing techniques in the build process.",
            "Prerequisites: Grade of C or better in SE 3540. Credit cannot be earned for both SE 4560 and SE 5560."));

        // CS 4620 — Prereq: C or better in CS 2020
        courses.add(c("cs4620", "Database Management Systems", "CS 4620", "CS", "4620",
            "bg-blue-500", "Abbas Heydarnoori", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Semantic models for conceptual and logical design of databases. Detailed study of relational systems: design, dependency and normal forms. Use of interactive and embedded query language. Overview of database connectivity, security, and object-oriented systems.",
            "Prerequisites: Grade of C or better in CS 2020."));

        // SE 4770 — Prereq: C or better in ALL THREE: SE 4550, SE 4560, AND CS 4620
        courses.add(c("se4770", "Software Engineering Capstone Experience", "SE 4770", "SE", "4770",
            "bg-indigo-500", "Michael Decker", "TBA", 3,
            list("Fall", "Spring"),
            "A synthesis of classroom knowledge and skills in computer science and software engineering, culminating in a comprehensive software engineering team project experience. Covers two or more areas of software engineering.",
            "Prerequisites: Grade of C or better in SE 4550, SE 4560, and CS 4620."));

        // CS 4770 — Prereq: C or better in CS 3350, and 15+ credit hours of CS 3000+
        courses.add(c("cs4770", "Computer Science Capstone Experience", "CS 4770", "CS", "4770",
            "bg-indigo-500", "Michael Decker", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "A synthesis of classroom knowledge and skills in computer science, culminating in a comprehensive team project experience. Covers two or more areas of Computer Science. Credit can be earned for only one of these courses: CS 4770, SE 4770, CS 4540.",
            "Prerequisites: Grade of C or better in CS 3350, and completed at least 15 credit hours of CS courses at 3000-level or higher."));

        // ======================================================
        // TIER 2 — CS/SE ELECTIVE COURSES (8 courses)
        // Source: coursicle_tier2_data.csv
        // ======================================================

        // CS 3060 — Prereq: C or better in CS 2020
        courses.add(c("cs3060", "Programming Languages", "CS 3060", "CS", "3060",
            "bg-blue-500", "Mehdi Keshani", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Examination of a wide variety of programming languages, paradigms, features, and syntaxes through exposure to theory and hands-on exercises. Topics covered include static, dynamic, strong and weakly typed, compiled and interpreted, object-oriented, functional and procedural programming, and decision constructs.",
            "Prerequisites: Grade of C or better in CS 2020."));

        // CS 3140 — Prereq: CS 2010 (NOT CS 2020 — per catalog)
        courses.add(c("cs3140", "Web Application Development", "CS 3140", "CS", "3140",
            "bg-blue-500", "Jadwiga Carlson", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall"),
            "A survey of web technologies and emerging web standards, protocols, markup languages, and scripting languages. Both client-side and server-side technologies and scripting languages are covered.",
            "Prerequisites: CS 2010."));

        // CS 3160 — Prereq: CS 2020
        courses.add(c("cs3160", "Windows Application Development", "CS 3160", "CS", "3160",
            "bg-blue-500", "Jadwiga Carlson", "MWF (50 min)", 3,
            list("Spring"),
            "Implementing a graphical user interface on the Windows operating system with object-oriented programming. Event-driven programming; dialogs and controls; data validation; graphics; database access; n-tier application design.",
            "Prerequisites: CS 2020."));

        // CS 3180 — Prereq: CS 2020
        courses.add(c("cs3180", "Mobile Application Development", "CS 3180", "CS", "3180",
            "bg-blue-500", "Rob Green", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Spring"),
            "An introduction to the fundamentals of mobile application design and development, including a focused study on Android Development. Topics covered range from mobile user interface/experience design, navigation, data sharing, data access, and the use of various tools and libraries.",
            "Prerequisites: CS 2020."));

        // CS 3240 — Prereq: CS 2020
        courses.add(c("cs3240", "Usability Engineering", "CS 3240", "CS", "3240",
            "bg-blue-500", "Keith Instone", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "User interface design and human-computer interaction. Understanding the user. Design and prototyping of highly usable interfaces. Design notations, dialog styles, screen layouts, and usability testing. Event-driven programming language for rapid prototyping.",
            "Prerequisites: CS 2020."));

        // CS 4120 — Prereq: MATH 2220 AND C+ in CS 3350
        courses.add(c("cs4120", "Design and Analysis of Algorithms", "CS 4120", "CS", "4120",
            "bg-blue-500", "Sankardas Roy", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Algorithms for solving problems that occur frequently in computer applications. Basic principles and techniques for designing and analyzing algorithms. Introduction to computational complexity, divide-and-conquer, dynamic programming, greedy approach, and graph algorithms.",
            "Prerequisites: MATH 2220 or equivalents and grade of C or better in CS 3350."));

        // CS 3800 — Prereq: CS 2010; may be repeated if topics differ
        courses.add(c("cs3800", "Special Topics in Computer Science", "CS 3800", "CS", "3800",
            "bg-blue-500", "Staff", "TBA", 3,
            list(),
            "Detailed study of the professional and ethical issues pertaining to computer science or of a particular computer system or programming language which is not covered elsewhere in the curriculum. May be repeated if topics differ.",
            "Prerequisites: CS 2010."));

        // CS 4800 — Prereq: Consent of instructor; may be repeated up to 6 hrs
        courses.add(c("cs4800", "Seminar in Computer Applications", "CS 4800", "CS", "4800",
            "bg-blue-500", "Staff", "TBA", 3,
            list(),
            "Selected topics among different subfields of Computer Science. May be repeated up to six hours if topics are different.",
            "Prerequisites: Consent of instructor."));

        // ======================================================
        // TIER 3 — MATHEMATICS / BUSINESS COURSES (22 courses)
        // Source: coursicle_tier3_data.csv
        // Color: bg-green-500 (math/stats), bg-yellow-500 (business)
        // ======================================================

        // MATH 1150 — No prereqs (placement exam)
        courses.add(c("math1150", "Introduction to Statistics", "MATH 1150", "MATH", "1150",
            "bg-green-500", "Marcy Beaverson", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Description of data, binomial and normal distributions, estimation and testing hypotheses for means and proportions.",
            "Prerequisites: Two years high school algebra, one year of geometry and a satisfactory placement exam score."));

        // MATH 1190 — No prereqs
        courses.add(c("math1190", "Real World Math Skills", "MATH 1190", "MATH", "1190",
            "bg-green-500", "Ann Darke", "MTuWTh (50 min) / TuTh (1 hr 40 min)", 4,
            list("Fall", "Spring"),
            "Students develop and use the concepts of numeracy to investigate and explain quantitative relationships and solve problems in a variety of real-world contexts, make decisions by analyzing mathematical models, and use the language and structure of statistics and probability to investigate, represent, make decisions, and draw conclusions from real-world contexts.",
            ""));

        // MATH 1200 — Prereq: placement exam or C+ in MATH 95
        courses.add(c("math1200", "College Algebra", "MATH 1200", "MATH", "1200",
            "bg-green-500", "Staff", "TBA", 5,
            list("Fall", "Spring"),
            "Polynomials, factoring, rational exponents, linear and quadratic equations and inequalities, applications; polynomial, exponential and logarithmic functions and their graphs, systems of equations, theory of equations.",
            "Prerequisites: Two years of high school algebra, one year of geometry and a satisfactory placement exam score, or grade of C or higher in MATH 95."));

        // MATH 1220 — Prereq: MATH 1200 or placement
        courses.add(c("math1220", "College Algebra", "MATH 1220", "MATH", "1220",
            "bg-green-500", "Ju Bae", "(50 min) / (1 hr 20 min)", 4,
            list("Fall", "Spring"),
            "Review of functions and their graphs, linear and quadratic functions, factoring. Polynomial and rational functions. Review of exponents. Exponential and logarithmic functions and their graphs. Systems of equations, theory of equations.",
            ""));

        // MATH 1280 — Prereq: C+ in MATH 1200 or 1220, or placement
        courses.add(c("math1280", "Precalculus Mathematics", "MATH 1280", "MATH", "1280",
            "bg-green-500", "Michelle Heckman", "MTuWTh (1 hr 15 min) / MTuWThF (50 min)", 5,
            list("Fall", "Spring"),
            "Basic algebra; inequalities; functions and graphs; logarithmic and exponential functions; trigonometric functions and identities; applications and other topics. Not to be taken if credit for MATH 1290 has been received.",
            "Prerequisites: Two years of high school algebra and one of geometry AND a satisfactory placement exam score, or grade of C or higher in MATH 1200 or MATH 1220."));

        // MATH 1290 — Prereq: C+ in MATH 1200 or 1220 or consent
        courses.add(c("math1290", "Trigonometry", "MATH 1290", "MATH", "1290",
            "bg-green-500", "Staff", "TBA", 2,
            list("Fall", "Spring"),
            "Trigonometric functions, graphs, identities, equations, inverse functions, solution of triangles, complex numbers. Intended for students who have good preparation in algebra and geometry but lack knowledge of trigonometry.",
            "Prerequisites: C or higher in MATH 1200 or MATH 1220 or consent of instructor."));

        // MATH 1310 — Prereq: C+ in MATH 1280 or 1290, or ACT/placement
        courses.add(c("math1310", "Calculus and Analytic Geometry", "MATH 1310", "MATH", "1310",
            "bg-green-500", "Daria Filippova", "MTuWTh (1 hr 15 min) / MTuWThF (50 min)", 5,
            list("Fall", "Spring"),
            "Differential and integral calculus including applications. The MATH 1310-2320-2330 sequence is a traditional calculus course for well-prepared students and is prerequisite for all advanced mathematics and statistics courses.",
            "Prerequisites: (1) two years of high school algebra, one year of geometry, one-half year of trigonometry, ACT math score of 24 or higher and satisfactory score on department placement test; or (2) grade of C or higher in MATH 1280 or MATH 1290."));

        // MATH 1340 — Prereq: C+ in MATH 1280 or 1290, or ACT/placement
        courses.add(c("math1340", "Calculus and Analytic Geometry IA", "MATH 1340", "MATH", "1340",
            "bg-green-500", "Toheeb Ibrahim", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Limits, the derivative, differentiation techniques and applications of the derivative. MATH 1340 and MATH 1350 is a two-semester sequence which includes all the topics from MATH 1310.",
            "Prerequisites: (1) two years of high school algebra, one year of geometry, one-half year of trigonometry, ACT math score of 24 or higher and satisfactory score on department placement test; or (2) grade of C or higher in MATH 1280 or MATH 1290."));

        // MATH 1350 — Prereq: C+ in MATH 1340
        courses.add(c("math1350", "Calculus and Analytic Geometry IB", "MATH 1350", "MATH", "1350",
            "bg-green-500", "Daria Filippova", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "The definite integral; the fundamental theorem; indefinite integrals; integration by parts, by substitution and using tables; and applications of definite and indefinite integrals.",
            "Prerequisites: Grade of C or higher in MATH 1340."));

        // MATH 2220 — Prereq: C+ in MATH 1280/1310/1340/1350 or BA 1700
        courses.add(c("math2220", "Discrete Mathematics", "MATH 2220", "MATH", "2220",
            "bg-green-500", "David Meel", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Logic, methods of proof, introduction to set theory, relations, functions, algorithms, counting techniques, graph theory, and trees.",
            "Prerequisites: C or better in MATH 1280, MATH 1310, MATH 1340, MATH 1350, or BA 1700."));

        // MATH 2320 — Prereq: C+ in MATH 1310 or MATH 1350
        courses.add(c("math2320", "Calculus and Analytic Geometry II", "MATH 2320", "MATH", "2320",
            "bg-green-500", "Xiaofen Zhang", "MTuWTh (1 hr 15 min) / MTuWThF (50 min)", 5,
            list("Fall", "Spring"),
            "MATH 1310 continued. Calculus of transcendental functions, techniques of integration, plane analytic geometry, sequences, and series.",
            "Prerequisites: Grade of C or higher in MATH 1310 or MATH 1350."));

        // MATH 2470 — Prereq: C+ in MATH 1310/1350 or BA 1700
        courses.add(c("math2470", "Fundamentals of Statistics", "MATH 2470", "MATH", "2470",
            "bg-green-500", "John Chen", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Descriptive statistics. Discrete probability models, sampling distributions, statistical estimation, and testing.",
            "Prerequisites: C or better in MATH 1310, MATH 1350, or BA 1700. Credit not given for both MATH 2470 and STAT 2110."));

        // MATH 3280 — Prereq: C+ in MATH 2320 or 2220 or CS 2020
        courses.add(c("math3280", "Mathematical Foundations and Techniques", "MATH 3280", "MATH", "3280",
            "bg-green-500", "Mihai Staic", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Spring"),
            "Introduction to mathematical proofs and proof techniques, involving topics such as logic, sets, relations, functions, induction, sequences, series, metric spaces, graph theory.",
            "Prerequisites: C or better in MATH 2320 or MATH 2220 or CS 2020 or consent of instructor."));

        // MATH 3320 — Prereq: C+ in MATH 2320, or (MATH 1310 AND MATH 2220), or (MATH 1310 AND CS 2020)
        courses.add(c("math3320", "Elementary Linear Algebra", "MATH 3320", "MATH", "3320",
            "bg-green-500", "Juan Bes", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Systems of linear equations, vectors, matrices, determinants, linear transformations, vector spaces and applications. Techniques and some proofs.",
            "Prerequisites: C or better in either MATH 2320, or MATH 1310 and MATH 2220, or MATH 1310 and CS 2020."));

        // MATH 3410 — Prereq: C+ in MATH 2320 or consent
        courses.add(c("math3410", "Principles of Probability and Statistics", "MATH 3410", "MATH", "3410",
            "bg-green-500", "Sandra Zirkes", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Summary and display of data; basic probability concepts; discrete distributions; continuous distributions; computer-aided probabilistic and statistical modelling of real problems; estimation; tests of statistical hypotheses.",
            "Prerequisites: C or better in MATH 2320 or consent of instructor."));

        // MATH 3430 — Prereq: (CS 1010 or CS 2010) AND C+ in MATH 1310 or (MATH 1340 AND 1350)
        courses.add(c("math3430", "Computing with Data", "MATH 3430", "MATH", "3430",
            "bg-green-500", "Wei Ning", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall"),
            "Computational methods for collecting, manipulating, exploring, and graphing data. Basic principles of exploratory data analysis and statistical graphical methods. Methods for downloading and organizing large data sets. All of the computing methods will be illustrated using a high-level language such as R or Python.",
            "Prerequisites: CS 1010 or CS 2010 and C or better in MATH 1310, or MATH 1340 and MATH 1350."));

        // BA 1600 — Prereq: C+ in MATH 1220 or 1280, or placement of 32
        courses.add(c("ba1600", "Business Mathematics and Computational Calculus", "BA 1600", "BA", "1600",
            "bg-yellow-500", "Diane Conway", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Algebra skills (polynomial and rational expressions, equations, factoring, exponents and radicals, linear functions, nonlinear functions), limits, derivatives, extrema, optimization, Fundamental Theorem of Calculus.",
            "Prerequisites: Schmidthorst College of Business student or DSP-B or C or better in MATH 1220, MATH 1280 or math placement of 32."));

        // BA 2050 — Prereq: C+ in BA 1600 or MATH 1310/1340+1350
        courses.add(c("ba2050", "Data Computing and Numerical Literacy", "BA 2050", "BA", "2050",
            "bg-yellow-500", "Pei Wang", "(50 min) / (1 hr 15 min)", 4,
            list("Fall", "Spring"),
            "Learners explore data from creation to gathering to wrangling to visualizing. Develops critical data literacy skills and logic skills through business case studies.",
            "Prerequisites: C or better in BA 1600 or MATH 1310 or both MATH 1340 and MATH 1350."));

        // BA 2110 — No prereqs listed; credit not given for both BA 2110 and MATH 2470
        courses.add(c("ba2110", "Business Analytics III: Descriptive Analytics", "BA 2110", "BA", "2110",
            "bg-yellow-500", "Yuhang Xu", "(1 hr 15 min) / (50 min)", 3,
            list("Fall", "Spring"),
            "Elementary probability, random variables, probability distributions, sampling, descriptive statistics, sampling distributions, estimation, hypothesis testing.",
            "Credit not given for both BA 2110 and MATH 2470."));

        // BA 2120 — Prereq: C+ in BA 2050; Coreq: BIZX 2200
        courses.add(c("ba2120", "Business Statistics", "BA 2120", "BA", "2120",
            "bg-yellow-500", "Shuchismita Sarkar", "(1 hr 15 min) / (50 min)", 3,
            list("Fall", "Spring"),
            "How to interpret and utilize data for informed decision-making. Topics include statistical fundamentals, probability, hypothesis testing, and regression analysis tailored for business applications.",
            "Prerequisites: C or better in BA 2050 or equivalent. Corequisite(s): BIZX 2200 or equivalent."));

        // BIZX 2200 — Coreq: BA 2120
        courses.add(c("bizx2200", "Applied Business Statistics Experience", "BIZX 2200", "BIZX", "2200",
            "bg-yellow-500", "Jennifer Price", "M (1 hr 50 min)", 1,
            list("Fall", "Spring"),
            "Experiential learning with a focus on technological application and integration of 2000-level business knowledge.",
            "Corequisite: BA 2120 or equivalent."));

        // =====================================================================
        // Tier 4 – BGP General Education Courses (first 40 of ~137)
        // =====================================================================

        // --- English Composition and Oral Communication ---

        // COMM 1020 — No prereqs
        courses.add(c("comm1020", "Introduction to Public Speaking", "COMM 1020", "COMM", "1020",
            "bg-gray-500", "Jack Cullen", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Basic principles of public speaking. Focuses on informative and persuasive speaking in both extemporaneous and impromptu styles. Emphasizes adapting to diverse audiences and reducing communication apprehension.",
            null));

        // WRIT 1110 — No prereqs
        courses.add(c("writ1110", "Seminar in Academic Writing", "WRIT 1110", "WRIT", "1110",
            "bg-gray-500", "Andrew Kurtz", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Provides a theoretical and practical foundation for college writers. Workshop-based course exploring diverse intellectual practices associated with effective writing. Graded ABC/No credit.",
            null));

        // WRIT 1120 — Prereq: WRIT 1110
        courses.add(c("writ1120", "Seminar in Research Writing", "WRIT 1120", "WRIT", "1120",
            "bg-gray-500", "Dawn Hubbell-Staeble", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Builds on foundational understandings of academic reading and writing with a focus on inquiry-based research writing. ePortfolio based. Graded ABC/No Credit.",
            "Placement through UWP online pre-screening or prior credit for WRIT 1110."));

        // --- Quantitative Literacy (additional BGP courses) ---

        // MATH 1230 — Prereq: MATH 1200 or MATH 1220
        courses.add(c("math1230", "Mathematics for Architecture/Construction", "MATH 1230", "MATH", "1230",
            "bg-green-500", "Xiaofen Zhang", "MTuWThF (50 min)", 5,
            list("Fall", "Spring"),
            "Units and unit conversions; geometry; trigonometry; laws of cosines and sines; vectors; analytic geometry; conceptual introduction to differential and integral calculus. Designed for Architecture and Construction Management programs.",
            "Grade of C or higher in MATH 1200 or MATH 1220, or satisfactory placement exam score."));

        // POLS 2900 — No prereqs
        courses.add(c("pols2900", "Statistics and Research Methods", "POLS 2900", "POLS", "2900",
            "bg-gray-500", "Melissa Miller", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Research design, methods of inquiry, and basic statistics used by political scientists. Required of all POLS majors.",
            null));

        // PSYC 2700 — Prereq: PSYC 1010 and MATH 1150 or MATH 1220
        courses.add(c("psyc2700", "Quantitative Methods I", "PSYC 2700", "PSYC", "2700",
            "bg-gray-500", "Carolyn Tompsett", "TuTh (1 hr 40 min)", 4,
            list("Fall", "Spring"),
            "Principles of measurement. Quantitative analyses of behavioral measures, including measures of typicality, individual differences, correlational methods and tests of significance.",
            "PSYC 1010 and MATH 1150 or MATH 1220 or a math placement score of 32 or higher."));

        // SOC 2690 — No prereqs
        courses.add(c("soc2690", "Introductory Statistics", "SOC 2690", "SOC", "2690",
            "bg-gray-500", "Meredith Gilbertson", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to core statistics concepts and techniques for the social and behavioral sciences. Includes techniques for describing samples, stating and testing hypotheses, and modeling cause-effect relationships.",
            null));

        // --- Humanities and The Arts ---

        // ACS 2000 — No prereqs
        courses.add(c("acs2000", "Introduction to American Culture Studies", "ACS 2000", "ACS", "2000",
            "bg-gray-500", "Rob Sloane", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Regional, ethnic and economic aspects of American national experience as reflected in verbal, visual and material artifacts. Required of all American culture studies majors.",
            null));

        // ACS 2500 — No prereqs
        courses.add(c("acs2500", "Cultural Pluralism in the United States", "ACS 2500", "ACS", "2500",
            "bg-gray-500", "Clay Chiarelott", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary exploration of race, ethnicity, class, gender and sexual orientation in the United States, emphasizing imaginative expressive forms such as fiction, poetry, film and the visual arts.",
            null));

        // ARCH 2330 — No prereqs
        courses.add(c("arch2330", "History of Architecture I", "ARCH 2330", "ARCH", "2330",
            "bg-gray-500", "Kerry Fan", "TuTh (1 hr 20 min)", 3,
            list("Fall"),
            "Ancient and medieval Western architecture and traditional non-Western architecture in cultural, aesthetic, and technical aspects.",
            null));

        // ARCH 2340 — May be taken before ARCH 2330
        courses.add(c("arch2340", "History of Architecture II", "ARCH 2340", "ARCH", "2340",
            "bg-gray-500", "Kerry Fan", "TuTh (1 hr 20 min)", 3,
            list("Spring"),
            "Western architecture from renaissance to present and recent developments in global architecture in cultural, aesthetic, and technical aspects. May be taken before ARCH 2330.",
            "May be taken before ARCH 2330."));

        // ART 1010 — No prereqs
        courses.add(c("art1010", "Introduction to Art", "ART 1010", "ART", "1010",
            "bg-gray-500", "James Sholes", "TuTh / MW", 3,
            list("Fall", "Spring"),
            "Historical and aesthetic components of art with laboratory or online experiences with basic elements of creative expression. Non-majors only. Extra fee.",
            null));

        // ARTH 1450 — No prereqs
        courses.add(c("arth1450", "Western Art I", "ARTH 1450", "ARTH", "1450",
            "bg-gray-500", "Mariah Morales", "MWF (50 min) / MW (1 hr 20 min)", 3,
            list("Fall", "Spring"),
            "Survey of major monuments in Western Art from the Paleolithic era to Medieval times. Introduction to artistic practices, period styles, and cultural values. Required for BA Art History majors.",
            null));

        // ARTH 1460 — May be taken before ARTH 1450
        courses.add(c("arth1460", "Western Art II", "ARTH 1460", "ARTH", "1460",
            "bg-gray-500", "Mariah Morales", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Survey of major monuments in Western Art from the Renaissance to the present. May be taken before ARTH 1450. Required for BA Art History majors.",
            "May be taken before ARTH 1450."));

        // ARTH 2700 — No prereqs
        courses.add(c("arth2700", "Survey of World Art", "ARTH 2700", "ARTH", "2700",
            "bg-gray-500", "Mariah Morales", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Survey of world arts and cultures from Africa, Asia, Oceania, the Caribbean, and the Americas. Required for BA Art History majors.",
            null));

        // CLCV 2410 — No prereqs (credit restriction only)
        courses.add(c("clcv2410", "Great Greek Minds", "CLCV 2410", "CLCV", "2410",
            "bg-gray-500", "Philip Peek", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Masterpieces of Greek literature in English translation: Homer, Sappho, Aeschylus, Sophocles, Euripides, Aristophanes, Plato, Aristotle. No Greek required.",
            "No credit for both CLCV 2410 and CLCV 4850."));

        // CLCV 2420 — No prereqs (credit restriction only)
        courses.add(c("clcv2420", "Great Roman Minds", "CLCV 2420", "CLCV", "2420",
            "bg-gray-500", "Daniel Moore", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Masterpieces of Latin literature in English translation: Lucretius, Cicero, Catullus, Virgil, Horace, Ovid, Petronius, Tacitus, Juvenal, Martial. No Latin required.",
            "No credit for both CLCV 2420 and CLCV 4860."));

        // CLCV 3800 — No prereqs
        courses.add(c("clcv3800", "Classical Mythology", "CLCV 3800", "CLCV", "3800",
            "bg-gray-500", "Scott Keister", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Study in English of Greek and Roman myths; historical meanings and influence on life, literature and art. No Latin required.",
            null));

        // ENG 1500 — Prereq: WRIT 1110
        courses.add(c("eng1500", "Literature and Culture", "ENG 1500", "ENG", "1500",
            "bg-gray-500", "Kate Dailey", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "A general education course emphasizing discussion of humanistic themes based on student responses to readings in fiction, drama, poetry, and nonfiction.",
            "Enrollment in or completion of WRIT 1110."));

        // ENG 2010 — No prereqs
        courses.add(c("eng2010", "Introduction to Literature", "ENG 2010", "ENG", "2010",
            "bg-gray-500", "Mariah Morales", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the study of literature through analysis and interpretation of major literary genres.",
            null));

        // ENG 2110 — No prereqs
        courses.add(c("eng2110", "African-American Literature", "ENG 2110", "ENG", "2110",
            "bg-gray-500", "Jacqueline Justice", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "African-American literature from the mid-eighteenth century to the present in its historical, political, and cultural context.",
            null));

        // ENG 2120 — No prereqs
        courses.add(c("eng2120", "Native American and Indigenous Literatures", "ENG 2120", "ENG", "2120",
            "bg-gray-500", "Jolene Buehrer", "MW / TuTh", 3,
            list("Fall"),
            "Native American literature from the oral to the written tradition in its historical and cultural context, including tales, songs, myths, memoirs, poetry and fiction.",
            null));

        // ENG 2610 — No prereqs
        courses.add(c("eng2610", "World Literature from Ancient Times to 1700", "ENG 2610", "ENG", "2610",
            "bg-gray-500", "Erin Labbie", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall"),
            "Works in English and in translation of various world literatures from ancient times to 1700, including texts from European and non-European cultures.",
            null));

        // ENG 2620 — No prereqs
        courses.add(c("eng2620", "World Literature from 1700 to Present", "ENG 2620", "ENG", "2620",
            "bg-gray-500", "Joseph Wagner", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Spring"),
            "Works in English and in translation of various world literatures from 1700 to the present, including texts from European and non-European cultures.",
            null));

        // ENG 2640 — No prereqs
        courses.add(c("eng2640", "British Literature Survey to 1660", "ENG 2640", "ENG", "2640",
            "bg-gray-500", "Erin Labbie", "MWF (50 min)", 3,
            list("Spring"),
            "Survey of British prose, poetry, and drama from Anglo-Saxon origins through the restoration of Charles II; emphasis on literary traditions and historical contexts.",
            null));

        // ENG 2650 — No prereqs
        courses.add(c("eng2650", "British Literature Survey, 1660-Present", "ENG 2650", "ENG", "2650",
            "bg-gray-500", "Piya Lapinski", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall"),
            "Survey of British prose, poetry, and drama from the Restoration period through the present. Students examine literary texts in their historical and cultural contexts.",
            null));

        // ENG 2740 — No prereqs
        courses.add(c("eng2740", "Survey of American Literature to 1865", "ENG 2740", "ENG", "2740",
            "bg-gray-500", "Susan Cruea", "MWF (50 min)", 3,
            list("Fall"),
            "American literature from its beginnings through the Civil War. May emphasize historical development and/or major themes.",
            null));

        // ENG 2750 — No prereqs
        courses.add(c("eng2750", "Survey of American Literature, 1865-Present", "ENG 2750", "ENG", "2750",
            "bg-gray-500", "Bill Albertini", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "American literature from the end of the Civil War through the present. Students examine literary texts in their historical and cultural contexts.",
            null));

        // ETHN 2200 — No prereqs (credit restriction: only one of ETHN 2200 or ROCS 2200)
        courses.add(c("ethn2200", "Introduction to African Literature", "ETHN 2200", "ETHN", "2200",
            "bg-gray-500", "Opportune Zongo", "TBA", 3,
            list("Spring"),
            "Creative and critical writing in the English language by writers of African descent, including writers from the Caribbean. Credit only for one of ETHN 2200 or ROCS 2200.",
            "Credit only allowed for one of ETHN 2200 or ROCS 2200."));

        // FILM 1610 — No prereqs
        courses.add(c("film1610", "Introduction to Film", "FILM 1610", "FILM", "1610",
            "bg-gray-500", "Andrew Kurtz", "TuTh (1 hr 15 min)", 3,
            list("Fall"),
            "Introduces students to the critical study of film as entertainment and art. Overview of basic theories and methodologies used to study narrative, documentary and experimental films.",
            null));

        // FREN 2010 — Prereq: FREN 1020
        courses.add(c("fren2010", "Intermediate French I", "FREN 2010", "FREN", "2010",
            "bg-gray-500", "Jennifer Wolter", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Grammar review; development of the four skills.",
            "FREN 1020 or a satisfactory placement exam score."));

        // FREN 2020 — Prereq: FREN 2010
        courses.add(c("fren2020", "Intermediate French II", "FREN 2020", "FREN", "2020",
            "bg-gray-500", "Opportune Zongo", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "A communicative approach to intermediate language using the four skill areas, along with French and Francophone culture.",
            "FREN 2010 or satisfactory placement exam score."));

        // FREN 2220 — No prereqs
        courses.add(c("fren2220", "French Culture", "FREN 2220", "FREN", "2220",
            "bg-gray-500", "Daniel Dinca", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the cultural, social, intellectual, and artistic life of French-speaking peoples. Readings and class in English. Does not fulfill the Arts & Sciences Foreign Language requirement.",
            null));

        // GERM 2010 — Prereq: GERM 1020
        courses.add(c("germ2010", "Intermediate German I", "GERM 2010", "GERM", "2010",
            "bg-gray-500", "Ariana Segarra", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Grammar review; development of the four skills.",
            "GERM 1020 or a satisfactory exam placement score."));

        // GERM 2020 — Prereq: GERM 2010
        courses.add(c("germ2020", "Intermediate German II", "GERM 2020", "GERM", "2020",
            "bg-gray-500", "Kristie Foell", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "GERM 2010 continued.",
            "GERM 2010 or a satisfactory exam placement score."));

        // GERM 2150 — No prereqs
        courses.add(c("germ2150", "German Culture and Civilization", "GERM 2150", "GERM", "2150",
            "bg-gray-500", "Edgar Landgraf", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Cultural-historical treatment of the social, intellectual and artistic life of the German-speaking peoples from medieval times to World War II. Lectures and readings in English.",
            null));

        // GERM 2160 — No prereqs
        courses.add(c("germ2160", "Contemporary Germany", "GERM 2160", "GERM", "2160",
            "bg-gray-500", "Kristie Foell", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Division of Germany after World War II; rebuilding and development of the two German states since 1949; political, economic and social systems; revolution in East Germany and unification. In English.",
            null));

        // HNRS 2020 — Prereq: HNRS 2010
        courses.add(c("hnrs2020", "Critical Thinking in Humanities and the Arts", "HNRS 2020", "HNRS", "2020",
            "bg-gray-500", "Sara Ghaffari", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Spring"),
            "Interdisciplinary seminar on influential ideas of human culture. Emphasis on reading primary texts and critical thinking. Required of all Honors students in their first year.",
            "HNRS 2010 and admission to BGSU's Honors College."));

        // HNRS 2600 — Prereq: HNRS 2010
        courses.add(c("hnrs2600", "Critical Thinking for the Public Good", "HNRS 2600", "HNRS", "2600",
            "bg-gray-500", "Michelle Sprouse", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary seminar exploring contemporary issues of human values in public service fields. Introduces students to creative research methods for a future Honors project.",
            "HNRS 2010 and admission to BGSU's Honors College."));

        // ITAL 2620 — No prereqs
        courses.add(c("ital2620", "Italian-American Experience: Mafia, Migration, and the Movies", "ITAL 2620", "ITAL", "2620",
            "bg-gray-500", "Carlo Celli", "TBA", 3,
            list("Fall", "Spring"),
            "Identifies and explores cross-cultural and transnational stereotypes of the Italian Mafia in America and Italy. In English.",
            null));

        // MUCT 1010 — No prereqs
        courses.add(c("muct1010", "Exploring Music", "MUCT 1010", "MUCT", "1010",
            "bg-gray-500", "Eftychia Papanikolaou", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Explores different categories of music (classical, world, popular) and various genres in their social contexts. Directed listening focuses on how musical sounds create meaning.",
            null));

        // MUCT 1250 — No prereqs
        courses.add(c("muct1250", "Exploring Music of World Cultures", "MUCT 1250", "MUCT", "1250",
            "bg-gray-500", "Christopher Witulski", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Musical systems of major non-Western art musics: Africa, Near East, Pacific and Asia. Theoretical, analytical and cultural concepts related to music.",
            null));

        // MUCT 2220 — No prereqs
        courses.add(c("muct2220", "Turning Points: Arts and Humanities in Context", "MUCT 2220", "MUCT", "2220",
            "bg-gray-500", "Per Broman", "TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "Explores the convergence of politics, history, religion, and the arts during four significant turning points in world history.",
            null));

        // MUCT 2610 — No prereqs
        courses.add(c("muct2610", "Music History I", "MUCT 2610", "MUCT", "2610",
            "bg-gray-500", "Katherine Meizel", "MWF (50 min)", 3,
            list("Fall"),
            "Study of the history, social setting and style of Western art music in the Medieval, Renaissance and Baroque periods (ca. 800-1750).",
            null));

        // PHIL 1010 — No prereqs
        courses.add(c("phil1010", "Introduction to Philosophy", "PHIL 1010", "PHIL", "1010",
            "bg-gray-500", "James Schultz", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Critical discussion and debate of questions about identity, morality, knowledge, existence of God, responsibility, and the meaning of life.",
            null));

        // PHIL 1020 — No prereqs
        courses.add(c("phil1020", "Introduction to Ethics", "PHIL 1020", "PHIL", "1020",
            "bg-gray-500", "Cole James", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Central theoretical questions in ethics: the source of morality, right and wrong, what it means to be a good person.",
            null));

        // PHIL 1030 — No prereqs
        courses.add(c("phil1030", "Introduction to Logic", "PHIL 1030", "PHIL", "1030",
            "bg-gray-500", "Sara Worley", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Basic concepts of logic; how to distinguish arguments from non-arguments, premises from conclusions. Methods for evaluating arguments and recognizing reasoning mistakes.",
            null));

        // PHIL 1250 — No prereqs
        courses.add(c("phil1250", "Contemporary Moral Issues", "PHIL 1250", "PHIL", "1250",
            "bg-gray-500", "Samuel Morkal-Williams", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Real-world moral challenges we face as individuals and as a society: privacy, same-sex marriage, terrorism, body modification.",
            null));

        // PHIL 2190 — No prereqs
        courses.add(c("phil2190", "Philosophy of Death and Dying", "PHIL 2190", "PHIL", "2190",
            "bg-gray-500", "Theodore Bach", "TuTh / MW", 3,
            list("Fall", "Spring"),
            "Explores questions like: What is death? Should we fear it? Is there evidence of immortality? How should we deal with death cross-culturally?",
            null));

        // PHIL 2320 — No prereqs
        courses.add(c("phil2320", "Environmental Ethics", "PHIL 2320", "PHIL", "2320",
            "bg-gray-500", "Ian Young", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Investigates the proper relationship between human beings and the environment from a variety of distinct cultural perspectives.",
            null));

        // PHIL 2420 — No prereqs
        courses.add(c("phil2420", "Medical Ethics", "PHIL 2420", "PHIL", "2420",
            "bg-gray-500", "Ian Young", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Explores central questions in medical and healthcare practices: abortion, physician-assisted suicide, genetic manipulation, right to healthcare.",
            null));

        // POPC 1600 — No prereqs
        courses.add(c("popc1600", "Introduction to Popular Culture", "POPC 1600", "POPC", "1600",
            "bg-gray-500", "Charles Coletta", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Basic theories and approaches to the scholarly study of popular culture, including various media, folklore, and everyday life.",
            null));

        // POPC 1650 — No prereqs
        courses.add(c("popc1650", "Popular Culture and Media", "POPC 1650", "POPC", "1650",
            "bg-gray-500", "Tiffany Knoell", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Some of the ways in which mass media (TV, film, recording industry, print, radio) have affected modern American culture.",
            null));

        // POPC 1700 — No prereqs
        courses.add(c("popc1700", "Black Popular Culture", "POPC 1700", "POPC", "1700",
            "bg-gray-500", "Angela Nelson", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Basic theories and approaches to 20th and 21st century African-American popular culture. Examines the relationship of race, ethnicity, gender, sexuality, and class.",
            null));

        // POPC 2200 — No prereqs
        courses.add(c("popc2200", "Introduction to Folklore and Folklife", "POPC 2200", "POPC", "2200",
            "bg-gray-500", "Montana Miller", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Study and collecting of folklore; ballads, myths, tall tales, heroes, folk medicines, superstitions, proverbs and crafts.",
            null));

        // RUSN 2150 — No prereqs
        courses.add(c("rusn2150", "Russian Culture", "RUSN 2150", "RUSN", "2150",
            "bg-gray-500", "Timothy Pogacar", "TuTh (1 hr 15 min)", 3,
            list("Fall"),
            "Russian culture and its manifestations in arts, family and social life, folkways, religion, and other areas. In English.",
            null));

        // RUSN 2160 — No prereqs
        courses.add(c("rusn2160", "Post-Communist Russia", "RUSN 2160", "RUSN", "2160",
            "bg-gray-500", "Timothy Pogacar", "TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "Russian society and cultural values as reflected in arts, education, work, recreation, politics, family life, and religion. Cross-cultural approach. In English.",
            null));

        // SPAN 2010 — Prereq: SPAN 1020
        courses.add(c("span2010", "Intermediate Spanish I", "SPAN 2010", "SPAN", "2010",
            "bg-gray-500", "Pedro Porben", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Communicative approach to intermediate language use in the four skill areas: listening, speaking, reading, writing. Reading and discussion in Spanish of cultural readings.",
            "SPAN 1020 or a satisfactory placement exam score."));

        // SPAN 2020 — Prereq: SPAN 2010
        courses.add(c("span2020", "Intermediate Spanish II", "SPAN 2020", "SPAN", "2020",
            "bg-gray-500", "Lynn Pearson", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "SPAN 2010 continued. Three classroom hours each week.",
            "SPAN 2010 or satisfactory placement exam score."));

        // SPAN 2030 — Prereq: SPAN 2010
        courses.add(c("span2030", "Intermediate Spanish for the Professions", "SPAN 2030", "SPAN", "2030",
            "bg-gray-500", "Cynthia Whipple", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Alternative to SPAN 2020 or 2120 that includes specialized vocabulary and communicative practice for professional use; may focus on medical, legal, or business uses.",
            "SPAN 2010 or a satisfactory exam placement score."));

        // SPAN 2700 — No prereqs
        courses.add(c("span2700", "Hispanic Culture", "SPAN 2700", "SPAN", "2700",
            "bg-gray-500", "Daniel Dinca", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the cultural, social, intellectual, and artistic life of Latin America and/or Spain from a variety of disciplinary perspectives. In English.",
            null));

        // THEA 1410 — No prereqs
        courses.add(c("thea1410", "The Theatre Experience", "THEA 1410", "THEA", "1410",
            "bg-gray-500", "Marcus Sherrell", "MW (1 hr 15 min)", 3,
            list("Fall"),
            "Art of theatre; heritage and contemporary values as humanistic discipline; importance as social/cultural experience. Laboratory hours required.",
            null));

        // THEA 2020 — No prereqs
        courses.add(c("thea2020", "Performance in Life and on Stage", "THEA 2020", "THEA", "2020",
            "bg-gray-500", "David Loehr", "MWF (50 min)", 3,
            list("Fall"),
            "Introduction to Performance Studies through critical engagement of textual, cultural, and rhetorical approaches. Emphasis on vocal and physical performance skills.",
            null));

        // THFM 2150 — No prereqs
        courses.add(c("thfm2150", "Exploring Cultural Diversity Through Performance", "THFM 2150", "THFM", "2150",
            "bg-gray-500", "Amy-Rose", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Through performance and discussion of selected public and private texts written by American minority writers, explores what it means to be a part of a culturally diverse society.",
            null));

        // WS 2000 — No prereqs
        courses.add(c("ws2000", "Introduction to Women's Studies: Perspectives on Gender, Class and Ethnicity", "WS 2000", "WS", "2000",
            "bg-gray-500", "Becky Jenkins", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary survey of the new scholarship on women. Emphasis on the interconnectedness of gender, class and ethnicity in women's experiences and viewpoints.",
            null));

        // --- Social and Behavioral Sciences ---

        // AFRS 2000 — No prereqs
        courses.add(c("afrs2000", "Introduction to Africana Studies", "AFRS 2000", "AFRS", "2000",
            "bg-gray-500", "Apollos Nwauwa", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary course introducing students to crosscultural perspectives, literary genres, and critical-analysis skills needed to study peoples of African descent. Focus on arts and humanities.",
            null));

        // ASIA 1800 — No prereqs (credit restriction with HIST 1800)
        courses.add(c("asia1800", "Asian Civilizations", "ASIA 1800", "ASIA", "1800",
            "bg-gray-500", "Andrew Kunze", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Core course for Asian Studies majors and minors. General knowledge of Asia relative to historical, cultural, social, economic, and political developments. Credit for only one of ASIA 1800 or HIST 1800.",
            "Credit allowed for only one of ASIA 1800 or HIST 1800."));

        // ASIA 2000 — No prereqs
        courses.add(c("asia2000", "Introduction to Asian Religion", "ASIA 2000", "ASIA", "2000",
            "bg-gray-500", "Andrew Kunze", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to Asian religions including Christianity, Islam, Hinduism, Buddhism, Shintoism, Sikhism, Jainism, Taoism, and Confucianism as practiced in South, East, or Southeast Asia.",
            null));

        // CAST 2010 — No prereqs
        courses.add(c("cast2010", "Introduction to Canadian Studies", "CAST 2010", "CAST", "2010",
            "bg-gray-500", "Scott Piroth", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Multidisciplinary review of Canadian development. Comparisons with the United States. History, geography, government, population, economy, literature, art, and popular culture.",
            null));

        // CDIS 1230 — No prereqs
        courses.add(c("cdis1230", "Introduction to Communication Disorders", "CDIS 1230", "CDIS", "1230",
            "bg-gray-500", "Siva Santhanam", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Normal speech and language development; description and etiology of various communication disorders including phonology, voice, stuttering, language and hearing.",
            null));

        // ECON 2000 — No prereqs (credit restriction with ECON 2020/2030)
        courses.add(c("econ2000", "Introduction to Economics", "ECON 2000", "ECON", "2000",
            "bg-gray-500", "Christian Imboden", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Alternative economic goals; economic growth, full employment, price stability, fair income distribution. Recommended for students taking only one ECON course.",
            "No credit for students who have credit for ECON 2020 or ECON 2030."));

        // ECON 2020 — No course prereqs
        courses.add(c("econ2020", "Principles of Microeconomics", "ECON 2020", "ECON", "2020",
            "bg-gray-500", "Jarus Quinn", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Price and allocation of resources. Demand, supply; price theory; income distribution; market failure; current problems and public policy.",
            "High school algebra or equivalent. Recommended before ECON 2030."));

        // ECON 2030 — Prereq: ECON 2020
        courses.add(c("econ2030", "Principles of Macroeconomics", "ECON 2030", "ECON", "2030",
            "bg-gray-500", "Andrea Schneider", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "National income and employment, inflation, banking system, monetary and fiscal policy; economic growth and development; international economics.",
            "ECON 2020 or with consent of department."));

        // EDFI 2980 — No prereqs
        courses.add(c("edfi2980", "Schools, Society, and Cultural Diversity", "EDFI 2980", "EDFI", "2980",
            "bg-gray-500", "Christopher Frey", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Critical interdisciplinary examination of schooling, society, and cultural diversity in the United States. Inquiry into origins of contemporary ideas, issues, and problems.",
            null));

        // EIEC 2210 — Prereq: EDTL 2010 (C or better)
        courses.add(c("eiec2210", "Cultural and Linguistic Diversity in Early Childhood Education", "EIEC 2210", "EIEC", "2210",
            "bg-gray-500", "Trisha Prunty", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Focus on theories, working in education settings with children and families from diverse cultural and linguistic backgrounds to support educational involvement and achievement.",
            "C or better in EDTL 2010 and a cumulative GPA of 2.5 or higher."));

        // ENVS 1010 — No prereqs
        courses.add(c("envs1010", "Introduction to Environmental Studies", "ENVS 1010", "ENVS", "1010",
            "bg-gray-500", "Anita Milas", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Overview of environmental principles and concepts. Students consider contemporary environmental issues as they relate to the quality of life.",
            null));

        // ETHN 1010 — No prereqs
        courses.add(c("ethn1010", "Introduction to Ethnic Studies", "ETHN 1010", "ETHN", "1010",
            "bg-gray-500", "Thomas Edge", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Gateway course introducing students to interdisciplinary analyses of race and ethnicity in the U.S. Explores the social construction and ideologies of race.",
            null));

        // ETHN 1100 — No prereqs
        courses.add(c("ethn1100", "Introduction to Latina/o Studies", "ETHN 1100", "ETHN", "1100",
            "bg-gray-500", "Luis Moreno", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Latina/o experience in the United States: cultures, life experiences, and the limited political, education, socio-economic opportunities of this minority.",
            null));

        // ETHN 1200 — No prereqs
        courses.add(c("ethn1200", "Introduction to African American Studies", "ETHN 1200", "ETHN", "1200",
            "bg-gray-500", "Thomas Edge", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the history of black studies, tracing origins in social, cultural, and political struggles for human and civil rights to the intellectual currents which define the field.",
            null));

        // ETHN 1300 — No prereqs
        courses.add(c("ethn1300", "Introduction to Asian American Studies", "ETHN 1300", "ETHN", "1300",
            "bg-gray-500", "Vibha Bhalla", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Similarities and differences of the various components of the Asian American category with reference to their individual histories and collective situation from the 19th century to the present.",
            null));

        // ETHN 1600 — No prereqs
        courses.add(c("ethn1600", "Introduction to Native American Studies", "ETHN 1600", "ETHN", "1600",
            "bg-gray-500", "Michelle Stokely", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary examination of the Native American Diaspora in the context of European discovery and conquest. Overview of diverse native peoples and cultures of North America.",
            null));

        // ETHN 2010 — No prereqs
        courses.add(c("ethn2010", "Ethnicity and Social Movements", "ETHN 2010", "ETHN", "2010",
            "bg-gray-500", "Thomas Edge", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "The nature, causes, and consequences of social movements born out of the diasporan histories and experiences of racial and ethnic peoples in the United States.",
            null));

        // ETHN 2600 — No prereqs
        courses.add(c("ethn2600", "Contemporary Issues in Native America", "ETHN 2600", "ETHN", "2600",
            "bg-gray-500", "Michelle Stokely", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Examines salient issues of interest to contemporary Native American people and communities including federal Indian law, identity politics, sovereignty, and global indigeneity.",
            null));

        // GEOG 1210 — No prereqs
        courses.add(c("geog1210", "World Geography: Eurasia and Africa", "GEOG 1210", "GEOG", "1210",
            "bg-gray-500", "Kefa Otiso", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Geographical analysis of variations and interrelationships of physical, cultural, economic, political, and population factors. Focus on Europe, Africa, Middle East, and Asia.",
            null));

        // GEOG 1220 — No prereqs
        courses.add(c("geog1220", "World Geography: Americas and the Pacific", "GEOG 1220", "GEOG", "1220",
            "bg-gray-500", "Karen Johnson-Webb", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Geographical analysis of variations and interrelationships of physical, cultural, economic, political, and population factors. Focus on North America, Latin America, Australia-New Zealand, and the Pacific Islands.",
            null));

        // GEOG 2300 — No prereqs
        courses.add(c("geog2300", "Cultural Geography", "GEOG 2300", "GEOG", "2300",
            "bg-gray-500", "Kefa Otiso", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Geographic influences upon human activities. Cultural processes and global patterns of religion, language, education, technology, diet, health, resource use, political organization, and population.",
            null));

        // GERO 1010 — No prereqs
        courses.add(c("gero1010", "Aging, the Individual and Society", "GERO 1010", "GERO", "1010",
            "bg-gray-500", "Cynthia Spitler", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "An interdisciplinary exploration of aging: biological, psychological, and social factors that influence the aging process and the older adult's place in society.",
            null));

        // HDFS 1930 — No prereqs
        courses.add(c("hdfs1930", "Lifespan Human Development", "HDFS 1930", "HDFS", "1930",
            "bg-gray-500", "Debra Scavuzzo", "F (50 min) / MW (50 min)", 3,
            list("Fall", "Spring"),
            "Examination of environmental and contextual factors that influence development through the life course. Emphasis on patterns of cognitive, biological, psychosocial, and trauma-aware development.",
            null));

        // HDFS 2020 — No prereqs
        courses.add(c("hdfs2020", "Contemporary Marriages and Families", "HDFS 2020", "HDFS", "2020",
            "bg-gray-500", "Christy Snyder", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Analysis of trends in marriage and family relationships in contemporary society including family processes throughout the life cycle. Addresses diversity and the dynamic nature of family systems.",
            null));

        // HIST 1250 — No prereqs
        courses.add(c("hist1250", "Early America", "HIST 1250", "HIST", "1250",
            "bg-gray-500", "Kara Barr", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Selected constitutional, intellectual, political and social developments that defined and shaped America between its first European settlement and the end of Reconstruction.",
            null));

        // HIST 1260 — No prereqs
        courses.add(c("hist1260", "Modern America", "HIST 1260", "HIST", "1260",
            "bg-gray-500", "Cheryl Dong", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "How and why selected economic, intellectual, political and social developments transformed post-Civil War America and shaped 20th-century American society.",
            null));

        // HIST 1510 — No prereqs
        courses.add(c("hist1510", "World Civilizations", "HIST 1510", "HIST", "1510",
            "bg-gray-500", "Alannah Graves", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Comparative study of how and why economic, social, political and intellectual factors shaped and defined the history of selected Western and non-Western civilizations in the ancient and medieval periods.",
            null));

        // HIST 1520 — No prereqs
        courses.add(c("hist1520", "The Modern World", "HIST 1520", "HIST", "1520",
            "bg-gray-500", "Michael Kimaid", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Comparative study of how and why selected economic, social, political and intellectual revolutions of the modern world have transformed contemporary European and non-Western cultures.",
            null));

        // HNRS 2010 — Admission to Honors College
        courses.add(c("hnrs2010", "Introduction to Critical Thinking", "HNRS 2010", "HNRS", "2010",
            "bg-gray-500", "Heath Diehl", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall"),
            "First of two courses required for all first-year Honors students. Systematic method of reflective critical thinking through evaluation and construction of arguments.",
            "Admission to the Honors College or permission of Honors College Dean."));

        // HNRS 2400 — Prereq: HNRS 2010
        courses.add(c("hnrs2400", "Critical Thinking in Business and the Workforce", "HNRS 2400", "HNRS", "2400",
            "bg-gray-500", "Kenneth Thompson", "MW (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary seminar exploring contemporary issues in business and the workforce. Emphasizes analysis, discussion, and evaluation of business problems for the public good.",
            "HNRS 2010 and admission into BGSU's Honors College."));

        // INST 2000 — No prereqs
        courses.add(c("inst2000", "Introduction to International Studies", "INST 2000", "INST", "2000",
            "bg-gray-500", "Franziska Schultz", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary overview of the processes and effects of globalization. Major themes include population and migration, role of women, environmental change, economic and political issues.",
            null));

        // MDIA 1030 — No prereqs
        courses.add(c("mdia1030", "Media and the Information Society", "MDIA 1030", "MDIA", "1030",
            "bg-gray-500", "Rick Busselle", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Social trends as influenced by technology in the information society. Social policy and effects involving information technologies. Open to nonmajors.",
            null));

        // MDIA 3520 — No prereqs
        courses.add(c("mdia3520", "Social Media and Society", "MDIA 3520", "MDIA", "3520",
            "bg-gray-500", "Xiaofeng Jia", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Examines applications and implications for social media. Social psychological perspectives of social media will be primarily examined.",
            null));

        // POLS 1100 — No prereqs
        courses.add(c("pols1100", "American Government: Processes and Structure", "POLS 1100", "POLS", "1100",
            "bg-gray-500", "Dominic Wells", "MWF (50 min) / MW (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Constitutional basis and development, political processes (parties, nominations and elections, interest groups and public opinion), federalism and institutions of national government.",
            null));

        // POLS 1710 — No prereqs
        courses.add(c("pols1710", "Introduction to Comparative Government", "POLS 1710", "POLS", "1710",
            "bg-gray-500", "Scott Piroth", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Basic concepts, approaches to and comparisons of different political systems, including political cultures, participation, interest groups, institutions and processes.",
            null));

        // POLS 1720 — No prereqs
        courses.add(c("pols1720", "Introduction to International Relations", "POLS 1720", "POLS", "1720",
            "bg-gray-500", "Stefan Fritsch", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Historical and contemporary overview of the modern international system; governmental and nongovernmental actors; major issues of the post-cold-war period.",
            null));

        // PSYC 1010 — No prereqs
        courses.add(c("psyc1010", "General Psychology", "PSYC 1010", "PSYC", "1010",
            "bg-gray-500", "Renee Brott", "MWF (50 min) / TuTh (1 hr 50 min)", 4,
            list("Fall", "Spring"),
            "Scientific approaches to the study of behavior of organisms. Application to personal and social behavior.",
            null));

        // SOC 1010 — No prereqs
        courses.add(c("soc1010", "Principles of Sociology", "SOC 1010", "SOC", "1010",
            "bg-gray-500", "Margaret Weinberger", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Scientific study of social structure, interaction, and institutions. Topics include gender, race, class, family, culture, and crime.",
            null));

        // SOC 2020 — No prereqs
        courses.add(c("soc2020", "Social Problems", "SOC 2020", "SOC", "2020",
            "bg-gray-500", "Margaret Weinberger", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Application of sociological concepts and theories to understand the social causes of problems such as poverty, war, and global warming.",
            null));

        // SOC 2120 — No prereqs
        courses.add(c("soc2120", "Population and Society", "SOC 2120", "SOC", "2120",
            "bg-gray-500", "Lauren Newmyer", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Population growth and distribution. Domestic and international perspectives on migration, fertility (births), and mortality (deaths).",
            null));

        // SOC 2160 — No prereqs
        courses.add(c("soc2160", "Race, Ethnicity and Inequality", "SOC 2160", "SOC", "2160",
            "bg-gray-500", "Julie Didelot", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Analysis of privilege and oppression and how they were created and are maintained at the institutional level as well as experienced at the interpersonal and individual levels in the U.S.",
            null));

        // SOC 2310 — No prereqs
        courses.add(c("soc2310", "Cultural Anthropology", "SOC 2310", "SOC", "2310",
            "bg-gray-500", "Jacqueline Hudson", "MW (1 hr 20 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to basic concepts and issues in the study of culture. Examines cultural variation in social organization, cultural values, and differential impact of globalization.",
            null));

        // TECH 3020 — Prereq: junior status
        courses.add(c("tech3020", "Technology Systems in Societies", "TECH 3020", "TECH", "3020",
            "bg-gray-500", "Robyn Miller", "TBA", 3,
            list("Fall", "Spring"),
            "Current issues and their relationship to technology and systems in various cultures throughout the world. Emphasis on explaining technological behaviors and how technology permeates human affairs.",
            "Junior status or consent of instructor."));

        // --- Natural Sciences ---

        // ASTR 1010 — No prereqs
        courses.add(c("astr1010", "Experimental Astronomy", "ASTR 1010", "ASTR", "1010",
            "bg-gray-500", "Andrew Layden", "MF (50 min) / W (1 hr 50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the properties of planets, stars, and galaxies; how they are distributed and move within the universe. Includes two hours per week of laboratory and observational work.",
            null));

        // ASTR 2010 — No prereqs
        courses.add(c("astr2010", "Modern Astronomy", "ASTR 2010", "ASTR", "2010",
            "bg-gray-500", "Allen Rogel", "MF (50 min) / W (1 hr 50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the physical universe including motions in the sky, gravity, radiation, the Sun, nature and evolution of stars, galaxies, and the search for extraterrestrial life.",
            null));

        // ASTR 2120 — No prereqs
        courses.add(c("astr2120", "The Solar System", "ASTR 2120", "ASTR", "2120",
            "bg-gray-500", "Kate Dellenbusch", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to planetary and space science including motions in the sky, history of astronomy, the moon, solar/terrestrial relations, planetary structure, comets, and the origin of the solar system.",
            null));

        // BIOL 1010 — No prereqs (credit restriction with ENVH 1050)
        courses.add(c("biol1010", "Environment of Life", "BIOL 1010", "BIOL", "1010",
            "bg-gray-500", "Daniel Wiegmann", "MWF (50 min) / W (1 hr 50 min)", 3,
            list("Fall", "Spring"),
            "Basic ecology and current environmental problems of air, water and land pollution; human reproduction and population dynamics. Not accepted toward biology major or minor.",
            "Credit not given for more than one of ENVH 1050 and BIOL 1010."));

        // BIOL 1040 — No prereqs
        courses.add(c("biol1040", "Introduction to Biology", "BIOL 1040", "BIOL", "1040",
            "bg-gray-500", "Michael Geusz", "MWF (50 min) / W (1 hr 50 min)", 4,
            list("Fall", "Spring"),
            "Basic concepts: the cell, metabolism, genetics, reproduction, development, evolution, ecology. Not accepted toward biology major or minor.",
            null));

        // BIOL 1080 — No prereqs
        courses.add(c("biol1080", "Life in the Sea", "BIOL 1080", "BIOL", "1080",
            "bg-gray-500", "Kevin Neves", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Shore and ocean environments, variety and adaptations of marine life. High school biology recommended. Not accepted toward biology major or minor.",
            null));

        // BIOL 2040 — No prereqs
        courses.add(c("biol2040", "Concepts in Biology I", "BIOL 2040", "BIOL", "2040",
            "bg-gray-500", "Mason Murphy", "MWF (50 min) / W (2 hr 50 min)", 4,
            list("Fall", "Spring"),
            "Introduction to ecological and evolutionary biology, Mendelian and population genetics, and the major groups of plants, animals and microbes. Field trips required.",
            null));

        // BIOL 2050 — No prereqs
        courses.add(c("biol2050", "Concepts in Biology II", "BIOL 2050", "BIOL", "2050",
            "bg-gray-500", "Jonathon Whipps", "MWF (50 min) / W (2 hr 50 min)", 4,
            list("Fall", "Spring"),
            "Introduction to molecular and cellular biology, physiology and organ systems.",
            null));

        // CHEM 1000 — No prereqs
        courses.add(c("chem1000", "Introduction to Chemistry", "CHEM 1000", "CHEM", "1000",
            "bg-gray-500", "Subhalakshmi Nagarajan", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Examination of basic chemical concepts and role of chemistry in modern society. For students not majoring in sciences.",
            null));

        // CHEM 1090 — Prereq: math + coreq CHEM 1100
        courses.add(c("chem1090", "Elementary Chemistry", "CHEM 1090", "CHEM", "1090",
            "bg-gray-500", "Siobhan Shay", "MWF (50 min) / MW (1 hr 20 min)", 3,
            list("Fall", "Spring"),
            "General chemistry and introduction to organic chemistry. Not accepted toward chemistry major or minor. Corequisite: CHEM 1100.",
            "Two years of high school science and MATH 1190, 1200, 1220, 1280, 1290, 1310, 1340, or 2320 or math placement score of 32+. Corequisite: CHEM 1100."));

        // CHEM 1100 — Coreq: CHEM 1090
        courses.add(c("chem1100", "Elementary Chemistry Laboratory", "CHEM 1100", "CHEM", "1100",
            "bg-gray-500", "Siobhan Shay", "M (2 hr 50 min) / Tu (2 hr 50 min)", 1,
            list("Fall", "Spring"),
            "Exploration of fundamental chemical principles and their application to environmental, health, and economic problems. Corequisite: CHEM 1090.",
            "Corequisite: CHEM 1090."));

        // CHEM 1230 — Prereq: math + coreq CHEM 1240
        courses.add(c("chem1230", "General Chemistry I", "CHEM 1230", "CHEM", "1230",
            "bg-gray-500", "Peter Blass", "MWF (50 min)", 4,
            list("Fall", "Spring"),
            "First in a two-course sequence for science majors. Topics include atomic structure, molecular bonding, chemical reactions, stoichiometry, thermochemistry, and gases.",
            "MATH 1200, 1220, 1230, 1260, 1280, 1300, 1310, or 1340 or math placement score of 41+. Corequisite: CHEM 1240."));

        // CHEM 1240 — Coreq: CHEM 1230
        courses.add(c("chem1240", "General Chemistry I Laboratory", "CHEM 1240", "CHEM", "1240",
            "bg-gray-500", "Ekaterina Mejiritski", "W (2 hr 50 min) / Th (2 hr 50 min)", 1,
            list("Fall", "Spring"),
            "Laboratory course taken in conjunction with CHEM 1230. One three-hour lab period per week.",
            "Corequisite: CHEM 1230."));

        // CHEM 1350 — Prereq: high school chem or CHEM 1090 + MATH 1220+
        courses.add(c("chem1350", "General Chemistry", "CHEM 1350", "CHEM", "1350",
            "bg-gray-500", "Siobhan Shay", "MWF (50 min) / M (2 hr 50 min)", 5,
            list("Fall"),
            "First in a two-course sequence for well-prepared chemistry majors and science majors. Topics include atomic structure, bonding, reactions, stoichiometry, thermochemistry, and gases.",
            "High school chemistry or CHEM 1090 and MATH 1220 or higher or math placement score of 41+."));

        // FN 2070 — Coreq: FN 2080
        courses.add(c("fn2070", "Introduction to Human Nutrition", "FN 2070", "FN", "2070",
            "bg-gray-500", "Staci Freeworth", "TuTh (1 hr 15 min) / MW (1 hr 20 min)", 3,
            list("Fall", "Spring"),
            "Basic concepts and principles in the science of human nutrition, energy balance and weight control, individual nutrient needs, diet selection, and current nutrition controversies.",
            "Corequisite: FN 2080."));

        // FN 2080 — Coreq: FN 2070
        courses.add(c("fn2080", "Introduction to Human Nutrition Laboratory", "FN 2080", "FN", "2080",
            "bg-gray-500", "Lisa Langhals", "TuTh (1 hr 40 min)", 1,
            list("Fall", "Spring"),
            "A laboratory course taken in conjunction with FN 2070. One two-hour lab period.",
            "Corequisite: FN 2070."));

        // GEOG 1250 — No prereqs
        courses.add(c("geog1250", "Weather and Climate", "GEOG 1250", "GEOG", "1250",
            "bg-gray-500", "Arthur Samel", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to the atmosphere with emphasis on factors that drive weather and climate, including air masses, fronts, thunderstorms, hurricanes, the greenhouse effect and global warming.",
            null));

        // GEOG 1260 — No prereqs
        courses.add(c("geog1260", "Weather Studies Laboratory", "GEOG 1260", "GEOG", "1260",
            "bg-gray-500", "Arthur Samel", "W (1 hr 50 min)", 3,
            list("Fall"),
            "Introduction to meteorology including characteristics of the atmosphere, drivers of atmospheric motion, and tools used to measure the atmosphere.",
            null));

        // GEOL 1000 — No prereqs (credit restriction)
        courses.add(c("geol1000", "Introduction to Geology", "GEOL 1000", "GEOL", "1000",
            "bg-gray-500", "Yuning Fu", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "The earth; physical and historical geology; including economic, social and environmental aspects. Not open to geology majors and minors.",
            "Credit allowed for no more than one: GEOL 1000, GEOL 1010, GEOL 1040."));

        // GEOL 1040 — No prereqs (credit restriction)
        courses.add(c("geol1040", "Earth Environments", "GEOL 1040", "GEOL", "1040",
            "bg-gray-500", "Sheila Roberts", "TuTh (1 hr 15 min) / W (1 hr 50 min)", 4,
            list("Fall", "Spring"),
            "Introduction to the principles of geology and Earth's dynamic systems. Earth materials and processes and their connections to people, including natural resources and hazards.",
            "Credit allowed for no more than one: GEOL 1000, GEOL 1010, GEOL 1040."));

        // GEOL 1050 — No prereqs
        courses.add(c("geol1050", "Life Through Time", "GEOL 1050", "GEOL", "1050",
            "bg-gray-500", "Christopher Lepre", "TuTh (1 hr 15 min) / W (1 hr 50 min)", 4,
            list("Fall", "Spring"),
            "Introduction to the origin, evolution, and extinction of major fossil groups in relation to a changing Earth through time.",
            null));

        // GEOL 2150 — No prereqs
        courses.add(c("geol2150", "Geologic History of Dinosaurs", "GEOL 2150", "GEOL", "2150",
            "bg-gray-500", "Joshua Luurtsema", "TuTh (1 hr 15 min) / W (1 hr 50 min)", 3,
            list("Fall", "Spring"),
            "Evolution, ways of life and extinction of the Dinosauria; geologic history of vertebrates and dinosaurs in relation to a changing earth.",
            null));

        // HNRS 2500 — Prereq: HNRS 2010
        courses.add(c("hnrs2500", "Critical Thinking in STEM", "HNRS 2500", "HNRS", "2500",
            "bg-gray-500", "Daniel Pavuk", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Interdisciplinary seminar exploring contemporary issues in STEM. Emphasizes analysis, discussion, and evaluation of issues and projects. Introduces students to quantitative research.",
            "HNRS 2010 and admission to BGSU's Honors College."));

        // PHYS 1010 — No prereqs
        courses.add(c("phys1010", "Basic Physics", "PHYS 1010", "PHYS", "1010",
            "bg-gray-500", "Lisa Bodi", "M (1 hr 50 min) / W (1 hr 50 min)", 3,
            list("Fall", "Spring"),
            "Laboratory course for non-science majors. Elementary description of major physics concepts and principles with contemporary applications. Not acceptable toward physics major or minor.",
            null));

        // PHYS 2010 — Prereq: MATH 1120 or MATH 1200+
        courses.add(c("phys2010", "College Physics I", "PHYS 2010", "PHYS", "2010",
            "bg-gray-500", "Eric Mandell", "MWF (50 min) / W (1 hr 50 min)", 5,
            list("Fall", "Spring"),
            "First term of introductory physics using algebra and trigonometry. Topics include motion, forces, energy, fluids, heat and simple harmonic motion.",
            "Satisfactory math placement score or grade of C or higher in MATH 1120 or MATH 1200 or above."));

        // PHYS 2020 — Prereq: PHYS 2010
        courses.add(c("phys2020", "College Physics II", "PHYS 2020", "PHYS", "2020",
            "bg-gray-500", "Andrew McNeill", "MWF (50 min) / W (1 hr 50 min)", 5,
            list("Fall", "Spring"),
            "PHYS 2010 continued. Simple harmonic motion, wave motion, sound, electricity, magnetism, optics; atomic, nuclear and solid-state physics.",
            "PHYS 2010."));

        // PHYS 2110 — Coreq: MATH 1310
        courses.add(c("phys2110", "University Physics I", "PHYS 2110", "PHYS", "2110",
            "bg-gray-500", "Andrew McNeill", "M (1 hr 50 min) / TuTh (50 min)", 5,
            list("Fall"),
            "Introductory calculus-based physics for science and engineering majors. Kinematics, Newtonian mechanics, gravitation, heat and thermodynamics.",
            "Corequisite: MATH 1310."));

        // PHYS 2120 — Prereq: PHYS 2110, Coreq: MATH 2320
        courses.add(c("phys2120", "University Physics II", "PHYS 2120", "PHYS", "2120",
            "bg-gray-500", "Alexey Zayak", "WF (50 min) / M (1 hr 50 min)", 5,
            list("Spring"),
            "PHYS 2110 continued. Wave motion, sound, optics, electricity and magnetism.",
            "PHYS 2110. Corequisite: MATH 2320."));

        // SEES 2220 — No prereqs
        courses.add(c("sees2220", "Water Resources and Issues", "SEES 2220", "SEES", "2220",
            "bg-gray-500", "Ganming Liu", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "Introduction to scientific issues affecting the world's fresh water supply with emphasis on water use, quality, conflict, and environmental and social sustainability.",
            null));

        // EDTL 2010 — No prereqs
        courses.add(c("edtl2010", "Introduction to Education", "EDTL 2010", "EDTL", "2010",
            "bg-gray-500", "Trisha Prunty", "TuTh (50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to educational foundation topics and contemporary issues for prospective teachers. Weekly seminar and field experiences. Required as entry-year experience for all teacher-education candidates.",
            null));

        // =====================================================================
        // TIER 5 — Foreign Language Courses
        // =====================================================================

        // --- American Sign Language ---

        // ASL 1010 — No prereqs
        courses.add(c("asl1010", "American Sign Language I", "ASL 1010", "ASL", "1010",
            "bg-gray-500", "Brent Borden", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Basic vocabulary and grammatical structure of the visual language system used by deaf persons in North America. Implications of deafness for language and communication, psycholinguistic studies of Sign.",
            null));

        // ASL 1020 — Prereq: ASL 1010
        courses.add(c("asl1020", "American Sign Language II", "ASL 1020", "ASL", "1020",
            "bg-gray-500", "Kyle Parke", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Students will expand conversational range including situations such as giving directions, making requests, establishing connections with Deaf persons, handling interruptions during conversations. Students will learn historical aspects of Deaf education and Deaf organizations.",
            "C or higher in ASL 1010 or consent of program."));

        // ASL 2010 — Prereq: ASL 1020
        courses.add(c("asl2010", "American Sign Language III", "ASL 2010", "ASL", "2010",
            "bg-gray-500", "Jodie Gregg", "TuTh (1 hr 15 min) / W (3 hr)", 3,
            list("Fall", "Spring"),
            "This course is to foster and increase competence of American Sign Language (ASL) emphasizing advanced ASL structures in dialogue, narrative, and conversational formats encouraging students to establish and maintain social relationships with Deaf people. This is a continuation of ASL 1020, expanding the emphasis on ASL grammar, syntax, spatial referencing, and vocabulary development.",
            "C or higher in ASL 1020, or consent of program."));

        // ASL 2020 — Prereq: ASL 2010
        courses.add(c("asl2020", "American Sign Language IV", "ASL 2020", "ASL", "2020",
            "bg-gray-500", "Hillary Anderson", "TuTh (1 hr 15 min)", 3,
            list("Fall", "Spring"),
            "This course is to advance competence of ASL understanding. Students will develop comprehension in context of medium-length stories, narratives, and dialogues. This further encourages ASL skills in order for students to establish and maintain social relationships with deaf people. This course is a continuation of ASL 2010.",
            "C or better in ASL 2010 or consent of the program."));

        // --- Chinese ---

        // CHIN 1010 — No prereqs
        courses.add(c("chin1010", "Elementary Language and Culture I", "CHIN 1010", "CHIN", "1010",
            "bg-gray-500", "Min Yang", "MWThF (50 min) / MWF (50 min)", 3,
            list("Fall"),
            "Introduction to Mandarin Chinese, the official standard language of Mainland China and Taiwan. Development of the four skills: listening, speaking, reading and writing.",
            null));

        // CHIN 1020 — Prereq: CHIN 1010
        courses.add(c("chin1020", "Elementary Language and Culture II", "CHIN 1020", "CHIN", "1020",
            "bg-gray-500", "Min Yang", "MWThF (50 min) / MWF (50 min)", 3,
            list("Spring"),
            "CHIN 1010 continued. Four class periods and laboratory practice each week.",
            "CHIN 1010 or one year of high school Chinese, or equivalent."));

        // CHIN 2010 — Prereq: CHIN 1020
        courses.add(c("chin2010", "Intermediate Chinese I", "CHIN 2010", "CHIN", "2010",
            "bg-gray-500", "Min Yang", "MWF (50 min) / MW (1 hr 20 min)", 3,
            list("Fall"),
            "CHIN 1020 continued. Grammar and character writing review; continued development of the four skills.",
            "CHIN 1020, two years of high school Chinese, or equivalent."));

        // CHIN 2020 — Prereq: CHIN 2010
        courses.add(c("chin2020", "Intermediate Chinese II", "CHIN 2020", "CHIN", "2020",
            "bg-gray-500", "Min Yang", "MWThF (50 min) / MWF (50 min)", 3,
            list("Spring"),
            "CHIN 2010 continued. Grammar and character writing review; continued development of the four skills.",
            "CHIN 2010, three years of high school Chinese, or equivalent."));

        // CHIN 2160 — No prereqs
        courses.add(c("chin2160", "Contemporary Chinese Culture", "CHIN 2160", "CHIN", "2160",
            "bg-gray-500", "Min Yang", "MW (1 hr 15 min)", 3,
            list("Spring"),
            "Contemporary life in Chinese societies and crosscultural study of Chinese values. Study of culture as displayed in societal institutions and the arts. Presentations, readings, discussions, and writing in English.",
            null));

        // CHIN 3120 — No prereqs
        courses.add(c("chin3120", "Introduction to Chinese Literature", "CHIN 3120", "CHIN", "3120",
            "bg-gray-500", "Min Yang", "MW (1 hr 15 min)", 3,
            list("Spring"),
            "A survey of modern Chinese literature, including canonical works by Lu Xun, Mao Dun, Ding Ling, and others. Examination of various literary genres, trends, and aesthetic aspects of works. Readings, writings, and lectures in English.",
            null));

        // CHIN 4150 — No prereqs
        courses.add(c("chin4150", "Chinese Film", "CHIN 4150", "CHIN", "4150",
            "bg-gray-500", "Min Yang", "MW (1 hr 15 min) / M (3 hr)", 3,
            list("Fall"),
            "Cultural and literary aspects of Chinese film. The course will emphasize important developments in Chinese film's genres, aesthetic, and connections with economic, social and political transformations in China. Two class meetings and one required film screening per week.",
            null));

        // --- French ---

        // FREN 1010 — No prereqs
        courses.add(c("fren1010", "Elementary French I", "FREN 1010", "FREN", "1010",
            "bg-gray-500", "Jennifer Wolter", "MWThF (50 min) / MTuWTh (50 min)", 3,
            list("Fall", "Spring"),
            "Beginning oral-aural study; attention to grammar.",
            null));

        // FREN 1020 — Prereq: FREN 1010
        courses.add(c("fren1020", "Elementary French II", "FREN 1020", "FREN", "1020",
            "bg-gray-500", "Jennifer Wolter", "MWThF (50 min) / MTuWTh (50 min)", 3,
            list("Fall", "Spring"),
            "FREN 1010 continued. Development of listening, speaking, reading and writing skills.",
            "FREN 1010 or a satisfactory placement exam score."));

        // FREN 2120 — Prereq: FREN 2010
        courses.add(c("fren2120", "French for the 21st Century", "FREN 2120", "FREN", "2120",
            "bg-gray-500", "Daniel Dinca", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "This course integrates instruction in reading French with a review of high-frequency communication techniques and practical cultural knowledge. Materials and class sessions make strategic use of English to explore cross-cultural issues.",
            "FREN 2010 or three years of high school French. Does not count as prerequisite for 3000-level class. Once a student has taken FREN 2020 or 3000-level classes, FREN 2120 may not be taken for credit."));

        // --- German ---

        // GERM 1010 — No prereqs
        courses.add(c("germ1010", "Elementary Language and Culture I", "GERM 1010", "GERM", "1010",
            "bg-gray-500", "Abdulla Davlatboyey", "MTuWF (50 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Cultural approach to beginning language study in the four skills: listening, speaking, reading, writing.",
            null));

        // GERM 1020 — Prereq: GERM 1010
        courses.add(c("germ1020", "Elementary Language and Culture II", "GERM 1020", "GERM", "1020",
            "bg-gray-500", "Christina Guenther", "MWF (50 min)", 3,
            list("Fall", "Spring"),
            "GERM 1010 continued. Development of listening, speaking, reading and writing skills.",
            "GERM 1010 or a satisfactory exam placement score."));

        // GERM 2150/2160 already in Tier 4

        // GERM 3110 — Prereq: GERM 2020
        courses.add(c("germ3110", "Introduction to German Literature", "GERM 3110", "GERM", "3110",
            "bg-gray-500", "Philip Peek", "TBA", 3,
            list("Fall"),
            "Approaches to reading and interpreting representative works, primarily 20th century; development of reading comprehension, vocabulary skills, speaking ability (discussion), and intellectual appreciation.",
            "GERM 2020 or permission of instructor."));

        // GERM 3800 — No prereqs
        courses.add(c("germ3800", "Topics in German Language, Thought, or Culture", "GERM 3800", "GERM", "3800",
            "bg-gray-500", "Edgar Landgraf", "MWF (50 min) / TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "Topic chosen to meet curriculum needs and student requests. May be repeated to six hours with different topics.",
            null));

        // GERM 4150 — No prereqs
        courses.add(c("germ4150", "The German Film", "GERM 4150", "GERM", "4150",
            "bg-gray-500", "Kristie Foell", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "Cultural and literary aspects of German film; emphasis may be on important developments in German filmmaking, thematic aspects of film or on interrelationships between literary and cultural phenomena and the film.",
            null));

        // --- Greek ---

        // GRK 1010 — No prereqs
        courses.add(c("grk1010", "Elementary Greek I", "GRK 1010", "GRK", "1010",
            "bg-gray-500", "Philip Peek", "MTuWF (50 min) / MTuWTh (50 min)", 3,
            list("Fall"),
            "Introduction to ancient Greek with a focus on listening and reading Homer's Odyssey.",
            null));

        // GRK 1020 — Prereq: GRK 1010
        courses.add(c("grk1020", "Elementary Greek II", "GRK 1020", "GRK", "1020",
            "bg-gray-500", "Philip Peek", "MTuWF (50 min) / MTuWTh (50 min)", 3,
            list("Spring"),
            "Introduction to ancient Greek with a continued focus on listening and reading Homer's Odyssey.",
            "GRK 1010 or one year of ancient Greek in high school."));

        // GRK 2010 — Prereq: GRK 1020
        courses.add(c("grk2010", "Intermediate Greek I", "GRK 2010", "GRK", "2010",
            "bg-gray-500", "Philip Peek", "MWF (50 min)", 3,
            list("Fall"),
            "Grammatical review and reading of ancient Greek texts.",
            "GRK 1020 or two years of ancient Greek in high school."));

        // GRK 2020 — Prereq: GRK 2010
        courses.add(c("grk2020", "Intermediate Greek II", "GRK 2020", "GRK", "2020",
            "bg-gray-500", "Philip Peek", "MWF (50 min)", 3,
            list("Spring"),
            "Grammatical review and reading of ancient Greek texts.",
            "GRK 2010."));

        // --- Italian ---

        // ITAL 1010 — No prereqs
        courses.add(c("ital1010", "Elementary Italian I", "ITAL 1010", "ITAL", "1010",
            "bg-gray-500", "Carlo Celli", "MWThF (50 min) / MTuWTh (50 min)", 3,
            list("Fall", "Spring"),
            "Cultural approach to beginning language. Development of the four skills: listening, speaking, reading, writing. Four class periods and laboratory practice each week.",
            null));

        // ITAL 1020 — Prereq: ITAL 1010
        courses.add(c("ital1020", "Elementary Italian II", "ITAL 1020", "ITAL", "1020",
            "bg-gray-500", "Carlo Celli", "MWThF (50 min) / MTuWF (50 min)", 3,
            list("Fall", "Spring"),
            "ITAL 1010 continued. Four class periods and laboratory practice each week.",
            "ITAL 1010 or one year of Italian in high school."));

        // ITAL 2010 — No prereqs listed in CSV (Staff, TBA)
        courses.add(c("ital2010", "Intermediate Italian I", "ITAL 2010", "ITAL", "2010",
            "bg-gray-500", "Staff", "TBA", 3,
            list("Fall"),
            "Development of the four language skills.",
            null));

        // ITAL 2020 — Prereq: ITAL 2010
        courses.add(c("ital2020", "Intermediate Italian II", "ITAL 2020", "ITAL", "2020",
            "bg-gray-500", "Mariella Zucchi-Bingman", "TBA", 3,
            list("Spring"),
            "ITAL 2010 continued. Development of the four language skills.",
            "ITAL 2010, three years of Italian in high school."));

        // --- Japanese ---

        // JAPN 1010 — No prereqs
        courses.add(c("japn1010", "Elementary Language and Culture I", "JAPN 1010", "JAPN", "1010",
            "bg-gray-500", "Ryoko Okamura", "MWThF (50 min) / MWF (50 min)", 3,
            list("Fall"),
            "Introduction to the Japanese language with an emphasis on its cultural context. Development of the four skills: Listening, Speaking, Reading, and Writing.",
            null));

        // JAPN 1020 — Prereq: JAPN 1010
        courses.add(c("japn1020", "Elementary Language and Culture II", "JAPN 1020", "JAPN", "1020",
            "bg-gray-500", "Georgia Adams", "MWF (50 min)", 3,
            list("Spring"),
            "JAPN 1010 continued. Development of the four skills: Listening, Speaking, Reading, and Writing.",
            "JAPN 1010 or one year of high school Japanese, or equivalent."));

        // JAPN 2010 — Prereq: JAPN 1020
        courses.add(c("japn2010", "Intermediate Japanese I", "JAPN 2010", "JAPN", "2010",
            "bg-gray-500", "Ryoko Okamura", "MWF (50 min) / MWThF (50 min)", 3,
            list("Fall"),
            "JAPN 1010-JAPN 1020 continued. Development of the four skills: Listening, Speaking, Reading, and Writing. Further attention to communicative skills and basic grammar.",
            "JAPN 1020 or two years of high school Japanese, or equivalent."));

        // JAPN 2020 — Prereq: JAPN 2010
        courses.add(c("japn2020", "Intermediate Japanese II", "JAPN 2020", "JAPN", "2020",
            "bg-gray-500", "Yukiko Bickell", "MWThF (50 min) / MWF (50 min)", 3,
            list("Spring"),
            "JAPN 2010 continued. Development of the four skills: Listening, Speaking, Reading, and Writing. Further attention to communicative skills. Completion of basic grammar.",
            "JAPN 2010 or three years of high school Japanese, or equivalent."));

        // JAPN 2150 — No prereqs
        courses.add(c("japn2150", "Japanese Culture", "JAPN 2150", "JAPN", "2150",
            "bg-gray-500", "Ryoko Okamura", "MW (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall"),
            "Japanese culture, its evolution, and manifestations in the arts, social life, folkways, religious beliefs, and other areas of life. Presentations, readings, and writing in English.",
            null));

        // JAPN 2160 — No prereqs
        courses.add(c("japn2160", "Contemporary Japanese Society", "JAPN 2160", "JAPN", "2160",
            "bg-gray-500", "Ryoko Okamura", "MWF (50 min)", 3,
            list("Spring"),
            "Contemporary life in Japan and crosscultural study of Japanese values. Examination of the culture as evidenced in societal institutions and the arts. Presentations, readings, discussions, and writing in English.",
            null));

        // JAPN 3120 — No prereqs
        courses.add(c("japn3120", "Introduction to Japanese Literature", "JAPN 3120", "JAPN", "3120",
            "bg-gray-500", "Ryoko Okamura", "MWF (50 min)", 3,
            list("Fall"),
            "Works of select Japanese writers in translation representative of key literary traditions, themes, and styles. Class discussion, readings, and writing in English.",
            null));

        // JAPN 4150 — No prereqs
        courses.add(c("japn4150", "Japanese Film", "JAPN 4150", "JAPN", "4150",
            "bg-gray-500", "Ryoko Okamura", "MW (1 hr 15 min) / TuTh (1 hr 15 min)", 3,
            list("Spring"),
            "Cultural and cinematic aspects of Japanese film; emphasis may be on important developments in Japanese filmmaking, thematic aspects of film, or on interrelationships between cinematic and other cultural phenomena.",
            null));

        // --- Latin ---

        // LAT 1010 — No prereqs
        courses.add(c("lat1010", "Elementary Language and Culture I", "LAT 1010", "LAT", "1010",
            "bg-gray-500", "Nicholas Dee", "MTuWThF (50 min) / MTuWF (50 min)", 3,
            list("Fall"),
            "Cultural and reading approach to beginning language. Development of the four skills: listening, speaking, reading, writing. Four class periods and laboratory practice each week.",
            null));

        // LAT 1020 — Prereq: LAT 1010
        courses.add(c("lat1020", "Elementary Language and Culture II", "LAT 1020", "LAT", "1020",
            "bg-gray-500", "James Pfundstein", "TBA", 3,
            list("Spring"),
            "LAT 1010 continued. Four class periods and laboratory practice each week.",
            "LAT 1010 or one year of Latin in high school."));

        // LAT 2010 — Prereq: LAT 1020
        courses.add(c("lat2010", "Intermediate Latin I", "LAT 2010", "LAT", "2010",
            "bg-gray-500", "James Pfundstein", "MWF (50 min)", 3,
            list("Fall"),
            "Grammatical review and reading of ancient Latin texts.",
            "LAT 1020 or two years of Latin in high school."));

        // LAT 2020 — Prereq: LAT 2010
        courses.add(c("lat2020", "Intermediate Latin II", "LAT 2020", "LAT", "2020",
            "bg-gray-500", "Nicholas Dee", "MWF (50 min)", 3,
            list("Spring"),
            "Grammatical review and reading of ancient Latin texts.",
            "LAT 2010 or three years of Latin in high school."));

        // --- Russian ---

        // RUSN 1010 — No prereqs
        courses.add(c("rusn1010", "Elementary Language and Culture I", "RUSN 1010", "RUSN", "1010",
            "bg-gray-500", "Irina Stakhanova", "MWF (50 min)", 3,
            list("Fall"),
            "Introduction to the Russian language in its cultural and social context with emphasis on speaking, listening and reading skills.",
            null));

        // RUSN 1020 — Prereq: RUSN 1010
        courses.add(c("rusn1020", "Elementary Language and Culture II", "RUSN 1020", "RUSN", "1020",
            "bg-gray-500", "Elena Liskova", "MWThF (50 min) / MW (1 hr 15 min)", 3,
            list("Spring"),
            "RUSN 1010 continued. Increased use of authentic reading materials. Completion of elementary grammar study.",
            "RUSN 1010 or by placement."));

        // RUSN 2010 — Prereq: RUSN 1020
        courses.add(c("rusn2010", "Intermediate Russian I", "RUSN 2010", "RUSN", "2010",
            "bg-gray-500", "Timothy Pogacar", "MWTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall"),
            "Further development in reading, narrating and describing. Writing common documents. Review of elementary grammar.",
            "RUSN 1020 or by placement."));

        // RUSN 2020 — Prereq: RUSN 2010
        courses.add(c("rusn2020", "Intermediate Russian II", "RUSN 2020", "RUSN", "2020",
            "bg-gray-500", "Timothy Pogacar", "MWTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Spring"),
            "RUSN 2010 continued. Introduction to reading Russian fiction, media, and reference works. Completion of basic grammar.",
            "RUSN 2010 or by placement."));

        // RUSN 3120 — No prereqs
        courses.add(c("rusn3120", "Introduction to Russian Literature", "RUSN 3120", "RUSN", "3120",
            "bg-gray-500", "Timothy Pogacar", "MW (1 hr 15 min) / Th (3 hr)", 3,
            list("Fall"),
            "Enjoyment and analysis of literature with selections from 19th- and 20th-century stories, plays, novels, and essays by writers such as Bulgakov, Chekhov, Dostoevsky, and Tolstoy. Cultural background. Conducted in English.",
            null));

        // RUSN 3160 — No prereqs
        courses.add(c("rusn3160", "Contemporary European Societies and Culture", "RUSN 3160", "RUSN", "3160",
            "bg-gray-500", "Timothy Pogacar", "TuTh (1 hr 15 min) / MW (1 hr 15 min)", 3,
            list("Spring"),
            "Contemporary Eastern European societies and cultures (may vary by semester) compared on the bases of select topics, including nation building, religion, and popular art forms. Presentations, readings, and writing in English.",
            null));

        // --- Spanish ---

        // SPAN 1010 — No prereqs
        courses.add(c("span1010", "Elementary Spanish I", "SPAN 1010", "SPAN", "1010",
            "bg-gray-500", "Cynthia Ducar", "MTuWF (50 min) / MTuWTh (50 min)", 3,
            list("Fall", "Spring"),
            "Introduction to Spanish language and to Hispanic cultures. Communicative approach to teach beginning language use in the four skill areas: listening, speaking, reading, writing.",
            null));

        // SPAN 1020 — Prereq: SPAN 1010
        courses.add(c("span1020", "Elementary Spanish II", "SPAN 1020", "SPAN", "1020",
            "bg-gray-500", "Mateo Rafaly", "MWThF (50 min) / MTuWTh (50 min)", 3,
            list("Fall", "Spring"),
            "SPAN 1010 continued. Development of listening, speaking, reading and writing skills.",
            "SPAN 1010 or a satisfactory placement exam score."));

        // SPAN 2120 — Prereq: SPAN 2010
        courses.add(c("span2120", "Spanish Cultural Readings IV", "SPAN 2120", "SPAN", "2120",
            "bg-gray-500", "Laura Reyes", "TuTh (1 hr 15 min) / MWF (50 min)", 3,
            list("Fall", "Spring"),
            "Development of reading comprehension in Spanish using cultural materials concerning Spain and Spanish America. Conducted in English.",
            "SPAN 2010 or a satisfactory placement exam score. Cannot be taken for credit if SPAN 2020 credit has been received."));

        courseRepository.saveAll(courses);
        log.info("Seeded {} courses (Tier 1 + Tier 2 + Tier 3 + Tier 4 + Tier 5)", courses.size());
    }

    /**
     * Shorthand factory for a Course. The {@code prereqText} field stores the exact
     * catalog requirement string verbatim — it may describe prerequisites, corequisites,
     * grade minimums, placement scores, consent of instructor, or combinations thereof.
     */
    private Course c(String id, String name, String code, String subject, String number,
                     String color, String instructor, String schedule, int credits,
                     List<String> semesters, String description, String prereqText) {
        Course course = new Course();
        course.setId(id);
        course.setName(name);
        course.setCode(code);
        course.setSubject(subject);
        course.setNumber(number);
        course.setColor(color);
        course.setInstructor(instructor);
        course.setSchedule(schedule);
        course.setCredits(credits);
        course.setEnrolled(false);
        course.setSemesters(semesters);
        course.setHistory(Collections.emptyList());
        course.setDescription(description);
        course.setPrerequisiteText(prereqText);
        return course;
    }

    /** Convenience varargs helper to build a semester list. */
    private List<String> list(String... values) {
        return Arrays.asList(values);
    }

    @Override
    public int getOrder() {
        return 10; // Courses must be seeded before CourseInfo
    }

    @Override
    public boolean shouldSeed() {
        return courseRepository.count() == 0;
    }

}
