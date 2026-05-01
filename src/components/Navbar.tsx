"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/mls-schedule", label: "Schedule" },
  { href: "/login", label: "Login" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-[#002D57]">
          LSCS App
        </Link>

        <div className="flex items-center gap-3">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#002D57] text-white"
                    : "text-[#002D57] hover:bg-[#002D57]/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <>
              <span className="hidden text-sm text-slate-600 md:inline">
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
    </nav>
  );
}
