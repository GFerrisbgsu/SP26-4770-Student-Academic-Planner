/**
 * Static visual preview of the SE degree map — no backend required.
 * Access at http://localhost:5173/se-map-preview while running `npm run dev`.
 * All bubbles render as "not started". Useful for tweaking arrow positions.
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { SE_COURSE_BUBBLES, SE_ARROWS, SE_SEMESTER_COLUMNS, SE_ROW_LABELS } from '~/data/seMapLayout';
import type { CourseBubble as BubbleData } from '~/data/courseMapLayout';
import { CourseBubble } from '~/components/coursemap/CourseBubble';
import { PrerequisiteArrows } from '~/components/coursemap/PrerequisiteArrows';

export default function SeMapPreview() {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const bubbleRefsMap = useRef(new Map<string, HTMLElement | null>());

  const setBubbleRef = useCallback((key: string, el: HTMLElement | null) => {
    bubbleRefsMap.current.set(key, el);
  }, []);

  // Empty enrollment map — everything shows as "not started"
  const emptyEnrollmentMap = useMemo(() => new Map(), []);

  const gridRows = SE_ROW_LABELS.map((label, rowIdx) => {
    const row = rowIdx + 1;
    const cells = SE_SEMESTER_COLUMNS.map((col) => {
      const bubble = SE_COURSE_BUBBLES.find((b) => b.row === row && b.col === col.sortOrder);
      return { col, bubble };
    });
    return { label, row, cells };
  });

  const noop = useCallback((_bubble: BubbleData) => {}, []);

  return (
    <div className="p-4 space-y-4 overflow-x-auto bg-white min-h-screen">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">SE Degree Map — Preview</h1>
        <span className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 rounded px-2 py-0.5 font-medium">
          Static preview · no backend required
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        Edit <code className="bg-gray-100 px-1 rounded">app/data/seMapLayout.ts</code> and save to see changes instantly.
      </p>

      {/* Column headers */}
      <div className="flex items-end gap-0 pl-25">
        {SE_SEMESTER_COLUMNS.map((col) => (
          <div
            key={col.sortOrder}
            className={`
              text-center shrink-0 pb-1
              ${col.isSummer ? 'w-20' : 'w-[140px]'}
            `}
          >
            <p className="text-sm font-semibold text-green-600">{col.label}</p>
          </div>
        ))}
      </div>

      {/* Grid with arrows */}
      <div className="relative pt-10" ref={setContainerEl}>
        <PrerequisiteArrows
          arrows={SE_ARROWS}
          bubbles={SE_COURSE_BUBBLES}
          bubbleRefs={bubbleRefsMap.current}
          enrollmentMap={emptyEnrollmentMap}
          containerRef={containerEl}
        />

        <div className="relative z-10 space-y-2">
          {gridRows.map(({ label, row, cells }) => (
            <div key={row} className="flex items-center gap-0">
              <div className="w-25 shrink-0 text-xs font-medium text-muted-foreground pr-2 text-right">
                {label}
              </div>
              {cells.map(({ col, bubble }) => (
                <div
                  key={`${row}-${col.sortOrder}`}
                  className={`
                    flex items-center justify-center
                    ${col.isSummer ? 'w-20' : 'w-[140px]'}
                    shrink-0 px-1 h-13
                  `}
                >
                  {bubble && (
                    <div ref={(el) => setBubbleRef(bubble.key, el)}>
                      <CourseBubble
                        bubble={bubble}
                        enrollment={undefined}
                        isCurrentSemester={false}
                        onClick={noop}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-2">
          <svg width="30" height="10"><line x1="0" y1="5" x2="30" y2="5" stroke="#9ca3af" strokeWidth="2" markerEnd="url(#ah-g)" /></svg>
          Prerequisite Pending
        </div>
        <div className="flex items-center gap-2">
          <svg width="30" height="10"><line x1="0" y1="5" x2="30" y2="5" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 4" /></svg>
          Corequisite
        </div>
      </div>
    </div>
  );
}
