import { Badge } from '~/components/ui/badge';
import type { SemesterDTO, UserSemesterDTO } from '~/types/program';
import type { SemesterColumn } from '~/data/courseMapLayout';

interface SemesterHeaderProps {
  columns: SemesterColumn[];
  semesters: SemesterDTO[];
  userSemester?: UserSemesterDTO;
  semesterCredits: Map<number, number>;
  onRollback: (semester: SemesterDTO) => void;
}

export function SemesterHeader({ columns, semesters, userSemester, semesterCredits, onRollback }: SemesterHeaderProps) {
  const currentSortOrder = userSemester?.currentSemester.sortOrder ?? 1;

  return (
    <div className="flex items-end gap-0 mb-2">
      {/* Row label spacer */}
      <div className="w-25 shrink-0" />

      {columns.map((col) => {
        const semester = semesters.find((s) => s.sortOrder === col.sortOrder);
        const isCurrent = col.sortOrder === currentSortOrder;
        const isPast = col.sortOrder < currentSortOrder;
        const credits = semester ? (semesterCredits.get(semester.id) ?? 0) : 0;

        return (
          <div
            key={col.sortOrder}
            className={`
              flex flex-col items-center justify-end
              ${col.isSummer ? 'w-20' : 'w-[140px]'}
              shrink-0 px-1
            `}
          >
            <button
              type="button"
              onClick={() => {
                if (isPast && semester) onRollback(semester);
              }}
              className={`text-xs font-semibold ${
                isCurrent ? 'text-blue-600' : isPast ? 'text-green-600 hover:underline cursor-pointer' : 'text-gray-500'
              }`}
              disabled={!isPast}
              title={isPast ? `Click to roll back to ${col.label}` : undefined}
            >
              {col.label}
            </button>
            {semester && credits > 0 && (
              <span className="text-[10px] text-muted-foreground">{credits} cr</span>
            )}
            {isCurrent && (
              <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-600 mt-0.5">
                Current
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
