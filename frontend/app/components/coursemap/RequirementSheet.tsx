import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '~/components/ui/sheet';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ScrollArea } from '~/components/ui/scroll-area';
import { CourseDetailPanel } from '~/components/coursemap/CourseDetailPanel';
import { ScheduleModal, hasValidSchedule } from '~/components/ScheduleModal';
import { getCourseById, updateCourseSchedule } from '~/services/courseService';
import type { Course } from '~/services/courseService';
import type { CourseBubble } from '~/data/courseMapLayout';
import type {
  RequirementGroupDTO,
  RequirementCourseDTO,
  UserCourseEnrollmentDTO,
  SemesterDTO,
} from '~/types/program';

interface RequirementSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bubble: CourseBubble | null;
  requirementGroup?: RequirementGroupDTO;
  enrollments: UserCourseEnrollmentDTO[];
  mappedEnrollment?: UserCourseEnrollmentDTO;
  currentSemester?: SemesterDTO;
  isCurrentSemester: boolean;
  onEnroll: (courseId: string, requirementGroupId?: number) => Promise<boolean>;
  onUnenroll: (courseId: string) => void;
  enrollError?: string | null;
  onClearEnrollError?: () => void;
}

export function RequirementSheet({
  open,
  onOpenChange,
  bubble,
  requirementGroup,
  enrollments,
  mappedEnrollment,
  currentSemester,
  isCurrentSemester,
  onEnroll,
  onUnenroll,
  enrollError,
  onClearEnrollError,
}: RequirementSheetProps) {
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);
  const [scheduleModalCourse, setScheduleModalCourse] = useState<Course | null>(null);
  const [pendingRequirementGroupId, setPendingRequirementGroupId] = useState<number | undefined>();

  if (!bubble) return null;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPreviewCourseId(null);
      setScheduleModalCourse(null);
      onClearEnrollError?.();
    }
    onOpenChange(open);
  };

  /**
   * Check if the course has a valid schedule before enrolling.
   * If not, fetch the full course and show the ScheduleModal.
   */
  const handleEnrollWithScheduleCheck = async (courseId: string, requirementGroupId?: number) => {
    try {
      const fullCourse = await getCourseById(courseId);
      if (hasValidSchedule(fullCourse.schedule)) {
        const success = await onEnroll(courseId, requirementGroupId);
        if (success) handleOpenChange(false);
      } else {
        setPendingRequirementGroupId(requirementGroupId);
        setScheduleModalCourse(fullCourse);
      }
    } catch {
      const success = await onEnroll(courseId, requirementGroupId);
      if (success) handleOpenChange(false);
    }
  };

  const handleScheduleConfirm = async (schedule: string) => {
    if (!scheduleModalCourse) return;
    try {
      await updateCourseSchedule(scheduleModalCourse.id, schedule);
    } catch {
      // Schedule update failed — continue with enrollment anyway
    }
    setScheduleModalCourse(null);
    const success = await onEnroll(scheduleModalCourse.id, pendingRequirementGroupId);
    if (success) handleOpenChange(false);
  };

  // Use the pre-computed enrollment from enrollmentMap (handles deduplication for pool bubbles)
  const existingEnrollment = mappedEnrollment;

  // Get eligible courses from the requirement group
  let eligibleCourses: RequirementCourseDTO[] = [];
  if (requirementGroup) {
    for (const option of requirementGroup.options) {
      for (const course of option.courses) {
        // Exclude already-enrolled courses
        const alreadyEnrolled = enrollments.some((e) => e.courseId === course.courseId);
        if (!alreadyEnrolled) {
          eligibleCourses.push(course);
        }
      }
    }
  }

  // For CHOOSE_ONE_OPTION groups (e.g. Lab Science Sequence), once a course from
  // one option is enrolled, restrict the list to only courses from that same option.
  if (requirementGroup?.selectionRule === 'CHOOSE_ONE_OPTION') {
    const chosenOptionEnrollment = enrollments.find((e) =>
      e.fulfillments.some((f) => f.requirementGroupName === requirementGroup.name)
    );
    if (chosenOptionEnrollment) {
      // Find which option contains the already-chosen course
      const chosenOption = requirementGroup.options.find((opt) =>
        opt.courses.some((c) => c.courseId === chosenOptionEnrollment.courseId)
      );
      if (chosenOption) {
        const optionCourseIds = new Set(chosenOption.courses.map((c) => c.courseId));
        eligibleCourses = eligibleCourses.filter((c) => optionCourseIds.has(c.courseId));
      }
    }
  }

  // Filter by course level suffix (e.g. only show 1010-level for lang_1010)
  if (bubble.courseCodeSuffix) {
    eligibleCourses = eligibleCourses.filter((c) =>
      c.courseCode.replace(/\s+/g, '').endsWith(bubble.courseCodeSuffix!)
    );

    // If a language is already chosen, lock to that language
    const chosenLangEnrollment = enrollments.find((e) =>
      e.fulfillments.some((f) => f.requirementGroupName === bubble.requirementGroup)
    );
    if (chosenLangEnrollment) {
      const prefix = chosenLangEnrollment.courseCode.replace(/\s*\d{4}$/, '');
      if (prefix) {
        eligibleCourses = eligibleCourses.filter((c) =>
          c.courseCode.startsWith(prefix)
        );
      }
    }
  }

  const isExclusive = requirementGroup?.exclusive;

  return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-100 sm:w-135 sm:max-w-none">
        {/* Course detail panel — rendered inside SheetContent so Radix
            doesn't treat clicks on it as "outside". position:fixed keeps
            it visually to the left of the sheet. Hidden when schedule modal is open. */}
        {previewCourseId && !scheduleModalCourse && (
          <CourseDetailPanel
            courseId={previewCourseId}
            onClose={() => setPreviewCourseId(null)}
          />
        )}

        {/* Schedule modal for courses without a valid schedule */}
        {scheduleModalCourse && (
          <ScheduleModal
            isOpen={true}
            onClose={() => setScheduleModalCourse(null)}
            course={scheduleModalCourse}
            onConfirm={handleScheduleConfirm}
          />
        )}
        <SheetHeader>
          <SheetTitle>{bubble.label}</SheetTitle>
          <SheetDescription>
            {requirementGroup?.name ?? bubble.requirementGroup ?? 'Course details'}
          </SheetDescription>
        </SheetHeader>

        {enrollError && (
          <div className="mx-4 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {enrollError}
          </div>
        )}

        <div className="mt-4 px-4 space-y-4">
          {/* Existing enrollment info */}
          {existingEnrollment && (
            <div
              className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted"
              onClick={() => setPreviewCourseId(existingEnrollment.courseId)}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{existingEnrollment.courseCode}</span>
                <Badge variant={existingEnrollment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {existingEnrollment.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{existingEnrollment.courseName}</p>
              <p className="text-sm">{existingEnrollment.credits} credits · {existingEnrollment.semesterName}</p>
              {existingEnrollment.fulfillments.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Fulfills: </span>
                  {existingEnrollment.fulfillments.map((f) => f.requirementGroupName).join(', ')}
                </div>
              )}
              {existingEnrollment.status === 'ENROLLED' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnenroll(existingEnrollment.courseId);
                    handleOpenChange(false);
                  }}
                >
                  Unenroll
                </Button>
              )}
            </div>
          )}

          {/* Fixed course — show enroll button if not enrolled */}
          {bubble.type === 'fixed' && !existingEnrollment && bubble.courseCode && (
            <div
            className="rounded-lg border p-3 space-y-2 cursor-pointer hover:bg-muted"
              onClick={() => {
                const id = bubble.courseCode!.toLowerCase().replace(/\s+/g, '');
                setPreviewCourseId(id);
              }}
            >
              <p className="font-semibold">{bubble.courseCode}</p>
              <p className="text-sm text-muted-foreground">
                This course is required in this slot.
              </p>
              {!isCurrentSemester ? (
                <p className="text-sm text-amber-600">
                  You can only enroll in courses for the current semester.
                </p>
              ) : (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const groupCourse = requirementGroup?.options
                      .flatMap((o) => o.courses)
                      .find((c) => c.courseCode === bubble.courseCode);
                    const courseId = groupCourse?.courseId
                      ?? bubble.courseCode!.toLowerCase().replace(/\s+/g, '');
                    handleEnrollWithScheduleCheck(courseId, requirementGroup?.id);
                  }}
                >
                  Enroll in {bubble.courseCode}
                </Button>
              )}
            </div>
          )}

          {/* Pool course — show eligible courses */}
          {bubble.type === 'pool' && !existingEnrollment && (
            <div className="space-y-2">
              {!isCurrentSemester && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-sm text-amber-800">
                  You can only enroll in courses for the current semester.
                </div>
              )}

              {isExclusive && isCurrentSemester && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-sm text-amber-800">
                  ⚠ Exclusive requirement. Courses used here cannot fulfill other requirements.
                </div>
              )}

              {requirementGroup && (
                <div className="text-sm text-muted-foreground">
                  {requirementGroup.selectionRule === 'CHOOSE_N_COURSES' && (
                    <span>Choose {requirementGroup.minCoursesRequired} course(s)</span>
                  )}
                  {requirementGroup.selectionRule === 'CHOOSE_MIN_CREDITS' && (
                    <span>Minimum {requirementGroup.minCreditsRequired} credits</span>
                  )}
                  {requirementGroup.selectionRule === 'CHOOSE_ONE_OPTION' && (
                    <span>Choose one option from below</span>
                  )}
                  {requirementGroup.selectionRule === 'CHOOSE_SEQUENCE' && (
                    <span>Complete a language sequence</span>
                  )}
                </div>
              )}

              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="space-y-2 pr-4">
                  {eligibleCourses.length > 0 && isCurrentSemester ? (
                    eligibleCourses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted cursor-pointer"
                        onClick={() => setPreviewCourseId(course.courseId)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{course.courseCode}</p>
                          <p className="text-xs text-muted-foreground truncate">{course.courseName}</p>
                          {course.credits && (
                            <p className="text-xs text-muted-foreground">{course.credits} credits</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 ml-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnrollWithScheduleCheck(course.courseId, requirementGroup?.id);
                          }}
                        >
                          Enroll
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {!isCurrentSemester
                        ? 'Advance to this semester to enroll'
                        : 'No eligible courses available'}
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
