"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Dashboard from "@/components/dashboard/dashboard";

export default function HomePage() {
  const {
    displayName,
    isLoading,
  } = useDashboard();

  if (isLoading) {
    return (
      <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8">
        <SkeletonLoader width="100%" height={80} className="mb-6" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <SkeletonLoader width="100%" height={120} className="mb-6" />
          <SkeletonLoader width="100%" height={120} className="mb-6" />
          <SkeletonLoader
            width="100%"
            height={120}
            className="mb-6 lg:col-span-2"
          />
        </div>
        <SkeletonLoader width="100%" height={320} />
      </main>
    );
  }
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 animate-fadein">
      <div className="flex items-center justify-between gap-3">
        {/**Welcome */}
        <div className="flex flex-col gap-3">
          <p className="text-foreground dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Bienvenido, Dr. {displayName}
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
