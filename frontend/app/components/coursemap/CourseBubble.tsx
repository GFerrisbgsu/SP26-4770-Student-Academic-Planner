import { useState } from 'react';
import type { CourseBubble as BubbleData } from '~/data/courseMapLayout';
import type { UserCourseEnrollmentDTO } from '~/types/program';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';

interface CourseBubbleProps {
  bubble: BubbleData;
  enrollment?: UserCourseEnrollmentDTO;
  isCurrentSemester: boolean;
  onClick: (bubble: BubbleData) => void;
}

export function CourseBubble({ bubble, enrollment, isCurrentSemester, onClick }: CourseBubbleProps) {
  const status = getStatus(enrollment);
  const colors = getColors(status);

  // For pool bubbles with an enrollment, show the enrolled course name
  const showEnrolledName = bubble.type === 'pool' && enrollment;
  const displayLabel = showEnrolledName ? enrollment.courseCode : bubble.label;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onClick(bubble)}
            className={`
              flex flex-col items-center justify-center
              rounded-lg border-2 px-2 py-1
              text-xs font-semibold
              min-w-22.5 h-11
              transition-all duration-200
              cursor-pointer select-none
              ${colors.bg} ${colors.border} ${colors.text}
              ${isCurrentSemester ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
              hover:scale-105 hover:shadow-md
            `}
          >
            <span className="truncate leading-tight text-center">
              {displayLabel}
            </span>
            {showEnrolledName && (
              <span className="truncate leading-tight text-center text-[9px] font-normal opacity-50">
                {bubble.label}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-50">
          <p className="font-semibold">{bubble.label}</p>
          {enrollment && (
            <>
              <p className="text-xs">{enrollment.courseName}</p>
              <p className="text-xs text-muted-foreground">
                {enrollment.credits} credits · {enrollment.semesterName}
              </p>
              {enrollment.grade && (
                <p className="text-xs">Grade: {enrollment.grade}</p>
              )}
            </>
          )}
          {!enrollment && bubble.type === 'pool' && (
            <p className="text-xs text-muted-foreground">Click to choose a course</p>
          )}
          {!enrollment && bubble.type === 'fixed' && (
            <p className="text-xs text-muted-foreground">{bubble.courseCode}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type BubbleStatus = 'completed' | 'enrolled' | 'not-started';

function getStatus(enrollment?: UserCourseEnrollmentDTO): BubbleStatus {
  if (!enrollment) return 'not-started';
  return enrollment.status === 'COMPLETED' ? 'completed' : 'enrolled';
}

function getColors(status: BubbleStatus) {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' };
    case 'enrolled':
      return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' };
    case 'not-started':
      return { bg: 'bg-white', border: 'border-gray-300', text: 'text-gray-700' };
  }
}
