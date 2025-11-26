import React from "react";
import { STAGE_TOTAL_CONFIG, COHORT_DATA_CONFIG } from "./constants";
import { StageTotalChart } from "./components/StageTotalChart";
import { DiseaseCohortChart } from "./components/DiseaseCohortChart";

export const MedicalStats: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Medical Statistics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Overview of patient statistics across different eye conditions and
          stages.
        </p>
      </div>

      <div className="space-y-8">
        {/* Overall Stage Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <StageTotalChart
            dataConfig={STAGE_TOTAL_CONFIG}
            title="Overall Disease Stage Distribution"
          />
        </div>

        {/* Age Cohort Breakdown */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Age Cohort Analysis</h3>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {COHORT_DATA_CONFIG.map((diseaseData, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
              >
                <DiseaseCohortChart diseaseData={diseaseData} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalStats;
