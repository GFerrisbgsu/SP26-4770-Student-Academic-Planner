-- V29: Create course notes and course files tables
-- Supports: per-course notes and files persistence for course page tabs

CREATE TABLE course_notes (
    id                BIGSERIAL       PRIMARY KEY,
    course_id         VARCHAR(255)    NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title             VARCHAR(255)    NOT NULL,
    content           TEXT            NOT NULL,
    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_course_notes_course_id ON course_notes(course_id);
CREATE INDEX idx_course_notes_updated_at ON course_notes(updated_at);

CREATE TABLE course_files (
    id                BIGSERIAL       PRIMARY KEY,
    course_id         VARCHAR(255)    NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name              VARCHAR(255)    NOT NULL,
    file_type         VARCHAR(50)     NOT NULL,   -- pdf, image, document, link, folder
    category          VARCHAR(50)     NOT NULL,   -- syllabus, lecture, assignment, resource, other
    file_size         VARCHAR(50),
    file_url          TEXT,
    uploaded_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_course_files_course_id ON course_files(course_id);
CREATE INDEX idx_course_files_category ON course_files(category);
CREATE INDEX idx_course_files_uploaded_at ON course_files(uploaded_at);
