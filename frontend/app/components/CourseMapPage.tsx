import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { programService } from '~/services/programService';
import { semesterService } from '~/services/semesterService';
import { enrollmentService } from '~/services/enrollmentService';
import type {
  ProgramDTO,
  SemesterDTO,
  UserSemesterDTO,
  UserCourseEnrollmentDTO,
  RequirementGroupDTO,
} from '~/types/program';
import { getLayoutForProgram, DEFAULT_PROGRAM_ID } from '~/data/courseMapRegistry';
import type { CourseBubble as BubbleData } from '~/data/courseMapLayout';
import { CourseBubble } from '~/components/coursemap/CourseBubble';
import { PrerequisiteArrows } from '~/components/coursemap/PrerequisiteArrows';
import { RequirementSheet } from '~/components/coursemap/RequirementSheet';
import { SemesterHeader } from '~/components/coursemap/SemesterHeader';
import { SemesterConfirmDialog } from '~/components/coursemap/SemesterConfirmDialog';
import { ProgramSwitchDialog } from '~/components/coursemap/ProgramSwitchDialog';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CourseMapPage() {
  const [program, setProgram] = useState<ProgramDTO | null>(null);
  const [allPrograms, setAllPrograms] = useState<ProgramDTO[]>([]);
  const [activeProgramId, setActiveProgramId] = useState<number>(DEFAULT_PROGRAM_ID);
  const [semesters, setSemesters] = useState<SemesterDTO[]>([]);
  const [userSemester, setUserSemester] = useState<UserSemesterDTO | undefined>();
  const [enrollments, setEnrollments] = useState<UserCourseEnrollmentDTO[]>([]);
  const [semesterCredits, setSemesterCredits] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState<BubbleData | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'advance' | 'rollback'>('advance');
  const [affectedEnrollments, setAffectedEnrollments] = useState<UserCourseEnrollmentDTO[]>([]);
  const [rollbackTarget, setRollbackTarget] = useState<SemesterDTO | undefined>();

  // Program switch dialog state
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [switchTargetProgram, setSwitchTargetProgram] = useState<ProgramDTO | null>(null);

  // Container element stored in state so its first assignment triggers a
  // re-render, allowing PrerequisiteArrows to calculate on initial mount.
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const bubbleRefsMap = useRef(new Map<string, HTMLElement | null>());

  // Dynamic layout based on active program
  const layout = useMemo(() => getLayoutForProgram(activeProgramId), [activeProgramId]);

  // ── Data fetching ──

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [allProgramsData, semesterData, userSem, enrollmentData] = await Promise.all([
        programService.getAllPrograms(),
        semesterService.getAllSemesters(),
        semesterService.getCurrentSemester(),
        enrollmentService.getAllEnrollments(),
      ]);

      setAllPrograms(allProgramsData);

      // Determine the active program from the user's semester record
      const currentProgramId = userSem.programId ?? DEFAULT_PROGRAM_ID;
      setActiveProgramId(currentProgramId);

      // Fetch the full program (with categories) for the active program
      const programData = await programService.getProgram(currentProgramId);
      setProgram(programData);
      setSemesters(semesterData);
      setUserSemester(userSem);
      setEnrollments(enrollmentData);

      // Build semester credit totals
      const creditMap = new Map<number, number>();
      for (const e of enrollmentData) {
        const prev = creditMap.get(e.semesterId) ?? 0;
        creditMap.set(e.semesterId, prev + (e.credits ?? 0));
      }
      setSemesterCredits(creditMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Enrollment map: bubble key → enrollment ──

  const enrollmentMap = useMemo(() => {
    const map = new Map<string, UserCourseEnrollmentDTO>();
    // Track which enrollments have been mapped (for pool deduplication)
    const usedEnrollmentIds = new Set<number>();

    // Build semesterId → sortOrder lookup for semester-aware matching
    const semesterSortOrder = new Map<number, number>();
    for (const s of semesters) {
      semesterSortOrder.set(s.id, s.sortOrder);
    }

    for (const bubble of layout.bubbles) {
      if (bubble.type === 'fixed' && bubble.courseCode) {
        const enrollment = enrollments.find(
          (e) => e.courseCode === bubble.courseCode && !usedEnrollmentIds.has(e.id)
        );
        if (enrollment) {
          // For duplicate fixed bubbles (e.g. CS 3900 in multiple summers),
          // only map to the bubble whose column matches the enrollment semester
          const enrollSortOrder = semesterSortOrder.get(enrollment.semesterId) ?? 0;
          if (enrollSortOrder === bubble.col) {
            map.set(bubble.key, enrollment);
            usedEnrollmentIds.add(enrollment.id);
          }
        }
      }
    }

    // Second pass for fixed bubbles: map any remaining unmatched enrollments
    // to the first available bubble (fallback for when semester doesn't match any column)
    for (const bubble of layout.bubbles) {
      if (bubble.type === 'fixed' && bubble.courseCode && !map.has(bubble.key)) {
        const enrollment = enrollments.find(
          (e) => e.courseCode === bubble.courseCode && !usedEnrollmentIds.has(e.id)
        );
        if (enrollment) {
          map.set(bubble.key, enrollment);
          usedEnrollmentIds.add(enrollment.id);
        }
      }
    }

    // Pool bubbles: for each enrollment assign it to the closest available pool bubble
    // (iterating enrollments → bubbles avoids greedy mis-assignment when bubbles are
    // processed in layout order rather than semester order).
    const poolBubblesByGroup = new Map<string, typeof layout.bubbles[number][]>();
    for (const bubble of layout.bubbles) {
      if (bubble.type === 'pool' && bubble.requirementGroup) {
        const list = poolBubblesByGroup.get(bubble.requirementGroup) ?? [];
        list.push(bubble);
        poolBubblesByGroup.set(bubble.requirementGroup, list);
      }
    }

    for (const enrollment of enrollments) {
      if (usedEnrollmentIds.has(enrollment.id)) continue;
      const enrollSortOrder = semesterSortOrder.get(enrollment.semesterId) ?? 0;
      for (const fulfillment of enrollment.fulfillments) {
        const poolBubbles = poolBubblesByGroup.get(fulfillment.requirementGroupName);
        if (!poolBubbles) continue;
        // Find the closest unoccupied bubble in this group
        const available = poolBubbles.filter(
          (b) =>
            !map.has(b.key) &&
            (!b.courseCodeSuffix ||
              enrollment.courseCode.replace(/\s+/g, '').endsWith(b.courseCodeSuffix))
        );
        available.sort(
          (a, b) => Math.abs(a.col - enrollSortOrder) - Math.abs(b.col - enrollSortOrder)
        );
        if (available.length > 0) {
          map.set(available[0].key, enrollment);
          usedEnrollmentIds.add(enrollment.id);
          break; // enrollment assigned — move on
        }
      }
    }

    // Fallback pass: enrollments that have no fulfillments (e.g. fulfillment
    // assignment failed silently) — assign to the closest available pool bubble
    // across ALL groups, sorted by semester proximity, so they still show up.
    const allPoolBubbles = layout.bubbles.filter((b) => b.type === 'pool' && !map.has(b.key));
    for (const enrollment of enrollments) {
      if (usedEnrollmentIds.has(enrollment.id)) continue;
      if (enrollment.fulfillments.length > 0) continue; // already handled above
      const enrollSortOrder = semesterSortOrder.get(enrollment.semesterId) ?? 0;
      const available = allPoolBubbles.filter((b) => !map.has(b.key));
      available.sort(
        (a, b) => Math.abs(a.col - enrollSortOrder) - Math.abs(b.col - enrollSortOrder)
      );
      if (available.length > 0) {
        map.set(available[0].key, enrollment);
        usedEnrollmentIds.add(enrollment.id);
      }
    }

    return map;
  }, [enrollments, semesters, layout.bubbles]);

  // Hide duplicate fixed bubbles (e.g. CS 3900 in multiple summers) in later
  // columns when the course is already enrolled/completed in an earlier column.
  const hiddenBubbleKeys = useMemo(() => {
    const hidden = new Set<string>();
    const groups = new Map<string, BubbleData[]>();
    for (const b of layout.bubbles) {
      if (b.type === 'fixed' && b.courseCode) {
        const list = groups.get(b.courseCode) ?? [];
        list.push(b);
        groups.set(b.courseCode, list);
      }
    }
    for (const [, dupes] of groups) {
      if (dupes.length <= 1) continue;
      const enrolledBubble = dupes
        .filter((b) => enrollmentMap.has(b.key))
        .sort((a, b) => a.col - b.col)[0];
      if (enrolledBubble) {
        for (const b of dupes) {
          if (b.key !== enrolledBubble.key) hidden.add(b.key);
        }
      }
    }
    return hidden;
  }, [layout.bubbles, enrollmentMap]);

  const visibleBubbles = useMemo(
    () => layout.bubbles.filter((b) => !hiddenBubbleKeys.has(b.key)),
    [layout.bubbles, hiddenBubbleKeys]
  );

  // ── Requirement group lookup (memoized) ──

  const requirementGroupMap = useMemo(() => {
    const map = new Map<string, RequirementGroupDTO>();
    if (!program?.categories) return map;
    for (const cat of program.categories) {
      for (const group of cat.groups) {
        map.set(group.name, group);
      }
    }
    return map;
  }, [program]);

  const findRequirementGroup = useCallback(
    (groupName?: string): RequirementGroupDTO | undefined => {
      if (!groupName) return undefined;
      return requirementGroupMap.get(groupName);
    },
    [requirementGroupMap]
  );

  // ── Handlers ──

  const handleBubbleClick = useCallback((bubble: BubbleData) => {
    setSelectedBubble(bubble);
    setSheetOpen(true);
  }, []);

  const handleEnroll = async (courseId: string, requirementGroupId?: number): Promise<boolean> => {
    if (!userSemester || actionInProgress) return false;
    setActionInProgress(true);
    setEnrollError(null);
    try {
      await enrollmentService.enrollCourse({
        courseId,
        semesterId: userSemester.currentSemester.id,
      });
      // Auto-assign fulfillment so the bubble reflects enrollment immediately
      if (requirementGroupId) {
        try {
          await enrollmentService.assignFulfillment({
            courseId,
            requirementGroupId,
          });
        } catch (fulfillErr) {
          console.warn('Fulfillment assignment failed:', fulfillErr);
        }
      }
      return true;
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Failed to enroll');
      return false;
    } finally {
      await loadData();
      setActionInProgress(false);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await enrollmentService.unenrollCourse(courseId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unenroll');
    } finally {
      setActionInProgress(false);
    }
  };

  // Check which current-semester bubbles are missing enrollments
  const missingBubbles = useMemo(() => {
    if (!userSemester) return [];
    // Collect course codes that are already enrolled (in any semester)
    const enrolledCodes = new Set(enrollments.map((e) => e.courseCode));

    // For fixed courses that appear in multiple columns (e.g. CS 3900 in Su1/Su2/Su3),
    // find the last column each appears in. Only that final instance is required —
    // earlier ones are optional (the student can still take it later).
    const lastColByCourseCode = new Map<string, number>();
    for (const b of layout.bubbles) {
      if (b.type === 'fixed' && b.courseCode) {
        const prev = lastColByCourseCode.get(b.courseCode) ?? 0;
        if (b.col > prev) lastColByCourseCode.set(b.courseCode, b.col);
      }
    }

    return layout.bubbles.filter(
      (b) =>
        b.col === userSemester.currentSemester.sortOrder &&
        !enrollmentMap.has(b.key) &&
        // Don't block if already enrolled in another semester
        !(b.type === 'fixed' && b.courseCode && enrolledCodes.has(b.courseCode)) &&
        // Don't block at an earlier duplicate — only require enrollment at the last occurrence
        !(b.type === 'fixed' && b.courseCode && (lastColByCourseCode.get(b.courseCode) ?? b.col) > b.col)
    );
  }, [userSemester, enrollmentMap, layout.bubbles, enrollments]);

  const isOnLastSemester = useMemo(() => {
    if (!userSemester) return false;
    const maxCol = Math.max(...layout.columns.map((c) => c.sortOrder));
    const currentSortOrder = userSemester.currentSemester.sortOrder;
    if (currentSortOrder > maxCol) return true;
    // Also block if on the last semester but courses are already COMPLETED
    // (the final advance has already been performed)
    if (currentSortOrder === maxCol) {
      return enrollments.some(
        (e) => e.semesterId === userSemester.currentSemester.id && e.status === 'COMPLETED'
      );
    }
    return false;
  }, [userSemester, layout.columns, enrollments]);

  const canAdvance = missingBubbles.length === 0 && !isOnLastSemester;

  // Find the target semester for "Go Back".
  // If the current semester has completed courses (e.g. advanced at the last semester),
  // rollback to the current semester itself to undo the completion.
  const previousSemester = useMemo(() => {
    if (!userSemester) return undefined;
    const current = userSemester.currentSemester;
    const hasCompletedHere = enrollments.some(
      (e) => e.semesterId === current.id && e.status === 'COMPLETED'
    );
    if (hasCompletedHere) return current;
    const prevSort = current.sortOrder - 1;
    return semesters.find((s) => s.sortOrder === prevSort);
  }, [userSemester, semesters, enrollments]);

  const handleGoBack = () => {
    if (!previousSemester) return;
    handleRollbackClick(previousSemester);
  };

  const handleAdvanceClick = () => {
    if (!canAdvance) return;
    const currentEnrollments = enrollments.filter(
      (e) => e.semesterId === userSemester?.currentSemester.id && e.status === 'ENROLLED'
    );
    setAffectedEnrollments(currentEnrollments);
    setRollbackTarget(undefined);
    setConfirmType('advance');
    setConfirmOpen(true);
  };

  const handleRollbackClick = (targetSemester: SemesterDTO) => {
    // Find enrollments that will be deleted (those after the target semester)
    const affected = enrollments.filter(
      (e) => {
        const sem = semesters.find((s) => s.id === e.semesterId);
        return sem && sem.sortOrder > targetSemester.sortOrder;
      }
    );
    setAffectedEnrollments(affected);
    setRollbackTarget(targetSemester);
    setConfirmType('rollback');
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      setConfirmOpen(false);
      if (confirmType === 'advance') {
        await semesterService.advanceSemester();
      } else if (confirmType === 'rollback' && rollbackTarget) {
        await semesterService.rollbackSemester({ targetSemesterId: rollbackTarget.id });
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${confirmType} semester`);
    } finally {
      setActionInProgress(false);
    }
  };

  const setBubbleRef = useCallback((key: string, el: HTMLElement | null) => {
    bubbleRefsMap.current.set(key, el);
  }, []);

  // Program switch handlers
  const handleProgramSelect = (programIdStr: string) => {
    const newId = Number(programIdStr);
    if (newId === activeProgramId) return;
    const target = allPrograms.find((p) => p.id === newId);
    if (!target) return;
    setSwitchTargetProgram(target);
    setSwitchDialogOpen(true);
  };

  const handleProgramSwitchConfirm = async () => {
    if (!switchTargetProgram || actionInProgress) return;
    setActionInProgress(true);
    try {
      setSwitchDialogOpen(false);
      await semesterService.switchProgram(switchTargetProgram.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch program');
    } finally {
      setActionInProgress(false);
      setSwitchTargetProgram(null);
    }
  };

  // Credit breakdown by program category (must be above early returns — hooks can't be conditional)
  const categoryCredits = useMemo(() => {
    if (!program?.categories) return [];
    return program.categories
      .filter((cat) => cat.totalCreditsRequired)
      .map((cat) => {
        const categoryCourseIds = new Set<string>();
        for (const group of cat.groups) {
          for (const option of group.options) {
            for (const course of option.courses) {
              categoryCourseIds.add(course.courseId);
            }
          }
        }
        const earned = enrollments
          .filter((e) => categoryCourseIds.has(e.courseId))
          .reduce((s, e) => s + (e.credits ?? 0), 0);
        return { name: cat.name, earned, required: cat.totalCreditsRequired! };
      });
  }, [program, enrollments]);

  // ── Render ──

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-muted-foreground">Loading course map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
        <p className="text-destructive">Error: {error}</p>
        <button onClick={loadData} className="text-sm underline text-blue-600">
          Retry
        </button>
      </div>
    );
  }

  const currentSortOrder = userSemester?.currentSemester.sortOrder ?? 1;
  const totalEnrolled = enrollments.length;
  const totalCompleted = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const totalCredits = enrollments.reduce((sum, e) => sum + (e.credits ?? 0), 0);
  const completedCredits = enrollments
    .filter((e) => e.status === 'COMPLETED')
    .reduce((sum, e) => sum + (e.credits ?? 0), 0);
  const inProgressCredits = totalCredits - completedCredits;

  // Build grid: for each cell (row, col), find the bubble (if any)
  const gridRows = layout.rowLabels.map((label, rowIdx) => {
    const row = rowIdx + 1;
    const cells = layout.columns.map((col) => {
      const bubble = layout.bubbles.find((b) => b.row === row && b.col === col.sortOrder);
      return { col, bubble };
    });
    return { label, row, cells };
  });

  const selectedGroup = findRequirementGroup(selectedBubble?.requirementGroup);
  const selectedBubbleIsCurrentSemester = selectedBubble
    ? selectedBubble.col === currentSortOrder
    : false;

  return (
    <div className="p-4 space-y-4 overflow-x-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{program?.name ?? 'Course Map'}</h1>
          {allPrograms.length > 1 && (
            <Select value={String(activeProgramId)} onValueChange={handleProgramSelect}>
              <SelectTrigger className="w-70">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                {allPrograms.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {totalCompleted} completed · {totalEnrolled - totalCompleted} in progress · {totalCredits} credits total
        </p>
      </div>

      {/* Semester headers */}
      <SemesterHeader
        columns={layout.columns}
        semesters={semesters}
        userSemester={userSemester}
        semesterCredits={semesterCredits}
        onRollback={handleRollbackClick}
      />

      {/* Grid with arrows — pt-10 reserves space for above-routed arrows */}
      <div className="relative pt-10" ref={setContainerEl}>
        <PrerequisiteArrows
          arrows={layout.arrows}
          bubbles={visibleBubbles}
          bubbleRefs={bubbleRefsMap.current}
          enrollmentMap={enrollmentMap}
          containerRef={containerEl}
        />

        <div className="relative z-10 space-y-2">
          {gridRows.map(({ label, row, cells }) => (
            <div key={row} className="flex items-center gap-0">
              {/* Row label */}
              <div className="w-25 shrink-0 text-xs font-medium text-muted-foreground pr-2 text-right">
                {label}
              </div>

              {/* Bubbles for each column */}
              {cells.map(({ col, bubble }) => (
                <div
                  key={`${row}-${col.sortOrder}`}
                  className={`
                    flex items-center justify-center
                    ${col.isSummer ? 'w-20' : 'w-[140px]'}
                    shrink-0 px-1 h-13
                  `}
                >
                  {bubble && !hiddenBubbleKeys.has(bubble.key) && (
                    <div ref={(el) => setBubbleRef(bubble.key, el)}>
                      <CourseBubble
                        bubble={bubble}
                        enrollment={enrollmentMap.get(bubble.key)}
                        isCurrentSemester={col.sortOrder === currentSortOrder}
                        onClick={handleBubbleClick}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Floating credit panel + semester controls */}
      <div className="fixed right-4 top-2 z-50 bg-white rounded-lg shadow-lg border p-2 flex items-start gap-4 text-sm">
        {/* Credit summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{completedCredits}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{inProgressCredits}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center border-l pl-4">
            <p className="text-lg font-bold">{totalCredits}</p>
            <p className="text-[10px] text-muted-foreground">/ {program?.totalCreditsRequired ?? '?'} Total</p>
          </div>
        </div>

        {/* Category breakdown */}
        {categoryCredits.length > 0 && (
          <div className="border-l pl-4 space-y-0.5">
            {categoryCredits.map((cat) => (
              <div key={cat.name} className="flex justify-between gap-3 text-xs">
                <span className="truncate">{cat.name}</span>
                <span className="font-medium shrink-0">{cat.earned}/{cat.required}</span>
              </div>
            ))}
          </div>
        )}

        {/* Semester controls */}
        <div className="border-l pl-4 flex flex-col gap-1 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAdvanceClick}
            disabled={!canAdvance}
            className="w-full"
          >
            Advance
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGoBack}
            disabled={!previousSemester}
            className="w-full text-xs h-7"
          >
            <ChevronLeft className="mr-1 h-3 w-3" />
            Go Back
          </Button>
          {!canAdvance && (
            <p className="text-[10px] text-destructive text-center">
              {missingBubbles.length} unenrolled
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded border-2 bg-green-100 border-green-500" />
          Completed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded border-2 bg-blue-100 border-blue-500" />
          In Progress
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-4 rounded border-2 bg-white border-gray-300" />
          Not Started
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t-2 border-green-500" />
          Prerequisite Satisfied
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t-2 border-gray-400" />
          Prerequisite Pending
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-6 border-t-2 border-dashed border-gray-400" />
          Corequisite
        </div>
      </div>

      {/* Side sheet */}
      <RequirementSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        bubble={selectedBubble}
        requirementGroup={selectedGroup}
        enrollments={enrollments}
        mappedEnrollment={selectedBubble ? enrollmentMap.get(selectedBubble.key) : undefined}
        currentSemester={userSemester?.currentSemester}
        isCurrentSemester={selectedBubbleIsCurrentSemester}
        onEnroll={handleEnroll}
        onUnenroll={handleUnenroll}
        enrollError={enrollError}
        onClearEnrollError={() => setEnrollError(null)}
      />

      {/* Confirm dialog */}
      <SemesterConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        type={confirmType}
        currentSemester={userSemester?.currentSemester}
        targetSemester={rollbackTarget}
        affectedEnrollments={affectedEnrollments}
        onConfirm={handleConfirm}
      />

      {/* Program switch dialog */}
      {switchTargetProgram && (
        <ProgramSwitchDialog
          open={switchDialogOpen}
          onOpenChange={setSwitchDialogOpen}
          targetProgram={switchTargetProgram}
          onConfirm={handleProgramSwitchConfirm}
        />
      )}
    </div>
  );
}
