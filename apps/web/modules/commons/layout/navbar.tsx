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
    <header className="sticky top-0 z-10 w-full border-b border-border bg-background px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 transition-all ease-in-out duration-300 hover:scale-[1.05]"
          >
            <Image
              src="/augen 2.svg"
              alt="Logo"
              width={130}
              height={130}
              className="mx-1 dark:brightness-100 filter-[brightness(0)_saturate(100%)_invert(47%)_sepia(77%)_saturate(654%)_hue-rotate(117deg)_brightness(95%)_contrast(86%)] dark:filter-none"
            />
          </Link>

          {/* Navigation links */}
          <nav className="hidden items-center gap-2 lg:flex">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border border-muted-foreground/20 ${
                isActive("/") && pathname === "/"
                  ? "bg-secondary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-md">Panel</span>
            </Link>
            <Link
              href="/patients"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border border-muted-foreground/20 ${
                isActive("/patients")
                  ? "bg-secondary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-md">Pacientes</span>
            </Link>
            <Link
              href="/diagnosis"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border border-muted-foreground/20 ${
                isActive("/diagnosis")
                  ? "bg-secondary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <PieChart className="w-5 h-5" />
              <span className="text-md">Predicciones</span>
            </Link>
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <div className="border border-muted-foreground/20 rounded-lg">
            <ContactUsDialog />
          </div>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
