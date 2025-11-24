"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddPatientDialogProps {
  onAddPatient: (data: {
    name: string;
    dateOfBirth: string;
    gender: string;
    clinicalConditions: string[];
  }) => Promise<boolean>;
}

export function AddPatientDialog({ onAddPatient }: AddPatientDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    clinicalConditions: "",
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="lg" className="max-w-[480px] w-full">
          <span className="text-lg">+</span>
          <span className="truncate">Agregar Paciente</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre del Paciente
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Introduzca el nombre completo"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                Sexo
              </label>
              <select
                id="gender"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                required
              >
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium">
                Fecha de Nacimiento
              </label>
              <input
                id="dateOfBirth"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
            <label htmlFor="conditions" className="text-sm font-medium">
              Condiciones Clínicas
            </label>
            <textarea
              id="conditions"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-24"
              placeholder="Introduzca las condiciones clínicas relevantes..."
              value={formData.clinicalConditions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  clinicalConditions: e.target.value,
                })
              }
            />
          </div>

          <div className="flex gap-3 pt-4 w-full">
            <Button
              type="button"
              variant="secondary"
              className="w-1/2 px-4 py-2 rounded-lg border border-border hover:bg-secondary hover:shadow-md transition-shadow text-sm font-medium"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <button
              type="submit"
              className="w-1/2 px-4 py-2 rounded-lg bg-primary/25 text-foreground hover:bg-primary/35 hover:shadow-md dark:bg-primary/35 dark:hover:bg-primary/45 dark:text-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-shadow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
