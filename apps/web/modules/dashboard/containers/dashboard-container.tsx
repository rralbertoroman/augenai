"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserProfileById } from "@/server/services/user_profile";
import { CreatePredictionModal } from "@/modules/diagnosis/components/create-prediction-modal";
import Dashboard from "../components/dashboard";
import { Button } from "@/components/ui/button";

/**
 * DashboardContainer - Main container for the home/dashboard page.
 * Handles user profile loading and orchestrates the dashboard layout.
 * Following SyncLat's container pattern: containers compose components and handle orchestration.
 */
export function DashboardContainer() {
  const { user, accessToken } = useAuth();
  const [userName, setUserName] = useState<string>("Doctor");

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.id && accessToken) {
        try {
          const profile = await getUserProfileById(user.id);
          if (profile?.name) {
            setUserName(profile.name);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };
    loadUserProfile();
  }, [user?.id, accessToken]);

  return (
    <main className="flex flex-1 flex-col p-4 sm:p-6 lg:p-8 animate-fadein">
      {/* Header Section */}
      <DashboardHeader userName={userName} />

      {/* Dashboard Content */}
      <Dashboard />
    </main>
  );
}

/**
 * DashboardHeader - Header section with welcome message and new prediction button
 */
function DashboardHeader({ userName }: { userName: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      {/* Welcome */}
      <div className="flex flex-col gap-3">
        <h1
          className="text-foreground/70 text-5xl font-bold leading-tight pb-6"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Hola de nuevo, Dr. {userName}
        </h1>
      </div>
      {/* New Prediction */}
      <div className="max-w-[480px] w-full ml-auto">
        <CreatePredictionModal
          trigger={
            <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
              <span className="truncate">Generar nueva predicción</span>
            </Button>
          }
        />
      </div>
    </div>
  );
}
