"use client";

import { use } from "react";
import { PredictionDetailContainer } from "@/modules/predictions/containers";

export default function PredictionDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = use(params);
  return <PredictionDetailContainer requestId={requestId} />;
}
