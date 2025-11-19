"use client";

import { RecentPredictions } from "@/components/diagnosis/recent-predictions";
import { RecentPatients } from "@/components/diagnosis/recent-patients";
import { mockPredictions, mockPatients } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">History</h1>
        <p className="text-muted-foreground">
          View recent predictions and patient records
        </p>
      </div>

      <section className="space-y-8">
        <div className="overflow-x-auto">
          <RecentPredictions predictions={mockPredictions} />
        </div>

        <div className="overflow-x-auto">
          <RecentPatients patients={mockPatients} />
        </div>
      </section>
    </main>
  );
}
