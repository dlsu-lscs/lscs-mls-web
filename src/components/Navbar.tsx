"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/mls-schedule", label: "Schedule" },
  { href: "/login", label: "Login" },
];

type NavbarProps = {
  termOptions?: string[];
  selectedTerm?: string;
  onTermChange?: (term: string) => void;
};

export default function Navbar({
  termOptions,
  selectedTerm,
  onTermChange,
}: NavbarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(135deg,#142133_0%,#1d3658_55%,#276097_100%)] text-white shadow-[0_12px_40px_rgba(20,33,51,0.28)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 ring-1 ring-white/10">
            <Image
              src="/logo.png"
              alt="LSCS logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
          </span>
          <span>
            <span className="block text-sm font-medium uppercase tracking-[0.28em] text-white/60">
              LSCS Planner
            </span>
            <span className="block text-lg font-semibold text-white">
              Course Scheduling Hub
            </span>
          </span>
        </Link>

        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
          {termOptions?.length && selectedTerm && onTermChange ? (
            <label className="flex min-w-[270px] items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-2.5 backdrop-blur">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                Term
              </span>
              <select
                value={selectedTerm}
                onChange={(event) => onTermChange(event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-white outline-none"
              >
                {termOptions.map((term) => (
                  <option key={term} value={term} className="bg-[#142133] text-white">
                    {term}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-[#142133] shadow-[0_10px_24px_rgba(255,255,255,0.16)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user ? (
              <>
                <span className="hidden rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white/75 xl:inline">
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-[#E8C468] px-4 py-2 text-sm font-semibold text-[#3D2A08] transition hover:bg-[#f0d17c]"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
