package com.sap.smart_academic_calendar.service.seeding;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.model.Event;
import com.sap.smart_academic_calendar.model.User;
import com.sap.smart_academic_calendar.repository.CourseRepository;
import com.sap.smart_academic_calendar.repository.EventRepository;
import com.sap.smart_academic_calendar.repository.UserRepository;

/**
 * Seeds class schedule events from enrolled courses.
 * Generates recurring class events for Spring 2026 semester.
 */
@Component
public class EventSeeder implements DataSeeder<Event> {
    
    private static final Logger log = LoggerFactory.getLogger(EventSeeder.class);
    
    private final EventRepository eventRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    
    // Spring 2026 semester dates (adjust as needed)
    private static final LocalDate SEMESTER_START = LocalDate.of(2026, 1, 12); // Monday, Jan 12, 2026
    private static final LocalDate SEMESTER_END = LocalDate.of(2026, 5, 8);    // Friday, May 8, 2026
    
    // Day abbreviation to DayOfWeek mapping
    private static final Map<String, DayOfWeek> DAY_MAP = new HashMap<>();
    static {
        DAY_MAP.put("M", DayOfWeek.MONDAY);
        DAY_MAP.put("Tu", DayOfWeek.TUESDAY);
        DAY_MAP.put("W", DayOfWeek.WEDNESDAY);
        DAY_MAP.put("Th", DayOfWeek.THURSDAY);
        DAY_MAP.put("F", DayOfWeek.FRIDAY);
    }
    
    public EventSeeder(EventRepository eventRepository, CourseRepository courseRepository, 
                      UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    public void seed() throws Exception {
        // Check if events already exist
        if (eventRepository.count() > 0) {
            log.info("Events already exist, skipping event seeding");
            return;
        }
        
        // Get the first test user
        User testUser = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("No users found. Please run UserSeeder first."));
        
        log.info("Seeding class schedule events for Spring 2026 semester...");
        
        // Get all enrolled courses
        List<Course> enrolledCourses = courseRepository.findByEnrolledTrue();
        
        if (enrolledCourses.isEmpty()) {
            log.warn("No enrolled courses found, skipping event seeding");
            return;
        }
        
        List<Event> events = new ArrayList<>();
        
        for (Course course : enrolledCourses) {
            String schedule = course.getSchedule();
            
            // Skip TBA or invalid schedules
            if (schedule == null || schedule.trim().isEmpty() || schedule.equalsIgnoreCase("TBA")) {
                log.info("Skipping course {} with TBA schedule", course.getCode());
                continue;
            }
            
            try {
                // Parse schedule and generate events
                events.addAll(generateClassEvents(testUser, course, schedule));
            } catch (Exception e) {
                log.warn("Failed to parse schedule '{}' for course {}: {}", 
                        schedule, course.getCode(), e.getMessage());
            }
        }
        
        // Save all events
        eventRepository.saveAll(events);
        
        log.info("Seeded {} class schedule events from {} enrolled courses", 
                events.size(), enrolledCourses.size());
    }
    
    @Override
    public int getOrder() {
        return 20; // Events should be created after courses and course info
    }
    
    @Override
    public boolean shouldSeed() {
        return eventRepository.count() == 0 && courseRepository.count() > 0 && userRepository.count() > 0;
    }
    
    /**
     * Generate recurring class events for a course based on its schedule.
     * @param user the user to assign events to
     * @param course the course
     * @param schedule the schedule string (e.g., "MWF 9:00-10:00")
     * @return list of generated events
     */
    private List<Event> generateClassEvents(User user, Course course, String schedule) {
        List<Event> events = new ArrayList<>();
        
        // Parse schedule: "MWF 9:00-10:00" or "TuTh 14:00-15:30"
        String[] parts = schedule.trim().split("\\s+");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid schedule format: " + schedule);
        }
        
        String daysStr = parts[0];
        String timeRange = parts[1];
        
        // Parse days
        List<DayOfWeek> classDays = parseDays(daysStr);
        
        // Parse time range
        String[] times = timeRange.split("-");
        if (times.length != 2) {
            throw new IllegalArgumentException("Invalid time range format: " + timeRange);
        }
        
        double startTime = parseTime(times[0]);
        double endTime = parseTime(times[1]);
        String timeDisplay = formatTime(startTime) + " - " + formatTime(endTime);
        
        // Generate recurring events for each class day throughout the semester
        LocalDate currentDate = SEMESTER_START;
        while (!currentDate.isAfter(SEMESTER_END)) {
            if (classDays.contains(currentDate.getDayOfWeek())) {
                Event event = new Event();
                event.setUser(user);
                event.setTitle(course.getName());
                event.setDate(currentDate);
                event.setTime(timeDisplay);
                event.setStartTime(startTime);
                event.setEndTime(endTime);
                event.setColor(course.getColor());
                event.setType("class");
                event.setDescription("Class session for " + course.getCode());
                event.setLocation("TBA");
                event.setTag("school");
                event.setCourseId(course.getId());
                event.setCompleted(false);
                event.setCreatedAt(LocalDateTime.now());
                event.setUpdatedAt(LocalDateTime.now());
                
                events.add(event);
            }
            currentDate = currentDate.plusDays(1);
        }
        
        return events;
    }
    
    /**
     * Parse day abbreviations like "MWF", "TuTh", "F" into DayOfWeek list.
     */
    private List<DayOfWeek> parseDays(String daysStr) {
        List<DayOfWeek> days = new ArrayList<>();
        int i = 0;
        while (i < daysStr.length()) {
            // Try two-character abbreviations first (Tu, Th)
            if (i + 1 < daysStr.length()) {
                String twoChar = daysStr.substring(i, i + 2);
                if (DAY_MAP.containsKey(twoChar)) {
                    days.add(DAY_MAP.get(twoChar));
                    i += 2;
                    continue;
                }
            }
            // Try one-character abbreviations (M, W, F)
            String oneChar = daysStr.substring(i, i + 1);
            if (DAY_MAP.containsKey(oneChar)) {
                days.add(DAY_MAP.get(oneChar));
                i++;
            } else {
                throw new IllegalArgumentException("Unknown day abbreviation: " + oneChar);
            }
        }
        return days;
    }
    
    /**
     * Parse time string like "9:00" or "14:30" into decimal hours (9.0, 14.5).
     */
    private double parseTime(String timeStr) {
        String[] parts = timeStr.split(":");
        int hours = Integer.parseInt(parts[0]);
        int minutes = parts.length > 1 ? Integer.parseInt(parts[1]) : 0;
        return hours + (minutes / 60.0);
    }
    
    /**
     * Format decimal time back to string (9.0 -> "9:00 AM", 14.5 -> "2:30 PM").
     */
    private String formatTime(double time) {
        int hours = (int) time;
        int minutes = (int) ((time - hours) * 60);
        String period = hours >= 12 ? "PM" : "AM";
        int displayHours = hours > 12 ? hours - 12 : (hours == 0 ? 12 : hours);
        return String.format("%d:%02d %s", displayHours, minutes, period);
    }
}
