/**
 * Conflict Resolution Dialog
 *
 * Shown when the same note has been modified both locally and externally.
 * Allows user to choose which version to keep or merge.
 */

import { useState } from 'react';
import { AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ConflictData {
  /** Path to the conflicted file */
  path: string;
  /** Note title */
  title: string;
  /** Local version content */
  localContent: string;
  /** Local version timestamp */
  localTimestamp: number;
  /** External version content */
  externalContent: string;
  /** External version timestamp */
  externalTimestamp: number;
}

export interface ConflictResolutionDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog is closed */
  onOpenChange: (open: boolean) => void;
  /** Conflict data */
  conflict: ConflictData | null;
  /** Called when user chooses to keep local version */
  onKeepLocal: () => void;
  /** Called when user chooses to keep external version */
  onKeepExternal: () => void;
  /** Called when user chooses to keep both (creates backup) */
  onKeepBoth: () => void;
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

/**
 * Get a preview of content (first 500 chars)
 */
function getPreview(content: string, maxLength = 500): string {
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength) + '...';
}

export function ConflictResolutionDialog({
  open,
  onOpenChange,
  conflict,
  onKeepLocal,
  onKeepExternal,
  onKeepBoth,
}: ConflictResolutionDialogProps) {
  const [selectedTab, setSelectedTab] = useState<'local' | 'external'>('local');

  if (!conflict) {
    return null;
  }

  const localNewer = conflict.localTimestamp > conflict.externalTimestamp;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Conflict Detected
          </DialogTitle>
          <DialogDescription>
            "{conflict.title}" has been modified both locally and externally.
            Choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedTab}
          onValueChange={(v) => setSelectedTab(v as 'local' | 'external')}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Local Version
              {localNewer && (
                <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
                  Newer
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="external" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              External Version
              {!localNewer && (
                <span className="text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
                  Newer
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="flex-1 min-h-0 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Modified: {formatTime(conflict.localTimestamp)}
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-3 bg-muted/30">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {getPreview(conflict.localContent)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="external" className="flex-1 min-h-0 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Modified: {formatTime(conflict.externalTimestamp)}
              </div>
              <ScrollArea className="h-[300px] border rounded-md p-3 bg-muted/30">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {getPreview(conflict.externalContent)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onKeepBoth}
            className="flex items-center gap-2"
          >
            Keep Both
            <span className="text-xs text-muted-foreground">(creates backup)</span>
          </Button>
          <div className="flex gap-2">
            <Button
              variant={localNewer ? 'default' : 'secondary'}
              onClick={onKeepLocal}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Keep Local
            </Button>
            <Button
              variant={!localNewer ? 'default' : 'secondary'}
              onClick={onKeepExternal}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Keep External
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
