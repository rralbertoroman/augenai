import React from "react";
import Inference from "@/components/inference/inference";
import { ModelScorecard } from "@/components/model/model-scorecard";
import RecentPatients from "@/components/dashboard/recent-patients/recent-patients";
import RecentPredictionsTable from "@/components/dashboard/recent-predictions/recent-predictions";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

const Dashboard:React.FC = () => {
    return (
        <>
            <div className="flex flex-row justify-between p-4">
                <div className="flex flex-row w-full justify-start gap-4">
                    <Button variant={'ghost'} className="disabled"><Save/></Button>
                </div>
                <div className="flex flex-row w-full justify-end gap-4">
                    <div className="flex flex-row w-full gap-2">
                        <label htmlFor="search-name" className="sr-only">
                            Search by name
                        </label>
                        <input
                            type="text"
                            id="search-name"
                            name="search-name"
                            className="block w-full rounded-l-md border border-gray-300 py-2 pl-3 pr-3 text-sm leading-6 text-gray-900 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Search patient..."
                        />
                    </div>
                    <div className="flex flex-row w-full gap-2">
                        <label htmlFor="search-model" className="sr-only">
                            Search by model name
                        </label>
                        <input
                            type="text"
                            id="search-model"
                            name="search-model"
                            className="block w-full rounded-r-md border border-gray-300 py-2 pl-3 pr-3 text-sm leading-6 text-gray-900 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Search model..."
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                <Inference />
                <ModelScorecard />
                <RecentPredictionsTable />
                <RecentPatients />
            </div>
        </>
    )
}

export default Dashboard;