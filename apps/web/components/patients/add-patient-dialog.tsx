"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardDialog } from "@/components/common/clipboard-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddPatientDialogProps {
  onAddPatient: (data: {
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

export function AddPatientDialog({
  onAddPatient,
  patient,
  isOpen: externalOpen,
  onOpenChange: externalOnOpenChange,
}: AddPatientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    dateOfBirth: patient?.dateOfBirth || "",
    gender: patient?.gender || "",
    clinicalConditions: patient?.clinicalConditions || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const conditions = formData.clinicalConditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const success = await onAddPatient({
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
        <Button variant="default" size="lg" className="max-w-[480px] w-full">
          <span className="text-lg">+</span>
          <span className="truncate">
            {patient ? "Editar Paciente" : "Agregar Paciente"}
          </span>
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
            {error}
          </div>
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
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              required
            />
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
          <Button type="submit" className="w-1/2" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : patient ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </ClipboardDialog>
  );
}
