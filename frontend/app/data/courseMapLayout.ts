/**
 * Shared type definitions for course map layouts.
 * Program-specific data (bubbles, arrows, columns) lives in the
 * respective layout files: seMapLayout.ts, csMapLayout.ts
 */

// ── Types ──

export type BubbleType = 'fixed' | 'pool';

export interface CourseBubble {
  /** Unique key for React rendering */
  key: string;
  /** Display label on the bubble */
  label: string;
  /** Row track (1-7) */
  row: number;
  /** Semester column sort_order (1-11) */
  col: number;
  /** 'fixed' = specific course, 'pool' = choose from eligible courses */
  type: BubbleType;
  /**
   * For fixed: the course ID/code to match (e.g. "CS 2010").
   * For pool: the name of the requirement group this bubble represents.
   */
  courseCode?: string;
  /** Requirement group name this bubble is associated with */
  requirementGroup?: string;
  /** For pool bubbles with sequence groups: filter courses to those ending with this suffix (e.g. '1010') */
  courseCodeSuffix?: string;
}

export interface Arrow {
  from: string; // bubble key
  to: string;   // bubble key
  type: 'prerequisite' | 'corequisite';
  /** Route below the grid rows instead of above (avoids top-line clutter) */
  routeBelow?: boolean;
  /** Force a simple L-bend even when intermediate bubbles exist (line passes behind them) */
  forceSimple?: boolean;
  /**
   * Manual pixel offset for the vertical bend point.
   * - On simple/forceSimple paths: shifts the bend left (negative) or right (positive) from default.
   * - On above paths: shifts the exit stub. On below paths: shifts the exit stub.
   * Use this to nudge individual arrows away from bubbles they pass through.
   */
  bendXOffset?: number;
  /**
   * Manual pixel offset applied to the horizontal rail of above/below paths.
   * Positive = further from the row, negative = closer. Use to fine-tune
   * vertical clearance on a per-arrow basis.
   */
  railYOffset?: number;
  /**
   * Manual pixel offset for the 2nd vertical line (descent into the target).
   * Default position is 30px left of the target bubble.
   * Negative = further left, positive = closer to the target.
   */
  endXOffset?: number;
  /**
   * Length of the initial horizontal stub exiting the source bubble before the
   * first vertical bend. Defaults: 10px (above/below paths), 20px (simple paths),
   * 30px (corequisites). Increase to push the first bend further from the bubble.
   */
  startStub?: number;
  /**
   * Vertical offset for the point where the arrow exits the source bubble.
   * Negative = higher on the bubble, positive = lower. Applied on top of the
   * automatic sibling stagger. Default is 0 (bubble vertical centre).
   */
  startYOffset?: number;
  /**
   * Vertical offset for the final arrowhead landing point on the target bubble.
   * Negative = higher, positive = lower. Use to separate overlapping arrowheads
   * when several prerequisites arrive at the same target. Default is 0.
   */
  endYOffset?: number;
}

// ── Semester column type ──

export interface SemesterColumn {
  sortOrder: number;
  label: string;
  isSummer: boolean;
}

// ── (Program-specific data lives in seMapLayout.ts and csMapLayout.ts) ──

