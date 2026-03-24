-- ==================================================
-- V9: Create Course Tables
-- ==================================================
-- Creates tables for courses and course information,
-- including prerequisites and metadata.
-- Author: System
-- Date: 2026-02-22

-- Create courses table
CREATE TABLE courses (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    subject VARCHAR(100),
    number VARCHAR(50),
    color VARCHAR(50) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    schedule VARCHAR(255) NOT NULL,
    credits INTEGER,
    enrolled BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT
);

-- Create course_semesters table (for @ElementCollection semesters in Course.java)
CREATE TABLE course_semesters (
    course_id VARCHAR(255) NOT NULL,
    semester VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create course_history table (for @ElementCollection history in Course.java)
CREATE TABLE course_history (
    course_id VARCHAR(255) NOT NULL,
    history_entry VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create course_info table
CREATE TABLE course_info (
    course_id VARCHAR(255) PRIMARY KEY,
    program VARCHAR(255) NOT NULL,
    course_type VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create course_prerequisites table (for @ElementCollection prerequisites in CourseInfo.java)
CREATE TABLE course_prerequisites (
    course_id VARCHAR(255) NOT NULL,
    prerequisite VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course_info(course_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_subject ON courses(subject);
CREATE INDEX idx_courses_enrolled ON courses(enrolled);
CREATE INDEX idx_course_info_course_id ON course_info(course_id);

-- Add comments to tables for documentation
COMMENT ON TABLE courses IS 'Stores course information including schedule, instructor, and enrollment status';
COMMENT ON TABLE course_semesters IS 'Stores the semesters when a course is offered';
COMMENT ON TABLE course_history IS 'Stores historical information about courses';
COMMENT ON TABLE course_info IS 'Stores metadata about courses including prerequisites and program information';
COMMENT ON TABLE course_prerequisites IS 'Stores prerequisite courses for each course';

-- Add column comments for important fields
COMMENT ON COLUMN courses.enrolled IS 'Whether the user is currently enrolled in this course';
COMMENT ON COLUMN courses.schedule IS 'Schedule format: "MWF 10:00-11:00" or "TuTh 14:00-15:30"';
COMMENT ON COLUMN courses.code IS 'Unique course code (e.g., "CS 2010")';
COMMENT ON COLUMN course_info.course_type IS 'Course classification (e.g., "Core Requirement", "Elective")';
