import React from "react";
import Inference from "../inference/inference";

const Dashboard:React.FC = () => {
    return (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
            <Inference />
            <div className="bg-green-300">Q1</div>
            <div className="bg-yellow-300">Q3</div>
            <div className="bg-blue-300">Q2</div>
        </div>
    )
}

export default Dashboard;