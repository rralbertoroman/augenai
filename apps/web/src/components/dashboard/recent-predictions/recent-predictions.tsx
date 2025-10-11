import { columns } from './columns';
import { DataTable } from './data-table';
import React from 'react';

import type { ColumnDef } from '@tanstack/react-table';
import type { Prediction } from '@augenai/types';

const recentPredictions:Prediction[] = [
    {
        id: '1',
        patient: {
            id: '1',
            name: 'John Doe',
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            diagnosis: {
                disease: {
                    name: 'Diabetic Retinopathy',
                    stages: ['R0', 'R1', 'R2', 'R3', 'R4']
                },
                currentStage: 'R1'
            },
            clinicalConditions: ['Diabetes Type 2']
        },
        model: {
            modelName: 'Diabetic Retinopathy Classifier',
            modelTasks: ['Image Classification'],
            diseases: [{name: 'Diabetic Retinopathy', stages: ['R0', 'R1', 'R2', 'R3', 'R4']}],
            acceptedImageTypes: ['fundus'],
            latestTraining: '',
            accuracy: 0
        },
        predictedDiagnosis: {
            disease: {
                name: 'Diabetic Retinopathy',
                stages: ['R0', 'R1', 'R2', 'R3', 'R4']
            },
            currentStage: 'R1'
        },
        consultationDate: '2023-05-10',
    }
]

interface RecentPredictionsTablePresentationProps {
    columns: ColumnDef<Prediction>[]
    data: Prediction[]
}

const RecentPredictionsTablePresentation: React.FC<RecentPredictionsTablePresentationProps> = ({columns, data}) => {
    return (
        <div className="flex flex-col h-full w-full p-3">
            <h1 className="text-2xl font-bold mb-6">Recent Predictions</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}

const RecentPredictionsTable: React.FC = () => {

    return <RecentPredictionsTablePresentation columns={columns} data={recentPredictions}/>
}

export default RecentPredictionsTable;