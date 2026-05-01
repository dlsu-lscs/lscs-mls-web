"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import Navbar from "@/components/Navbar";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import { useAuth } from "@/context/AuthContext";
import { useSchedule } from "@/context/ScheduleContext";
import {
  COURSES,
  FILTER_OPTIONS,
  FINDER_DAYS,
  FilterKey,
  getFilterValue,
  meetingDaysLabel,
  meetingRoomLabel,
  meetingTimeLabel,
  TERM_OPTIONS,
  Course,
} from "@/lib/schedule-data";

export default function MlsSchedulePage() {
  const { user } = useAuth();
  const {
    selectedTerm,
    selectedCourses,
    setSelectedTerm,
    addCourse,
    hasCourse,
  } = useSchedule();
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("classCode");
  const [query, setQuery] = useState("");
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const userId = user?.email?.split("@")[0]?.toUpperCase() || "STUDENT";

  const filteredCourses = COURSES.filter((course) => {
    if (!deferredQuery) {
      return true;
    }

    return getFilterValue(course, selectedFilter).toLowerCase().includes(deferredQuery);
  });

  function handleConfirmPick() {
    if (!pendingCourse) {
      return;
    }

    addCourse(pendingCourse);
    setPendingCourse(null);
  }

  return (
    <>
      <Navbar
        termOptions={TERM_OPTIONS}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
      />

      <main className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#4B5563] lg:px-6 xl:px-8">
        <div className="mx-auto max-w-[1580px] space-y-6">
          <section className="rounded-2xl border border-[#E5E7EB] bg-white px-6 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#5C6B80]">
              MLS Schedule
            </p>
            <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h1 className="text-[34px] font-extrabold tracking-tight text-[#111827]">
                  Course Finder
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4B5563]">
                  Hi {userId}. Focus on comparing sections here, then use the side preview
                  for quick schedule context before opening the full `Schedule`
                  workspace.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3 text-sm">
                  <span className="font-semibold text-[#111827]">{selectedCourses.length}</span>{" "}
                  picked course{selectedCourses.length === 1 ? "" : "s"}
                </div>
                <Link
                  href="/schedule"
                  className="rounded-xl bg-[#5C6B80] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#526175]"
                >
                  Open Full Schedule
                </Link>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
            <section className="space-y-5">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                  <label className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#64748B]">
                      Main Search
                    </span>
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={`Search by ${FILTER_OPTIONS.find((option) => option.value === selectedFilter)?.label.toLowerCase()}`}
                      className="mt-2 w-full bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8]"
                    />
                  </label>

                  <label className="rounded-xl border border-[#5C6B80] bg-[#5C6B80] px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                      Filter Target
                    </span>
                    <select
                      value={selectedFilter}
                      onChange={(event) => setSelectedFilter(event.target.value as FilterKey)}
                      className="mt-2 w-full bg-transparent text-sm font-medium text-white outline-none"
                    >
                      {FILTER_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-[#5C6B80] text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
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
                        const isSelected = hasCourse(course.id);

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
                                    : "bg-[#E8C971] text-[#111827] hover:bg-[#ddc05d]"
                                }`}
                              >
                                {isSelected ? "Added" : "Pick"}
                              </button>
                            </td>
                            <td className="px-5 py-4 font-semibold text-[#111827]">
                              {course.code}
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#111827]">{course.section}</p>
                              <p className="mt-1 text-xs text-[#64748B]">
                                Class #{course.classNumber}
                              </p>
                            </td>
                            <td className="px-5 py-4">{course.professor}</td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-[#111827]">{course.modality}</p>
                              <p className="mt-1 text-xs text-[#64748B]">{course.remarks}</p>
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
                          <td colSpan={9} className="px-5 py-12 text-center text-sm text-[#64748B]">
                            No sections match the current filter. Try a broader search.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#5C6B80]">Mini Schedule</p>
                    <h2 className="mt-1 text-2xl font-extrabold text-[#111827]">
                      Quick Preview
                    </h2>
                  </div>
                  <Link
                    href="/schedule"
                    className="text-sm font-semibold text-[#5C6B80] underline-offset-4 hover:underline"
                  >
                    Expand
                  </Link>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <ScheduleCalendar
                    courses={selectedCourses}
                    days={FINDER_DAYS}
                    rowHeight={18}
                    compact
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
                <h3 className="text-lg font-bold text-[#111827]">Selected Courses</h3>
                <div className="mt-4 space-y-3">
                  {selectedCourses.length > 0 ? (
                    selectedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4"
                      >
                        <p className="text-sm font-bold text-[#111827]">
                          {course.code}-{course.section}
                        </p>
                        <p className="mt-1 text-xs text-[#64748B]">{course.professor}</p>
                        <p className="mt-2 text-xs text-[#4B5563]">
                          {meetingDaysLabel(course.meetings)} |{" "}
                          {meetingTimeLabel(course.meetings)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-6 text-center text-sm text-[#64748B]">
                      No course picked yet. Use the table to build your schedule.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {pendingCourse ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/35 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <p className="text-sm font-semibold text-[#5C6B80]">Confirm selection</p>
            <h2 className="mt-2 text-[28px] font-extrabold text-[#111827]">
              Add {pendingCourse.code}-{pendingCourse.section}?
            </h2>
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#4B5563]">
              <p className="font-semibold text-[#111827]">{pendingCourse.professor}</p>
              <p>{pendingCourse.remarks}</p>
              <p>{meetingDaysLabel(pendingCourse.meetings)}</p>
              <p>{meetingTimeLabel(pendingCourse.meetings)}</p>
              <p>{meetingRoomLabel(pendingCourse.meetings)}</p>
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
