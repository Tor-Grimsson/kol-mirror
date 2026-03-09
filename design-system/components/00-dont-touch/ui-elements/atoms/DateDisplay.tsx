import * as React from "react";
import { Calendar } from "lucide-react";

import { cn } from "@/lib/utils";

export interface DateDisplayProps {
  timestamp?: number;
  format?: "relative" | "full" | "short" | "iso";
  showIcon?: boolean;
  iconClassName?: string;
  className?: string;
}

export function DateDisplay({
  timestamp,
  format = "relative",
  showIcon = false,
  iconClassName,
  className,
}: DateDisplayProps) {
  if (!timestamp) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        N/A
      </span>
    );
  }

  const formatDate = (ts: number) => {
    const date = new Date(ts);

    switch (format) {
      case "relative":
        return getRelativeTime(ts);
      case "full":
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      case "short":
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      case "iso":
        return date.toISOString();
      default:
        return getRelativeTime(ts);
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {showIcon && <Calendar className={cn("w-3 h-3 text-muted-foreground", iconClassName)} />}
      <span>{formatDate(timestamp)}</span>
    </span>
  );
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}
