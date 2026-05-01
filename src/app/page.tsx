import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="grid min-h-screen grid-rows-[1fr_auto] items-center bg-[#F5F7FA] px-8 py-16">
        <main className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 rounded-[28px] border border-slate-200 bg-white px-8 py-14 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex w-full items-center justify-center">
            <Image
              src="/lscs-logo.png"
              alt="LSCS logo"
              width={180}
              height={38}
              priority
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#5C6B80]">
              LSCS Course Planning
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-[#111827]">
              Build your term plan with a finder-first flow.
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600">
              Browse available sections in `MLS Schedule`, confirm picks with a quick
              preview, then review the full calendar and enlisted course details on
              `Schedule`.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              className="rounded-full bg-[#142133] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d3658]"
              href="/mls-schedule"
            >
              Open MLS Schedule
            </Link>
            <Link
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-[#111827] transition hover:bg-slate-50"
              href="/schedule"
            >
              View Schedule
            </Link>
          </div>
        </main>

        <footer className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <span className="text-sm text-slate-500">© 2026 LSCS App</span>
        </footer>
      </div>
    </>
  );
}
