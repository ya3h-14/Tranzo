import React from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors">
              {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-full border-2 border-slate-100 bg-slate-50/50 px-5 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-amber-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm",
              icon && "pl-11",
              error && "border-red-500 focus:border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 ml-4">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
