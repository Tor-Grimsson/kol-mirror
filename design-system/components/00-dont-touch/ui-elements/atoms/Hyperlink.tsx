import * as React from "react";
import { ExternalLink, Edit2, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-elements/atoms/Button";

export interface HyperlinkProps {
  href: string;
  title?: string;
  showIcon?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Hyperlink({
  href,
  title,
  showIcon = true,
  onEdit,
  onDelete,
  className,
  children,
}: HyperlinkProps) {
  const displayTitle = title || children || href;

  return (
    <div className={cn("inline-flex items-center gap-1 group", className)}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-[200px]"
      >
        {showIcon && <ExternalLink className="w-3 h-3 shrink-0" />}
        <span className="truncate">{displayTitle}</span>
      </a>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-white/30 hover:text-white/50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
