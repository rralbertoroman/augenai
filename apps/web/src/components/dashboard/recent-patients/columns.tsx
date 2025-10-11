import type {ColumnDef} from "@tanstack/react-table";
import type {Patient, Diagnosis} from '@augenai/types';

export const columns: ColumnDef<Patient>[]=[
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'dateOfBirth',
        header: 'Age',
        cell: ({row}) => {
            const dateOfBirth = row.getValue('dateOfBirth') as string;
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const month = today.getMonth() - birthDate.getMonth();
            if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        }
    },
    {
        accessorKey: 'gender',
        header: 'Gender',
    },
    {
        accessorKey: 'diagnosis',
        header: 'Disease - Stage',
        cell: ({row}) => {
            const diagnosis = row.getValue('diagnosis') as Diagnosis;
            return `${diagnosis.disease.name} - ${diagnosis.currentStage}`;
        }
    },
    {
        accessorKey: 'clinicalConditions',
        header: 'Clinical Conditions'
    }
]