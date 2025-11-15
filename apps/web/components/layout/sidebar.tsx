"use client";

import Link from "next/link";
import { useSidebar } from "@/hooks/use-sidebar";

export function Sidebar() {
  const { navigation, isActive } = useSidebar();

  return (
    <aside className="w-16 bg-card border-r flex flex-col items-center py-4 space-y-4">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
            isActive(item.href)
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted text-muted-foreground"
          }`}
          title={item.name}
        >
          <span className="text-2xl">{item.icon}</span>
        </Link>
      ))}
    </aside>
  );
}
