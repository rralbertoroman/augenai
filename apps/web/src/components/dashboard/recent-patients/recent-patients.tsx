import { columns } from './columns';
import { DataTable } from './data-table';
import React from 'react';

import type { ColumnDef } from '@tanstack/react-table';
import type { Patient } from '@augenai/types';

const recentPatients:Patient[] = [
    {
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
    },{
        id: '2',
        name: 'Jane Doe',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        diagnosis: {
            disease: {
                name: 'Age Related Macular Degeneration',
                stages: ['M0', 'M1', 'M2']
            },
            currentStage: 'M1'
        },
        clinicalConditions: ['']
    }
]

interface RecentPatientsTablePresentationProps {
    columns: ColumnDef<Patient>[]
    data: Patient[]
}

const RecentPatientsTablePresentation: React.FC<RecentPatientsTablePresentationProps> = ({columns, data}) => {
    return (
        <div className="flex flex-col h-full w-full p-3">
            <h1 className="text-2xl font-bold mb-6">Recent Patients</h1>
            <DataTable columns={columns} data={data} />
        </div>
    )
}

const RecentPatientsTable: React.FC = () => {

    return <RecentPatientsTablePresentation columns={columns} data={recentPatients}/>
}

export default RecentPatientsTable;