import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Logo & Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-[#0a1628] via-[#132744] to-[#0d1a2d] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        {/* Main Content */}
        <div className="text-center relative z-10 flex flex-col items-center justify-center">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logougcorangewhite.png"
              alt="UGC Logo"
              width={280}
              height={280}
              className="drop-shadow-2xl"
              priority
            />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl font-bold text-white tracking-wide mb-2">
            TICKETING PORTAL
          </h1>
          <div className="w-24 h-1 bg-orange-500 rounded-full mb-6"></div>
          
          {/* Subtitle */}
          <p className="max-w-md text-lg text-slate-300 text-center">
            Role-based ticketing platform for Business and Operation Departments
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-gradient-to-br from-[#0d1a2d] via-[#0f1f3d] to-[#081020] p-8 lg:w-1/2">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
