import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-secondary via-navy to-secondary-900 lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="UGC Ticketing"
            width={120}
            height={120}
            className="mx-auto mb-8"
            priority
          />
          <h1 className="mb-4 text-4xl font-bold text-white">UGC_Ticketing</h1>
          <p className="max-w-md text-lg text-slate-300">
            Role-based ticketing platform for logistics and cargo operations.
            Manage rate inquiries and service requests efficiently.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-8 text-center text-white">
          <div>
            <div className="text-3xl font-bold text-primary">9</div>
            <div className="text-sm text-slate-300">User Roles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">6</div>
            <div className="text-sm text-slate-300">Departments</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-sm text-slate-300">Support</div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}