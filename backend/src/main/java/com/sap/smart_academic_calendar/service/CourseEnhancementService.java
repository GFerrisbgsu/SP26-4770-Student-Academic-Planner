package com.sap.smart_academic_calendar.service;

import com.sap.smart_academic_calendar.dto.BulkUpdateResult;
import com.sap.smart_academic_calendar.dto.CoursicleDataDTO;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.CourseInfo;
import com.sap.smart_academic_calendar.model.PrerequisiteEntry;
import com.sap.smart_academic_calendar.repository.CourseInfoRepository;
import com.sap.smart_academic_calendar.repository.CourseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for enhancing course data with Coursicle information
 * 
 * Coordinates batch updates of course instructor and schedule data
 * by fetching from Coursicle and updating the database.
 * 
 * Key Features:
 * - Batch processing with error recovery (continues on individual failures)
 * - Rate limiting (3-second delay between requests)
 * - Comprehensive error reporting
 * - Transactional updates (each course update is atomic)
 * 
 * Usage:
 * 1. Call enhanceCoursesFromCoursicle() with list of course codes
 * 2. Service fetches each course from database
 * 3. Service scrapes Coursicle for updated data
 * 4. Service updates course entity and saves
 * 5. Returns BulkUpdateResult with success/error counts
 */
@Service
public class CourseEnhancementService {
    
    private static final Logger log = LoggerFactory.getLogger(CourseEnhancementService.class);
    
    private static final long RATE_LIMIT_DELAY_MS = 3000; // 3 seconds between requests
    
    private final CourseRepository courseRepository;
    private final CoursicleScraperService scraperService;
    private final CourseInfoRepository courseInfoRepository;
    
    public CourseEnhancementService(CourseRepository courseRepository,
                                   CoursicleScraperService scraperService,
                                   CourseInfoRepository courseInfoRepository) {
        this.courseRepository = courseRepository;
        this.scraperService = scraperService;
        this.courseInfoRepository = courseInfoRepository;
    }
    
    /**
     * Enhance multiple courses with Coursicle data
     * 
     * Processes each course code:
     * 1. Fetch course from database
     * 2. Scrape Coursicle for real instructor/schedule
     * 3. Update course entity
     * 4. Save to database
     * 5. Wait 3 seconds (rate limiting)
     * 
     * Continues processing even if individual courses fail.
     * 
     * @param courseCodes List of course codes (e.g., ["CS 2010", "MATH 1280"])
     * @return BulkUpdateResult with success count, error count, and error messages
     */
    @Transactional
    public BulkUpdateResult enhanceCoursesFromCoursicle(List<String> courseCodes) {
        log.info("Starting Coursicle enhancement for {} courses", courseCodes.size());
        
        int successCount = 0;
        List<String> errors = new ArrayList<>();
        
        for (int i = 0; i < courseCodes.size(); i++) {
            String code = courseCodes.get(i);
            
            try {
                log.info("Processing course {}/{}: {}", i + 1, courseCodes.size(), code);
                
                // Step 1: Fetch course from database
                Course course = courseRepository.findByCode(code);
                if (course == null) {
                    String error = code + ": Course not found in database";
                    log.error(error);
                    errors.add(error);
                    continue;
                }
                
                // Step 2: Parse course code into subject and number
                String[] parts = code.split(" ");
                if (parts.length != 2) {
                    String error = code + ": Invalid course code format (expected 'SUBJECT NUMBER')";
                    log.error(error);
                    errors.add(error);
                    continue;
                }
                
                String subject = parts[0];
                String number = parts[1];
                
                // Step 3: Scrape Coursicle for updated data
                CoursicleDataDTO data = scraperService.scrapeCourse(subject, number);
                
                if (data == null) {
                    String error = code + ": Failed to scrape Coursicle (returned null)";
                    log.error(error);
                    errors.add(error);
                    continue;
                }
                
                // Step 4: Update course entity with all available fields
                String oldInstructor = course.getInstructor();
                String oldSchedule = course.getSchedule();

                course.setInstructor(data.getInstructor());
                course.setSchedule(data.getSchedule());

                // Update description if Coursicle provided one (don't overwrite with null)
                if (data.getDescription() != null && !data.getDescription().isBlank()) {
                    course.setDescription(data.getDescription());
                }

                // Update credits if Coursicle provided a value
                if (data.getCredits() != null) {
                    course.setCredits(data.getCredits());
                }

                // Update semesters list if Coursicle returned any
                if (data.getSemesters() != null && !data.getSemesters().isEmpty()) {
                    course.setSemesters(data.getSemesters());
                }
                
                // Step 5: Save to database
                courseRepository.save(course);
                
                successCount++;
                log.info("Successfully updated {}: instructor '{}' -> '{}', schedule '{}' -> '{}'",
                        code, oldInstructor, data.getInstructor(), oldSchedule, data.getSchedule());
                
                // Step 6: Rate limiting - wait 3 seconds before next request
                if (i < courseCodes.size() - 1) { // Don't wait after last course
                    log.debug("Rate limiting: waiting {} ms before next request", RATE_LIMIT_DELAY_MS);
                    Thread.sleep(RATE_LIMIT_DELAY_MS);
                }
                
            } catch (InterruptedException e) {
                String error = code + ": Thread interrupted during rate limiting delay";
                log.error(error, e);
                errors.add(error);
                Thread.currentThread().interrupt(); // Restore interrupt status
                break; // Stop processing if interrupted
                
            } catch (Exception e) {
                String error = code + ": " + e.getClass().getSimpleName() + " - " + e.getMessage();
                log.error("Error enhancing course {}: {}", code, e.getMessage(), e);
                errors.add(error);
                // Continue with next course
            }
        }
        
        int errorCount = errors.size();
        log.info("Coursicle enhancement complete: {} successes, {} errors", successCount, errorCount);
        
        if (!errors.isEmpty()) {
            log.warn("Errors encountered: {}", errors);
        }
        
        return new BulkUpdateResult(successCount, errorCount, errors);
    }
    
    /**
     * Enhance a single course with Coursicle data
     * 
     * Convenience method for updating one course at a time.
     * 
     * @param courseCode Course code (e.g., "CS 2010")
     * @return BulkUpdateResult with update status
     */
    @Transactional
    public BulkUpdateResult enhanceSingleCourse(String courseCode) {
        return enhanceCoursesFromCoursicle(List.of(courseCode));
    }

    /**
     * Update the prerequisite list for a given course.
     *
     * Accepts fully-typed PrerequisiteEntry objects so callers can supply
     * PREREQUISITE, COREQUISITE, or OTHER entries as needed.
     * The import script sends simple PREREQUISITE entries derived from the
     * OCR-detected course-code list; richer types are populated later via
     * structured parsing of Course.prerequisiteText.
     *
     * @param courseId      Lowercase course ID, e.g. "cs2020"
     * @param prerequisites Typed prerequisite list
     * @return true if updated; false if CourseInfo record not found
     */
    @Transactional
    public boolean updatePrerequisites(String courseId, List<PrerequisiteEntry> prerequisites) {
        CourseInfo courseInfo = courseInfoRepository.findByCourseId(courseId)
                .orElse(null);

        if (courseInfo == null) {
            log.warn("CourseInfo not found for courseId='{}' – prerequisite update skipped", courseId);
            return false;
        }

        courseInfo.setPrerequisites(prerequisites);
        courseInfoRepository.save(courseInfo);
        log.info("Updated prerequisites for {}: {}", courseId, prerequisites);
        return true;
    }
}
