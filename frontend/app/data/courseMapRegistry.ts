/**
 * Maps program IDs to their course map layout configuration.
 * Used by CourseMapPage to dynamically render the correct grid
 * based on the user's selected program.
 */

import type { CourseBubble, Arrow, SemesterColumn } from '~/data/courseMapLayout';
import {
  SE_SEMESTER_COLUMNS,
  SE_ROW_LABELS,
  SE_COURSE_BUBBLES,
  SE_ARROWS,
} from '~/data/seMapLayout';
import {
  CS_SEMESTER_COLUMNS,
  CS_ROW_LABELS,
  CS_COURSE_BUBBLES,
  CS_ARROWS,
} from '~/data/csMapLayout';

export interface CourseMapLayout {
  columns: SemesterColumn[];
  rowLabels: string[];
  bubbles: CourseBubble[];
  arrows: Arrow[];
}

const LAYOUT_REGISTRY: Record<number, CourseMapLayout> = {
  1: {
    columns: SE_SEMESTER_COLUMNS,
    rowLabels: SE_ROW_LABELS,
    bubbles: SE_COURSE_BUBBLES,
    arrows: SE_ARROWS,
  },
  2: {
    columns: CS_SEMESTER_COLUMNS,
    rowLabels: CS_ROW_LABELS,
    bubbles: CS_COURSE_BUBBLES,
    arrows: CS_ARROWS,
  },
};

/** Default program ID (Software Engineering) */
export const DEFAULT_PROGRAM_ID = 1;

/**
 * Returns the layout config for a given program ID.
 * Falls back to SE layout if the program ID is unknown.
 */
export function getLayoutForProgram(programId: number): CourseMapLayout {
  return LAYOUT_REGISTRY[programId] ?? LAYOUT_REGISTRY[DEFAULT_PROGRAM_ID];
}
