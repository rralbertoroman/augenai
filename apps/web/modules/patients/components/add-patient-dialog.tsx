"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ClipboardDialog } from "@/modules/commons/clipboard/clipboard-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PatientDialogProps {
  onSave: (data: {
    name: string;
    dateOfBirth: string;
    gender: string;
    clinicalConditions: string[];
  }) => Promise<boolean>;
  patient?: {
    id: string;
    name: string;
    dateOfBirth: string;
    gender: string;
    clinicalConditions: string;
  };
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PatientDialog({
  onSave,
  patient,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: PatientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState({
    name: patient?.name || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    clinicalConditions: patient?.clinicalConditions || "",
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    patient?.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
  );
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    clinicalConditions: patient?.clinicalConditions || "",
  });

  useEffect(() => {
    if (patient) {
      const dateOfBirth = patient.dateOfBirth;
      const initialData = {
        name: patient.name,
        dateOfBirth: dateOfBirth,
        gender: patient.gender,
        clinicalConditions: patient.clinicalConditions,
      };
      setInitialFormData(initialData);
      setFormData(initialData);
      setSelectedDate(dateOfBirth ? new Date(dateOfBirth) : undefined);
      setHasChanges(false);
    } else {
      const emptyData = {
        name: "",
        dateOfBirth: "",
        gender: "",
        clinicalConditions: "",
      };
      setInitialFormData(emptyData);
      setFormData(emptyData);
      setSelectedDate(undefined);
      setHasChanges(false);
    }
  }, [patient]);

  useEffect(() => {
    if (patient) {
      // Only track changes if we're in edit mode
      const hasDataChanged =
        JSON.stringify(formData) !== JSON.stringify(initialFormData);
      setHasChanges(hasDataChanged);
    }
  }, [formData, initialFormData, patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const conditions = formData.clinicalConditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const success = await onSave({
        ...formData,
        clinicalConditions: conditions,
      });

      if (success) {
        setOpen(false);
        setFormData({
          name: "",
          dateOfBirth: "",
          gender: "",
          clinicalConditions: "",
        });
      } else {
        setError("Error al crear el paciente. Por favor, intenta nuevamente.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ClipboardDialog
      open={isOpen}
      onOpenChange={setOpen}
      title={patient ? "Editar Paciente" : "Crear Nuevo Paciente"}
      trigger={
        patient ? (
          <Button variant="ghost" size="sm" className="gap-2">
            <Pencil className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        ) : (
          <Button variant="default" size="lg" className="max-w-[480px] w-full">
            <span className="text-lg">+</span>
            <span className="truncate">Agregar Paciente</span>
          </Button>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Paciente</Label>
          <Input
            id="name"
            placeholder="Introduzca el nombre completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Femenino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dateOfBirth"
                  className="w-full justify-between font-normal"
                >
                  {selectedDate
                    ? selectedDate.toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Seleccionar fecha"}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  captionLayout="dropdown"
                  disabled={(date) => {
                    // Disable future dates (max 2 days ago from today)
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() - 2);
                    return date > maxDate;
                  }}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    if (date) {
                      const isoDate = date.toISOString().split("T")[0];
                      setFormData({
                        ...formData,
                        dateOfBirth: isoDate,
                      });
                    }
                    setDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="conditions">Condiciones Clínicas</Label>
          <Textarea
            id="conditions"
            placeholder="Introduzca las condiciones clínicas relevantes..."
            value={formData.clinicalConditions}
            onChange={(e) =>
              setFormData({
                ...formData,
                clinicalConditions: e.target.value,
              })
            }
            className="min-h-24"
          />
        </div>

        <div className="flex gap-3 pt-4 w-full">
          <Button
            type="button"
            variant="secondary"
            className="w-1/2"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-1/2"
            disabled={isSubmitting || (patient && !hasChanges)}
          >
            {isSubmitting ? "Guardando..." : patient ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </ClipboardDialog>
  );
}
