import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClassificationObject } from "@/types/prediction";

interface PredictionsTableProps {
  predictions: ClassificationObject[];
}

export function PredictionsTable({ predictions }: PredictionsTableProps) {
  if (predictions.length <= 1) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">All Predictions</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.map((pred) => (
            <TableRow key={pred.class_id}>
              <TableCell className="font-medium">{pred.class_name}</TableCell>
              <TableCell>{(pred.confidence * 100).toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
