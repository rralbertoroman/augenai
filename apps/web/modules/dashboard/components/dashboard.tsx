import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartColumnStacked, ClipboardPlus, Sparkles } from "lucide-react";
import { MedicalStats } from "./medical-stats/MedicalStats";
import Start from "./start";
import ModelStats from "./model_stats";
import { DashboardProvider } from "@/contexts/dashboard-context";

enum TabsValue {
  START = "start",
  MEDICAL_STATS = "medical_stats",
  MODEL_STATS = "model_stats",
}

const DashboardContent: React.FC = () => {
  return (
    <div className="w-full p-4">
      <Tabs defaultValue="start" className="w-full">
        <TabsList className="grid w-full grid-cols-3 space-x-2 mb-4">
          <TabsTrigger
            value={TabsValue.START}
            className="p-2 hover:bg-muted/60"
          >
            <ClipboardPlus /> Inicio
          </TabsTrigger>
          <TabsTrigger
            value={TabsValue.MEDICAL_STATS}
            className="hover:bg-muted/60"
          >
            <ChartColumnStacked />
            Estadísticas de Pacientes y Enfermedades
          </TabsTrigger>
          <TabsTrigger
            value={TabsValue.MODEL_STATS}
            className="hover:bg-muted/60"
          >
            <Sparkles />
            Estadísticas del Modelo
          </TabsTrigger>
        </TabsList>
        <TabsContent value={TabsValue.START} className="p-4 border rounded-lg">
          <Start />
        </TabsContent>
        <TabsContent
          value={TabsValue.MEDICAL_STATS}
          className="p-4 border rounded-lg"
        >
          <MedicalStats />
        </TabsContent>
        <TabsContent
          value={TabsValue.MODEL_STATS}
          className="p-4 border rounded-lg"
        >
          <ModelStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default Dashboard;
