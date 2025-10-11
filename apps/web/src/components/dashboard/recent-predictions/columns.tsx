import type {ColumnDef} from "@tanstack/react-table";
import type {Diagnosis, Model, Prediction} from '@augenai/types';

export const columns: ColumnDef<Prediction>[]=[
    {
        accessorKey: 'predictedDiagnosis',
        header: 'Predicted Diagnosis',
        cell: ({row}) => {
            const diagnosis = row.getValue('predictedDiagnosis') as Diagnosis;
            return `${diagnosis.disease.name} - ${diagnosis.currentStage}`;
        }
    },
    {
        accessorKey: 'model',
        header: 'Model',
        cell: ({row}) => {
            const model = row.getValue("model") as Model;
            return model.modelName;
        }
    },
    {
        accessorKey: 'consultationDate',
        header: 'Consultation Date',
        cell: ({row}) => {
            const consultationDate = row.getValue("consultationDate") as string;
            const date = new Date(consultationDate);
            return date.toLocaleDateString();
        }
    }
]