import { useEffect, useState } from 'react';
import type { Arrow, CourseBubble } from '~/data/courseMapLayout';
import type { UserCourseEnrollmentDTO } from '~/types/program';

interface PrerequisiteArrowsProps {
  arrows: Arrow[];
  bubbles: CourseBubble[];
  bubbleRefs: Map<string, HTMLElement | null>;
  enrollmentMap: Map<string, UserCourseEnrollmentDTO>;
  containerRef: HTMLElement | null;
}

interface ArrowPath {
  d: string;
  satisfied: boolean;
  type: 'prerequisite' | 'corequisite';
}

// Pre-compute grid lookups so we can detect intermediate bubbles
function buildBubbleLookups(bubbles: CourseBubble[]) {
  const byKey = new Map(bubbles.map(b => [b.key, b]));
  const cells = new Set(bubbles.map(b => `${b.row}-${b.col}`));
  return { byKey, cells };
}

/**
 * Check whether the natural path for an arrow would cross through
 * intermediate bubble cells.
 */
function hasIntermediateBubbles(
  fromKey: string, toKey: string,
  byKey: Map<string, CourseBubble>, cells: Set<string>,
): boolean {
  const from = byKey.get(fromKey);
  const to = byKey.get(toKey);
  if (!from || !to) return false;

  const minCol = Math.min(from.col, to.col);
  const maxCol = Math.max(from.col, to.col);
  if (maxCol - minCol <= 1) return false;

  if (from.row === to.row) {
    for (let c = minCol + 1; c < maxCol; c++) {
      if (cells.has(`${from.row}-${c}`)) return true;
    }
  } else {
    for (let c = minCol + 1; c < maxCol; c++) {
      if (cells.has(`${to.row}-${c}`)) return true;
    }
  }
  return false;
}

/**
 * Simple path: straight horizontal (same-row, no obstacles) or
 * L-shaped with a bend 20 px from the source (cross-row, no obstacles).
 */
function buildSimplePath(x1: number, y1: number, x2: number, y2: number, bendXOffset = 0, startStub = 20): string {
  if (Math.abs(y2 - y1) < 4) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  // Place the vertical bend so the final horizontal into the target is at least 30px
  const bendX = Math.min(x1 + startStub, x2 - 30) + bendXOffset;
  return `M ${x1} ${y1} L ${bendX} ${y1} L ${bendX} ${y2} L ${x2} ${y2}`;
}

/**
 * Route the arrow ABOVE the row to avoid crossing bubbles in between.
 * Goes: up from source → horizontal above → down to target.
 * Wider column spans route higher so overlapping arrows are staggered.
 */
function buildAbovePath(
  x1: number, y1: number,
  x2: number, y2: number,
  laneIndex: number,
  bendXOffset = 0,
  railYOffset = 0,
  endXOffset = 0,
  startStub = 10,
): string {
  const topY = Math.min(y1, y2);
  // Each lane is 14px apart, starting 16px above the topmost point
  const aboveY = topY - 16 - laneIndex * 14 + railYOffset;
  const startX = x1 + startStub + bendXOffset;
  const endX = x2 - 30 + endXOffset;
  return `M ${x1} ${y1} L ${startX} ${y1} L ${startX} ${aboveY} L ${endX} ${aboveY} L ${endX} ${y2} L ${x2} ${y2}`;
}

/**
 * Route the arrow BELOW the rows to avoid top-of-grid clutter.
 * Goes: down from source → horizontal below → up to target.
 */
function buildBelowPath(
  x1: number, y1: number,
  x2: number, y2: number,
  columnSpan: number,
  bendXOffset = 0,
  railYOffset = 0,
  endXOffset = 0,
  startStub = 10,
): string {
  const bottomY = Math.max(y1, y2);
  const belowY = bottomY + 12 + columnSpan * 4 + railYOffset;
  const startX = x1 + startStub + bendXOffset;
  const endX = x2 - 30 + endXOffset;
  return `M ${x1} ${y1} L ${startX} ${y1} L ${startX} ${belowY} L ${endX} ${belowY} L ${endX} ${y2} L ${x2} ${y2}`;
}

export function PrerequisiteArrows({ arrows, bubbles, bubbleRefs, enrollmentMap, containerRef }: PrerequisiteArrowsProps) {
  const [paths, setPaths] = useState<ArrowPath[]>([]);

  useEffect(() => {
    if (!containerRef) return;

    const { byKey, cells } = buildBubbleLookups(bubbles);

    /**
     * A "plain" arrow has no manual positioning properties at all.
     * Plain arrows use the original span-based height formula and skip
     * source/target staggering — preserving the original SE appearance.
     * As soon as any manual property is added to an arrow it becomes
     * "tweaked" and opts in to the lane-based system automatically.
     */
    function isPlain(arrow: Arrow): boolean {
      return (
        arrow.bendXOffset === undefined &&
        arrow.railYOffset === undefined &&
        arrow.endXOffset === undefined &&
        arrow.endYOffset === undefined &&
        arrow.startStub === undefined &&
        arrow.startYOffset === undefined &&
        !arrow.routeBelow &&
        !arrow.forceSimple
      );
    }

    // Build per-source cross-row arrow indices for staggering (tweaked arrows only)
    const crossRowBySource = new Map<string, Arrow[]>();
    // Build per-target arrow indices for converging stagger (tweaked arrows only)
    const convergingByTarget = new Map<string, Arrow[]>();
    for (const arrow of arrows) {
      if (isPlain(arrow)) continue;
      const from = byKey.get(arrow.from);
      const to = byKey.get(arrow.to);
      if (!from || !to) continue;

      if (from.row !== to.row && arrow.type !== 'corequisite') {
        const list = crossRowBySource.get(arrow.from) ?? [];
        list.push(arrow);
        crossRowBySource.set(arrow.from, list);
      }

      if (arrow.type !== 'corequisite') {
        const list = convergingByTarget.get(arrow.to) ?? [];
        list.push(arrow);
        convergingByTarget.set(arrow.to, list);
      }
    }

    // Assign lane indices only to tweaked above-routed arrows.
    // Plain arrows use span-based height, so they don't need a lane.
    const aboveArrowLanes = new Map<Arrow, number>();
    const aboveCandidates: { arrow: Arrow; span: number }[] = [];
    for (const arrow of arrows) {
      if (isPlain(arrow)) continue;
      if (arrow.type === 'corequisite' || arrow.routeBelow || arrow.forceSimple) continue;
      const from = byKey.get(arrow.from);
      const to = byKey.get(arrow.to);
      if (!from || !to) continue;
      if (hasIntermediateBubbles(arrow.from, arrow.to, byKey, cells)) {
        aboveCandidates.push({ arrow, span: Math.abs(to.col - from.col) });
      }
    }
    aboveCandidates.sort((a, b) => a.span - b.span);
    aboveCandidates.forEach(({ arrow }, i) => aboveArrowLanes.set(arrow, i));

    const calculate = () => {
      const containerRect = containerRef.getBoundingClientRect();
      const newPaths: ArrowPath[] = [];

      for (const arrow of arrows) {
        const fromEl = bubbleRefs.get(arrow.from);
        const toEl = bubbleRefs.get(arrow.to);
        if (!fromEl || !toEl) continue;

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const isCoreq = arrow.type === 'corequisite';
        const plain = isPlain(arrow);

        const x1 = fromRect.right - containerRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - containerRect.top + (arrow.startYOffset ?? 0);
        const x2 = toRect.left - containerRect.left;
        const y2 = isCoreq
          ? toRect.top + toRect.height * 0.7 - containerRect.top
          : toRect.top + toRect.height / 2 - containerRect.top;

        const fromEnrollment = enrollmentMap.get(arrow.from);
        const satisfied = fromEnrollment?.status === 'COMPLETED';

        // Staggering only applies to tweaked arrows
        let sourceYOffset = 0;
        let targetYOffset = 0;
        if (!plain) {
          const siblings = crossRowBySource.get(arrow.from);
          if (siblings && siblings.length > 1) {
            const idx = siblings.indexOf(arrow);
            if (idx >= 0) sourceYOffset = (idx - (siblings.length - 1) / 2) * 12;
          }
          const incoming = convergingByTarget.get(arrow.to);
          if (incoming && incoming.length > 1) {
            const idx = incoming.indexOf(arrow);
            if (idx >= 0) targetYOffset = (idx - (incoming.length - 1) / 2) * 10;
          }
        }

        let d: string;
        const bxo = arrow.bendXOffset ?? 0;
        const ryo = arrow.railYOffset ?? 0;
        const exo = arrow.endXOffset ?? 0;
        // endYOffset shifts the final arrowhead landing independently of auto-stagger
        const ey2 = y2 + targetYOffset + (arrow.endYOffset ?? 0);
        if (isCoreq) {
          const stub = arrow.startStub ?? 30;
          const bendX = x1 + stub + bxo;
          d = `M ${x1} ${y1} L ${bendX} ${y1} L ${bendX} ${ey2} L ${x2} ${ey2}`;
        } else if (arrow.routeBelow) {
          const from = byKey.get(arrow.from)!;
          const to = byKey.get(arrow.to)!;
          d = buildBelowPath(x1, y1 + sourceYOffset, x2, ey2, Math.abs(to.col - from.col), bxo, ryo, exo, arrow.startStub ?? 10);
        } else if (!arrow.forceSimple && hasIntermediateBubbles(arrow.from, arrow.to, byKey, cells)) {
          if (plain) {
            // Original span-based formula — no lane system, no stagger
            const fromB = byKey.get(arrow.from)!;
            const toB = byKey.get(arrow.to)!;
            const span = Math.abs(toB.col - fromB.col);
            const topY = Math.min(y1, ey2);
            const aboveY = topY - 12 - span * 6;
            d = `M ${x1} ${y1} L ${x1 + 10} ${y1} L ${x1 + 10} ${aboveY} L ${x2 - 30} ${aboveY} L ${x2 - 30} ${ey2} L ${x2} ${ey2}`;
          } else {
            const lane = aboveArrowLanes.get(arrow) ?? 0;
            d = buildAbovePath(x1, y1 + sourceYOffset, x2, ey2, lane, bxo, ryo, exo, arrow.startStub ?? 10);
          }
        } else {
          d = buildSimplePath(x1, y1 + sourceYOffset, x2, ey2, bxo, arrow.startStub ?? 20);
        }

        newPaths.push({ d, satisfied, type: arrow.type });
      }

      setPaths(newPaths);
    };

    calculate();

    const resizeObserver = new ResizeObserver(calculate);
    resizeObserver.observe(containerRef);

    return () => resizeObserver.disconnect();
  }, [arrows, bubbles, bubbleRefs, enrollmentMap, containerRef]);

  if (paths.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <defs>
        <marker
          id="arrowhead-green"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
        </marker>
        <marker
          id="arrowhead-gray"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
        </marker>
      </defs>
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke={p.satisfied ? '#22c55e' : '#9ca3af'}
          strokeWidth={2}
          strokeDasharray={p.type === 'corequisite' ? '6 4' : undefined}
          markerEnd={p.satisfied ? 'url(#arrowhead-green)' : 'url(#arrowhead-gray)'}
        />
      ))}
    </svg>
  );
}
