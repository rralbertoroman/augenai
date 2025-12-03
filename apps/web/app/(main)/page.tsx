"use client";

import { CreatePredictionModal } from "@/components/diagnosis/create-prediction-modal";
import Dashboard from "@/components/dashboard/dashboard";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 animate-fadein">
      <div className="flex items-center justify-between gap-3">
        {/**Welcome */}
        <div className="flex flex-col gap-3">
          <p className="text-foreground text-3xl font-semibold leading-tight tracking-[-0.033em] pb-6">
            Bienvenido
          </p>
        </div>
        {/**New Prediction */}
        <div className="max-w-[480px] w-full ml-auto">
          <CreatePredictionModal
            trigger={
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                <span className="truncate">Generar nueva predicción</span>
              </button>
            }
          />
        </div>
      </div>

      {/**Dashboard */}
      <Dashboard />
    </main>
  );
}
