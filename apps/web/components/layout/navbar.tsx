import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface NavbarProps {
  currentPath?: string;
}

export function Navbar({ currentPath }: NavbarProps) {
  return (
    <nav
      className="border-b bg-card shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center gap-6 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold text-foreground hover:text-foreground/80 transition-colors"
        >
          AugenAi
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6 ml-8" role="menubar">
          <Link
            href="/patients"
            className={`text-md font-medium transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1 ${
              currentPath === "/patients"
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
            role="menuitem"
            aria-current={currentPath === "/patients" ? "page" : undefined}
          >
            Patients
          </Link>
        </div>

        {/* Theme toggle and user menu */}
        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />
          <div className="h-8 w-px bg-border" />
          <UserMenu />
        </div>
      </div>
    </nav>
  );
}
