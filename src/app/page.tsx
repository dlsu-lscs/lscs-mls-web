 "use client";

import Navbar from "@/components/Navbar";
import CourseFinderWorkspace from "@/components/CourseFinderWorkspace";
import { useSchedule } from "@/context/ScheduleContext";
import { TERM_OPTIONS } from "@/lib/schedule-data";

export default function Home() {
  const { selectedTerm, setSelectedTerm } = useSchedule();

  return (
    <>
      <Navbar
        termOptions={TERM_OPTIONS}
        selectedTerm={selectedTerm}
        onTermChange={setSelectedTerm}
      />
      <CourseFinderWorkspace />
    </>
  );
}
