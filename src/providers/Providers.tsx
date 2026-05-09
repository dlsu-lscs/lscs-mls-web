"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ScheduleProvider>{children}</ScheduleProvider>
    </AuthProvider>
  );
}
