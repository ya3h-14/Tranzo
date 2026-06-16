import React from "react";
import { cn } from "@/utils/cn";

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex space-x-1 rounded-xl bg-slate-100 p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "w-full rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            activeTab === tab.id
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
