import { Plus, FileText, Boxes, Network } from "lucide-react";
import { Button } from "@/components/ui-elements/atoms/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditorType } from "@/store/NotesContext";

interface NoteTypeDropdownProps {
  onSelect: (type: EditorType) => void;
  align?: "start" | "end";
  triggerClassName?: string;
  label?: string;
}

export const NoteTypeDropdown = ({ onSelect, align = "end", triggerClassName, label }: NoteTypeDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        size={label ? "sm" : "icon"}
        variant={label ? "default" : "ghost"}
        className={triggerClassName ?? "w-8 h-8 hover:bg-list-item"}
      >
        <Plus className={label ? "w-3 h-3" : "w-4 h-4"} />
        {label}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align={align} className="w-64 bg-background border-border z-50">
      <DropdownMenuItem
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => onSelect("standard")}
      >
        <FileText className="w-4 h-4 text-foreground mt-0" />
        <div className="flex-1">
          <div className="font-medium text-xs">Standard</div>
          <div className="text-xs text-muted-foreground">Markdown editor</div>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => onSelect("modular")}
      >
        <Boxes className="w-4 h-4 text-foreground mt-0" />
        <div className="flex-1">
          <div className="font-medium text-xs">Modular</div>
          <div className="text-xs text-muted-foreground">Rearrangeable blocks</div>
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex items-start gap-3 p-3 cursor-pointer"
        onClick={() => onSelect("visual")}
      >
        <Network className="w-4 h-4 text-foreground mt-0" />
        <div className="flex-1">
          <div className="font-medium text-xs">Visual</div>
          <div className="text-xs text-muted-foreground">Node-based flowchart</div>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
