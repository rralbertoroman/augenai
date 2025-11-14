import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  currentPath?: string;
}

export function Navbar({ currentPath }: NavbarProps) {
  return (
    <nav
      className="border-b border-[#E5E5E5] bg-white shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center gap-6 px-6">
        {/* Home button */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/" aria-label="Go to home page">
            <Home className="size-5" aria-hidden="true" />
          </Link>
        </Button>

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-[#1A1A1A]">
          augenai
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6 ml-8" role="menubar">
          <Link
            href="/patients"
            className={`text-sm font-medium transition-colors hover:text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1 ${
              currentPath === "/patients" ? "text-[#1A1A1A]" : "text-[#666666]"
            }`}
            role="menuitem"
            aria-current={currentPath === "/patients" ? "page" : undefined}
          >
            Patients
          </Link>
          <Link
            href="/appointments"
            className={`text-sm font-medium transition-colors hover:text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1 ${
              currentPath === "/appointments"
                ? "text-[#1A1A1A]"
                : "text-[#666666]"
            }`}
            role="menuitem"
            aria-current={currentPath === "/appointments" ? "page" : undefined}
          >
            Appointments
          </Link>
          {/* <Link
            href="/user"
            className={`text-sm font-medium transition-colors hover:text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-2 py-1 ${
              currentPath === "/user" ? "text-[#1A1A1A]" : "text-[#666666]"
            }`}
            role="menuitem"
            aria-current={currentPath === "/user" ? "page" : undefined}
          >
            User
          </Link> */}
        </div>

        {/* Search fields */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search patient..."
              className="w-[200px] pl-9"
              aria-label="Search for patients"
            />
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search model..."
              className="w-[200px] pl-9"
              aria-label="Search for models"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
