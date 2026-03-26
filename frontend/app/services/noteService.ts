const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_BASE_URL}/notes`;

interface CourseNoteDTO {
  id: number;
  courseId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseNote {
  id: number;
  courseId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseNoteRequest {
  title: string;
  content: string;
}

function mapCourseNote(dto: CourseNoteDTO): CourseNote {
  return {
    id: dto.id,
    courseId: dto.courseId,
    title: dto.title,
    content: dto.content,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export async function getNotesByCourse(courseId: string): Promise<CourseNote[]> {
  const res = await fetch(`${BASE_URL}/course/${courseId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch notes for course ${courseId}`);
  }

  const data: CourseNoteDTO[] = await res.json();
  return data.map(mapCourseNote);
}

export async function createNote(courseId: string, request: CreateCourseNoteRequest): Promise<CourseNote> {
  const res = await fetch(`${BASE_URL}/course/${courseId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error('Failed to create note');
  }

  const data: CourseNoteDTO = await res.json();
  return mapCourseNote(data);
}

export async function updateNote(noteId: number, request: CreateCourseNoteRequest): Promise<CourseNote> {
  const res = await fetch(`${BASE_URL}/${noteId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error('Failed to update note');
  }

  const data: CourseNoteDTO = await res.json();
  return mapCourseNote(data);
}

export async function deleteNote(noteId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${noteId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to delete note');
  }
}
