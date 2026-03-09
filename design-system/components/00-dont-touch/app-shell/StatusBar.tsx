/**
 * Status Bar
 *
 * Shows current app status: vault mode, sync status, etc.
 */

import { HardDrive, Cloud, AlertCircle, CheckCircle, Loader2, FolderOpen, Plus, ArrowRightLeft } from 'lucide-react';
import { useVault } from '@/components/vault-system/VaultProvider';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function StatusBar() {
  const { isFilesystem, selectVault, createVault } = useVault();

  return (
    <div className="h-6 px-2 flex items-center justify-between text-xs text-muted-foreground border-t bg-muted/30">
      {/* Left side - Storage mode */}
      <div className="flex items-center gap-2">
        {/* Storage mode indicator - non-interactive */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          {isFilesystem ? (
            <>
              <HardDrive className="w-3 h-3" />
              <span className="hidden sm:inline">Local Vault</span>
            </>
          ) : (
            <>
              <Cloud className="w-3 h-3" />
              <span className="hidden sm:inline">Browser Storage</span>
            </>
          )}
        </div>

        {/* Vault Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-xs gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Vault</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={createVault}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Vault
            </DropdownMenuItem>
            <DropdownMenuItem onClick={selectVault}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Switch Vault
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {!isFilesystem && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-xs"
            onClick={selectVault}
          >
            <FolderOpen className="w-3 h-3 mr-1" />
            Open Vault
          </Button>
        )}

        <span className="text-muted-foreground/50">
          KOL Noter v0.1.0
        </span>
      </div>
    </div>
  );
}

/**
 * Sync status indicator (for future use)
 */
export function SyncStatus({
  status,
}: {
  status: 'idle' | 'syncing' | 'synced' | 'error';
}) {
  const icons = {
    idle: null,
    syncing: <Loader2 className="w-3 h-3 animate-spin" />,
    synced: <CheckCircle className="w-3 h-3 text-green-500" />,
    error: <AlertCircle className="w-3 h-3 text-destructive" />,
  };

  const labels = {
    idle: '',
    syncing: 'Saving...',
    synced: 'Saved',
    error: 'Save failed',
  };

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1">
      {icons[status]}
      <span>{labels[status]}</span>
    </div>
  );
}
