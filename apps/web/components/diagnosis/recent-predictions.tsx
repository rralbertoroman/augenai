import type { RecentPredictionsProps } from "@/types/diagnosis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RecentPredictions({ predictions }: RecentPredictionsProps) {
  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Recent Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table aria-label="Recent predictions table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Predicted Diagnosis</TableHead>
                <TableHead scope="col">Model</TableHead>
                <TableHead scope="col">Consultation Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {predictions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No predictions available
                  </TableCell>
                </TableRow>
              ) : (
                predictions.map((prediction) => (
                  <TableRow key={prediction.id}>
                    <TableCell className="font-medium">
                      {prediction.diagnosis}
                    </TableCell>
                    <TableCell>{prediction.model}</TableCell>
                    <TableCell>
                      <time
                        dateTime={prediction.consultationDate.toISOString()}
                      >
                        {formatDate(prediction.consultationDate)}
                      </time>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
