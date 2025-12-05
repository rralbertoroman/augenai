"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import {
  formatDate,
  formatTime,
  getTaskLabel,
} from "@/modules/predictions/contexts";
import type { PredictionRequest } from "@/server/zod-schemas/prediction_workflow";

interface PredictionRequestListProps {
  requests: PredictionRequest[];
  onShare?: (requestId: string) => void;
}

export function PredictionRequestList({
  requests,
  onShare,
}: PredictionRequestListProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Paciente</TableHead>
          <TableHead>Tipo de Tarea</TableHead>
          <TableHead>Enfermedades Sospechadas</TableHead>
          <TableHead className="text-center">Predicciones</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              No se encontraron solicitudes de predicción
            </TableCell>
          </TableRow>
        ) : (
          requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium text-foreground">
                <div className="flex flex-col">
                  <span>{formatDate(request.created_at)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(request.created_at)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {request.patient_name || "N/A"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getTaskLabel(request.task)}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {request.diseaseNames?.map(
                    (diseaseName: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {diseaseName}
                      </Badge>
                    ),
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className="font-semibold text-foreground">
                  {request.totalPredictions}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="font-semibold"
                    onClick={() => router.push(`/diagnosis/${request.id}`)}
                  >
                    Ver detalles
                  </Button>
                  {onShare && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="font-semibold border border-border"
                      onClick={() => onShare(request.id)}
                    >
                      Compartir
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
