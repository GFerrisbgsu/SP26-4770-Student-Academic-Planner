-- V20: Create program degree requirement tables
-- Models the full BGSU Software Engineering B.S. degree structure:
--   programs → requirement_categories → requirement_groups → requirement_options → requirement_courses
--
-- Supports complex catalog constraints:
--   ALL_REQUIRED, CHOOSE_N_COURSES, CHOOSE_MIN_CREDITS, CHOOSE_ONE_OPTION, CHOOSE_SEQUENCE

-- ============================================
-- 1. programs — Top-level degree program
-- ============================================
CREATE TABLE programs (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL UNIQUE,
    degree_type     VARCHAR(50)     NOT NULL,
    total_credits_required INT      NOT NULL DEFAULT 120,
    min_gpa         DECIMAL(3,2)    NOT NULL DEFAULT 2.00,
    catalog_year    VARCHAR(20),
    catalog_url     TEXT,
    description     TEXT,
    admission_requirements TEXT,
    graduation_notes TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. requirement_categories — Major sections of the degree
--    e.g. "BGP Requirements", "Major Requirements", "Additional Requirements"
-- ============================================
CREATE TABLE requirement_categories (
    id                      BIGSERIAL       PRIMARY KEY,
    program_id              BIGINT          NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name                    VARCHAR(255)    NOT NULL,
    description             TEXT,
    total_credits_required  INT,
    sort_order              INT             NOT NULL DEFAULT 0,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_req_categories_program ON requirement_categories(program_id);

-- ============================================
-- 3. requirement_groups — Individual requirement slots within a category
--    e.g. "SE Core Courses", "SE Electives", "Calculus", "World Languages"
-- ============================================
CREATE TABLE requirement_groups (
    id                      BIGSERIAL       PRIMARY KEY,
    category_id             BIGINT          NOT NULL REFERENCES requirement_categories(id) ON DELETE CASCADE,
    name                    VARCHAR(255)    NOT NULL,
    description             TEXT,
    selection_rule          VARCHAR(50)     NOT NULL DEFAULT 'ALL_REQUIRED',
    min_courses_required    INT,
    min_credits_required    INT,
    constraint_notes        TEXT,
    sort_order              INT             NOT NULL DEFAULT 0,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_req_groups_category ON requirement_groups(category_id);

-- ============================================
-- 4. requirement_options — One valid path to satisfy a group
--    Simple groups have 1 option; OR-groups have multiple options
--    e.g. Option A: MATH 1310  vs  Option B: MATH 1340 + MATH 1350
-- ============================================
CREATE TABLE requirement_options (
    id              BIGSERIAL       PRIMARY KEY,
    group_id        BIGINT          NOT NULL REFERENCES requirement_groups(id) ON DELETE CASCADE,
    name            VARCHAR(255),
    description     TEXT,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_req_options_group ON requirement_options(group_id);

-- ============================================
-- 5. requirement_courses — Links a specific course to an option
-- ============================================
CREATE TABLE requirement_courses (
    id              BIGSERIAL       PRIMARY KEY,
    option_id       BIGINT          NOT NULL REFERENCES requirement_options(id) ON DELETE CASCADE,
    course_id       VARCHAR(255)    NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    sort_order      INT             NOT NULL DEFAULT 0
);

CREATE INDEX idx_req_courses_option ON requirement_courses(option_id);
CREATE INDEX idx_req_courses_course ON requirement_courses(course_id);
