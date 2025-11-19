import { usePathname } from "next/navigation";

const navigation = [
  { name: "Diagnosis", href: "/", icon: "🔬" },
  { name: "History", href: "/history", icon: "📊" },
];

export function useSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return {
    navigation,
    isActive,
  };
}
