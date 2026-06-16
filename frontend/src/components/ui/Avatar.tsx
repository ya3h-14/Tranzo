import React from "react";
import { cn } from "@/utils/cn";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, alt, fallback, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-slate-100 items-center justify-center text-slate-600 font-medium",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="aspect-square h-full w-full object-cover" />
      ) : fallback ? (
        fallback
      ) : (
        <User size={size === "sm" ? 16 : size === "md" ? 20 : 24} />
      )}
    </div>
  );
}
