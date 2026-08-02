"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import CourseFinderWorkspace from "@/components/CourseFinderWorkspace";
import { useSchedule } from "@/context/ScheduleContext";
import { getCampuses, getTerms, triggerCourseFetch, ApiCampus, ApiTerm } from "@/services/api";

export default function Home() {
  const { setSelectedTerm, setCampusNo, setSessionId, campusNo } = useSchedule();

  const [campuses, setCampuses] = useState<ApiCampus[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<ApiCampus | null>(null);
  const [selectedTerm, setSelectedTermLocal] = useState<ApiTerm | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  // Load campuses and terms on mount, restore persisted campus preference.
  // If there's no active scraper session yet, bootstrap one and retry once.
  useEffect(() => {
    let mounted = true;
    setLoadError(null);

    async function loadCampusesAndTerms() {
      try {
        return await Promise.all([getCampuses(), getTerms()]);
      } catch {
        await triggerCourseFetch(0, 0);
        return await Promise.all([getCampuses(), getTerms()]);
      }
    }

    loadCampusesAndTerms().then(([campusData, termData]) => {
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
    }).catch((err) => {
      if (!mounted) return;
      setLoadError(err instanceof Error ? err.message : "Failed to load campuses and terms.");
    });

    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryToken]);

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
      {loadError && (
        <div className="flex items-center justify-center gap-3 bg-red-50 px-4 py-2 text-sm text-red-700">
          <span>{loadError}</span>
          <button
            type="button"
            onClick={() => setRetryToken((t) => t + 1)}
            className="rounded-md bg-red-100 px-2 py-0.5 font-medium hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      )}
      <CourseFinderWorkspace />
    </>
  );
}
