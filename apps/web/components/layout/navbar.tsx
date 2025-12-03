"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContactUsDialog } from "./contact-us-dialog";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { LayoutDashboard, Users, PieChart } from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/augen 2.svg"
              alt="Logo"
              width={150}
              height={150}
              className="mx-1"
            />
          </Link>

          {/* Navigation links */}
          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/") && pathname === "/"
                  ? "bg-secondary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-primary-foreground"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-md">Panel</span>
            </Link>
            <Link
              href="/patients"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/patients")
                  ? "bg-secondary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-primary-foreground"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-md">Pacientes</span>
            </Link>
            <Link
              href="/diagnosis"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/diagnosis")
                  ? "bg-secondary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-primary-foreground"
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span className="text-md">Predicciones</span>
            </Link>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <ContactUsDialog />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
