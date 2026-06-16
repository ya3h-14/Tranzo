import React from "react";
import { Logo } from "@/components/Logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Industrial Background Accents */}
      <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-100 rounded-full opacity-50 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-slate-200 rounded-full opacity-50 blur-3xl" />

      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="flex justify-center mb-8">
            <Logo showTagline className="scale-125" />
          </div>
          <h2 className="mt-2 text-center text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {title}
          </h2>
          <div className="mx-auto w-12 h-1 bg-amber-500 mt-2 rounded-full" />
          <p className="mt-4 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}
