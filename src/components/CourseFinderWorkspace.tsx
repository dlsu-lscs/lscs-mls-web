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
import { getCoursesByName, fetchCoursesFromMls } from '@/services/api';

const COMPACT_PREVIEW_DAYS: DayKey[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export default function CourseFinderWorkspace() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { selectedCourses, addCourse, hasCourse } = useSchedule();

  const [courseNameInput, setCourseNameInput] = useState('');
  const [studentId, setStudentId] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('classCode');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const [courses, setCourses] = useState<Course[]>([]);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'syncing' | 'error'>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);

  const handleSearch = useCallback(async (name: string) => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;
    setFetchState('loading');
    setFetchError(null);
    setSubmittedName(trimmed);
    try {
      const rows = await getCoursesByName(trimmed);
      setCourses(mapApiCourses(rows));
      setFetchState('idle');
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Search failed');
      setFetchState('error');
    }
  }, []);

  const handleSync = useCallback(async () => {
    const name = courseNameInput.trim().toUpperCase();
    const id = studentId.trim();
    if (!name) { setFetchError('Enter a course name first.'); return; }
    if (!id) { setFetchError('Enter your DLSU ID number to sync from MLS.'); return; }
    setFetchState('syncing');
    setFetchError(null);
    setSubmittedName(name);
    try {
      await fetchCoursesFromMls(id, name);
      const rows = await getCoursesByName(name);
      setCourses(mapApiCourses(rows));
      setFetchState('idle');
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Sync failed');
      setFetchState('error');
    }
  }, [courseNameInput, studentId]);

  const filteredCourses = courses.filter((course) => {
    if (!deferredQuery) return true;
    return getFilterValue(course, selectedFilter).toLowerCase().includes(deferredQuery);
  });

  function handleConfirmPick() {
    if (!pendingCourse) return;
    addCourse(pendingCourse);
    setPendingCourse(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-gray-500 animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  const displayName = user.email.split('@')[0].toUpperCase();
  const isLoading = fetchState === 'loading';
  const isSyncing = fetchState === 'syncing';
  const isBusy = isLoading || isSyncing;

  return (
    <>
      <main className="min-h-screen bg-[#F5F7FA] px-4 py-5 text-[#4B5563] lg:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-[1560px] space-y-4">

          <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5C6B80]">Home</p>
                <h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-[#111827]">Course Finder</h1>
                <p className="mt-1 text-sm leading-6 text-[#4B5563]">
                  Hi {displayName}. Search for a course by name, filter sections, then open Schedule for your weekly layout.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm">
                  <span className="font-semibold text-[#111827]">{selectedCourses.length}</span>{' '}
                  picked course{selectedCourses.length === 1 ? '' : 's'}
                </div>
                <Link href="/schedule" className="rounded-xl bg-[#5C6B80] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#526175]">
                  Open Schedule
                </Link>
              </div>
            </div>
          </section>

          <div className="grid w-full items-start gap-5 lg:grid-cols-[minmax(0,6fr)_minmax(360px,4fr)]">
            <section className="w-full space-y-4">

              <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3">
                <div className="flex gap-3">
                  <label className="flex-1 rounded-xl border border-[#E5E7EB] px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Course Name</span>
                    <input
                      type="text"
                      value={courseNameInput}
                      onChange={(e) => setCourseNameInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(courseNameInput); }}
                      placeholder="e.g. CCPROG1, CCAPDEV, DASALGO"
                      className="mt-1.5 w-full bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSearch(courseNameInput)}
                    disabled={isBusy || !courseNameInput.trim()}
                    className="self-stretch rounded-xl bg-[#5C6B80] px-5 text-sm font-semibold text-white transition hover:bg-[#526175] disabled:opacity-50"
                  >
                    {isLoading ? 'Searching…' : 'Search'}
                  </button>
                </div>

                <div className="flex gap-3 items-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                      Sync from MLS <span className="normal-case font-normal text-[#94A3B8]">— enter your DLSU ID to fetch latest data</span>
                    </p>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="DLSU ID number e.g. 12345678"
                      className="mt-1 w-full bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={isBusy || !courseNameInput.trim()}
                    className="shrink-0 rounded-xl border border-[#5C6B80] px-4 py-2 text-sm font-semibold text-[#5C6B80] transition hover:bg-[#5C6B80] hover:text-white disabled:opacity-50"
                  >
                    {isSyncing ? 'Syncing…' : 'Sync from MLS'}
                  </button>
                </div>

                {fetchError && <p className="text-sm text-red-600 font-medium">⚠ {fetchError}</p>}
                {isSyncing && (
                  <p className="text-sm text-[#5C6B80] animate-pulse">
                    Fetching latest data from MLS, this may take 10–15 seconds…
                  </p>
                )}

                {courses.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
                    <label className="rounded-xl border border-[#E5E7EB] px-4 py-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Filter Results</span>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Filter by ${FILTER_OPTIONS.find((o) => o.value === selectedFilter)?.label.toLowerCase()}`}
                        className="mt-1.5 w-full bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8]"
                      />
                    </label>
                    <label className="rounded-xl border border-[#5C6B80] bg-[#5C6B80] px-4 py-2.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Filter By</span>
                      <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value as FilterKey)}
                        className="mt-1.5 w-full bg-transparent text-sm font-medium text-white outline-none"
                      >
                        {FILTER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} className="bg-[#5C6B80]">{o.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="w-full overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#5C6B80] text-white text-[12px] font-semibold">
                    <tr>
                      <th className="px-3 py-3">Action</th>
                      <th className="px-3 py-3">Code</th>
                      <th className="px-3 py-3">Section</th>
                      <th className="px-3 py-3">Class #</th>
                      <th className="px-3 py-3">Professor</th>
                      <th className="px-3 py-3">Modality</th>
                      <th className="px-3 py-3">Time</th>
                      <th className="px-3 py-3">Days</th>
                      <th className="px-3 py-3">Room</th>
                      <th className="px-3 py-3">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isBusy ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-sm text-[#64748B] animate-pulse">
                          {isSyncing ? 'Syncing from MLS…' : 'Fetching courses…'}
                        </td>
                      </tr>
                    ) : courses.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-sm text-[#64748B]">
                          {submittedName
                            ? `No courses found for "${submittedName}". Try syncing from MLS to fetch the latest data.`
                            : 'Search for a course above to get started.'}
                        </td>
                      </tr>
                    ) : filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-sm text-[#64748B]">
                          No sections match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => {
                        const isSelected = hasCourse(course.id);
                        return (
                          <tr key={course.id} className="border-t border-[#E5E7EB] text-[12px] text-[#4B5563] align-top hover:bg-[#F8FAFC]">
                            <td className="px-3 py-2">
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
                                {isSelected ? 'Added' : 'Add'}
                              </button>
                            </td>
                            <td className="px-3 py-2 font-semibold text-[#111827]">{course.code}</td>
                            <td className="px-3 py-2 font-semibold text-[#111827]">{course.section}</td>
                            <td className="px-3 py-2 text-[#64748B]">{course.classNumber}</td>
                            <td className="px-3 py-2 leading-tight">{course.professor}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                course.modality === 'Fully Online'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {course.modality}
                              </span>
                            </td>
                            <td className="px-3 py-2 leading-tight">{meetingTimeLabel(course.meetings)}</td>
                            <td className="px-3 py-2">{meetingDaysLabel(course.meetings)}</td>
                            <td className="px-3 py-2 leading-tight">{meetingRoomLabel(course.meetings)}</td>
                            <td className="px-3 py-2 font-semibold text-[#111827]">{course.enrolled}/{course.capacity}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="w-full space-y-4">
              <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#5C6B80]">Mini Schedule</p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#111827]">Quick Preview</h2>
                  </div>
                  <span className="rounded-lg bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">Mon–Sat</span>
                </div>
                <ScheduleCalendar courses={selectedCourses} days={[...COMPACT_PREVIEW_DAYS]} rowHeight={22} compact timeColumnWidth={60} />
              </section>

              <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#111827]">Selected Courses</h3>
                  <span className="text-xs text-[#64748B]">{selectedCourses.length} total</span>
                </div>
                <div className="mt-3 space-y-2">
                  {selectedCourses.length > 0 ? (
                    selectedCourses.map((course) => (
                      <div key={course.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
                        <p className="text-sm font-bold text-[#111827]">{course.code}-{course.section}</p>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">{course.professor}</p>
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

      {pendingCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/35 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <p className="text-sm font-semibold text-[#5C6B80]">Confirm selection</p>
            <h2 className="mt-2 text-[28px] font-extrabold text-[#111827]">
              Add {pendingCourse.code}-{pendingCourse.section}?
            </h2>
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#4B5563]">
              <p className="font-semibold text-[#111827]">{pendingCourse.professor}</p>
              <p>{pendingCourse.modality}</p>
              <p>{meetingDaysLabel(pendingCourse.meetings)}</p>
              <p>{meetingTimeLabel(pendingCourse.meetings)}</p>
              <p>{meetingRoomLabel(pendingCourse.meetings)}</p>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setPendingCourse(null)} className="rounded-lg border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:text-[#111827]">
                Cancel
              </button>
              <button type="button" onClick={handleConfirmPick} className="rounded-lg bg-[#5C6B80] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#526175]">
                Confirm and Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}