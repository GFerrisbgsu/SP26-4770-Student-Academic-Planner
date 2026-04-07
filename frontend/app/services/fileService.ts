const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_BASE_URL}/files`;
const API_ORIGIN = new URL(API_BASE_URL).origin;

export type CourseFileType = 'pdf' | 'image' | 'document' | 'link' | 'folder';
export type CourseFileCategory = 'syllabus' | 'lecture' | 'assignment' | 'resource' | 'other';

interface CourseFileDTO {
  id: number;
  courseId: string;
  name: string;
  fileType: string;
  category: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface CourseFileItem {
  id: number;
  courseId: string;
  name: string;
  type: CourseFileType;
  category: CourseFileCategory;
  size?: string;
  url?: string;
  uploadDate: Date;
  updatedAt: Date;
}

export interface CreateCourseFileRequest {
  name: string;
  fileType: CourseFileType;
  category: CourseFileCategory;
  fileSize?: string;
  fileUrl?: string;
}

function normalizeFileType(fileType: string): CourseFileType {
  if (fileType === 'image' || fileType === 'document' || fileType === 'link' || fileType === 'folder') {
    return fileType;
  }
  return 'pdf';
}

function normalizeCategory(category: string): CourseFileCategory {
  if (category === 'syllabus' || category === 'lecture' || category === 'assignment' || category === 'resource') {
    return category;
  }
  return 'other';
}

function mapCourseFile(dto: CourseFileDTO): CourseFileItem {
  return {
    id: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    type: normalizeFileType(dto.fileType),
    category: normalizeCategory(dto.category),
    size: dto.fileSize,
    url: dto.fileUrl,
    uploadDate: new Date(dto.uploadedAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export async function getFilesByCourse(courseId: string, category?: CourseFileCategory): Promise<CourseFileItem[]> {
  const categoryQuery = category && category !== 'other' ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`${BASE_URL}/course/${courseId}${categoryQuery}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch files for course ${courseId}`);
  }

  const data: CourseFileDTO[] = await res.json();
  return data.map(mapCourseFile);
}

export async function createFile(courseId: string, request: CreateCourseFileRequest): Promise<CourseFileItem> {
  const res = await fetch(`${BASE_URL}/course/${courseId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to create file');
  }

  const data: CourseFileDTO = await res.json();
  return mapCourseFile(data);
}

export async function uploadCourseFile(
  courseId: string,
  file: globalThis.File,
  name?: string,
  category: CourseFileCategory = 'other'
): Promise<CourseFileItem> {
  const formData = new FormData();
  formData.append('file', file);
  if (name?.trim()) {
    formData.append('name', name.trim());
  }
  formData.append('category', category);

  const res = await fetch(`${BASE_URL}/course/${courseId}/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Failed to upload file');
  }

  const data: CourseFileDTO = await res.json();
  return mapCourseFile(data);
}

export function resolveCourseFileUrl(fileUrl?: string): string | undefined {
  if (!fileUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  // Backend returns server-relative routes like /api/files/{id}/download.
  // Use API origin so we do not accidentally produce /api/api/... URLs.
  if (fileUrl.startsWith('/')) {
    return `${API_ORIGIN}${fileUrl}`;
  }

  const normalizedPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function resolveCourseFilePreviewUrl(fileUrl?: string): string | undefined {
  const resolvedUrl = resolveCourseFileUrl(fileUrl);
  if (!resolvedUrl) {
    return undefined;
  }

  if (resolvedUrl.endsWith('/download')) {
    return `${resolvedUrl.slice(0, -'/download'.length)}/preview`;
  }

  return resolvedUrl;
}

export function getCourseFilePreviewUrl(fileId: number): string {
  return `${API_ORIGIN}/api/files/${fileId}/preview`;
}

export function getCourseFileDownloadUrl(fileId: number): string {
  return `${API_ORIGIN}/api/files/${fileId}/download`;
}

export async function updateFile(
  fileId: number,
  request: Partial<CreateCourseFileRequest>
): Promise<CourseFileItem> {
  const res = await fetch(`${BASE_URL}/${fileId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error('Failed to update file');
  }

  const data: CourseFileDTO = await res.json();
  return mapCourseFile(data);
}

export async function deleteFile(fileId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${fileId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to delete file');
  }
}
