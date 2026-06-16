import React from "react";
import { cn } from "@/utils/cn";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchBar({ className, onSearch, onChange, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-xl border-0 py-2.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-shadow"
        placeholder="Search..."
        onChange={(e) => {
          onChange?.(e);
          onSearch?.(e.target.value);
        }}
        {...props}
      />
    </div>
  );
}
