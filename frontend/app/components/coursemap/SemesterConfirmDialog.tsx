import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import type { UserCourseEnrollmentDTO, SemesterDTO } from '~/types/program';

interface SemesterConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'advance' | 'rollback';
  currentSemester?: SemesterDTO;
  targetSemester?: SemesterDTO;
  affectedEnrollments: UserCourseEnrollmentDTO[];
  onConfirm: () => void;
}

export function SemesterConfirmDialog({
  open,
  onOpenChange,
  type,
  currentSemester,
  targetSemester,
  affectedEnrollments,
  onConfirm,
}: SemesterConfirmDialogProps) {
  const title = type === 'advance'
    ? `Advance to Next Semester?`
    : `Roll Back to ${targetSemester?.name}?`;

  const description = type === 'advance'
    ? `This will mark all courses in ${currentSemester?.name} as completed and move you to the next semester.`
    : `This will delete all enrollments after ${targetSemester?.name}. This action cannot be undone.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {affectedEnrollments.length > 0 && (
          <div className="my-2 max-h-50 overflow-y-auto">
            <p className="text-sm font-medium mb-1">
              {type === 'advance' ? 'Courses to be completed:' : 'Courses to be removed:'}
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
              {affectedEnrollments.map((e) => (
                <li key={e.id}>
                  {e.courseCode} — {e.courseName} ({e.semesterName})
                </li>
              ))}
            </ul>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={type === 'rollback' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            {type === 'advance' ? 'Advance Semester' : 'Roll Back'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
