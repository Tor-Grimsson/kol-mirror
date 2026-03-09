import { Plus } from "lucide-react";
import { Button } from "@/components/ui-elements/atoms/Button";

interface OutlineButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function OutlineButton({ onClick, disabled, children }: OutlineButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="text-foreground"
    >
      <Plus className="w-3 h-3 mr-1" />
      {children}
    </Button>
  );
}
