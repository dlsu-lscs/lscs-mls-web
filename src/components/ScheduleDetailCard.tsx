"use client";

import { Course, meetingDaysLabel, meetingRoomLabel, meetingTimeLabel } from "@/lib/schedule-data";

type ScheduleDetailCardProps = {
  course: Course;
  index: number;
};

const THEMES = [
  {
    header: "bg-[#E6C564]",
    body: "bg-[#EED17F]",
  },
  {
    header: "bg-[#B3E5FC]",
    body: "bg-[#C9EFFF]",
  },
];

export default function ScheduleDetailCard({
  course,
  index,
}: ScheduleDetailCardProps) {
  const theme = THEMES[index % THEMES.length];

  return (
    <article className="overflow-hidden rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <header className={`${theme.header} px-4 py-3 text-base font-bold text-[#1E293B]`}>
        {course.code}-{course.section}
      </header>
      <div className={`${theme.body} px-4 py-4 text-xs leading-6 text-[#1E293B]`}>
        <p>
          <strong>Professor:</strong> {course.professor}
        </p>
        <p>
          <strong>Modality:</strong> {course.modality}
        </p>
        <p>
          <strong>Schedule:</strong> {meetingDaysLabel(course.meetings)}
        </p>
        <p>
          <strong>Time:</strong> {meetingTimeLabel(course.meetings)}
        </p>
        <p>
          <strong>Room:</strong> {meetingRoomLabel(course.meetings)}
        </p>
        <p>
          <strong>Enrolled:</strong> {course.enrolled}/{course.capacity}
        </p>
      </div>
    </article>
  );
}
