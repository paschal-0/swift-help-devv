import Link from "next/link";

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#E6EDF6] px-6 py-12 text-[#334155]">
      <section className="w-full max-w-[620px] rounded-[16px] border border-[#DDE5EF] bg-[#F8FAFC] px-7 py-8 text-center shadow-sm sm:px-10 sm:py-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E3F2FD] text-[#1565C0]">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path
              d="M12 6v6l4 2m5-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 text-[30px] font-bold tracking-tight text-[#1E293B]">
          SwiftHelp is under maintenance
        </h1>
        <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-7 text-[#64748B]">
          We are applying platform updates right now. Patient, professional, and organization workspaces
          are temporarily unavailable. Admin access remains open.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-[10px] bg-gradient-to-b from-[#1E88E5] to-[#064D83] px-5 py-3 text-[15px] font-semibold text-white shadow-sm"
            href="/get-started/login"
          >
            Sign in
          </Link>
          <Link
            className="rounded-[10px] border border-[#1565C0] px-5 py-3 text-[15px] font-semibold text-[#1565C0]"
            href="/super-admin-platform"
          >
            Admin workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
