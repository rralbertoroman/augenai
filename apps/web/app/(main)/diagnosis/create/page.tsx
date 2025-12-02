import { DiagnosisContainer } from "@/components/diagnosis/diagnosis-container";
import { Suspense } from "react";

export default function CreateDiagnosisPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DiagnosisContainer />
    </Suspense>
  );
}
