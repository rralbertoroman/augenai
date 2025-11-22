"use client";

import { User, LogOut } from "lucide-react";
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

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-2">
        <span className="font-medium text-sm">{displayName}</span>
      </div>
      <button
        className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300"
        title="Perfil"
      >
        <User className="w-4 h-4" />
      </button>
      <button
        onClick={handleLogout}
        className="p-2 text-foreground rounded-full hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
}
