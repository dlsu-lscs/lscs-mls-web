export type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type Meeting = {
  day: DayKey;
  start: string;
  end: string;
  room: string;
};

export type Course = {
  id: string;
  classNumber: string;
  code: string;
  section: string;
  professor: string;
  modality: "Fully Online" | "Hybrid";
  remarks: string;
  enrolled: number;
  capacity: number;
  meetings: Meeting[];
};

export type FilterKey =
  | "classNumber"
  | "professor"
  | "classCode"
  | "time"
  | "day"
  | "room"
  | "modality"
  | "enrolledCapacity";

export type CalendarEvent = {
  id: string;
  courseId: string;
  title: string;
  professor: string;
  modality: Course["modality"];
  room: string;
  day: DayKey;
  start: number;
  end: number;
  label: string;
};

export type PositionedEvent = CalendarEvent & {
  column: number;
  totalColumns: number;
};

export const TERM_OPTIONS = [
  "3rd Trimester AY 2025-2026",
  "2nd Trimester AY 2025-2026",
  "1st Trimester AY 2025-2026",
  "3rd Trimester AY 2024-2025",
  "2nd Trimester AY 2024-2025",
  "1st Trimester AY 2024-2025",
];

// Maps display term names to the relative term number expected by POST /courses/fetch.
// 0 = current active term, 1 = most recent past term, 2 = second most recent, etc.
export const TERM_NUMBER_MAP: Record<string, number> = {
  "3rd Trimester AY 2025-2026": 0,
  "2nd Trimester AY 2025-2026": 1,
  "1st Trimester AY 2025-2026": 2,
  "3rd Trimester AY 2024-2025": 3,
  "2nd Trimester AY 2024-2025": 4,
  "1st Trimester AY 2024-2025": 5,
};

// part values as expected by POST /courses/fetch: 0=Manila, -1=Laguna
export const CAMPUS_OPTIONS: { label: string; value: number }[] = [
  { label: "Manila", value: 0 },
  { label: "Laguna", value: -1 },
];

export const FINDER_DAYS: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const SCHEDULE_DAYS: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: "classCode", label: "Class Code" },
  { value: "classNumber", label: "Class Number" },
  { value: "professor", label: "Professor" },
  { value: "time", label: "Time" },
  { value: "day", label: "Day" },
  { value: "room", label: "Room" },
  { value: "modality", label: "Modality" },
  { value: "enrolledCapacity", label: "Enrolled Capacity" },
];

export const COURSES: Course[] = [
  {
    id: "ccprog1-s11",
    classNumber: "1432",
    code: "CCPROG1",
    section: "S11",
    professor: "Prof. Andrea Cruz",
    modality: "Hybrid",
    remarks: "Hybrid - Lab-intensive",
    enrolled: 34,
    capacity: 40,
    meetings: [
      { day: "Monday", start: "09:15", end: "10:45", room: "AG1707" },
      { day: "Thursday", start: "09:15", end: "10:45", room: "AG1707" },
    ],
  },
  {
    id: "csmath1-s14",
    classNumber: "1508",
    code: "CSMATH1",
    section: "S14",
    professor: "Prof. Luis Mendoza",
    modality: "Fully Online",
    remarks: "Fully Online - Synchronous",
    enrolled: 28,
    capacity: 35,
    meetings: [
      { day: "Tuesday", start: "11:00", end: "12:30", room: "Zoom Room A" },
      { day: "Friday", start: "11:00", end: "12:30", room: "Zoom Room A" },
    ],
  },
  {
    id: "sts-s19",
    classNumber: "1620",
    code: "STS",
    section: "S19",
    professor: "Prof. Beatrice Santos",
    modality: "Hybrid",
    remarks: "Hybrid - Lecture",
    enrolled: 37,
    capacity: 40,
    meetings: [
      { day: "Wednesday", start: "13:00", end: "14:30", room: "SJ110" },
      { day: "Friday", start: "13:00", end: "14:30", room: "SJ110" },
    ],
  },
  {
    id: "geethic-s08",
    classNumber: "1711",
    code: "GEETHIC",
    section: "S08",
    professor: "Prof. Miguel Reyes",
    modality: "Fully Online",
    remarks: "Fully Online - Asynchronous support",
    enrolled: 22,
    capacity: 35,
    meetings: [
      { day: "Tuesday", start: "08:00", end: "09:30", room: "Canvas + Zoom" },
      { day: "Thursday", start: "08:00", end: "09:30", room: "Canvas + Zoom" },
    ],
  },
  {
    id: "dasalgo-s22",
    classNumber: "1854",
    code: "DASALGO",
    section: "S22",
    professor: "Prof. Katrina Lim",
    modality: "Hybrid",
    remarks: "Hybrid - Problem-solving studio",
    enrolled: 19,
    capacity: 30,
    meetings: [
      { day: "Monday", start: "14:45", end: "16:15", room: "G305" },
      { day: "Wednesday", start: "14:45", end: "16:15", room: "G305" },
    ],
  },
  {
    id: "itnet01-s05",
    classNumber: "1902",
    code: "ITNET01",
    section: "S05",
    professor: "Prof. Rafael Ong",
    modality: "Hybrid",
    remarks: "Hybrid - Networking lab",
    enrolled: 26,
    capacity: 32,
    meetings: [{ day: "Tuesday", start: "16:00", end: "18:00", room: "M303" }],
  },
  {
    id: "csarch1-s03",
    classNumber: "1988",
    code: "CSARCH1",
    section: "S03",
    professor: "Prof. Nina Garcia",
    modality: "Hybrid",
    remarks: "Hybrid - Studio format",
    enrolled: 24,
    capacity: 30,
    meetings: [{ day: "Thursday", start: "15:00", end: "18:00", room: "VEL201" }],
  },
];

export const DAY_START = 7 * 60;
export const DAY_END = 21 * 60;
export const SLOT_MINUTES = 30;

export function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatTime(value: string) {
  const totalMinutes = toMinutes(value);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function dayAbbreviation(day: DayKey) {
  return day.slice(0, 3);
}

export function meetingDaysLabel(meetings: Meeting[]) {
  const seen = new Set<string>();
  return meetings
    .map((m) => dayAbbreviation(m.day))
    .filter((abbr) => (seen.has(abbr) ? false : seen.add(abbr) && true))
    .join(" / ");
}

export function meetingTimeLabel(meetings: Meeting[]) {
  const ranges = Array.from(
    new Set(meetings.map((meeting) => formatTimeRange(meeting.start, meeting.end))),
  );
  return ranges.join(", ");
}

export function meetingRoomLabel(meetings: Meeting[]) {
  return Array.from(new Set(meetings.map((meeting) => meeting.room))).join(", ");
}

export function getFilterValue(course: Course, filterKey: FilterKey) {
  switch (filterKey) {
    case "classNumber":
      return course.classNumber;
    case "professor":
      return course.professor;
    case "classCode":
      return `${course.code} ${course.section}`;
    case "time":
      return meetingTimeLabel(course.meetings);
    case "day":
      return `${meetingDaysLabel(course.meetings)} ${course.meetings.map((meeting) => meeting.day).join(" ")}`;
    case "room":
      return meetingRoomLabel(course.meetings);
    case "modality":
      return `${course.modality} ${course.remarks}`;
    case "enrolledCapacity":
      return `${course.enrolled}/${course.capacity}`;
    default:
      return "";
  }
}

export function buildCalendarLayouts(courses: Course[], days: DayKey[]) {
  const calendarEvents = courses.flatMap((course) =>
    course.meetings.map((meeting, index) => ({
      id: `${course.id}-${index}`,
      courseId: course.id,
      title: `${course.code}-${course.section}`,
      professor: course.professor,
      modality: course.modality,
      room: meeting.room,
      day: meeting.day,
      start: toMinutes(meeting.start),
      end: toMinutes(meeting.end),
      label: formatTimeRange(meeting.start, meeting.end),
    })),
  );

  const layouts = {} as Record<DayKey, PositionedEvent[]>;

  for (const day of days) {
    const events = calendarEvents
      .filter((event) => event.day === day)
      .sort((left, right) => left.start - right.start || left.end - right.end);
    const active: PositionedEvent[] = [];
    const group: PositionedEvent[] = [];
    const positioned: PositionedEvent[] = [];
    let groupMaxColumns = 0;

    for (const event of events) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (active[index].end <= event.start) {
          active.splice(index, 1);
        }
      }

      if (active.length === 0 && group.length > 0) {
        for (const groupedEvent of group) {
          groupedEvent.totalColumns = groupMaxColumns;
        }
        group.length = 0;
        groupMaxColumns = 0;
      }

      const occupied = new Set(active.map((activeEvent) => activeEvent.column));
      let column = 0;
      while (occupied.has(column)) {
        column += 1;
      }

      const positionedEvent: PositionedEvent = {
        ...event,
        column,
        totalColumns: 1,
      };

      active.push(positionedEvent);
      group.push(positionedEvent);
      positioned.push(positionedEvent);
      groupMaxColumns = Math.max(groupMaxColumns, active.length, column + 1);
    }

    for (const groupedEvent of group) {
      groupedEvent.totalColumns = groupMaxColumns || 1;
    }

    layouts[day] = positioned;
  }

  return layouts;
}
