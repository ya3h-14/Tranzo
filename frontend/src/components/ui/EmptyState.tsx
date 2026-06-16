import React from "react";
import { cn } from "@/utils/cn";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon || <PackageOpen size={32} />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mb-4 text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
