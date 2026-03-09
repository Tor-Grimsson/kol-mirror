import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetricCellProps {
  value: string | null | undefined;
  placeholder?: string;
  className?: string;
}

export function MetricCell({
  value,
  placeholder = "—",
  className,
}: MetricCellProps) {
  return (
    <span className={cn("inline-flex items-center gap-0 group/cell", className)}>
      <span className="text-xs text-muted-foreground">
        {value || placeholder}
      </span>
      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/0 group-hover/cell:text-muted-foreground/60 transition-all -ml-px" />
    </span>
  );
}
