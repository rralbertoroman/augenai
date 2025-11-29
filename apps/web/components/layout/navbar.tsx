"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LayoutDashboard, Users, PieChart } from "lucide-react";
import Image from 'next/image';

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-card px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/augen-full.svg" alt="Logo" width={120} height={120} className="mx-1"/>
          </Link>

          {/* Navigation links */}
          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/") && pathname === "/"
                  ? "bg-primary/20 text-foreground dark:bg-primary/30 dark:text-white"
                  : "text-foreground hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Panel</span>
            </Link>
            <Link
              href="/patients"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/patients")
                  ? "bg-primary/20 text-foreground dark:bg-primary/30 dark:text-white"
                  : "text-foreground hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Pacientes</span>
            </Link>
            <Link
              href="/diagnosis"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/diagnosis")
                  ? "bg-primary/20 text-foreground dark:bg-primary/30 dark:text-white"
                  : "text-foreground hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span>Predicciones</span>
            </Link>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
