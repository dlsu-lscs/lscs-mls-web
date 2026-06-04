"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import CourseFinderWorkspace from "@/components/CourseFinderWorkspace";
import { useSchedule } from "@/context/ScheduleContext";
import { getCampuses, getTerms, ApiCampus, ApiTerm } from "@/services/api";

export default function Home() {
  const { setSelectedTerm, setCampusNo, setSessionId, campusNo } = useSchedule();

  const [campuses, setCampuses] = useState<ApiCampus[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<ApiCampus | null>(null);
  const [selectedTerm, setSelectedTermLocal] = useState<ApiTerm | null>(null);

  // Load campuses and terms on mount, restore persisted campus preference
  useEffect(() => {
    let mounted = true;

    Promise.all([getCampuses(), getTerms()]).then(([campusData, termData]) => {
      if (!mounted) return;

      setCampuses(campusData);
      setTerms(termData);

      const restoredCampus =
        campusNo !== null
          ? (campusData.find((c) => c.campusNo === campusNo) ?? campusData[0])
          : campusData[0];
      const defaultTerm = termData[0] ?? null;

      if (restoredCampus) {
        setSelectedCampus(restoredCampus);
        setCampusNo(restoredCampus.campusNo);
      }
      if (defaultTerm) {
        setSelectedTermLocal(defaultTerm);
        setSelectedTerm(defaultTerm.name);
        setSessionId(defaultTerm.sessionId);
      }
    }).catch(() => {});

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCampusChange = useCallback(
    (campus: ApiCampus) => {
      setSelectedCampus(campus);
      setCampusNo(campus.campusNo);
    },
    [setCampusNo],
  );

  const handleTermChange = useCallback(
    (term: ApiTerm) => {
      setSelectedTermLocal(term);
      setSelectedTerm(term.name);
      setSessionId(term.sessionId);
    },
    [setSelectedTerm, setSessionId],
  );

  return (
    <>
      <Navbar
        campuses={campuses}
        terms={terms}
        selectedCampus={selectedCampus}
        selectedTerm={selectedTerm}
        onCampusChange={handleCampusChange}
        onTermChange={handleTermChange}
      />
      <CourseFinderWorkspace />
    </>
  );
}
