import { Navbar } from "@/modules/commons/layout/navbar";
import { SharedDataProvider } from "@/modules/commons/contexts";
import { PatientsProvider } from "@/modules/patients/contexts";
import { DashboardProvider } from "@/modules/dashboard/contexts";
import { PredictionRequestsProvider } from "@/modules/predictions/contexts";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SharedDataProvider>
      <PatientsProvider>
        <PredictionRequestsProvider>
          <DashboardProvider>
            <div className="flex min-h-screen w-full flex-col bg-background">
              <Navbar />
              {children}
            </div>
          </DashboardProvider>
        </PredictionRequestsProvider>
      </PatientsProvider>
    </SharedDataProvider>
  );
}
