import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0a1628] via-[#132744] to-[#0d1a2d] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10">
            <svg className="text-orange-500" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
              <circle cx="12" cy="12" r="3" fill="currentColor"></circle>
            </svg>
          </div>
          <div className="text-sm font-semibold tracking-wider text-orange-400 mb-4">UGC</div>
          <h1 className="mb-4 text-4xl font-bold text-white">UGC_Ticketing</h1>
          <p className="max-w-md text-lg text-slate-300">Role-based ticketing platform for logistics and cargo operations. Manage rate inquiries and service requests efficiently.</p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8 text-center text-white relative z-10">
          <div><div className="text-3xl font-bold">9</div><div className="text-sm text-slate-400">User Roles</div></div>
          <div><div className="text-3xl font-bold">6</div><div className="text-sm text-slate-400">Departments</div></div>
          <div><div className="text-3xl font-bold">24/7</div><div className="text-sm text-slate-400">Support</div></div>
        </div>
      </div>
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-[#0d1a2d] via-[#0f1f3d] to-[#081020] p-8 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
