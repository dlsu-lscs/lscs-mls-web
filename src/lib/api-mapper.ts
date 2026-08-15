import type { ApiCourseRow } from '@/services/api';
import type { Course, DayKey, Meeting } from '@/lib/schedule-data';

const DAY_MAP: Record<string, DayKey> = {
  M:         'Monday',
  T:         'Tuesday',
  W:         'Wednesday',
  TH:        'Thursday',
  F:         'Friday',
  S:         'Saturday',
  Monday:    'Monday',
  Tuesday:   'Tuesday',
  Wednesday: 'Wednesday',
  Thursday:  'Thursday',
  Friday:    'Friday',
  Saturday:  'Saturday',
};

function parseDay(raw: string): DayKey {
  return DAY_MAP[raw.trim()] ?? 'Monday';
}

function parseTime(raw: string): { start: string; end: string } {
  const [start, end] = raw.split('-');
  return { start: start?.trim() ?? '00:00', end: end?.trim() ?? '00:00' };
}

export function mapApiCourses(rows: ApiCourseRow[]): Course[] {
  return rows.map((row) => {
    const meetings: Meeting[] = (row.timeslots ?? [])
      .filter((ts) => ts.day && ts.time)
      .map((ts) => {
        const { start, end } = parseTime(ts.time);
        return { day: parseDay(ts.day), start, end, room: ts.room ?? '' };
      });

    const professor = row.timeslots?.find((ts) => ts.instructor)?.instructor ?? '';

    return {
      id: String(row.id),
      classNumber: String(row.id),
      code: row.courseName,
      section: row.section ?? '',
      professor,
      modality: row.modality === 'Fully Online' ? 'Fully Online' : 'Hybrid',
      remarks: row.modality ?? '',
      enrolled: row.status?.enrolled ?? 0,
      capacity: row.status?.enrollCap ?? 0,
      meetings,
      term: row.term ?? '',
      campus: row.campus ?? '',
    };
  });
}
