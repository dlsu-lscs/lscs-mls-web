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

export interface ApiTimeslot {
  id: number;
  day: string;
  time: string;
  room: string;
  instructor: string;
  courseId?: number;
}

export interface ApiCourseStatus {
  id: number;
  enrollCap: number;
  enrolled: number;
  courseId?: number;
}

export interface ApiCourseRow {
  id: number;
  courseName: string;
  section: string;
  modality: string | null;
  term: string | null;
  campus: string | null;
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
  courseId: number;
  courseName: string;
  section: string;
  modality: string | null;
  enrollCap?: number;
  enrolled?: number;
  timeslots: ApiTimeslot[];
}

// Raw shape returned by GET /users/:id/courses — a course row with nested
// enrollment status and timeslots, not the flat shape the UI wants.
interface RawUserSelectedCourse {
  id: number;
  courseName: string;
  section: string;
  modality: string | null;
  status?: { enrollCap: number; enrolled: number };
  timeslots?: ApiTimeslot[];
}

export async function getUserSelectedCourses(uid: number): Promise<ApiSelectedCourse[]> {
  const rows = await apiFetch<RawUserSelectedCourse[]>(`/users/${uid}/courses`);
  return rows.map((row) => ({
    courseId: row.id,
    courseName: row.courseName,
    section: row.section,
    modality: row.modality,
    enrollCap: row.status?.enrollCap,
    enrolled: row.status?.enrolled,
    timeslots: row.timeslots ?? [],
  }));
}

export interface ApiCreatedSelectedCourse {
  id: number;
  courseId: number;
  userId: number;
}

export async function addSelectedCourse(uid: number, courseId: number): Promise<ApiCreatedSelectedCourse> {
  // Backend route is POST /users/courses (userId comes from the body, not the path).
  return apiFetch<ApiCreatedSelectedCourse>('/users/courses', {
    method: 'POST',
    body: JSON.stringify({ courseId, userId: uid }),
  });
}

export async function removeSelectedCourse(uid: number, courseId: number): Promise<void> {
  return apiFetch<void>(`/users/${uid}/courses/${courseId}`, { method: 'DELETE' });
}

// Live ArchersHub session endpoints — used to pick which campus/term to sync via POST /courses/fetch.

export interface ApiCampus {
  campusNo: number;
  name: string;
}

export interface ApiTerm {
  sessionId: number;
  name: string;
}

export async function getCampuses(): Promise<ApiCampus[]> {
  return apiFetch<ApiCampus[]>('/campuses');
}

export async function getTerms(): Promise<ApiTerm[]> {
  return apiFetch<ApiTerm[]>('/terms');
}

// Local-DB reference endpoints — distinct unique values already synced into our database.
// Note: courseRouter is mounted before archersHubRouter in the backend, so these
// /courses/* paths always resolve here even though archersHubRouter also declares
// a (now-unreachable) /courses/list route.

export async function getCourseCampuses(): Promise<string[]> {
  return apiFetch<string[]>('/courses/campuses');
}

export async function getCourseTerms(): Promise<string[]> {
  return apiFetch<string[]>('/courses/terms');
}

export async function getCourseNames(): Promise<string[]> {
  return apiFetch<string[]>('/courses/list');
}
