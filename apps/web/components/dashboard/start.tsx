"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Formatting functions using native Date methods

// Mock data based on the prediction request reference
type FeedbackStatus = "reviewed" | "pending" | "not_sent";

interface Prediction {
  id: string;
  class_id: string;
  confidence: number;
  disease_id: string;
  disease_name: string;
  stage_idx: number;
  stage_content: string;
  patient_id: string;
  request_id: string;
  createdAt: Date;
  type: string;
  patient_name: string;
  patient_age: number;
  image_url: string;
  feedback_status: FeedbackStatus;
}

const mockPredictions: Prediction[] = [
  {
    id: "pred-001",
    class_id: "class-123",
    confidence: 0.92,
    disease_id: "disease-456",
    disease_name: "Retinopatía Diabética",
    stage_idx: 2,
    stage_content: "Moderada no proliferativa",
    patient_id: "patient-789",
    request_id: "req-101",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Juan Pérez",
    patient_age: 45,
    image_url: "/placeholder-retina.jpg",
    feedback_status: "reviewed",
  },
  {
    id: "pred-002",
    class_id: "class-124",
    confidence: 0.87,
    disease_id: "disease-457",
    disease_name: "Glaucoma",
    stage_idx: 1,
    stage_content: "Etapa temprana",
    patient_id: "patient-790",
    request_id: "req-102",
    createdAt: new Date(),
    type: "classification",
    patient_name: "María García",
    patient_age: 62,
    image_url: "/placeholder-retina-2.jpg",
    feedback_status: "pending",
  },
  {
    id: "pred-003",
    class_id: "class-125",
    confidence: 0.95,
    disease_id: "disease-458",
    disease_name: "Degeneración Macular",
    stage_idx: 0,
    stage_content: "Detección temprana",
    patient_id: "patient-791",
    request_id: "req-103",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Carlos López",
    patient_age: 58,
    image_url: "/placeholder-retina-3.jpg",
    feedback_status: "not_sent",
  },
  {
    id: "pred-004",
    class_id: "class-126",
    confidence: 0.78,
    disease_id: "disease-459",
    disease_name: "Cataratas",
    stage_idx: 1,
    stage_content: "Incipiente",
    patient_id: "patient-792",
    request_id: "req-104",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Ana Martínez",
    patient_age: 67,
    image_url: "/placeholder-retina-4.jpg",
    feedback_status: "pending",
  },
  {
    id: "pred-005",
    class_id: "class-127",
    confidence: 0.91,
    disease_id: "disease-460",
    disease_name: "Edema Macular",
    stage_idx: 2,
    stage_content: "Moderado",
    patient_id: "patient-793",
    request_id: "req-105",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Luis Rodríguez",
    patient_age: 53,
    image_url: "/placeholder-retina-5.jpg",
    feedback_status: "reviewed",
  },
  {
    id: "pred-006",
    class_id: "class-128",
    confidence: 0.82,
    disease_id: "disease-461",
    disease_name: "Oclusión de Vena Retiniana",
    stage_idx: 1,
    stage_content: "Leve",
    patient_id: "patient-794",
    request_id: "req-106",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Sofía López",
    patient_age: 61,
    image_url: "/placeholder-retina-6.jpg",
    feedback_status: "not_sent",
  },
  {
    id: "pred-007",
    class_id: "class-129",
    confidence: 0.89,
    disease_id: "disease-462",
    disease_name: "Retinopatía Hipertensiva",
    stage_idx: 2,
    stage_content: "Moderada",
    patient_id: "patient-795",
    request_id: "req-107",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Miguel Sánchez",
    patient_age: 59,
    image_url: "/placeholder-retina-7.jpg",
    feedback_status: "pending",
  },
  {
    id: "pred-008",
    class_id: "class-130",
    confidence: 0.94,
    disease_id: "disease-463",
    disease_name: "Coriorretinopatía Serosa Central",
    stage_idx: 0,
    stage_content: "Aguda",
    patient_id: "patient-796",
    request_id: "req-108",
    createdAt: new Date(),
    type: "classification",
    patient_name: "Elena Ramírez",
    patient_age: 48,
    image_url: "/placeholder-retina-8.jpg",
    feedback_status: "reviewed",
  },
];

const formatDate = (date: Date) => {
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getConfidenceVariant = (confidence: number) => {
  if (confidence > 0.9) return "default";
  if (confidence > 0.7) return "secondary";
  return "destructive";
};

const STAGE_COLORS = {
  light: {
    healthy: { bg: "bg-[#dcfce7]", text: "text-[#166534]" },
    early: { bg: "bg-[#fee7b7]", text: "text-[#92400e]" },
    moderate: { bg: "bg-[#f4d399]", text: "text-[#9a3412]" },
    severe: { bg: "bg-[#ef4444]", text: "text-white" },
    critical: { bg: "bg-[#4c0519]", text: "text-white" },
    default: { bg: "bg-gray-100", text: "text-gray-800" },
  },
  dark: {
    healthy: { bg: "bg-[#10b981]", text: "text-[#ecfdf5]" },
    early: { bg: "bg-[#f4d399]", text: "text-[#9a3412]" },
    moderate: { bg: "bg-[#f0b981]", text: "text-[#9a3412]" },
    severe: { bg: "bg-[#dc0026]", text: "text-white" },
    critical: { bg: "bg-[#9f1239]", text: "text-white" },
    default: { bg: "bg-gray-700", text: "text-gray-200" },
  },
} as const;

const getStageVariant = (stage: string) => {
  // Default to light theme for now - you can make this dynamic based on theme
  const theme = "light";
  const stageLower = stage.toLowerCase();

  // Healthy/No Disease
  if (stageLower.includes("saludable") || stageLower.includes("healthy")) {
    return STAGE_COLORS[theme].healthy;
  }

  // Early/Mild Stages
  if (
    stageLower.includes("tempran") ||
    stageLower.includes("leve") ||
    stageLower.includes("early") ||
    stageLower.includes("mild")
  ) {
    return STAGE_COLORS[theme].early;
  }

  // Moderate Stages
  if (stageLower.includes("moderad") || stageLower.includes("intermedia")) {
    return STAGE_COLORS[theme].moderate;
  }

  // Severe/Advanced Stages
  if (stageLower.includes("sever") || stageLower.includes("avanzad")) {
    return STAGE_COLORS[theme].severe;
  }

  // Proliferative/Critical Stages
  if (stageLower.includes("proliferat") || stageLower.includes("crític")) {
    return STAGE_COLORS[theme].critical;
  }

  return STAGE_COLORS[theme].default;
};

const getFeedbackVariant = (status: FeedbackStatus) => {
  // Use the same theme as getStageVariant for consistency
  const theme = "light";

  switch (status) {
    case "reviewed":
      return {
        ...STAGE_COLORS[theme].healthy,
        label: "Revisado",
      };
    case "pending":
      return {
        ...STAGE_COLORS[theme].early,
        label: "Pendiente",
      };
    case "not_sent":
      return {
        ...STAGE_COLORS[theme].default,
        label: "No enviado",
      };
    default:
      return {
        ...STAGE_COLORS[theme].default,
        label: "Desconocido",
      };
  }
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const Start: React.FC = () => {
  const todayPredictions = mockPredictions.filter((prediction) =>
    isToday(new Date(prediction.createdAt)),
  );

  if (todayPredictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          No hay predicciones hoy
        </h2>
        <p className="text-muted-foreground">
          No se han realizado predicciones hoy.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Predicciones de Hoy
        </h2>
        <p className="text-muted-foreground">
          Últimas predicciones realizadas hoy
        </p>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3" scope="col">
                Fecha
              </th>
              <th className="px-6 py-3" scope="col">
                Paciente
              </th>
              <th className="px-6 py-3" scope="col">
                Diagnóstico
              </th>
              <th className="px-6 py-3 text-right" scope="col">
                Confianza
              </th>
              <th className="px-6 py-3 text-right" scope="col">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {todayPredictions.map((prediction) => (
              <tr key={prediction.id} className="border-t hover:bg-muted/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col">
                    <span>{formatDate(new Date(prediction.createdAt))}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(new Date(prediction.createdAt))}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{prediction.patient_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {prediction.patient_age} años
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium">{prediction.disease_name}</div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageVariant(prediction.stage_content).bg} ${getStageVariant(prediction.stage_content).text}`}
                  >
                    {prediction.stage_content}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Badge variant={getConfidenceVariant(prediction.confidence)}>
                    {Math.round(prediction.confidence * 100)}%
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFeedbackVariant(prediction.feedback_status).bg} ${getFeedbackVariant(prediction.feedback_status).text}`}
                  >
                    {getFeedbackVariant(prediction.feedback_status).label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Start;
