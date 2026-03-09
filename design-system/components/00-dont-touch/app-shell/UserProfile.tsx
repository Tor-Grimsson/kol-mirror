import { User, Mail, Bell, Shield, Palette, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui-elements/atoms/Button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface UserProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfile = ({ open, onOpenChange }: UserProfileProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Profile & Settings</SheetTitle>
          <SheetDescription>
            Manage your account settings and preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">John Doe</h3>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>

          <Separator />

          {/* Account Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account Settings
            </h4>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Email Preferences
              </Button>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Shield className="mr-2 h-4 w-4" />
                Security & Privacy
              </Button>
            </div>
          </div>

          <Separator />

          {/* Preferences Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-sm cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </div>
                </Label>
                <Switch id="notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="text-sm cursor-pointer">
                  Dark Mode
                </Label>
                <Switch id="dark-mode" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Advanced Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
