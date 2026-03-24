-- V21: Add exclusive flag to requirement_groups
-- Used to enforce MDC exclusivity: courses fulfilling an exclusive group
-- cannot be used to fulfill any other requirement group.
ALTER TABLE requirement_groups ADD COLUMN exclusive BOOLEAN NOT NULL DEFAULT false;

UPDATE requirement_groups SET exclusive = true WHERE name = 'Multidisciplinary Component (MDC)';
