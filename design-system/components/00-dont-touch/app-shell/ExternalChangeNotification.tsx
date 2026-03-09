/**
 * External Change Notification
 *
 * Shows notifications when files are changed externally (e.g., in Obsidian or VS Code).
 * Offers options to reload or dismiss.
 */

import { useState, useEffect } from 'react';
import { X, RefreshCw, FileEdit, FolderPlus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ExternalChangeEvent } from '@/lib/persistence/types';

export interface ExternalChangeNotificationProps {
  /** The change event to display */
  event: ExternalChangeEvent;
  /** Called when user wants to reload the changed item */
  onReload?: () => void;
  /** Called when user dismisses the notification */
  onDismiss?: () => void;
  /** Auto-dismiss after this many milliseconds (0 = no auto-dismiss) */
  autoDismissMs?: number;
}

/**
 * Get icon and color for change type
 */
function getChangeDisplay(type: ExternalChangeEvent['type']): {
  icon: typeof FileEdit;
  label: string;
  color: string;
} {
  switch (type) {
    case 'note-created':
    case 'system-created':
    case 'project-created':
      return { icon: FolderPlus, label: 'Created', color: 'text-green-500' };

    case 'note-updated':
    case 'system-updated':
    case 'project-updated':
      return { icon: FileEdit, label: 'Modified', color: 'text-blue-500' };

    case 'note-deleted':
    case 'system-deleted':
    case 'project-deleted':
      return { icon: Trash2, label: 'Deleted', color: 'text-red-500' };

    default:
      return { icon: AlertCircle, label: 'Changed', color: 'text-yellow-500' };
  }
}

/**
 * Format the item type for display
 */
function formatItemType(type: ExternalChangeEvent['itemType']): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Extract filename from path
 */
function getDisplayName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1] || path;
}

export function ExternalChangeNotification({
  event,
  onReload,
  onDismiss,
  autoDismissMs = 10000,
}: ExternalChangeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { icon: Icon, label, color } = getChangeDisplay(event.type);

  // Auto-dismiss
  useEffect(() => {
    if (autoDismissMs > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismissMs);

      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleReload = () => {
    onReload?.();
    handleDismiss();
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg shadow-lg animate-in slide-in-from-right-5 duration-200">
      <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {formatItemType(event.itemType)} {label.toLowerCase()} externally
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {getDisplayName(event.path)}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onReload && event.type.includes('updated') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReload}
            className="h-8 px-2"
            title="Reload changes"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 px-2"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Container for multiple notifications
 */
export interface ExternalChangeNotificationsProps {
  /** List of change events */
  events: ExternalChangeEvent[];
  /** Called when user wants to reload a specific item */
  onReload?: (event: ExternalChangeEvent) => void;
  /** Called when a notification is dismissed */
  onDismiss?: (event: ExternalChangeEvent) => void;
  /** Maximum notifications to show */
  maxVisible?: number;
}

export function ExternalChangeNotifications({
  events,
  onReload,
  onDismiss,
  maxVisible = 5,
}: ExternalChangeNotificationsProps) {
  const visibleEvents = events.slice(0, maxVisible);

  if (visibleEvents.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {visibleEvents.map((event, index) => (
        <ExternalChangeNotification
          key={`${event.path}-${event.timestamp}-${index}`}
          event={event}
          onReload={onReload ? () => onReload(event) : undefined}
          onDismiss={onDismiss ? () => onDismiss(event) : undefined}
        />
      ))}

      {events.length > maxVisible && (
        <p className="text-xs text-muted-foreground text-center">
          +{events.length - maxVisible} more changes
        </p>
      )}
    </div>
  );
}
