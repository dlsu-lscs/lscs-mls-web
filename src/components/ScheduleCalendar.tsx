"use client";

import {
  Course,
  DAY_END,
  DAY_START,
  dayAbbreviation,
  DayKey,
  formatTime,
  buildCalendarLayouts,
  SLOT_MINUTES,
} from "@/lib/schedule-data";

type ScheduleCalendarProps = {
  courses: Course[];
  days: DayKey[];
  rowHeight: number;
  compact?: boolean;
  timeColumnWidth?: number;
};

const EVENT_THEMES = [
  {
    block: "border-[#d8bc66] bg-[#EED17F] text-[#1E293B]",
    accent: "text-[#6b5311]",
  },
  {
    block: "border-[#9ed4eb] bg-[#C9EFFF] text-[#1E293B]",
    accent: "text-[#24506b]",
  },
];

export default function ScheduleCalendar({
  courses,
  days,
  rowHeight,
  compact = false,
  timeColumnWidth = 60,
}: ScheduleCalendarProps) {
  const calendarLayouts = buildCalendarLayouts(courses, days);
  const slotCount = (DAY_END - DAY_START) / SLOT_MINUTES;
  const calendarHeight = slotCount * rowHeight;
  const hourLabels = Array.from(
    { length: (DAY_END - DAY_START) / 60 + 1 },
    (_, index) => DAY_START + index * 60,
  );
  const timelineGuides = Array.from({ length: slotCount + 1 }, (_, index) => index);
  const courseThemeMap = new Map(
    courses.map((course, index) => [course.id, EVENT_THEMES[index % EVENT_THEMES.length]]),
  );

  const headerPaddingClass = compact ? "px-1 py-2" : "px-2 py-2.5";
  const headerTextClass = compact ? "text-xs" : "text-sm";

  return (
    <div className="w-full">
      <div
        className="grid rounded-lg border border-[#E2E8F0] bg-white"
        style={{
          gridTemplateColumns: `${timeColumnWidth}px repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <div className={`border-r border-[#718096]/20 bg-[#64748B] ${headerPaddingClass}`} />
        {days.map((day, index) => (
          <div
            key={day}
            className={`border-r border-white/10 bg-[#64748B] text-center font-semibold text-white ${headerPaddingClass} ${headerTextClass} ${
              index === days.length - 1 ? "border-r-0" : ""
            }`}
          >
            {compact ? dayAbbreviation(day) : day}
          </div>
        ))}

        <div
          className="relative border-r border-[#E2E8F0] bg-white"
          style={{ height: `${calendarHeight}px` }}
        >
          {hourLabels.map((minutes) => {
            const isFirstHour = minutes === DAY_START;

            return (
              <span
                key={minutes}
                // Added whitespace-nowrap and tabular-nums here for perfect alignment
                className={`absolute left-0 right-2 z-10 bg-white pr-1 text-right font-medium tabular-nums tracking-tight whitespace-nowrap text-[#64748B] ${
                  isFirstHour ? "translate-y-0" : "-translate-y-1/2"
                } ${compact ? "text-[10px]" : "text-[11px]"}`}
                style={{
                  top: isFirstHour
                    ? "2px"
                    : `${((minutes - DAY_START) / SLOT_MINUTES) * rowHeight}px`,
                }}
              >
                {formatTime(
                  `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`,
                )}
              </span>
            );
          })}
        </div>

        {days.map((day) => (
          <div key={day} className="relative bg-white" style={{ height: `${calendarHeight}px` }}>
            {timelineGuides.map((guide) => (
              <div
                key={`${day}-guide-${guide}`}
                className="absolute inset-x-0 border-t border-[#E2E8F0]"
                style={{ top: `${guide * rowHeight}px` }}
              />
            ))}

            {calendarLayouts[day].map((event) => {
              const top = ((event.start - DAY_START) / SLOT_MINUTES) * rowHeight;
              const height = ((event.end - event.start) / SLOT_MINUTES) * rowHeight;
              const width = `calc(${100 / event.totalColumns}% - 8px)`;
              const left = `calc(${(100 / event.totalColumns) * event.column}% + 4px)`;
              const theme = courseThemeMap.get(event.courseId) ?? EVENT_THEMES[0];

              return (
                <article
                  key={event.id}
                  className={`absolute rounded-md border p-2 ${theme.block}`}
                  style={{
                    top: `${top + 4}px`,
                    left,
                    width,
                    height: `${Math.max(height - 8, compact ? 36 : 52)}px`,
                  }}
                >
                  <p className={compact ? "text-[10px] font-bold leading-tight" : "text-xs font-bold"}>
                    {event.title}
                  </p>
                  <p className={`mt-0.5 ${compact ? "text-[9px]" : "text-[10px]"} font-medium ${theme.accent}`}>
                    {event.modality}
                  </p>
                  
                  {/* Time label hidden in compact mode, formatted with tabular-nums otherwise */}
                  {!compact ? (
                    <p className="mt-1 text-[10px] tabular-nums tracking-tight">{event.label}</p>
                  ) : null}

                  {!compact ? <p className="mt-0.5 text-[10px]">{event.room}</p> : null}
                </article>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}