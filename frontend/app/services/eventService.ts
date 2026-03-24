const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const BASE_URL = `${API_BASE_URL}/events`

export async function getUserEvents(userId: number) {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    credentials: 'include' // Send HttpOnly cookies for authentication
  })
  if (!res.ok) throw new Error("Failed to fetch events")
  return res.json()
}

export async function createEvent(userId: number, eventData: any) {
  const res = await fetch(`${BASE_URL}/user/${userId}`, {
    method: "POST",
    credentials: 'include', // Send HttpOnly cookies for authentication
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData)
  })
  if (!res.ok) throw new Error("Failed to create event")
  return res.json()
}

export async function deleteEvent(eventId: number) {
  await fetch(`${BASE_URL}/${eventId}`, {
    method: "DELETE",
    credentials: 'include' // Send HttpOnly cookies for authentication
  })
}

export async function updateEvent(eventId: number, eventData: any) {
  const res = await fetch(`${BASE_URL}/${eventId}`, {
    method: "PUT",
    credentials: 'include', // Send HttpOnly cookies for authentication
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventData)
  })
  if (!res.ok) throw new Error("Failed to update event")
  return res.json()
}

export async function deleteEventsByCourse(userId: number, courseId: string) {
  await fetch(`${BASE_URL}/user/${userId}/course/${courseId}`, {
    method: "DELETE",
    credentials: 'include' // Send HttpOnly cookies for authentication
  })
}
