/**
 * Layout configuration for the BS-CS interactive course map.
 * Defines the grid of 11 semester columns × 7 row tracks,
 * all course/requirement bubbles, and all prerequisite arrows.
 *
 * Semester columns: F1(1), Sp1(2), Su1(3), F2(4), Sp2(5), Su2(6), F3(7), Sp3(8), Su3(9), F4(10), Sp4(11)
 * Row tracks: CS Core A, CS Core B, CS Other, Math, Science, Language & SocSci, Writing & MDC
 */

import type { CourseBubble, Arrow, SemesterColumn } from '~/data/courseMapLayout';

// ── Semester columns (same as SE) ──

export const CS_SEMESTER_COLUMNS: SemesterColumn[] = [
  { sortOrder: 1,  label: 'Fall 1',   isSummer: false },
  { sortOrder: 2,  label: 'Spring 1', isSummer: false },
  { sortOrder: 3,  label: 'Summer 1', isSummer: true  },
  { sortOrder: 4,  label: 'Fall 2',   isSummer: false },
  { sortOrder: 5,  label: 'Spring 2', isSummer: false },
  { sortOrder: 6,  label: 'Summer 2', isSummer: true  },
  { sortOrder: 7,  label: 'Fall 3',   isSummer: false },
  { sortOrder: 8,  label: 'Spring 3', isSummer: false },
  { sortOrder: 9,  label: 'Summer 3', isSummer: true  },
  { sortOrder: 10, label: 'Fall 4',   isSummer: false },
  { sortOrder: 11, label: 'Spring 4', isSummer: false },
];

// ── Row track labels (same as SE) ──

export const CS_ROW_LABELS = [
  'CS Core A',
  'CS Core B',
  'CS Other',
  'Math',
  'Science',
  'Language & Social Science',
  'Writing & MDC',
];

// ── Course bubbles ──

export const CS_COURSE_BUBBLES: CourseBubble[] = [
  // ── Row 1: CS Core Track A ──
  { key: 'cs2010',       label: 'CS 2010',              row: 1, col: 1,  type: 'fixed', courseCode: 'CS 2010',  requirementGroup: 'CS Core Courses' },
  { key: 'cs2020',       label: 'CS 2020',              row: 1, col: 2,  type: 'fixed', courseCode: 'CS 2020',  requirementGroup: 'CS Core Courses' },
  { key: 'cs3350',       label: 'CS 3350',              row: 1, col: 4,  type: 'fixed', courseCode: 'CS 3350',  requirementGroup: 'CS Core Courses' },
  { key: 'cs3060',       label: 'CS 3060',              row: 1, col: 5,  type: 'fixed', courseCode: 'CS 3060',  requirementGroup: 'CS Core Courses' },
  { key: 'cs4120',       label: 'CS 4120',              row: 1, col: 7,  type: 'fixed', courseCode: 'CS 4120',  requirementGroup: 'CS Core Courses' },
  { key: 'cs4390',       label: 'CS 4390',              row: 1, col: 8,  type: 'fixed', courseCode: 'CS 4390',  requirementGroup: 'CS Core Courses' },
  { key: 'cs_4k_elect_1', label: 'CS 4000 Elective',    row: 1, col: 10, type: 'pool', requirementGroup: 'CS 4000-level Electives' },
  { key: 'cs4770',       label: 'CS 4770',              row: 1, col: 11, type: 'fixed', courseCode: 'CS 4770',  requirementGroup: 'CS Core Courses' },

  // ── Row 2: CS Core Track B ──
  { key: 'cs2900',       label: 'CS 2900',              row: 2, col: 1,  type: 'fixed', courseCode: 'CS 2900',  requirementGroup: 'CS Core Courses' },
  { key: 'cs2190',       label: 'CS 2190',              row: 2, col: 2,  type: 'fixed', courseCode: 'CS 2190',  requirementGroup: 'CS Core Courses' },
  { key: 'cs3080',       label: 'CS 3080',              row: 2, col: 4,  type: 'fixed', courseCode: 'CS 3080',  requirementGroup: 'CS Core Courses' },
  { key: 'se3540',       label: 'SE 3540',              row: 2, col: 5,  type: 'fixed', courseCode: 'SE 3540',  requirementGroup: 'CS Core Courses' },
  { key: 'cs_4k_elect_2', label: 'CS 4000 Elective',    row: 2, col: 8,  type: 'pool', requirementGroup: 'CS 4000-level Electives' },

  // ── Row 3: CS Other ──
  { key: 'cs3000',       label: 'CS 3000',              row: 3, col: 7,  type: 'fixed', courseCode: 'CS 3000',  requirementGroup: 'CS Core Courses' },
  { key: 'cs3900_su1',   label: 'CS 3900',              row: 3, col: 3,  type: 'fixed', courseCode: 'CS 3900',  requirementGroup: 'Internship' },
  { key: 'cs3900_su2',   label: 'CS 3900',              row: 3, col: 6,  type: 'fixed', courseCode: 'CS 3900',  requirementGroup: 'Internship' },
  { key: 'cs3900_su3',   label: 'CS 3900',              row: 3, col: 9,  type: 'fixed', courseCode: 'CS 3900',  requirementGroup: 'Internship' },
  { key: 'cs_3k_elect',  label: 'CS 3000 Elective',     row: 3, col: 10, type: 'pool', requirementGroup: 'CS 3000-level Elective' },
  { key: 'cs_4k_elect_3', label: 'CS 4000 Elective',    row: 3, col: 11, type: 'pool', requirementGroup: 'CS 4000-level Electives' },

  // ── Row 4: Math ──
  { key: 'math1280',     label: 'MATH 1280',            row: 4, col: 1,  type: 'fixed', courseCode: 'MATH 1280', requirementGroup: 'Quantitative Literacy' },
  { key: 'math2220',     label: 'MATH 2220',            row: 4, col: 2,  type: 'fixed', courseCode: 'MATH 2220', requirementGroup: 'Discrete Mathematics' },
  { key: 'math1340',     label: 'MATH 1340',            row: 4, col: 7,  type: 'fixed', courseCode: 'MATH 1340', requirementGroup: 'Calculus' },
  { key: 'math1350',     label: 'MATH 1350',            row: 4, col: 8,  type: 'fixed', courseCode: 'MATH 1350', requirementGroup: 'Calculus' },
  { key: 'math2470',     label: 'MATH 2470',            row: 4, col: 10, type: 'fixed', courseCode: 'MATH 2470', requirementGroup: 'Statistics' },
  { key: 'math_elect',   label: 'Math Elective',        row: 4, col: 11, type: 'pool', requirementGroup: 'Math Elective' },

  // ── Row 5: Science ──
  { key: 'nat_sci_1',    label: 'Nat Sci Lab 1',        row: 5, col: 4,  type: 'pool', requirementGroup: 'Lab Science Sequence' },
  { key: 'nat_sci_2',    label: 'Nat Sci Lab 2',        row: 5, col: 5,  type: 'pool', requirementGroup: 'Lab Science Sequence' },
  { key: 'mathsci_tot2', label: 'Math/Sci. Elective',   row: 5, col: 11, type: 'pool', requirementGroup: 'Additional Natural Science and Math' },

  // ── Row 6: Language & Social Science ──
  { key: 'lang_1010',    label: 'Lang 1010',            row: 6, col: 2,  type: 'pool', requirementGroup: 'World Languages and Cultures', courseCodeSuffix: '1010' },
  { key: 'lang_1020',    label: 'Lang 1020',            row: 6, col: 4,  type: 'pool', requirementGroup: 'World Languages and Cultures', courseCodeSuffix: '1020' },
  { key: 'lang_2010',    label: 'Lang 2010',            row: 6, col: 5,  type: 'pool', requirementGroup: 'World Languages and Cultures', courseCodeSuffix: '2010' },
  { key: 'lang_2020',    label: 'Lang 2020',            row: 6, col: 7,  type: 'pool', requirementGroup: 'World Languages and Cultures', courseCodeSuffix: '2020' },
  { key: 'socsci_1',     label: 'Soc/Beh Elective',     row: 6, col: 8,  type: 'pool', requirementGroup: 'Social and Behavioral Sciences' },
  { key: 'socsci_2',     label: 'Soc/Beh Elective',     row: 6, col: 10, type: 'pool', requirementGroup: 'Social and Behavioral Sciences' },

  // ── Row 7: Writing & MDC ──
  { key: 'writ1010',     label: 'WRIT 1110',            row: 7, col: 1,  type: 'fixed', courseCode: 'WRIT 1110', requirementGroup: 'English Composition and Oral Communication' },
  { key: 'writ1120',     label: 'WRIT 1120',            row: 7, col: 2,  type: 'fixed', courseCode: 'WRIT 1120', requirementGroup: 'Composition Requirement' },
  { key: 'mdc_1',        label: 'MDC Elective',         row: 7, col: 5,  type: 'pool', requirementGroup: 'Multidisciplinary Component (MDC)' },
  { key: 'mdc_2',        label: 'MDC Elective',         row: 7, col: 7,  type: 'pool', requirementGroup: 'Multidisciplinary Component (MDC)' },
  { key: 'mdc_4',        label: 'MDC Elective',         row: 7, col: 8,  type: 'pool', requirementGroup: 'Multidisciplinary Component (MDC)' },
  { key: 'mdc_3',        label: 'MDC Elective',         row: 7, col: 10, type: 'pool', requirementGroup: 'Multidisciplinary Component (MDC)' },
];

// ── Prerequisite / Corequisite arrows ──

export const CS_ARROWS: Arrow[] = [
  // Row 1 chains
  { from: 'cs2010',   to: 'cs2020',   type: 'prerequisite' },
  { from: 'cs2020',   to: 'cs3350',   type: 'prerequisite' , forceSimple: true, bendXOffset: 90 },
  { from: 'cs2020',   to: 'cs3060',   type: 'prerequisite' , routeBelow: true, bendXOffset:-5, railYOffset: 5, endXOffset: -3 },
  { from: 'cs3350',   to: 'cs4120',   type: 'prerequisite' , railYOffset: -19 },

  // CS 3350 → CS 4770 (long span — route below rows 1–2)
  { from: 'cs3350',   to: 'cs4770',   type: 'prerequisite', railYOffset: -10},

  // Row 1 → Row 2 cross-links
  { from: 'cs2010',   to: 'cs2190',   type: 'prerequisite', startYOffset: 6, bendXOffset: -10 },
  { from: 'cs2020',   to: 'se3540',   type: 'prerequisite', startYOffset: 6, bendXOffset: -5, routeBelow: true, railYOffset: -55, endXOffset: -3 },
  { from: 'cs3080',   to: 'cs4390',   type: 'prerequisite', routeBelow: true, railYOffset: 0 },
  // Listed last so it exits from the lowest position on cs2020
  { from: 'cs2020',   to: 'cs3080',   type: 'prerequisite', startYOffset: -6, bendXOffset: -15 },

  // Row 1/2 → Row 3
  { from: 'cs2010', to: 'cs3000', type: 'prerequisite', startYOffset: -6, routeBelow: true, railYOffset: -4, endXOffset: 12 },

  // Math → CS corequisite
  { from: 'math1280', to: 'cs2020',   type: 'corequisite' },

  // Row 4: Math chain
  { from: 'math1280', to: 'math2220', type: 'prerequisite' },
  { from: 'math1280', to: 'math1340', type: 'prerequisite', routeBelow: true, railYOffset: -5 },
  { from: 'math1340', to: 'math1350', type: 'prerequisite' },
  { from: 'math1350', to: 'math2470', type: 'prerequisite' },

  // Cross-row: math → CS
  // math2220→cs3350 bends just after MATH 2220, passes between Spring 1 and Summer 1 columns
  { from: 'math2220', to: 'cs3350',   type: 'prerequisite' , bendXOffset: -5, forceSimple: true},
  // math2220→cs4120 uses forceSimple L-bend; bendXOffset pushes the vertical line
  // to the gap between Summer 2 and Fall 3 so it doesn't pass through bubbles
  { from: 'math2220', to: 'cs4120',   type: 'prerequisite', forceSimple: true, bendXOffset: 350 },

  // Row 5: Science chain
  { from: 'nat_sci_1', to: 'nat_sci_2', type: 'prerequisite' },

  // Row 6: Language chain
  { from: 'lang_1010', to: 'lang_1020', type: 'prerequisite' },
  { from: 'lang_1020', to: 'lang_2010', type: 'prerequisite' },
  { from: 'lang_2010', to: 'lang_2020', type: 'prerequisite' },

  // Row 7: Writing chain
  { from: 'writ1010',  to: 'writ1120',  type: 'prerequisite' },
];
