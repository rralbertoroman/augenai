"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useDiseases } from "@/hooks/use-diseases";

interface DiseaseMultiSelectProps {
  selectedDiseases: string[];
  onChange: (diseases: string[]) => void;
  error?: string;
}

export function DiseaseMultiSelect({
  selectedDiseases,
  onChange,
  error,
}: DiseaseMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { diseases, isLoading } = useDiseases();

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

  const handleSelect = (id: string) => {
    if (!selectedDiseases.includes(id)) {
      onChange([...selectedDiseases, id]);
    }
  };

  const handleRemove = (disease: string) => {
    onChange(selectedDiseases.filter((d) => d !== disease));
  };

  const availableOptions = diseases.filter(
    (disease) =>
      !selectedDiseases.includes(disease.id) &&
      !disease.name.toLowerCase().includes("desconocida"),
  );

  return (
    <div className="space-y-2 w-full">
      <Label className="text-sm font-medium">Enfermedades sospechadas</Label>

      <div className="relative" ref={containerRef}>
        {/* Input-like container with tags */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:border-ring transition-colors flex flex-wrap gap-2 items-center"
        >
          {selectedDiseases.length > 0 ? (
            selectedDiseases.map((diseaseId) => {
              const disease = diseases.find((d) => d.id === diseaseId);
              return (
                <Badge
                  key={diseaseId}
                  variant="secondary"
                  className="gap-1 h-6"
                >
                  {disease?.name || diseaseId}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(diseaseId);
                    }}
                    className="ml-1 hover:text-destructive inline-flex items-center justify-center"
                    aria-label="Eliminar enfermedad"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })
          ) : (
            <span className="text-muted-foreground">
              Selecciona enfermedades...
            </span>
          )}
          <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full bottom-full mb-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Cargando enfermedades...
              </div>
            ) : diseases.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No hay enfermedades disponibles
              </div>
            ) : availableOptions.length > 0 ? (
              availableOptions.map((disease) => (
                <div
                  key={disease.id}
                  onClick={() => handleSelect(disease.id)}
                  className="px-3 py-2 text-sm hover:bg-accent cursor-pointer transition-colors"
                >
                  {disease.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Todas las enfermedades seleccionadas
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
