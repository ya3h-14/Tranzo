import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Loader({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <Loader2 className="animate-spin text-indigo-600" size={size} />
    </div>
  );
}
