/**
 * api-mapper.ts
 *
 * Converts flat JOIN rows from the backend into the Course[] type
 * the frontend calendar expects.
 *
 * DB column reference (updated schema):
 *   courses:            cid, courseName, section, modality, term
 *   course_enrollments: eid, enroll_cap, enrolled, course_id
 *   course_timeslots:   tid, day, time, room, instructor, course_id
 *
 * `day`  — DLSU abbreviations: M, T, W, TH, F, S
 * `time` — "HH:MM-HH:MM", e.g. "09:15-10:45"
 */

import type { ApiCourseRow } from '@/services/api';
import type { Course, DayKey, Meeting } from '@/lib/schedule-data';

const DAY_MAP: Record<string, DayKey> = {
  M:        'Monday',
  T:        'Tuesday',
  W:        'Wednesday',
  TH:       'Thursday',
  F:        'Friday',
  S:        'Saturday',
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
  const map = new Map<number, Course>();

  for (const row of rows) {
    if (!map.has(row.cid)) {
      map.set(row.cid, {
        id: String(row.cid),
        classNumber: String(row.cid), // class_number no longer in schema; use cid
        code: row.courseName,
        section: row.section ?? '',
        professor: '',
        modality: (row.modality === 'Fully Online' ? 'Fully Online' : 'Hybrid'),
        remarks: row.modality ?? '',
        enrolled: row.enrolled ?? 0,
        capacity: row.enroll_cap ?? 0,
        meetings: [],
      });
    }

    const course = map.get(row.cid)!;

    if (row.day && row.time) {
      const { start, end } = parseTime(row.time);
      course.meetings.push({
        day: parseDay(row.day),
        start,
        end,
        room: row.room ?? '',
      });

      if (!course.professor && row.instructor) {
        course.professor = row.instructor;
      }
    }
  }

  return Array.from(map.values());
}
