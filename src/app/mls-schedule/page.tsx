"use client";

import { Fragment, useState } from 'react';

//basic attributes for a course
type Course = {
  id: string;
  name: string;
  timeLabel: string;
  slot: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
};

//Fake data for testing
const COURSES: Course[] = [
  {
    id: 'ics-101',
    name: 'ICS 101',
    timeLabel: '9:00 - 10:00',
    slot: '9am',
    day: 'Monday',
  },
  {
    id: 'math-202',
    name: 'MATH 202',
    timeLabel: '10:00 - 11:00',
    slot: '10am',
    day: 'Tuesday',
  },
  {
    id: 'eng-303',
    name: 'ENG 303',
    timeLabel: '2:00 - 3:00',
    slot: '2pm',
    day: 'Wednesday',
  },
];

//days of the week and time for the clalendar component
const DAYS: Course['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'] as const;

type ScheduleState = Partial<Record<Course['day'], Partial<Record<(typeof TIME_SLOTS)[number], string>>>>;

export default function SchedulerPage() {
  const [schedule, setSchedule] = useState<ScheduleState>({});

  const handleAddCourse = (course: Course) => {
    setSchedule((prev) => {
      const updatedDay = { ...(prev[course.day] ?? {}), [course.slot]: course.name };
      return { ...prev, [course.day]: updatedDay };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:w-2/5">
          <h1 className="text-2xl font-semibold text-gray-900">Course List</h1>
          <p className="mt-1 text-sm text-gray-500">Add a course to populate the calendar.</p>

          <table className="mt-6 w-full table-fixed border-collapse text-left text-sm text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Day</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 last:border-none">
                  <td className="py-3 pr-2 font-medium text-gray-900">{course.name}</td>
                  <td className="py-3 pr-2">{course.timeLabel}</td>
                  <td className="py-3 pr-2">{course.day.slice(0, 3)}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleAddCourse(course)}
                      className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full rounded-lg bg-white p-6 shadow-sm lg:w-3/5">
          <h2 className="text-2xl font-semibold text-gray-900">Weekly Calendar</h2>
          <div className="mt-4 overflow-x-auto">
            <div className="grid min-w-full grid-cols-6 gap-px rounded-lg bg-gray-200 text-center text-sm font-medium text-gray-600">
              <div className="rounded-tl-lg bg-white px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                Time
              </div>
              {DAYS.map((day) => (
                <div key={day} className="bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                  {day.slice(0, 3)}
                </div>
              ))}
              {TIME_SLOTS.map((slot, index) => (
                <Fragment key={slot}>
                  <div
                    className={`bg-white px-3 py-4 text-left text-sm font-semibold text-gray-500 ${
                      index === TIME_SLOTS.length - 1 ? 'rounded-bl-lg' : ''
                    }`}
                  >
                    {slot}
                  </div>
                  {DAYS.map((day, dayIndex) => {
                    const courseName = schedule[day]?.[slot];
                    const isBottomRow = index === TIME_SLOTS.length - 1;
                    const isRightMost = dayIndex === DAYS.length - 1;

                    return (
                      <div
                        key={`${day}-${slot}`}
                        className={`flex min-h-[64px] items-center justify-center bg-white px-3 py-2 ${
                          isBottomRow && isRightMost ? 'rounded-br-lg' : ''
                        }`}
                      >
                        {courseName ? (
                          <span className="w-full rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                            {courseName}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
