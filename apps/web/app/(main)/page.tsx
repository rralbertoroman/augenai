"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/dashboard/dashboard";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 animate-fadein">
      <div className="flex items-center justify-between gap-3">
        {/**Welcome */}
        <div className="flex flex-col gap-3">
          <p className="text-foreground dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Bienvenido
          </p>
        </div>
        {/**New Prediction */}
        <div className="max-w-[480px] w-full ml-auto">
          <Link href="/diagnosis/create" className="w-full">
            <Button variant="default" size="lg" className="w-full">
              <span className="truncate">Generar nueva predicción</span>
            </Button>
          </Link>
        </div>
      </div>

      {/**Dashboard */}
      <Dashboard />
    </main>
  );
}
