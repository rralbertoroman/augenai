"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const {
    displayName,
    isLoading,
    totalPatients,
    totalPredictions,
    avgConfidence,
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
        <div className="flex flex-col gap-3">
          <p className="text-foreground dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Bienvenido, Dr. {displayName}
          </p>
        </div>
        <div className="max-w-[480px] w-full ml-auto">
          <Link href="/diagnosis/create" className="w-full">
            <Button variant="default" size="lg" className="w-full">
              <span className="truncate">Generar nueva predicción</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900 animate-fadein">
          <p className="text-foreground dark:text-gray-300 text-base font-medium leading-normal">
            Total Pacientes
          </p>
          <p className="text-foreground dark:text-white tracking-light text-4xl font-bold leading-tight">
            {totalPatients}
          </p>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 dark:border-gray-700 dark:bg-gray-900 animate-fadein">
          <p className="text-foreground dark:text-gray-300 text-base font-medium leading-normal">
            Total Predicciones
          </p>
          <p className="text-foreground dark:text-white tracking-light text-4xl font-bold leading-tight">
            {totalPredictions}
          </p>
        </div>
        <div className="lg:col-span-2 flex flex-col gap-4 rounded-lg border border-primary/50 bg-primary/20 p-6 dark:border-primary/50 dark:bg-primary/30 animate-fadein">
          <p className="text-foreground dark:text-gray-200 text-base font-medium leading-normal">
            Confianza promedio de predicción
          </p>
          <div className="flex items-end gap-3">
            <p className="text-green-800 dark:text-primary tracking-tight text-5xl font-bold leading-none">
              {avgConfidence}%
            </p>
            <div className="flex flex-col">
              <div className="flex items-center text-sm font-medium text-green-700 dark:text-primary/90">
                <span>↑ 2.1%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                vs últimos 30 días
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
