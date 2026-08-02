'use client';

import Link from 'next/link';
import { useDeferredValue, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ScheduleCalendar, { EVENT_THEMES } from '@/components/ScheduleCalendar';
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
import { getCoursesByName, getCourseList } from '@/services/api';

const COMPACT_PREVIEW_DAYS: DayKey[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

// Filter keys that should show a dropdown of unique values
const DROPDOWN_FILTERS = new Set<FilterKey>([
  'professor', 'modality', 'day', 'room',
]);

// ── Conflict detection ─────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

interface ConflictResult {
  hasConflict: boolean;
  conflictWith?: string;
}

function checkConflict(candidate: Course, selected: Course[]): ConflictResult {
  for (const existing of selected) {
    for (const cm of candidate.meetings) {
      for (const em of existing.meetings) {
        if (cm.day !== em.day) continue;
        const cStart = timeToMinutes(cm.start);
        const cEnd   = timeToMinutes(cm.end);
        const eStart = timeToMinutes(em.start);
        const eEnd   = timeToMinutes(em.end);
        // Overlap when one starts before the other ends
        if (cStart < eEnd && cEnd > eStart) {
          return {
            hasConflict: true,
            conflictWith: `${existing.code}-${existing.section} on ${cm.day} (${cm.start}–${cm.end})`,
          };
        }
      }
    }
  }
  return { hasConflict: false };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function CourseFinderWorkspace() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { selectedCourses, addCourse, removeCourse, hasCourse, campusNo, sessionId } = useSchedule();

  const [courseNameInput, setCourseNameInput] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('classCode');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const [courses, setCourses] = useState<Course[]>([]);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Autocomplete ─────────────────────────────────────────────────────────

  const [allCourseNames, setAllCourseNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Reload course list whenever campus or term changes
  useEffect(() => {
    if (campusNo === null || sessionId === null) return;
    getCourseList(campusNo, sessionId)
      .then((items) => setAllCourseNames(items.map((i) => i.name).sort()))
      .catch(() => {});
  }, [campusNo, sessionId]);

  // Filtered suggestions — cap at 10 for performance
  const suggestions = useMemo(() => {
    const q = courseNameInput.trim().toUpperCase();
    if (!q) return allCourseNames.slice(0, 10);
    return allCourseNames.filter((n) => n.includes(q)).slice(0, 10);
  }, [allCourseNames, courseNameInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (
        inputRef.current?.contains(e.target as Node) ||
        suggestionsRef.current?.contains(e.target as Node)
      ) return;
      setShowSuggestions(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Modal state
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // ── Search ───────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async (name: string) => {
    const trimmed = name.trim().toUpperCase();
    if (!trimmed) return;
    setFetchState('loading');
    setFetchError(null);
    setSubmittedName(trimmed);
    setQuery('');
    try {
      const rows = await getCoursesByName(trimmed);
      setCourses(mapApiCourses(rows));
      setFetchState('idle');
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Search failed');
      setFetchState('error');
    }
  }, []);

  // ── Unique dropdown values for the active filter ─────────────────────────

  const dropdownOptions = useMemo(() => {
    if (!DROPDOWN_FILTERS.has(selectedFilter)) return [];
    const seen = new Set<string>();
    for (const course of courses) {
      const val = getFilterValue(course, selectedFilter);
      if (val) {
        // Day filter can have multiple days per course — split them
        if (selectedFilter === 'day') {
          val.split(',').forEach((d) => { if (d.trim()) seen.add(d.trim()); });
        } else {
          seen.add(val);
        }
      }
    }
    return Array.from(seen).sort();
  }, [courses, selectedFilter]);

  // ── Filter courses ───────────────────────────────────────────────────────

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!deferredQuery) return true;
      const val = getFilterValue(course, selectedFilter).toLowerCase();
      if (selectedFilter === 'day') {
        return val.includes(deferredQuery);
      }
      return val === deferredQuery || val.includes(deferredQuery);
    });
  }, [courses, selectedFilter, deferredQuery]);

  // ── Pick / remove ────────────────────────────────────────────────────────

  function handlePickClick(course: Course) {
    const { hasConflict, conflictWith } = checkConflict(course, selectedCourses);
    if (hasConflict) {
      setPendingCourse(course);
      setConflictError(`Conflicts with ${conflictWith}`);
    } else {
      setPendingCourse(course);
      setConflictError(null);
    }
  }

  function handleConfirmPick() {
    if (!pendingCourse || conflictError) return;
    addCourse(pendingCourse);
    setPendingCourse(null);
  }

  // ── Guard ────────────────────────────────────────────────────────────────

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
  const isBusy = isLoading;
  const useDropdown = DROPDOWN_FILTERS.has(selectedFilter) && dropdownOptions.length > 0;

  return (
    <>
      <main className="min-h-screen bg-[#F5F7FA] px-4 py-5 text-[#4B5563] lg:px-6 xl:px-8">
        <div className="mx-auto w-full max-w-[1560px] space-y-4">

          {/* Header */}
          <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#5C6B80]">Home</p>
                <h1 className="mt-1 text-[30px] font-extrabold tracking-tight text-[#111827]">Course Finder</h1>
                <p className="mt-1 text-sm leading-6 text-[#4B5563]">
                  Hi {displayName}. Search for a course, filter sections, then open Schedule for your weekly layout.
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

              {/* Search Panel */}
              <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-3">

                {/* Course name + Search */}
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                      Course Name
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={courseNameInput}
                        onChange={(e) => {
                          setCourseNameInput(e.target.value.toUpperCase());
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setShowSuggestions(false);
                            handleSearch(courseNameInput);
                          }
                          if (e.key === 'Escape') setShowSuggestions(false);
                        }}
                        placeholder="e.g. CCPROG1, CCAPDEV, DASALGO"
                        className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8] transition focus:border-[#5C6B80] focus:ring-2 focus:ring-[#5C6B80]/10"
                        autoComplete="off"
                      />

                      {/* Suggestions dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-lg"
                        >
                          {suggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              onPointerDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setCourseNameInput(name);
                                setShowSuggestions(false);
                                handleSearch(name);
                              }}
                              className="flex w-full items-center px-4 py-2 text-left text-sm font-medium text-[#111827] hover:bg-[#F1F5F9] transition"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setShowSuggestions(false); handleSearch(courseNameInput); }}
                    disabled={isBusy || !courseNameInput.trim()}
                    className="rounded-xl bg-[#5C6B80] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#526175] disabled:opacity-50"
                  >
                    {isLoading ? 'Searching…' : 'Search'}
                  </button>
                </div>

                {fetchError && <p className="text-sm text-red-600 font-medium">⚠ {fetchError}</p>}

                {/* Filter row — shown after results load */}
                {courses.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
                    {/* Filter By selector */}
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                        Filter By
                      </label>
                      <select
                        value={selectedFilter}
                        onChange={(e) => { setSelectedFilter(e.target.value as FilterKey); setQuery(''); }}
                        className="w-full rounded-xl border border-[#5C6B80] bg-[#5C6B80] px-4 py-2.5 text-sm font-medium text-white outline-none"
                      >
                        {FILTER_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value} className="bg-[#5C6B80]">{o.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Smart filter: dropdown if categorical, text if freeform */}
                    {useDropdown ? (
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                          Select {FILTER_OPTIONS.find((o) => o.value === selectedFilter)?.label}
                        </label>
                        <select
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#111827] outline-none transition focus:border-[#5C6B80] focus:ring-2 focus:ring-[#5C6B80]/10"
                        >
                          <option value="">— All —</option>
                          {dropdownOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748B]">
                          Filter by {FILTER_OPTIONS.find((o) => o.value === selectedFilter)?.label}
                        </label>
                        <input
                          type="text"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder={`Type to filter…`}
                          className="w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#111827] outline-none placeholder:text-[#94A3B8] transition focus:border-[#5C6B80] focus:ring-2 focus:ring-[#5C6B80]/10"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Results Table */}
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
                          Fetching courses…
                        </td>
                      </tr>
                    ) : courses.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-sm text-[#64748B]">
                          {submittedName
                            ? `No courses found for "${submittedName}". Try using Sync from MLS to fetch the latest data.`
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
                        const { hasConflict } = !isSelected
                          ? checkConflict(course, selectedCourses)
                          : { hasConflict: false };

                        return (
                          <tr
                            key={course.id}
                            className={`border-t border-[#E5E7EB] text-[12px] text-[#4B5563] align-top transition ${
                              hasConflict ? 'bg-red-50' : 'hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <td className="px-3 py-2">
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={() => removeCourse(course.id)}
                                  className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200 transition"
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePickClick(course)}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                    hasConflict
                                      ? 'bg-red-100 text-red-500 cursor-not-allowed'
                                      : 'bg-[#E8C971] text-[#111827] hover:bg-[#ddc05d]'
                                  }`}
                                >
                                  {hasConflict ? 'Conflict' : 'Add'}
                                </button>
                              )}
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

            {/* Sidebar */}
            <aside className="w-full space-y-4">
              <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#111827]">Selected Courses</h3>
                  <span className="text-xs text-[#64748B]">{selectedCourses.length} total</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {selectedCourses.length > 0 ? (
                    selectedCourses.map((course, index) => {
                      const theme = EVENT_THEMES[index % EVENT_THEMES.length];
                      return (
                      <div key={course.id} className={`relative rounded-lg border p-2 ${theme.block}`}>
                        <button
                          type="button"
                          onClick={() => removeCourse(course.id)}
                          aria-label={`Remove ${course.code}-${course.section}`}
                          className="absolute right-1 top-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[13px] font-bold leading-none text-red-600 hover:bg-red-200 transition"
                        >
                          ×
                        </button>
                        <p className="pr-5 text-[14px] font-bold leading-tight">{course.code}-{course.section}</p>
                        <p className={`mt-0.5 truncate text-[12px] leading-tight ${theme.accent}`}>{course.professor}</p>
                        <div className={`mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-tight ${theme.accent}`}>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            course.modality === 'Fully Online'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {course.modality}
                          </span>
                          <span>{meetingDaysLabel(course.meetings)}</span>
                          <span>{meetingTimeLabel(course.meetings)}</span>
                          <span>{meetingRoomLabel(course.meetings)}</span>
                        </div>
                      </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-5 text-center text-sm text-[#64748B]">
                      No course picked yet. Search above to build your schedule.
                    </div>
                  )}
                </div>
              </section>

              <section className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#5C6B80]">Mini Schedule</p>
                    <h2 className="mt-1 text-xl font-extrabold text-[#111827]">Quick Preview</h2>
                  </div>
                  <span className="rounded-lg bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#64748B]">Mon–Sat</span>
                </div>
                <ScheduleCalendar
                  courses={selectedCourses}
                  days={[...COMPACT_PREVIEW_DAYS]}
                  rowHeight={22}
                  compact
                  timeColumnWidth={60}
                />
              </section>
            </aside>
          </div>
        </div>
      </main>

      {/* Confirm / Conflict Modal */}
      {pendingCourse && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111827]/35 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <p className="text-sm font-semibold text-[#5C6B80]">
              {conflictError ? 'Schedule Conflict' : 'Confirm selection'}
            </p>
            <h2 className="mt-2 text-[28px] font-extrabold text-[#111827]">
              {conflictError ? '⚠️ Cannot Add Course' : `Add ${pendingCourse.code}-${pendingCourse.section}?`}
            </h2>

            {conflictError ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">This course conflicts with your schedule:</p>
                <p className="mt-1">{conflictError}</p>
                <p className="mt-3 text-[#4B5563]">Remove the conflicting course first before adding this one.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm leading-6 text-[#4B5563]">
                <p className="font-semibold text-[#111827]">{pendingCourse.professor}</p>
                <p>{pendingCourse.modality}</p>
                <p>{meetingDaysLabel(pendingCourse.meetings)}</p>
                <p>{meetingTimeLabel(pendingCourse.meetings)}</p>
                <p>{meetingRoomLabel(pendingCourse.meetings)}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => { setPendingCourse(null); setConflictError(null); }}
                className="rounded-lg border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold text-[#4B5563] transition hover:text-[#111827]"
              >
                {conflictError ? 'Close' : 'Cancel'}
              </button>
              {!conflictError && (
                <button
                  type="button"
                  onClick={handleConfirmPick}
                  className="rounded-lg bg-[#5C6B80] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#526175]"
                >
                  Confirm and Add
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}