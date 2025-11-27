import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartColumnStacked, ClipboardPlus, Sparkles } from "lucide-react";
import { MedicalStats } from "@/components/dashboard/medical-stats/MedicalStats";
import Start from "./start";
import ModelStats from "./model_stats";

enum TabsValue {
  START = "start",
  MEDICAL_STATS = "medical_stats",
  MODEL_STATS = "model_stats",
}

const Dashboard: React.FC = () => {
  return (
    <div className="w-full p-4">
      <Tabs defaultValue="start" className="w-full">
        <TabsList className="grid w-full grid-cols-3 space-x-2 mb-4">
          <TabsTrigger value={TabsValue.START}>
            <ClipboardPlus /> Start
          </TabsTrigger>
          <TabsTrigger value={TabsValue.MEDICAL_STATS}>
            <ChartColumnStacked />
            Patient and Disease stats
          </TabsTrigger>
          <TabsTrigger value={TabsValue.MODEL_STATS}>
            <Sparkles />
            Model Stats
          </TabsTrigger>
        </TabsList>
        <TabsContent value={TabsValue.START} className="p-4 border rounded-lg">
          <Start />
        </TabsContent>
        <TabsContent
          value={TabsValue.MEDICAL_STATS}
          className="p-4 border rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4">
            Patient and Disease stats
          </h2>
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

export default Dashboard;
