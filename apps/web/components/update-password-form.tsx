"use client";

import { cn } from "@/lib/utils";
import { translateErrorMessage } from "@/lib/error-translator";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to the main route. The user already has an active session.
      router.push("/");
    } catch (error: any) {
      console.error("Password update error:", error);

      // Handle specific Supabase error responses
      if (error && typeof error === 'object') {
        if (error.code === 'weak_password') {
          if (error.weak_password?.reasons?.includes('length')) {
            setError('La contraseña debe tener al menos 6 caracteres.');
          } else {
            setError('La contraseña es demasiado débil. Por favor, use una contraseña más segura.');
          }
        } else if (error.message) {
          // Use the existing translation function for other error messages
          const userFriendlyMessage = translateErrorMessage(error.message);
          setError(userFriendlyMessage);
        } else {
          setError('Ocurrió un error al actualizar la contraseña. Por favor, inténtelo de nuevo.');
        }
      } else {
        // Handle string errors or other types
        const userFriendlyMessage = translateErrorMessage(error as string || 'Error desconocido');
        setError(userFriendlyMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Restablecer contraseña</CardTitle>
          <CardDescription>
            Por favor, ingresa tu nueva contraseña a continuación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nueva contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
