"use client";

import { useDeferredValue, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

type DayKey = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

type Meeting = {
  day: DayKey;
  start: string;
  end: string;
  room: string;
};

type Course = {
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

type FilterKey =
  | "classNumber"
  | "professor"
  | "classCode"
  | "time"
  | "day"
  | "room"
  | "modality"
  | "enrolledCapacity";

type CalendarEvent = {
  id: string;
  title: string;
  professor: string;
  modality: Course["modality"];
  room: string;
  day: DayKey;
  start: number;
  end: number;
  label: string;
};

type PositionedEvent = CalendarEvent & {
  column: number;
  totalColumns: number;
};

const TERM_OPTIONS = [
  "First Trimester AY 2025-2026",
  "Second Trimester AY 2025-2026",
  "Third Trimester AY 2025-2026",
];

const DAYS: DayKey[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: "classCode", label: "Class Code" },
  { value: "classNumber", label: "Class Number" },
  { value: "professor", label: "Professor" },
  { value: "time", label: "Time" },
  { value: "day", label: "Day" },
  { value: "room", label: "Room" },
  { value: "modality", label: "Modality" },
  { value: "enrolledCapacity", label: "Enrolled Capacity" },
];

const COURSES: Course[] = [
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

const DAY_START = 7 * 60;
const DAY_END = 20 * 60;
const SLOT_MINUTES = 30;
const ROW_HEIGHT = 30;
const SLOT_COUNT = (DAY_END - DAY_START) / SLOT_MINUTES;
const CALENDAR_HEIGHT = SLOT_COUNT * ROW_HEIGHT;

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(value: string) {
  const totalMinutes = toMinutes(value);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalizedHours = hours % 12 || 12;
  return `${normalizedHours}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function dayAbbreviation(day: DayKey) {
  return day.slice(0, 3);
}

function meetingDaysLabel(meetings: Meeting[]) {
  return meetings.map((meeting) => dayAbbreviation(meeting.day)).join(" / ");
}

function meetingTimeLabel(meetings: Meeting[]) {
  const ranges = Array.from(
    new Set(meetings.map((meeting) => formatTimeRange(meeting.start, meeting.end))),
  );
  return ranges.join(", ");
}

function meetingRoomLabel(meetings: Meeting[]) {
  return Array.from(new Set(meetings.map((meeting) => meeting.room))).join(", ");
}

function getFilterValue(course: Course, filterKey: FilterKey) {
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

function buildCalendarLayouts(courses: Course[]) {
  const calendarEvents = courses.flatMap((course) =>
    course.meetings.map((meeting, index) => ({
      id: `${course.id}-${index}`,
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

  for (const day of DAYS) {
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

export default function SchedulerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTerm, setSelectedTerm] = useState(TERM_OPTIONS[0]);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("classCode");
  const [query, setQuery] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const userId = user?.email?.split("@")[0]?.toUpperCase() || "STUDENT";

  const filteredCourses = COURSES.filter((course) => {
    if (!deferredQuery) {
      return true;
    }

    return getFilterValue(course, selectedFilter).toLowerCase().includes(deferredQuery);
  });

  const calendarLayouts = buildCalendarLayouts(selectedCourses);
  const hourLabels = Array.from(
    { length: (DAY_END - DAY_START) / 60 + 1 },
    (_, index) => DAY_START + index * 60,
  );
  const timelineGuides = Array.from({ length: SLOT_COUNT + 1 }, (_, index) => index);

  function handleConfirmPick() {
    if (!pendingCourse) {
      return;
    }

    setSelectedCourses((currentCourses) => {
      if (currentCourses.some((course) => course.id === pendingCourse.id)) {
        return currentCourses;
      }

      return [...currentCourses, pendingCourse];
    });
    setPendingCourse(null);
  }

  function handleRemoveCourse(courseId: string) {
    setSelectedCourses((currentCourses) =>
      currentCourses.filter((course) => course.id !== courseId),
    );
  }

  return (
    <>
      <Navbar
        termOptions={TERM_OPTIONS}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
      />

      <main className="min-h-screen bg-white px-5 py-8 text-[#4B5563] lg:px-8">
        <div className="mx-auto max-w-[1580px]">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_1.15fr_1fr]">
            <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
              <p className="text-sm font-semibold text-[#5C6B80]">Hi {userId}</p>
              <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                Browse sections, confirm a pick, then watch the schedule preview update in real time.
              </p>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-white p-4">
              <p className="text-sm font-semibold text-[#111827]">Instructions</p>
              <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                Use the filter, search the course list, click `Pick`, and confirm before the class is added to the calendar.
              </p>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-[#F4F6F8] p-4">
              <p className="text-sm font-semibold text-[#111827]">Context / Information</p>
              <p className="mt-2 text-sm leading-6 text-[#4B5563]">
                {selectedTerm} with {filteredCourses.length} visible option
                {filteredCourses.length === 1 ? "" : "s"} and {selectedCourses.length} picked course
                {selectedCourses.length === 1 ? "" : "s"}.
              </p>
            </section>
          </div>

          <div className="grid items-start gap-[50px] xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            <section className="space-y-5">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-[30px]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#5C6B80]">Course Finder</p>
                    <h1 className="mt-2 text-[30px] font-extrabold text-[#111827]">
                      Search & Discover
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex w-fit items-center rounded-xl bg-[#E8C971] px-4 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-[#dfbf5d]"
                  >
                    Back
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-3 xl:flex-row">
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search by ${FILTER_OPTIONS.find((option) => option.value === selectedFilter)?.label.toLowerCase()}`}
                    className="h-12 flex-1 rounded-xl border border-[#E5E7EB] bg-white px-4 text-sm text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#5C6B80]"
                  />

                  <select
                    value={selectedFilter}
                    onChange={(event) => setSelectedFilter(event.target.value as FilterKey)}
                    className="h-12 min-w-[230px] rounded-xl border border-[#5C6B80] bg-[#5C6B80] px-4 text-sm font-medium text-white outline-none"
                  >
                    {FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse">
                    <thead className="bg-[#5C6B80] text-white">
                      <tr className="text-left text-[13px] font-semibold">
                        <th className="px-5 py-4">Action</th>
                        <th className="px-5 py-4">Code</th>
                        <th className="px-5 py-4">Section</th>
                        <th className="px-5 py-4">Professor</th>
                        <th className="px-5 py-4">Remarks / Modality</th>
                        <th className="px-5 py-4">Time</th>
                        <th className="px-5 py-4">Days</th>
                        <th className="px-5 py-4">Room</th>
                        <th className="px-5 py-4">Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => {
                        const isSelected = selectedCourses.some(
                          (selectedCourse) => selectedCourse.id === course.id,
                        );

                        return (
                          <tr
                            key={course.id}
                            className="border-t border-[#E5E7EB] text-[13px] text-[#4B5563]"
                          >
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => setPendingCourse(course)}
                                disabled={isSelected}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                  isSelected
                                    ? "cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]"
                                    : "bg-[#E8C971] text-[#111827] hover:bg-[#dfbf5d]"
                                }`}
                              >
                                {isSelected ? "Added" : "Pick"}
                              </button>
                            </td>
                            <td className="px-5 py-4 font-semibold text-[#111827]">{course.code}</td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#111827]">{course.section}</p>
                              <p className="mt-1 text-xs text-[#6B7280]">
                                Class #{course.classNumber}
                              </p>
                            </td>
                            <td className="px-5 py-4">{course.professor}</td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#111827]">{course.modality}</p>
                              <p className="mt-1 text-xs text-[#6B7280]">{course.remarks}</p>
                            </td>
                            <td className="px-5 py-4">{meetingTimeLabel(course.meetings)}</td>
                            <td className="px-5 py-4">{meetingDaysLabel(course.meetings)}</td>
                            <td className="px-5 py-4">{meetingRoomLabel(course.meetings)}</td>
                            <td className="px-5 py-4 font-semibold text-[#111827]">
                              {course.enrolled}/{course.capacity}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredCourses.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-5 py-12 text-center text-sm text-[#6B7280]">
                            No sections match the current filter. Try a broader search.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#E5E7EB] bg-[#F4F6F8] p-[30px]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#5C6B80]">Schedule Map</p>
                  <h2 className="mt-2 text-[30px] font-extrabold text-[#111827]">Preview</h2>
                </div>

                <button
                  type="button"
                  className="rounded-xl bg-[#5C6B80] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] transition hover:bg-[#526175]"
                >
                  Save
                </button>
              </div>

              <div className="mt-6 overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[78px_repeat(5,minmax(0,1fr))]">
                    <div className="border-b border-r border-[#E5E7EB] bg-[#F9FAFB] px-3 py-4" />
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-3 py-4 text-center"
                      >
                        <p className="text-xs font-semibold text-[#6B7280]">{dayAbbreviation(day)}</p>
                        <p className="mt-1 text-sm font-semibold text-[#111827]">{day}</p>
                      </div>
                    ))}

                    <div
                      className="relative border-r border-[#E5E7EB] bg-white"
                      style={{ height: `${CALENDAR_HEIGHT}px` }}
                    >
                      {hourLabels.map((minutes) => (
                        <span
                          key={minutes}
                          className="absolute left-0 right-3 -translate-y-1/2 text-right text-[11px] font-medium text-[#9CA3AF]"
                          style={{
                            top: `${((minutes - DAY_START) / SLOT_MINUTES) * ROW_HEIGHT}px`,
                          }}
                        >
                          {formatTime(
                            `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`,
                          )}
                        </span>
                      ))}
                    </div>

                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className="relative bg-white"
                        style={{ height: `${CALENDAR_HEIGHT}px` }}
                      >
                        {timelineGuides.map((guide) => (
                          <div
                            key={`${day}-guide-${guide}`}
                            className="absolute inset-x-0 border-t border-[#E5E7EB]"
                            style={{ top: `${guide * ROW_HEIGHT}px` }}
                          />
                        ))}

                        {calendarLayouts[day].map((event) => {
                          const top = ((event.start - DAY_START) / SLOT_MINUTES) * ROW_HEIGHT;
                          const height =
                            ((event.end - event.start) / SLOT_MINUTES) * ROW_HEIGHT;
                          const width = `calc(${100 / event.totalColumns}% - 8px)`;
                          const left = `calc(${(100 / event.totalColumns) * event.column}% + 4px)`;

                          return (
                            <article
                              key={event.id}
                              className="absolute rounded-lg border border-[#d8bc66] bg-[#E8C971] p-3 text-[#111827]"
                              style={{
                                top: `${top + 4}px`,
                                left,
                                width,
                                height: `${height - 8}px`,
                              }}
                            >
                              <p className="text-sm font-bold leading-tight">{event.title}</p>
                              <p className="mt-1 text-[11px] font-medium text-[#5B4B13]">
                                {event.modality}
                              </p>
                              <p className="mt-2 text-xs font-medium">{event.label}</p>
                              <p className="mt-1 text-xs">{event.room}</p>
                            </article>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[28px] font-extrabold text-[#111827]">Course/s Picked</h3>
                  <span className="text-sm text-[#6B7280]">{selectedCourses.length} selected</span>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedCourses.length > 0 ? (
                    selectedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-bold text-[#111827]">
                              {course.code}-{course.section}
                            </p>
                            <p className="mt-1 text-sm text-[#4B5563]">{course.professor}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(course.id)}
                            className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#5C6B80] transition hover:border-[#CBD5E1] hover:text-[#111827]"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 grid gap-2 text-sm text-[#4B5563] sm:grid-cols-3">
                          <p>{course.modality}</p>
                          <p>{meetingDaysLabel(course.meetings)}</p>
                          <p>{meetingTimeLabel(course.meetings)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-4 py-8 text-center text-sm text-[#6B7280]">
                      Pick a course from the finder to populate this schedule summary.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {pendingCourse ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/35 px-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white p-6">
            <p className="text-sm font-semibold text-[#5C6B80]">Confirm selection</p>
            <h2 className="mt-2 text-[28px] font-extrabold text-[#111827]">
              Add {pendingCourse.code}-{pendingCourse.section}?
            </h2>

            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#4B5563]">
              <p className="font-semibold text-[#111827]">{pendingCourse.professor}</p>
              <p className="mt-2">{pendingCourse.remarks}</p>
              <p className="mt-2">{meetingDaysLabel(pendingCourse.meetings)}</p>
              <p className="mt-1">{meetingTimeLabel(pendingCourse.meetings)}</p>
              <p className="mt-1">{meetingRoomLabel(pendingCourse.meetings)}</p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPendingCourse(null)}
                className="rounded-lg border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:border-[#CBD5E1] hover:text-[#111827]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPick}
                className="rounded-lg bg-[#5C6B80] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#526175]"
              >
                Confirm and Add
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
