const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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

interface AuthResponse {
  jwtString: string;
  user: {
    email: string;
    givenName: string;
    familyName: string;
    userId: string;
    pictureUrl: string;
  };
}

export async function loginWithGoogle(accessToken: string): Promise<string> {
  const res = await apiFetch<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token: accessToken }),
  });
  return res.jwtString;
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

export interface ApiTimeslot {
  id: number;
  day: string;
  time: string;
  room: string;
  instructor: string;
  courseId: number;
}

export interface ApiCourseStatus {
  id: number;
  enrollCap: number;
  enrolled: number;
  courseId: number;
}

export interface ApiCourseRow {
  id: number;
  courseName: string;
  section: string;
  modality: string | null;
  term: string | null;
  status: ApiCourseStatus;
  timeslots: ApiTimeslot[];
}

export async function getCoursesByName(courseName: string): Promise<ApiCourseRow[]> {
  return apiFetch<ApiCourseRow[]>(`/courses/search/${encodeURIComponent(courseName.toUpperCase())}`);
}

export async function triggerCourseFetch(part: number, term: number): Promise<void> {
  return apiFetch<void>('/courses/fetch', {
    method: 'POST',
    body: JSON.stringify({ part, term }),
  });
}

export interface ApiSelectedCourse {
  sid: number;
  courseId: number;
  userId: number;
  courseName?: string;
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