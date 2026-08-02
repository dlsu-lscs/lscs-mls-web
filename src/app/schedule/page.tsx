"use client";

import Navbar from "@/components/Navbar";
import ScheduleCalendar from "@/components/ScheduleCalendar";
import ScheduleDetailCard from "@/components/ScheduleDetailCard";
import { useSchedule } from "@/context/ScheduleContext";
import { SCHEDULE_DAYS } from "@/lib/schedule-data";

export default function SchedulePage() {
  const { selectedCourses, selectedTerm } = useSchedule();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_62%)] px-4 py-8 lg:px-6">
        <div className="mx-auto max-w-[1280px]">
          <section className="overflow-hidden rounded-lg bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
            <div className="grid xl:grid-cols-[minmax(0,3fr)_320px]">
              <div className="border-b border-[#E2E8F0] p-8 xl:border-b-0 xl:border-r">
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B]">
                    Full Schedule
                  </p>
                  <h1 className="mt-2 text-3xl font-bold text-[#1E293B]">
                    Weekly Schedule View
                  </h1>
                  <p className="mt-2 text-sm text-[#64748B]">
                    Detailed calendar layout for your currently selected courses.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <ScheduleCalendar
                    courses={selectedCourses}
                    days={SCHEDULE_DAYS}
                    rowHeight={28}
                  />
                </div>
              </div>

              <aside className="bg-[#FBFBFB] p-6 xl:border-l-2 xl:border-[#E2E8F0]">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#64748B]">
                    Enlisted Courses
                  </p>
                  <h2 className="text-2xl font-bold text-[#1E293B]">Course Details</h2>
                  <p className="text-sm text-[#64748B]">
                    {selectedCourses.length} course{selectedCourses.length === 1 ? "" : "s"} in{" "}
                    {selectedTerm}.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-5">
                  {selectedCourses.length > 0 ? (
                    selectedCourses.map((course, index) => (
                      <ScheduleDetailCard key={course.id} course={course} index={index} />
                    ))
                  ) : (
                    <div className="rounded-md border border-dashed border-[#CBD5E1] bg-white px-4 py-8 text-center text-sm text-[#64748B]">
                      No courses selected yet. Add courses from `MLS Schedule` to populate
                      this view.
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
