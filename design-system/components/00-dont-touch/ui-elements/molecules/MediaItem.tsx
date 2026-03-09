import * as React from "react";
import {
  FileText,
  Image as ImageIcon,
  Mic,
  Play,
  Download,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui-elements/atoms/Button";
import { Hyperlink } from "../atoms/Hyperlink";
import { Badge } from "../atoms/Badge";

export interface MediaItemProps {
  type: "file" | "image" | "recording";
  name: string;
  url: string;
  size?: number;
  duration?: string;
  mimeType?: string;
  onPlay?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
  className?: string;
}

export function MediaItem({
  type,
  name,
  url,
  size,
  duration,
  mimeType,
  onPlay,
  onDownload,
  onEdit,
  onDelete,
  compact = false,
  className,
}: MediaItemProps) {
  const [isPreview, setIsPreview] = React.useState(false);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const icon = {
    file: <FileText className="w-4 h-4" />,
    image: <ImageIcon className="w-4 h-4" />,
    recording: <Mic className="w-4 h-4" />,
  }[type];

  const badgeVariant = {
    file: "secondary" as const,
    image: "info" as const,
    recording: "warning" as const,
  }[type];

  if (compact) {
    // Image preview state - square cell with image background
    if (type === "image" && isPreview) {
      return (
        <div
          className={cn(
            "aspect-square rounded-[4px] bg-cover bg-center relative group",
            className
          )}
          style={{ backgroundImage: `url(${url})` }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs truncate text-white">{name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsPreview(false)}
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex items-center justify-between p-1.5 rounded-[4px] bg-[#1e1e24] group text-xs",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon}
          <span className="truncate">{name}</span>
          {size && (
            <span className="text-muted-foreground text-[10px]">
              {formatSize(size)}
            </span>
          )}
          {type === "recording" && duration && (
            <span className="text-muted-foreground text-[10px]">
              {duration}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {type === "image" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={() => setIsPreview(true)}
            >
              <Eye className="w-3 h-3" />
            </Button>
          )}
          {type === "recording" && onPlay && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onPlay}
            >
              <Play className="w-3 h-3" />
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onDownload}
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-white/30 hover:text-white/50"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="p-2 rounded bg-accent/50">{icon}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">{name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant={badgeVariant} size="sm">
              {type}
            </Badge>
            {size && (
              <span className="text-xs text-muted-foreground">
                {formatSize(size)}
              </span>
            )}
            {type === "recording" && duration && (
              <span className="text-xs text-muted-foreground">
                {duration}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {type === "recording" && onPlay && (
          <Button variant="secondary" size="sm" onClick={onPlay}>
            <Play className="w-3 h-3 mr-1" /> Play
          </Button>
        )}
        {onDownload && (
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="w-3 h-3 mr-1" /> Download
          </Button>
        )}
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white/30 hover:text-white/50"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export interface ImageThumbnailProps {
  id: string;
  name: string;
  dataUrl: string;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function ImageThumbnail({
  id,
  name,
  dataUrl,
  onView,
  onDownload,
  onDelete,
  className,
}: ImageThumbnailProps) {
  return (
    <div
      className={cn(
        "relative aspect-square rounded overflow-hidden group border",
        className
      )}
    >
      <img
        src={dataUrl}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
        {onView && (
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={onView}
          >
            <ImageIcon className="w-3 h-3" />
          </Button>
        )}
        {onDownload && (
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={onDownload}
          >
            <Download className="w-3 h-3" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/60 to-transparent">
        <span className="text-[10px] text-white truncate block">
          {name}
        </span>
      </div>
    </div>
  );
}
