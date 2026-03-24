package com.sap.smart_academic_calendar.controller;

import com.sap.smart_academic_calendar.dto.BulkUpdateResult;
import com.sap.smart_academic_calendar.model.PrerequisiteEntry;
import com.sap.smart_academic_calendar.service.CourseEnhancementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin endpoints for course data management
 * 
 * Provides administrative operations for course enhancement,
 * including bulk updates from Coursicle.
 * 
 * Security Note:
 * - These endpoints are currently UNSECURED (no authentication)
 * - TODO: Add Spring Security with @PreAuthorize("hasRole('ADMIN')")
 * - For now, treat as internal-only endpoints
 * - Do not expose to public internet without authentication
 * 
 * Usage:
 * POST /api/admin/courses/enhance-from-coursicle
 * Body: ["CS 2010", "CS 2020", "MATH 1280"]
 * 
 * Returns:
 * {
 *   "successCount": 2,
 *   "errorCount": 1,
 *   "errors": ["MATH 1280: Network timeout"]
 * }
 */
@RestController
@RequestMapping("/api/admin/courses")
public class CourseAdminController {
    
    private static final Logger log = LoggerFactory.getLogger(CourseAdminController.class);
    
    private final CourseEnhancementService enhancementService;
    
    public CourseAdminController(CourseEnhancementService enhancementService) {
        this.enhancementService = enhancementService;
    }
    
    /**
     * Enhance courses with Coursicle data
     * 
     * Fetches real instructor names and schedules from Coursicle.com
     * for the specified course codes, replacing placeholder data.
     * 
     * Rate Limiting:
     * - Service implements 3-second delays between requests
     * - Total time = (number of courses × 3 seconds) + scraping time
     * - 15 courses take ~1-2 minutes
     * 
     * @param courseCodes List of course codes to enhance (e.g., ["CS 2010", "SE 3540"])
     * @return BulkUpdateResult with success/error counts and error messages
     */
    @PutMapping("/enhance-from-coursicle")
    public ResponseEntity<BulkUpdateResult> enhanceFromCoursicle(@RequestBody List<String> courseCodes) {
        log.info("Admin request: Enhance {} courses from Coursicle", courseCodes.size());
        
        if (courseCodes == null || courseCodes.isEmpty()) {
            log.warn("Empty course codes list provided");
            return ResponseEntity.badRequest()
                    .body(new BulkUpdateResult(0, 1, List.of("No course codes provided")));
        }
        
        BulkUpdateResult result = enhancementService.enhanceCoursesFromCoursicle(courseCodes);
        
        log.info("Enhancement result: {} successes, {} errors", 
                result.getSuccessCount(), result.getErrorCount());
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Enhance a single course with Coursicle data
     * 
     * Convenience endpoint for updating one course at a time.
     * 
     * @param courseCode Single course code (e.g., "CS 2010")
     * @return BulkUpdateResult with update status
     */
    @PutMapping("/enhance-from-coursicle/{courseCode}")
    public ResponseEntity<BulkUpdateResult> enhanceSingleCourse(@PathVariable String courseCode) {
        log.info("Admin request: Enhance single course from Coursicle: {}", courseCode);
        
        BulkUpdateResult result = enhancementService.enhanceSingleCourse(courseCode);
        
        return ResponseEntity.ok(result);
    }

    /**
     * Update prerequisite entries for a course.
     *
     * Accepts a list of PrerequisiteEntry objects with type and optional description.
     * The import script sends simple course-ID entries (type defaults to PREREQUISITE).
     * Future structured-parsing tasks will send COREQUISITE / OTHER entries.
     *
     * PUT /api/admin/courses/course-info/{courseId}/prerequisites
     * Body: [{"courseId":"cs2010","type":"PREREQUISITE"},{"courseId":null,"type":"OTHER","description":"Math Placement score"}]
     *
     * @param courseId      Lowercase course ID (e.g. "cs2020")
     * @param prerequisites Typed prerequisite list
     * @return 200 OK, or 404 if CourseInfo not found
     */
    @PutMapping("/course-info/{courseId}/prerequisites")
    public ResponseEntity<Map<String, Object>> updatePrerequisites(
            @PathVariable String courseId,
            @RequestBody List<PrerequisiteEntry> prerequisites) {
        log.info("Admin request: Update prerequisites for {} => {}", courseId, prerequisites);

        boolean updated = enhancementService.updatePrerequisites(courseId, prerequisites);

        if (updated) {
            return ResponseEntity.ok(Map.of(
                    "courseId", courseId,
                    "prerequisites", prerequisites,
                    "status", "updated"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "courseId", courseId,
                    "status", "not_found",
                    "message", "No CourseInfo record found for " + courseId
            ));
        }
    }
}
