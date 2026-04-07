-- Add program_id to user_semesters so each user's semester progress is tied to a program.
-- Existing rows default to program 1 (Software Engineering, B.S.).

ALTER TABLE user_semesters
    ADD COLUMN program_id BIGINT;

-- Default existing rows to the SE program (id = 1).
-- The ProgramSeeder always creates SE first, so id = 1 is safe.
UPDATE user_semesters SET program_id = 1 WHERE program_id IS NULL;

ALTER TABLE user_semesters
    ALTER COLUMN program_id SET NOT NULL;

ALTER TABLE user_semesters
    ADD CONSTRAINT fk_user_semesters_program
    FOREIGN KEY (program_id) REFERENCES programs(id);
