import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { TAG_COLOR_PRESETS, TAG_COLOR_INVERSES } from "@/store/NotesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TagProps {
  label: string;
  color?: string;
  variant?: "default" | "subtle" | "outlined" | "solid";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  showColorPicker?: boolean;
  onColorChange?: (color: string) => void;
  className?: string;
}

export function Tag({
  label,
  color,
  variant = "default",
  size = "md",
  removable = false,
  onRemove,
  onClick,
  showColorPicker = false,
  onColorChange,
  className,
}: TagProps) {
  const tagColor = color || TAG_COLOR_PRESETS[0]?.value || "#6b7280";
  const inverseColor = TAG_COLOR_INVERSES[tagColor] || "#000000";

  const sizeStyles = {
    sm: "h-5 px-1.5 text-[10px]",
    md: "h-6 px-2 text-xs",
    lg: "h-7 px-2.5 text-sm",
  };

  const variants = {
    default: {
      style: {
        backgroundColor: `${tagColor}20`,
        color: tagColor,
        borderColor: "transparent",
      },
    },
    subtle: {
      style: {
        backgroundColor: `${tagColor}10`,
        color: tagColor,
        borderColor: "transparent",
      },
    },
    outlined: {
      style: {
        backgroundColor: "transparent",
        color: tagColor,
        borderColor: `${tagColor}40`,
      },
    },
    solid: {
      style: {
        backgroundColor: tagColor,
        color: inverseColor,
        borderColor: "transparent",
      },
    },
  };

  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium font-mono",
        sizeStyles[size],
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      style={variants[variant].style}
      onClick={onClick}
    >
      #{label}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded p-0.5"
          style={{ color: 'inherit' }}
        >
          <X className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
        </button>
      )}
    </span>
  );

  if (showColorPicker && onColorChange) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{content}</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground mb-2 font-mono">Color</p>
            <div className="grid grid-cols-4 gap-1.5">
              {TAG_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                    tagColor === preset.value ? "border-white" : "border-border"
                  )}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => onColorChange(preset.value)}
                />
              ))}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onRemove}>
            <X className="w-3 h-3 mr-2" /> Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return content;
}
