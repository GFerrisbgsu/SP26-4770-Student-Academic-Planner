import { useEffect, useState } from 'react';
import { X, Clock, User, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ScrollArea } from '~/components/ui/scroll-area';
import { getCourseById } from '~/services/courseService';
import type { Course } from '~/types/course';

interface CourseDetailPanelProps {
  courseId: string | null;
  onClose: () => void;
}

export function CourseDetailPanel({ courseId, onClose }: CourseDetailPanelProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setCourse(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getCourseById(courseId)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [courseId]);

  if (!courseId) return null;

  return (
    <div
      className="fixed inset-y-0 right-[550px] z-[60] w-96 bg-background border-l border-r shadow-lg flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold truncate">
          {course?.code ?? 'Loading...'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground text-center py-8">Loading course details...</p>
          )}

          {error && (
            <p className="text-sm text-destructive text-center py-8">{error}</p>
          )}

          {course && !loading && (
            <>
              {/* Title */}
              <div>
                <h3 className="text-base font-semibold">{course.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.code}</p>
              </div>

              {/* Key details */}
              <div className="grid grid-cols-2 gap-3">
                {course.credits != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{course.credits} credits</span>
                  </div>
                )}

                {course.instructor && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                )}

                {course.schedule && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{course.schedule}</span>
                  </div>
                )}
              </div>

              {/* Semesters offered */}
              {course.semesters && course.semesters.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Offered</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-6">
                    {course.semesters.map((s) => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {course.description && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>Description</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-6">
                    {course.description}
                  </p>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisiteText && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Prerequisites</p>
                  <p className="text-sm text-muted-foreground leading-relaxed ml-0">
                    {course.prerequisiteText}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
