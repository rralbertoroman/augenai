import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface DiseaseMultiSelectProps {
  selectedDiseases: string[];
  onChange: (diseases: string[]) => void;
  error?: string;
}

// Common eye diseases - can be fetched from API later
const AVAILABLE_DISEASES = [
  { value: "diabetic_retinopathy", label: "Diabetic Retinopathy" },
  { value: "glaucoma", label: "Glaucoma" },
  { value: "age_related_macular_degeneration", label: "AMD" },
  { value: "cataract", label: "Cataract" },
  { value: "retinal_detachment", label: "Retinal Detachment" },
  { value: "hypertensive_retinopathy", label: "Hypertensive Retinopathy" },
];

export function DiseaseMultiSelect({
  selectedDiseases,
  onChange,
  error,
}: DiseaseMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    if (!selectedDiseases.includes(value)) {
      onChange([...selectedDiseases, value]);
    }
  };

  const handleRemove = (disease: string) => {
    onChange(selectedDiseases.filter((d) => d !== disease));
  };

  const availableOptions = AVAILABLE_DISEASES.filter(
    (disease) => !selectedDiseases.includes(disease.value),
  );

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-medium">Suspected Diseases</Label>

      <div className="relative" ref={containerRef}>
        {/* Input-like container with tags */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-ring transition-colors flex flex-wrap gap-2 items-center"
        >
          {selectedDiseases.length > 0 ? (
            selectedDiseases.map((disease) => {
              const diseaseLabel =
                AVAILABLE_DISEASES.find((d) => d.value === disease)?.label ||
                disease;
              return (
                <Badge key={disease} variant="secondary" className="gap-1 h-6">
                  {diseaseLabel}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(disease);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })
          ) : (
            <span className="text-muted-foreground">Select diseases...</span>
          )}
          <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full bottom-full mb-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
            {availableOptions.length > 0 ? (
              availableOptions.map((disease) => (
                <div
                  key={disease.value}
                  onClick={() => handleSelect(disease.value)}
                  className="px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors"
                >
                  {disease.label}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                All diseases selected
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
