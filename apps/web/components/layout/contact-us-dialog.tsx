"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardDialog } from "@/components/common/clipboard-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare } from "lucide-react";
import { sendContactUsEmail } from "@/server/resend/services";
import { useAuth } from "@/contexts/auth-context";

export function ContactUsDialog() {
  const { accessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!accessToken) {
        throw new Error("No estás autenticado");
      }

      const result = await sendContactUsEmail(
        accessToken,
        formData.message,
        formData.subject || undefined,
      );

      if (result.success) {
        setIsOpen(false);
        setFormData({
          subject: "",
          message: "",
        });
      } else {
        setError(result.error || "Error al enviar el mensaje");
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
      onOpenChange={setIsOpen}
      title="Contáctanos"
      trigger={
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Contáctanos</span>
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="subject">Asunto (Opcional)</Label>
          <Input
            id="subject"
            placeholder="Asunto del mensaje"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensaje</Label>
          <Textarea
            id="message"
            placeholder="Escribe tu mensaje aquí..."
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="min-h-32"
            required
          />
        </div>

        <div className="flex gap-3 pt-4 w-full">
          <Button
            type="button"
            variant="secondary"
            className="w-1/2"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" className="w-1/2" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
          </Button>
        </div>
      </form>
    </ClipboardDialog>
  );
}
