'use client';

import Link from 'next/link';
import { useDeferredValue, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import { useAuth } from '@/context/AuthContext';
import { useSchedule } from '@/context/ScheduleContext';
import {
  Course,
  DayKey,
  FILTER_OPTIONS,
  FilterKey,
  getFilterValue,
  meetingDaysLabel,
  meetingRoomLabel,
  meetingTimeLabel,
} from '@/lib/schedule-data';
import { mapApiCourses } from '@/lib/api-mapper';
import {
  getCoursesByName,
  fetchCoursesFromMls,
} from '@/services/api';

const COMPACT_PREVIEW_DAYS: DayKey[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type FetchState = 'idle' | 'loading' | 'error';

export default function CourseFinderWorkspace() {
  const { user } = useAuth();
  const router = useRouter();
  const { selectedCourses, addCourse, hasCourse } = useSchedule();

  // Search / filter state
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('classCode');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  // Course search state
  const [courseNameInput, setCourseNameInput] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ID number state (used for MLS scraper)

  // Confirm-pick modal
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);

  // Redirect to login if not authenticated
  if (!user) {
    router.replace('/login');
    return null;
  }

  const displayName = user.email.split('@')[0].toUpperCase();

  // Filter the loaded courses client-side
  const filteredCourses = courses.filter((course) => {
    if (!deferredQuery) return true;
    return getFilterValue(course, selectedFilter)
      .toLowerCase()
      .includes(deferredQuery);
  });

  // ---- DB lookup (fast) ----
  const handleDbSearch = useCallback(async () => {
    const name = courseNameInput.trim();
    if (!name) return;

    setFetchState('loading');
    setFetchError(null);

    try {
      const rows = await getCoursesByName(name);
      setCourses(mapApiCourses(rows));
      setFetchState('idle');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setFetchError(msg);
      setFetchState('error');
    }
  }, [courseNameInput]);

  // ---- MLS scraper (slower, needs ID number) ----
  const handleMlsFetch = useCallback(async () => {
    const name = courseNameInput.trim();

    if (!name) {
      setFetchError('Enter a course name first.');
      return;
    }

    setFetchState('loading');
    setFetchError(null);

    try {
      // Fire-and-forget scrape; result comes back from the same endpoint
      await fetchCoursesFromMls(idNum, name);
      // Then do a fast DB read to get the structured rows
      const rows = await getCoursesByName(name);
      setCourses(mapApiCourses(rows));
      setFetchState('idle');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fetch from MLS failed';
      setFetchError(msg);
      setFetchState('error');
    }
  }, [courseNameInput]);

  function handleConfirmPick() {
    if (!pendingCourse) return;
    addCourse(pendingCourse);
    setPendingCourse(null);
  }

  const isLoading = fetchState === 'loading';

  return (
    <>
      <main className="min-h-screen bg-[#F5F7FA] px-4 py-5 text-[#4B5563] lg:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-[1560px] space-y-4">
          {/* Header */}
          <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5C6B80]">
                  Home
                </p>
                <h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-[#111827]">
                  Course Finder
                </h1>
                <p className="mt-1 text-sm leading-6 text-[#4B5563]">
                  Hi {displayName}. Search for a course below, pick your
                  sections, then open Schedule for the full weekly layout.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm">
                  <span className="font-semibold text-[#111827]">
                    {selectedCourses.length}
                  </span>{' '}
                  picked course{selectedCourses.length === 1 ? '' : 's'}
                </div>
                <Link
                  href="/schedule"
                  className="rounded-xl bg-[#5C6B80] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#526175]"
                >
                  Open Schedule
                </Link>
              </div>
            </div>
          </section>

          <div className="grid w-full items-start justify-center gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(360px,4fr)]">
            <section className="w-full space-y-4">
              {/* Course search bar */}
              <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3">
                {/* Row 1: Course name + DLSU ID */}
                <div className="grid gap-3 sm:grid-cols-2">
                </div>

                {/* Row 2: Action buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDbSearch}
                    disabled={isLoading || !courseNameInput.trim()}
                    className="rounded-xl bg-[#5C6B80] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#526175] disabled:opacity-50"
                  >
                    {isLoading ? 'Searching…' : 'Search DB'}
                  </button>
                  <button
                    type="button"
                    onClick={handleMlsFetch}
                    disabled={isLoading || !courseNameInput.trim()}
                    className="rounded-xl border border-[#5C6B80] px-4 py-2.5 text-sm font-semibold text-[#5C6B80] transition hover:bg-[#5C6B80] hover:text-white disabled:opacity-50"
                  >
                    {isLoading ? 'Syncing…' : 'Sync from MLS'}
                  </button>
                  <p className="self-center text-xs text-[#94A3B8]">
                    "Search DB" is instant. "Sync from MLS" scrapes the latest
                    data (needs ID number, ~10 s).
                  </p>
                </div>

                {fetchError && (
                  <p className="text-sm text-red-600 font-medium">
                    ⚠ {fetchError}
                  </p>
                )}

                {/* Row 3: Client-side filter */}
                {courses.length > 0 && (
                  <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
                    <label className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                        Filter Results
                      </span>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Filter by ${
                          FILTER_OPTIONS.find(
                            (o) => o.value === selectedFilter,
                          )?.label.toLowerCase()
                        }`}
                        className="mt-1.5 w-full bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8]"
                      />
                    </label>

                    <label className="rounded-xl border border-[#5C6B80] bg-[#5C6B80] px-4 py-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                        Filter Target
                      </span>
                      <select
                        value={selectedFilter}
                        onChange={(e) =>
                          setSelectedFilter(e.target.value as FilterKey)
                        }
                        className="mt-1.5 w-full bg-transparent text-sm font-medium text-white outline-none"
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
                )}
              </div>

              {/* Results table */}
              <div className="w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
                <table className="w-full table-fixed border-collapse text-left">
                  <thead className="bg-[#5C6B80] text-white">
                    <tr className="text-left text-[12px] font-semibold">
                      <th className="w-[76px] px-3 py-2 sm:px-4 sm:py-3">Action</th>
                      <th className="w-[84px] px-3 py-2 sm:px-4 sm:py-3">Code</th>
                      <th className="w-[90px] px-3 py-2 sm:px-4 sm:py-3">Section</th>
                      <th className="w-[148px] px-3 py-2 sm:px-4 sm:py-3">Professor</th>
                      <th className="w-[148px] px-3 py-2 sm:px-4 sm:py-3">Remarks</th>
                      <th className="w-[124px] px-3 py-2 sm:px-4 sm:py-3">Time</th>
                      <th className="w-[76px] px-3 py-2 sm:px-4 sm:py-3">Days</th>
                      <th className="w-[104px] px-3 py-2 sm:px-4 sm:py-3">Room</th>
                      <th className="w-[78px] px-3 py-2 sm:px-4 sm:py-3">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-[#64748B]"
                        >
                          <span className="animate-pulse">
                            Fetching courses…
                          </span>
                        </td>
                      </tr>
                    ) : filteredCourses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-10 text-center text-sm text-[#64748B]"
                        >
                          {courses.length === 0
                            ? 'Search for a course above to get started.'
                            : 'No sections match the current filter. Try a broader search.'}
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => {
                        const isSelected = hasCourse(course.id);
                        return (
                          <tr
                            key={course.id}
                            className="border-t border-[#E5E7EB] text-[12px] text-[#4B5563] align-top"
                          >
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <button
                                type="button"
                                onClick={() => setPendingCourse(course)}
                                disabled={isSelected}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                  isSelected
                                    ? 'cursor-not-allowed bg-[#F3F4F6] text-[#9CA3AF]'
                                    : 'bg-[#E8C971] text-[#111827] hover:bg-[#ddc05d]'
                                }`}
                              >
                                {isSelected ? 'Added' : 'Pick'}
                              </button>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-[#111827] whitespace-normal break-words">
                              {course.code}
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <p className="font-semibold text-[#111827]">
                                {course.section}
                              </p>
                              <p className="mt-0.5 text-[11px] text-[#64748B]">
                                Class #{course.classNumber}
                              </p>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-normal break-words leading-tight">
                              {course.professor}
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-normal break-words leading-tight">
                              <p>{course.remarks}</p>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-normal break-words leading-tight">
                              {meetingTimeLabel(course.meetings)}
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-normal">
                              {meetingDaysLabel(course.meetings)}
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-normal break-words leading-tight">
                              {meetingRoomLabel(course.meetings)}
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-[#111827]">
                              {course.enrolled}/{course.capacity}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right sidebar */}
            <aside className="w-full space-y-4">
              <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#5C6B80]">
                      Mini Schedule
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#111827]">
                      Quick Preview
                    </h2>
                  </div>
                  <span className="rounded-lg bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">
                    Mon–Sat
                  </span>
                </div>
                <div className="mt-3 w-full">
                  <ScheduleCalendar
                    courses={selectedCourses}
                    days={[...COMPACT_PREVIEW_DAYS]}
                    rowHeight={22}
                    compact
                    timeColumnWidth={60}
                  />
                </div>
              </section>

              <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#111827]">
                    Selected Courses
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    {selectedCourses.length} total
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {selectedCourses.length > 0 ? (
                    selectedCourses.map((course) => (
                      <div
                        key={course.id}
                        className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3"
                      >
                        <p className="text-sm font-bold text-[#111827]">
                          {course.code}-{course.section}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">
                          {course.professor}
                        </p>
                        <div className="mt-2 space-y-1 text-[11px] text-[#4B5563]">
                          <p>{meetingDaysLabel(course.meetings)}</p>
                          <p>{meetingTimeLabel(course.meetings)}</p>
                          <p>{meetingRoomLabel(course.meetings)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-center text-sm text-[#64748B]">
                      No course picked yet. Search above to build your schedule.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* Confirm pick modal */}
      {pendingCourse ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/35 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <p className="text-sm font-semibold text-[#5C6B80]">
              Confirm selection
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold text-[#111827]">
              Add {pendingCourse.code}-{pendingCourse.section}?
            </h2>
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#4B5563]">
              <p className="font-semibold text-[#111827]">
                {pendingCourse.professor}
              </p>
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
