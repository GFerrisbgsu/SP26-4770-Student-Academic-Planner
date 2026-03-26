-- V28: Create assignments table for course-based assignment tracking
-- Supports: per-course assignments with status, due dates, points, and descriptions

CREATE TABLE assignments (
    id                BIGSERIAL       PRIMARY KEY,
    course_id         VARCHAR(255)    NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title             VARCHAR(255)    NOT NULL,
    description       TEXT,
    status            VARCHAR(20)     NOT NULL DEFAULT 'TODO',  -- TODO, IN_PROGRESS, COMPLETED
    due_date          TIMESTAMP       NOT NULL,
    points            INT,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by course
CREATE INDEX idx_assignments_course_id ON assignments(course_id);

-- Index for filtering by status
CREATE INDEX idx_assignments_status ON assignments(status);

-- Index for sorting by due date
CREATE INDEX idx_assignments_due_date ON assignments(due_date);
