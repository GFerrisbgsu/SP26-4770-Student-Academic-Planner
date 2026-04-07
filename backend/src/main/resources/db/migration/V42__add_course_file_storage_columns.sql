ALTER TABLE course_files
    ADD COLUMN storage_path TEXT,
    ADD COLUMN content_type VARCHAR(255);
