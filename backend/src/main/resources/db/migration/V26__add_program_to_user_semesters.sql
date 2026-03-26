-- Add program_id to user_semesters so each user's semester progress is tied to a program.
-- Existing rows default to program 1 (Software Engineering, B.S.).
-- Uses IF NOT EXISTS / DO blocks for idempotency (safe to re-run if column already exists).

ALTER TABLE user_semesters
    ADD COLUMN IF NOT EXISTS program_id BIGINT;

-- Default existing rows to the SE program (id = 1).
-- The ProgramSeeder always creates SE first, so id = 1 is safe.
UPDATE user_semesters SET program_id = 1 WHERE program_id IS NULL;

DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_semesters' AND column_name = 'program_id' AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE user_semesters ALTER COLUMN program_id SET NOT NULL;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_semesters_program') THEN
        ALTER TABLE user_semesters
            ADD CONSTRAINT fk_user_semesters_program
            FOREIGN KEY (program_id) REFERENCES programs(id);
    END IF;
END $$;
