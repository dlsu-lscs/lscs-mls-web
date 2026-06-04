"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { ApiCampus, ApiTerm } from "@/services/api";

const links = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/login", label: "Login" },
];

type NavbarProps = {
  campuses?: ApiCampus[];
  terms?: ApiTerm[];
  selectedCampus?: ApiCampus | null;
  selectedTerm?: ApiTerm | null;
  onCampusChange?: (campus: ApiCampus) => void;
  onTermChange?: (term: ApiTerm) => void;
};

export default function Navbar({
  campuses,
  terms,
  selectedCampus,
  selectedTerm,
  onCampusChange,
  onTermChange,
}: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const showControls = campuses !== undefined && terms !== undefined;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,#142133_0%,#1d3658_55%,#276097_100%)] text-white shadow-[0_8px_32px_rgba(20,33,51,0.24)]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-2 lg:px-6">

        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="LSCS logo"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
              priority
            />
          </span>
          <span className="hidden sm:block">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.26em] text-white/45">
              LSCS Planner
            </span>
            <span className="block text-[14px] font-bold leading-tight text-white">
              Course Scheduling Hub
            </span>
          </span>
        </Link>

        {/* Center: campus + term controls */}
        {showControls ? (
          <div className="flex flex-1 items-center justify-center px-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/6 px-2 py-1.5 backdrop-blur-sm">

              {/* Campus dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Campus
                </span>
                <select
                  value={selectedCampus?.campusNo ?? ""}
                  onChange={(e) => {
                    const campus = campuses!.find(
                      (c) => c.campusNo === Number(e.target.value),
                    );
                    if (campus) onCampusChange?.(campus);
                  }}
                  disabled={campuses!.length === 0}
                  className="cursor-pointer rounded-lg bg-white/10 px-2 py-0.5 text-[12px] font-semibold text-white outline-none transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#1d3658] [&>option]:text-white"
                >
                  {campuses!.length === 0 ? (
                    <option value="">Loading…</option>
                  ) : (
                    campuses!.map((c) => (
                      <option key={c.campusNo} value={c.campusNo}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <span className="h-3.5 w-px bg-white/15" />

              {/* Term dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                  Term
                </span>
                <select
                  value={selectedTerm?.sessionId ?? ""}
                  onChange={(e) => {
                    const term = terms!.find(
                      (t) => t.sessionId === Number(e.target.value),
                    );
                    if (term) onTermChange?.(term);
                  }}
                  disabled={terms!.length === 0}
                  className="cursor-pointer rounded-lg bg-white/10 px-2 py-0.5 text-[12px] font-semibold text-white outline-none transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#1d3658] [&>option]:text-white"
                >
                  {terms!.length === 0 ? (
                    <option value="">Loading…</option>
                  ) : (
                    terms!.map((t) => (
                      <option key={t.sessionId} value={t.sessionId}>
                        {t.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right: nav links + auth */}
        <div className="flex shrink-0 items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-white text-[#142133] shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user && (
            <>
              <span className="mx-0.5 hidden h-3.5 w-px bg-white/15 xl:block" />
              <span className="hidden rounded-lg border border-white/10 bg-white/6 px-2.5 py-1.5 text-[11px] text-white/60 xl:inline">
                {user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-[#E8C468] px-3 py-1.5 text-[12px] font-semibold text-[#3D2A08] transition hover:bg-[#f0d17c]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
