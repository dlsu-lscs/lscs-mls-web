const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function loginWithGoogle(accessToken: string): Promise<string> {
  return apiFetch<string>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token: accessToken }),
  });
}

export interface ApiUser {
  uid: number;
  email?: string;
  givenName?: string;
  familyName?: string;
  userId: string;
  pictureUrl?: string;
}

export async function getUserById(uid: number): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/users/${uid}`);
}

export interface ApiCourseRow {
  cid: number;
  course_name: string;
  section: string;
  modality: string | null;
  term: string | null;
  eid: number;
  enroll_cap: number;
  enrolled: number;
  tid: number;
  day: string;
  time: string;
  room: string;
  instructor: string;
}

export async function getCoursesByName(courseName: string): Promise<ApiCourseRow[]> {
  const params = new URLSearchParams({ courseName: courseName.toUpperCase() });
  return apiFetch<ApiCourseRow[]>(`/courses?${params}`);
}

export async function fetchCoursesFromMls(
  idNumber: string,
  courseName: string,
): Promise<unknown[]> {
  return apiFetch<unknown[]>('/courses', {
    method: 'POST',
    body: JSON.stringify({ idNumber, courseName: courseName.toUpperCase() }),
  });
}

export interface ApiSelectedCourse {
  sid: number;
  courseId: number;
  userId: number;
  course_name?: string;
  section?: string;
  modality?: string;
  day?: string;
  time?: string;
  room?: string;
  instructor?: string;
  enroll_cap?: number;
  enrolled?: number;
}

export async function getUserSelectedCourses(uid: number): Promise<ApiSelectedCourse[]> {
  return apiFetch<ApiSelectedCourse[]>(`/users/${uid}/courses`);
}

export async function addSelectedCourse(uid: number, courseId: number): Promise<ApiSelectedCourse> {
  return apiFetch<ApiSelectedCourse>(`/users/${uid}/courses`, {
    method: 'POST',
    body: JSON.stringify({ courseId, userId: uid }),
  });
}

export async function removeSelectedCourse(uid: number, courseId: number): Promise<void> {
  return apiFetch<void>(`/users/${uid}/courses/${courseId}`, { method: 'DELETE' });
}