package com.sap.smart_academic_calendar.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sap.smart_academic_calendar.dto.CourseDTO;
import com.sap.smart_academic_calendar.dto.CreateCourseRequest;
import com.sap.smart_academic_calendar.dto.DegreeProgressDTO;
import com.sap.smart_academic_calendar.dto.RequirementCategoryDTO;
import com.sap.smart_academic_calendar.dto.RequirementCourseDTO;
import com.sap.smart_academic_calendar.model.CourseInfo;
import com.sap.smart_academic_calendar.model.Course;
import com.sap.smart_academic_calendar.repository.CourseRepository;
import com.sap.smart_academic_calendar.repository.CourseInfoRepository;

/**
 * Service class for Course operations.
 * Contains business logic for course management.
 */
@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseInfoRepository courseInfoRepository;

    public CourseService(CourseRepository courseRepository, CourseInfoRepository courseInfoRepository) {
        this.courseRepository = courseRepository;
        this.courseInfoRepository = courseInfoRepository;
    }

    /**
     * Get all courses.
     * @return list of all courses
     */
    public List<CourseDTO> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return courses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific course by ID.
     * @param id the course ID
     * @return the course as CourseDTO
     */
    public CourseDTO getCourseById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        return convertToDTO(course);
    }

    /**
     * Get all enrolled courses.
     * @return list of enrolled courses
     */
    public List<CourseDTO> getEnrolledCourses() {
        List<Course> courses = courseRepository.findByEnrolledTrue();
        return courses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get courses by subject.
     * @param subject the subject area
     * @return list of courses in that subject
     */
    public List<CourseDTO> getCoursesBySubject(String subject) {
        List<Course> courses = courseRepository.findBySubject(subject);
        return courses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new course.
     * @param request the create course request
     * @return the created course as CourseDTO
     */
    @Transactional
    public CourseDTO createCourse(CreateCourseRequest request) {
        // Validate that course code doesn't already exist
        if (courseRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Course with code " + request.getCode() + " already exists");
        }

        Course course = new Course();
        course.setId(request.getId());
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setSubject(request.getSubject());
        course.setNumber(request.getNumber());
        course.setColor(request.getColor());
        course.setInstructor(request.getInstructor());
        course.setSchedule(request.getSchedule());
        course.setCredits(request.getCredits());
        course.setEnrolled(request.getEnrolled() != null ? request.getEnrolled() : false);
        course.setSemesters(request.getSemesters());
        course.setHistory(request.getHistory());
        course.setDescription(request.getDescription());

        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }

    /**
     * Update an existing course.
     * @param id the course ID
     * @param request the update request
     * @return the updated course as CourseDTO
     */
    @Transactional
    public CourseDTO updateCourse(String id, CreateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setSubject(request.getSubject());
        course.setNumber(request.getNumber());
        course.setColor(request.getColor());
        course.setInstructor(request.getInstructor());
        course.setSchedule(request.getSchedule());
        course.setCredits(request.getCredits());
        course.setEnrolled(request.getEnrolled());
        course.setSemesters(request.getSemesters());
        course.setHistory(request.getHistory());
        course.setDescription(request.getDescription());
        course.setPrerequisiteText(request.getPrerequisiteText());

        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    /**
     * Enroll in a course by setting enrolled=true.
     * Optionally updates the schedule if provided.
     * @param id the course ID
     * @param schedule optional new schedule string (e.g., "MWF 10:00-11:00")
     * @return the updated course as CourseDTO
     * @deprecated Use EnrollmentService.enrollCourse() for per-user enrollment.
     */
    @Deprecated
    @Transactional
    public CourseDTO enrollCourse(String id, String schedule) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        course.setEnrolled(true);
        if (schedule != null && !schedule.isBlank()) {
            course.setSchedule(schedule);
        }
        Course saved = courseRepository.save(course);
        return convertToDTO(saved);
    }

    /**
     * Unenroll from a course by setting enrolled=false.
     * @param id the course ID
     * @return the updated course as CourseDTO
     * @deprecated Use EnrollmentService.unenrollCourse() for per-user enrollment.
     */
    @Deprecated
    @Transactional
    public CourseDTO unenrollCourse(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        course.setEnrolled(false);
        Course saved = courseRepository.save(course);
        return convertToDTO(saved);
    }

    /**
     * Update the schedule for a course.
     * @param id the course ID
     * @param schedule the new schedule string
     * @return the updated course as CourseDTO
     */
    @Transactional
    public CourseDTO updateSchedule(String id, String schedule) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        course.setSchedule(schedule);
        Course saved = courseRepository.save(course);
        return convertToDTO(saved);
    }

    /**
     * Delete a course.
     * @param id the course ID
     */
    @Transactional
    public void deleteCourse(String id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    /**
     * Convert a Course entity to CourseDTO.
     * @param course the course entity
     * @return the course DTO
     */
    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setName(course.getName());
        dto.setCode(course.getCode());
        dto.setSubject(course.getSubject());
        dto.setNumber(course.getNumber());
        dto.setColor(course.getColor());
        dto.setInstructor(course.getInstructor());
        dto.setSchedule(course.getSchedule());
        dto.setCredits(course.getCredits());
        dto.setEnrolled(course.getEnrolled());
        dto.setSemesters(course.getSemesters());
        dto.setHistory(course.getHistory());
        dto.setDescription(course.getDescription());
        dto.setPrerequisiteText(course.getPrerequisiteText());
        return dto;
    }

    public DegreeProgressDTO getDegreeProgress() {
    List<Course> allCourses = courseRepository.findAll();

    int creditsInProgress = allCourses.stream()
        .filter(c -> Boolean.TRUE.equals(c.getEnrolled()))
        .mapToInt(c -> c.getCredits() != null ? c.getCredits() : 0)
        .sum();

    int creditsCompleted = allCourses.stream()
        .filter(c -> c.getHistory() != null && !c.getHistory().isEmpty())
        .mapToInt(c -> c.getCredits() != null ? c.getCredits() : 0)
        .sum();

    DegreeProgressDTO dto = new DegreeProgressDTO();
    dto.setProgram("Bachelor of Science in Computer Science");
    dto.setExpectedGraduation("May 2028");
    dto.setTotalCreditsRequired(122);
    dto.setCreditsCompleted(creditsCompleted);
    dto.setCreditsInProgress(creditsInProgress);
    return dto;
    }

    public List<RequirementCategoryDTO> getRequirementCategories() {
        Map<String, Course> courseMap = courseRepository.findAll().stream()
            .collect(Collectors.toMap(Course::getId, c -> c));

        Map<String, List<CourseInfo>> grouped = courseInfoRepository.findAll().stream()
            .collect(Collectors.groupingBy(CourseInfo::getCourseType));

        return grouped.entrySet().stream().map(entry -> {
            List<RequirementCourseDTO> courses = entry.getValue().stream()
                .map(info -> courseMap.get(info.getCourseId()))
                .filter(course -> course != null)
                .map(course -> {
                    String status;
                    if (Boolean.TRUE.equals(course.getEnrolled())) {
                        status = "inProgress";
                    } else if (course.getHistory() != null && !course.getHistory().isEmpty()) {
                        status = "completed";
                    } else {
                        status = "notStarted";
                    }

                    RequirementCourseDTO dto = new RequirementCourseDTO();
                    dto.setCourseId(course.getId());
                    dto.setCourseCode(course.getCode());
                    dto.setCourseName(course.getName());
                    dto.setCredits(course.getCredits() != null ? course.getCredits() : 0);
                    dto.setStatus(status);
                    return dto;
                })
                .collect(Collectors.toList());

            int completed = courses.stream().filter(c -> "completed".equals(c.getStatus()))
                .mapToInt(RequirementCourseDTO::getCredits).sum();
            int inProgress = courses.stream().filter(c -> "inProgress".equals(c.getStatus()))
                .mapToInt(RequirementCourseDTO::getCredits).sum();

            RequirementCategoryDTO cat = new RequirementCategoryDTO();
            cat.setName(entry.getKey());
            cat.setTotalCreditsRequired(courses.stream().mapToInt(RequirementCourseDTO::getCredits).sum());
            cat.setCompleted(completed);
            cat.setInProgress(inProgress);
            cat.setCourses(courses);
            return cat;
        }).collect(Collectors.toList());
    }
}
