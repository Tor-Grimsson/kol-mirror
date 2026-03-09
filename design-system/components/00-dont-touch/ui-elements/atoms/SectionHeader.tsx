import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  count?: number;
  collapsed?: boolean;
  onToggle?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  icon,
  iconClassName,
  count,
  collapsed = false,
  onToggle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between mb-2",
        onToggle && "cursor-pointer select-none",
        className
      )}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        {icon && (
          <span className={cn("text-muted-foreground", iconClassName)}>
            {icon}
          </span>
        )}
        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-1">
        {action}
        {onToggle && (
          collapsed ? (
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )
        )}
      </div>
    </div>
  );
}
