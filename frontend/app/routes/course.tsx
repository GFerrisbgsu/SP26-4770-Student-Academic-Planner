import type { Route } from "./+types/course";
import { useState, useEffect } from 'react';
import { EnhancedCoursePage } from '~/components/EnhancedCoursePage';
import { getEnrolledCourses } from '~/services/courseService';
import type { Course } from '~/services/courseService';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Course Details - Student Life" },
    { name: "description", content: "View course details, notes, and files" },
  ];
}

export default function Course() {
  const [courseColors, setCourseColors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Fetch enrolled courses to initialize colors
  useEffect(() => {
    async function loadCourses() {
      try {
        const courses = await getEnrolledCourses();
        const colors: Record<string, string> = {};
        courses.forEach(course => {
          colors[course.id] = course.color;
        });
        setCourseColors(colors);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return <EnhancedCoursePage courseColors={courseColors} />;
}
