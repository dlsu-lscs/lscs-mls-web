"use client";

import { Fragment, useState } from 'react';
// Assuming you have a Navbar component that you'll update with the #142133 dark blue later
import Navbar from '@/components/Navbar';

// Basic attributes for a course
type Course = {
  id: string;
  name: string;
  timeLabel: string;
  slot: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  professor?: string;
  room?: string;
};

// Fake data for testing (expanded to match some mockup details)
const COURSES: Course[] = [
  {
    id: 'cs-algcm-12',
    name: 'CS ALGCM - 12',
    timeLabel: '9:15 AM - 10:45 AM',
    slot: '9am',
    day: 'Monday',
    professor: 'Dinklefart Doodlefart',
    room: 'Secret',
  },
  {
    id: 'cs-adprg-y18',
    name: 'CS ADPRG - Y18',
    timeLabel: '1:00 PM - 2:45 PM',
    slot: '1pm',
    day: 'Tuesday',
    professor: '2hollis',
    room: 'AG1707',
  },
  {
    id: 'cs-algcm-12-th',
    name: 'CS ALGCM - 12',
    timeLabel: '9:15 AM - 10:45 AM',
    slot: '9am',
    day: 'Thursday',
    professor: 'Dinklefart Doodlefart',
    room: 'Secret',
  },
];

// Days of the week and time for the calendar component
const DAYS: Course['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'] as const;

type ScheduleState = Partial<Record<Course['day'], Partial<Record<(typeof TIME_SLOTS)[number], Course>>>>;

export default function SchedulerPage() {
  const [schedule, setSchedule] = useState<ScheduleState>({});
  // Track flat list of picked courses for the bottom section
  const [pickedCourses, setPickedCourses] = useState<Course[]>([]);

  const handleAddCourse = (course: Course) => {
    setSchedule((prev) => {
      const updatedDay = { ...(prev[course.day] ?? {}), [course.slot]: course };
      return { ...prev, [course.day]: updatedDay };
    });
    
    // Add to picked list if not already there
    if (!pickedCourses.find(c => c.id === course.id)) {
        setPickedCourses(prev => [...prev, course]);
    }
  };

  const handleRemoveCourse = (courseId: string, day: Course['day'], slot: string) => {
    setSchedule((prev) => {
        const updatedDay = { ...prev[day] };
        delete updatedDay[slot as keyof typeof updatedDay];
        return { ...prev, [day]: updatedDay };
    });
    setPickedCourses(prev => prev.filter(c => c.id !== courseId));
  };

  return (
    <>
      <Navbar />
      {/* Light Gray (#F5F5F5) Background */}
      <div className="min-h-screen bg-[#F5F5F5] px-6 py-10 font-sans text-[#333740]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row">
          
          {/* LEFT COLUMN: Controls & Tables */}
          <div className="flex w-full flex-col gap-8 lg:w-5/12">
            
            {/* Search and Table Area */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            placeholder="Search by code" 
                            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-[#276097]"
                        />
                    </div>
                    <button className="rounded-md bg-gray-400 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gray-500">
                        Back
                    </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="w-full table-auto border-collapse text-left text-xs">
                    <thead>
                    {/* Deep Blue (#276097) Header */}
                    <tr className="bg-[#276097] text-white">
                        <th className="px-4 py-3 font-semibold">Action</th>
                        <th className="px-4 py-3 font-semibold">Code / Section</th>
                        <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                    </thead>
                    <tbody>
                    {COURSES.map((course) => (
                        <tr key={course.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50">
                        <td className="px-4 py-3">
                            <button
                            type="button"
                            onClick={() => handleAddCourse(course)}
                            // Secondary/Gold (#E7C53D) Button
                            className="rounded bg-[#E7C53D] px-4 py-1.5 font-bold text-[#1A263C] transition hover:bg-[#FFD93B]"
                            >
                            Pick
                            </button>
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1A263C]">
                            {course.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{course.timeLabel}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Enter Course Code Card */}
            <div className="mt-4 rounded-xl bg-white p-8 shadow-sm text-center border border-gray-100">
                <h2 className="text-2xl font-bold text-[#1A263C] mb-6">Enter Course Code</h2>
                <input 
                    type="text" 
                    placeholder="E.g. GEETHICS" 
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-center text-lg outline-none focus:border-[#276097] mb-4"
                />
                {/* Primary/Deep Blue (#276097) Button */}
                <button className="w-full rounded-md bg-[#276097] px-4 py-3 text-lg font-semibold text-white transition hover:bg-[#25436B]">
                    Enter
                </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Calendar Preview & Summary */}
          <div className="flex w-full flex-col gap-6 lg:w-7/12 rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#1A263C]">Preview</h2>
                <button className="rounded-md bg-[#276097] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#25436B] shadow-sm">
                    SAVE ▾
                </button>
            </div>

            {/* Weekly Calendar */}
            <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
              <div className="grid min-w-[600px] grid-cols-6 gap-px bg-gray-200 text-center text-sm">
                
                {/* Calendar Header */}
                <div className="bg-[#276097] px-2 py-3 text-xs font-semibold text-white"></div>
                {DAYS.map((day) => (
                  <div key={day} className="bg-[#276097] px-2 py-3 text-sm font-semibold text-white">
                    {day.slice(0, 3)}
                  </div>
                ))}

                {/* Calendar Body */}
                {TIME_SLOTS.map((slot) => (
                  <Fragment key={slot}>
                    <div className="bg-white px-2 py-3 text-right text-xs font-medium text-gray-500 border-b border-r border-gray-100">
                      {slot}
                    </div>
                    {DAYS.map((day) => {
                      const course = schedule[day]?.[slot];
                      return (
                        <div
                          key={`${day}-${slot}`}
                          className="relative flex min-h-[50px] flex-col items-start p-1 bg-white border-b border-gray-100"
                        >
                          {course && (
                            // Render Gold blocks for selected courses
                            <div className="absolute inset-0 m-1 flex flex-col items-start justify-center rounded-sm bg-[#E7C53D] p-2 text-left shadow-sm">
                              <span className="text-xs font-bold text-[#1A263C] leading-tight">{course.name}</span>
                              <span className="text-[10px] text-[#333740]">{course.timeLabel}</span>
                              <span className="text-[10px] text-[#333740]">{course.room}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Courses Picked Summary */}
            <div className="mt-6">
                <h2 className="text-2xl font-bold text-[#1A263C] mb-4">Course/s Picked</h2>
                <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 min-h-[100px]">
                    {pickedCourses.map((course, idx) => (
                        <div key={`${course.id}-${idx}`} className="flex items-center gap-2 rounded-full bg-[#E7C53D] px-4 py-1.5 shadow-sm">
                            <span className="text-xs font-bold text-[#1A263C]">{course.name}</span>
                            <button 
                                onClick={() => handleRemoveCourse(course.id, course.day, course.slot)}
                                className="text-[#333740] hover:text-black font-bold"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    {pickedCourses.length === 0 && (
                        <span className="text-sm text-gray-400 italic flex items-center">No courses selected yet.</span>
                    )}
                </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}