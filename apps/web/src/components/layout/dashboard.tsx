import React from "react";
import Inference from "@/components/inference/inference";
import { ModelScorecard } from "@/components/model/model-scorecard";
import RecentPatients from "../dashboard/recent-patients/recent-patients";
import RecentPredictionsTable from "../dashboard/recent-predictions/recent-predictions";

const Dashboard:React.FC = () => {
    return (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
            <Inference />
            <ModelScorecard />
            <RecentPredictionsTable />
            <RecentPatients />
        </div>
    )
}

export default Dashboard;