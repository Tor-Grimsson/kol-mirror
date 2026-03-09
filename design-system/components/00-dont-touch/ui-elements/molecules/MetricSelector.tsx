import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Badge } from "../atoms/Badge";
import { cn } from "@/lib/utils";

export type HealthStatus = "good" | "warning" | "critical";
export type PriorityLevel = "high" | "medium" | "low";
export type ItemStatus = "not_started" | "in_progress" | "done" | "blocked";

export interface MetricSelectorProps {
  label: string;
  value?: string;
  options: { value: string; label: string }[];
  icon?: LucideIcon;
  placeholder?: string;
  onChange?: (value: string | undefined) => void;
  className?: string;
}

export function MetricSelector({
  label,
  value,
  options,
  icon: Icon,
  placeholder,
  onChange,
  className,
}: MetricSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      {Icon && (
        <Icon className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      )}
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value || undefined)}
        className={cn(
          "w-full h-8 pl-2 pr-8 text-xs bg-input border border-input-border rounded appearance-none",
          "cursor-pointer hover:bg-accent/50 transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-primary"
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export interface HealthBadgeProps {
  health?: HealthStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function HealthBadge({
  health,
  size = "sm",
  showLabel = true,
  className,
}: HealthBadgeProps) {
  const variants: Record<HealthStatus, "success" | "warning" | "critical"> = {
    good: "success",
    warning: "warning",
    critical: "critical",
  };

  const labels: Record<HealthStatus, string> = {
    good: "Good",
    warning: "Warning",
    critical: "Critical",
  };

  if (!health) {
    return (
      <Badge variant="outline" size={size} className={className}>
        Unknown
      </Badge>
    );
  }

  return (
    <Badge variant={variants[health]} size={size} className={className}>
      {showLabel && labels[health]}
    </Badge>
  );
}

export interface PriorityBadgeProps {
  priority?: PriorityLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({
  priority,
  size = "sm",
  showLabel = true,
  className,
}: PriorityBadgeProps) {
  const variants: Record<PriorityLevel, "critical" | "warning" | "info"> = {
    high: "critical",
    medium: "warning",
    low: "info",
  };

  const labels: Record<PriorityLevel, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  if (!priority) {
    return (
      <Badge variant="outline" size={size} className={className}>
        Unset
      </Badge>
    );
  }

  return (
    <Badge variant={variants[priority]} size={size} className={className}>
      {showLabel && labels[priority]}
    </Badge>
  );
}

export interface StatusBadgeProps {
  status?: ItemStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = "sm",
  showLabel = true,
  className,
}: StatusBadgeProps) {
  const variants: Record<ItemStatus, "info" | "warning" | "success" | "secondary"> = {
    not_started: "secondary",
    in_progress: "info",
    done: "success",
    blocked: "warning",
  };

  const labels: Record<ItemStatus, string> = {
    not_started: "Not Started",
    in_progress: "In Progress",
    done: "Done",
    blocked: "Blocked",
  };

  if (!status) {
    return (
      <Badge variant="outline" size={size} className={className}>
        Unset
      </Badge>
    );
  }

  return (
    <Badge variant={variants[status]} size={size} className={className}>
      {showLabel && labels[status]}
    </Badge>
  );
}
