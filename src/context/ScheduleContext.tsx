"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Course, TERM_OPTIONS } from "@/lib/schedule-data";

type ScheduleContextType = {
  selectedTerm: string;
  selectedCourses: Course[];
  setSelectedTerm: (term: string) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  hasCourse: (courseId: string) => boolean;
};

const TERM_STORAGE_KEY = "schedule:selectedTerm";
const COURSES_STORAGE_KEY = "schedule:selectedCourses";

const ScheduleContext = createContext<ScheduleContextType>({
  selectedTerm: TERM_OPTIONS[0],
  selectedCourses: [],
  setSelectedTerm: () => {},
  addCourse: () => {},
  removeCourse: () => {},
  hasCourse: () => false,
});

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [selectedTerm, setSelectedTermState] = useState(TERM_OPTIONS[0]);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  useEffect(() => {
    try {
      const storedTerm = localStorage.getItem(TERM_STORAGE_KEY);
      const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);

      if (storedTerm) {
        setSelectedTermState(storedTerm);
      }

      if (storedCourses) {
        setSelectedCourses(JSON.parse(storedCourses));
      }
    } catch {
      localStorage.removeItem(TERM_STORAGE_KEY);
      localStorage.removeItem(COURSES_STORAGE_KEY);
    }
  }, []);

  const setSelectedTerm = useCallback((term: string) => {
    setSelectedTermState(term);
    localStorage.setItem(TERM_STORAGE_KEY, term);
  }, []);

  const addCourse = useCallback((course: Course) => {
    setSelectedCourses((currentCourses) => {
      if (currentCourses.some((currentCourse) => currentCourse.id === course.id)) {
        return currentCourses;
      }

      const nextCourses = [...currentCourses, course];
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(nextCourses));
      return nextCourses;
    });
  }, []);

  
  const removeCourse = useCallback((courseId: string) => {
    setSelectedCourses((currentCourses) => {
      const nextCourses = currentCourses.filter((course) => course.id !== courseId);
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(nextCourses));
      return nextCourses;
    });
  }, []);

  const hasCourse = useCallback(
    (courseId: string) =>
      selectedCourses.some((selectedCourse) => selectedCourse.id === courseId),
    [selectedCourses],
  );

  const value = useMemo(
    () => ({
      selectedTerm,
      selectedCourses,
      setSelectedTerm,
      addCourse,
      removeCourse,
      hasCourse,
    }),
    [selectedTerm, selectedCourses, setSelectedTerm, addCourse, removeCourse, hasCourse],
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  return useContext(ScheduleContext);
}

