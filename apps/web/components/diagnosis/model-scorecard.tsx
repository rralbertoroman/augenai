import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ModelInfo } from "@/lib/mock-data";

interface ModelScorecardProps {
  modelData: ModelInfo;
}

export function ModelScorecard({ modelData }: ModelScorecardProps) {
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card className="h-fit shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Model Scorecard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Name */}
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            {modelData.name}
          </h3>
        </div>

        {/* Tasks Section */}
        <div>
          <h4
            className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2"
            id="model-tasks"
          >
            TASKS
          </h4>
          <ul className="space-y-1" aria-labelledby="model-tasks">
            {modelData.tasks.map((task, index) => (
              <li key={index} className="text-sm text-[#1A1A1A]">
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Diseases Section */}
        <div>
          <h4
            className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2"
            id="model-diseases"
          >
            DISEASES
          </h4>
          <div
            className="space-y-3"
            role="list"
            aria-labelledby="model-diseases"
          >
            {modelData.diseases.map((disease, index) => (
              <div key={index} role="listitem">
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {disease.name}
                </p>
                <p className="text-sm text-[#666666]">
                  Stages: {disease.stages.join("/")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Accepted Image Types Section */}
        <div>
          <h4 className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2">
            ACCEPTED IMAGE TYPES
          </h4>
          <p className="text-sm text-[#1A1A1A]">
            {modelData.acceptedImageTypes.join(", ")}
          </p>
        </div>

        {/* Latest Training Section */}
        <div>
          <h4 className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2">
            LATEST TRAINING
          </h4>
          <p className="text-sm text-[#1A1A1A]">
            {formatDate(modelData.latestTraining)}
          </p>
        </div>

        {/* Accuracy Section */}
        <div>
          <h4
            className="text-xs font-semibold text-[#666666] uppercase tracking-wide mb-2"
            id="model-accuracy"
          >
            ACCURACY
          </h4>
          <Badge
            className="bg-[#FCD34D] text-[#000000] border-[#FCD34D] hover:bg-[#FCD34D] font-semibold px-3 py-1 text-sm"
            aria-labelledby="model-accuracy"
            role="status"
          >
            {modelData.accuracy}%
          </Badge>
        </div>

        {/* Learn More Link */}
        <div className="pt-2">
          <a
            href="#"
            className="text-sm text-[#1A1A1A] hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            aria-label="Learn more about the DiabeticRetinopathyClassifier model"
          >
            Learn more about this model →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
