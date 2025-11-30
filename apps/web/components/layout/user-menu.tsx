"use client";

import { User, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleEditProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to profile edit page
    router.push("/profile/edit");
    setIsOpen(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    // Prevent the click from bubbling up and closing the dropdown
    e.stopPropagation();
  };

  const handleWrapperClick = () => {
    // Close the dropdown when clicking on the wrapper (outside the menu)
    setIsOpen(false);
  };

  if (!user) {
    return null;
  }

  // Extract user display name from metadata or email
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Usuario";

  return (
    <div className="relative" onClick={isOpen ? handleWrapperClick : undefined}>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <span className="font-medium text-sm">{displayName}</span>
        </div>
        <button
          onClick={toggleMenu}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          title="Menú de usuario"
        >
          <User className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
          onClick={handleMenuClick}
        >
          <button
            onClick={handleEditProfile}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <UserRound className="w-4 h-4 mr-2" />
            Editar perfil
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </button>
        </div>
      )}
    </div>
  );
}
