-- V22: Create semester and enrollment tables for per-user course tracking
-- Supports: per-user enrollment, semester assignment, dual-counting via fulfillments

-- ============================================
-- 1. semesters — Discrete academic semesters
-- ============================================
CREATE TABLE semesters (
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(50)  NOT NULL UNIQUE,
    term         VARCHAR(20)  NOT NULL,    -- FALL, SPRING, SUMMER
    year_number  INT          NOT NULL,    -- 1..4
    sort_order   INT          NOT NULL UNIQUE,
    max_credits  INT          NOT NULL DEFAULT 18
);

INSERT INTO semesters (name, term, year_number, sort_order, max_credits) VALUES
    ('Fall 1',   'FALL',   1,  1, 18),
    ('Spring 1', 'SPRING', 1,  2, 18),
    ('Summer 1', 'SUMMER', 1,  3, 12),
    ('Fall 2',   'FALL',   2,  4, 18),
    ('Spring 2', 'SPRING', 2,  5, 18),
    ('Summer 2', 'SUMMER', 2,  6, 12),
    ('Fall 3',   'FALL',   3,  7, 18),
    ('Spring 3', 'SPRING', 3,  8, 18),
    ('Summer 3', 'SUMMER', 3,  9, 12),
    ('Fall 4',   'FALL',   4, 10, 18),
    ('Spring 4', 'SPRING', 4, 11, 18);

-- ============================================
-- 2. user_semesters — Tracks each user's current semester
-- ============================================
CREATE TABLE user_semesters (
    id                    BIGSERIAL   PRIMARY KEY,
    user_id               BIGINT      NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_semester_id   BIGINT      NOT NULL REFERENCES semesters(id),
    created_at            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_semesters_user ON user_semesters(user_id);

-- ============================================
-- 3. user_course_enrollments — Per-user, per-semester course enrollment
-- ============================================
CREATE TABLE user_course_enrollments (
    id            BIGSERIAL     PRIMARY KEY,
    user_id       BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id     VARCHAR(255)  NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    semester_id   BIGINT        NOT NULL REFERENCES semesters(id),
    status        VARCHAR(20)   NOT NULL DEFAULT 'ENROLLED',  -- ENROLLED or COMPLETED
    grade         VARCHAR(10),
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON user_course_enrollments(user_id);
CREATE INDEX idx_enrollments_semester ON user_course_enrollments(user_id, semester_id);

-- ============================================
-- 4. user_requirement_fulfillments — Links an enrollment to one or more requirement groups
--    Supports dual-counting: one enrollment can fulfill multiple groups
-- ============================================
CREATE TABLE user_requirement_fulfillments (
    id                    BIGSERIAL   PRIMARY KEY,
    enrollment_id         BIGINT      NOT NULL REFERENCES user_course_enrollments(id) ON DELETE CASCADE,
    requirement_group_id  BIGINT      NOT NULL REFERENCES requirement_groups(id) ON DELETE CASCADE,
    slot_index            INT         NOT NULL DEFAULT 0,
    CONSTRAINT uq_enrollment_group UNIQUE (enrollment_id, requirement_group_id)
);

CREATE INDEX idx_fulfillments_enrollment ON user_requirement_fulfillments(enrollment_id);
CREATE INDEX idx_fulfillments_group ON user_requirement_fulfillments(requirement_group_id);
