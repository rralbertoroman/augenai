"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { PredictionProvider } from "@/contexts/prediction-context";
import { AuthProvider } from "@/contexts/auth-context";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PredictionProvider>{children}</PredictionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
