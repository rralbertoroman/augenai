"use client";

import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  if (!user) {
    return null;
  }

  // Extract user display name from metadata or email
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";
  const email = user.email || "";

  return (
    <div className="flex items-center gap-3">
      {/* User Info */}
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium text-foreground">{displayName}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
