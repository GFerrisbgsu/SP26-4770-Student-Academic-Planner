const BASE_URL = "http://localhost:8080/api/projects";

export interface Project {
  id: number;
  userId: number;
  name: string;
  description?: string;
  color: string;
  deadline?: string; // ISO date string
  deadlineTime?: string; // ISO time string
  completed?: boolean;
  todoListId?: number;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color: string;
  deadline?: string; // ISO date string
  deadlineTime?: string; // ISO time string
  completed?: boolean;
  todoListId?: number;
}

export async function getUserProjects(userId: number): Promise<Project[]> {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function createProject(userId: number, projectData: CreateProjectRequest): Promise<Project> {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    method: "POST",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function updateProject(projectId: number, projectData: CreateProjectRequest): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${projectId}`, {
    method: "PUT",
    credentials: 'include',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function deleteProject(projectId: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/${projectId}`, {
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to delete project");
}

export async function getProjectById(projectId: number): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${projectId}`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}
