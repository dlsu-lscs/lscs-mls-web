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
  campusNo: number | null;
  sessionId: number | null;
  selectedCourses: Course[];
  setSelectedTerm: (term: string) => void;
  setCampusNo: (n: number | null) => void;
  setSessionId: (n: number | null) => void;
  addCourse: (course: Course) => void;
  removeCourse: (courseId: string) => void;
  hasCourse: (courseId: string) => boolean;
};

const TERM_STORAGE_KEY = "schedule:selectedTerm";
const CAMPUS_NO_STORAGE_KEY = "schedule:campusNo";
const COURSES_STORAGE_KEY = "schedule:selectedCourses";

const ScheduleContext = createContext<ScheduleContextType>({
  selectedTerm: TERM_OPTIONS[0],
  campusNo: null,
  sessionId: null,
  selectedCourses: [],
  setSelectedTerm: () => {},
  setCampusNo: () => {},
  setSessionId: () => {},
  addCourse: () => {},
  removeCourse: () => {},
  hasCourse: () => false,
});

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [selectedTerm, setSelectedTermState] = useState(TERM_OPTIONS[0]);
  const [campusNo, setCampusNoState] = useState<number | null>(null);
  const [sessionId, setSessionIdState] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  useEffect(() => {
    try {
      const storedTerm = localStorage.getItem(TERM_STORAGE_KEY);
      const storedCampusNo = localStorage.getItem(CAMPUS_NO_STORAGE_KEY);
      const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);

      if (storedTerm) setSelectedTermState(storedTerm);
      if (storedCampusNo !== null) setCampusNoState(Number(storedCampusNo));
      if (storedCourses) setSelectedCourses(JSON.parse(storedCourses));
    } catch {
      localStorage.removeItem(TERM_STORAGE_KEY);
      localStorage.removeItem(CAMPUS_NO_STORAGE_KEY);
      localStorage.removeItem(COURSES_STORAGE_KEY);
    }
  }, []);

  const setSelectedTerm = useCallback((term: string) => {
    setSelectedTermState(term);
    localStorage.setItem(TERM_STORAGE_KEY, term);
  }, []);

  const setCampusNo = useCallback((n: number | null) => {
    setCampusNoState(n);
    if (n !== null) localStorage.setItem(CAMPUS_NO_STORAGE_KEY, String(n));
    else localStorage.removeItem(CAMPUS_NO_STORAGE_KEY);
  }, []);

  const setSessionId = useCallback((n: number | null) => {
    setSessionIdState(n);
  }, []);

  const addCourse = useCallback((course: Course) => {
    setSelectedCourses((currentCourses) => {
      if (currentCourses.some((c) => c.id === course.id)) return currentCourses;
      const next = [...currentCourses, course];
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCourse = useCallback((courseId: string) => {
    setSelectedCourses((currentCourses) => {
      const next = currentCourses.filter((c) => c.id !== courseId);
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const hasCourse = useCallback(
    (courseId: string) => selectedCourses.some((c) => c.id === courseId),
    [selectedCourses],
  );

  const value = useMemo(
    () => ({
      selectedTerm,
      campusNo,
      sessionId,
      selectedCourses,
      setSelectedTerm,
      setCampusNo,
      setSessionId,
      addCourse,
      removeCourse,
      hasCourse,
    }),
    [selectedTerm, campusNo, sessionId, selectedCourses, setSelectedTerm, setCampusNo, setSessionId, addCourse, removeCourse, hasCourse],
  );

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
}

export function useSchedule() {
  return useContext(ScheduleContext);
}
