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
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserProfileById,
  updateUserProfile,
} from "@/server/services/user_profile";
import { SupabaseError } from "@/lib/types/error-types";

export function ProfileEditForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  // Load user profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          setIsLoading(true);
          // Get user profile
          const profile = await getUserProfileById(user.id);
          if (profile) {
            setName(profile.name);
          } else {
            // If no profile exists, use user data from auth
            setName(
              user.user_metadata?.full_name || user.user_metadata?.name || "",
            );
          }
        } catch (err) {
          console.error("Error loading profile:", err);
          const userFriendlyMessage = translateErrorMessage(
            err instanceof Error ? err.message : String(err),
          );
          setError(userFriendlyMessage);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Get the auth token to call the server action
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No se encontró sesión activa");
      }

      // Update user profile in the database (only update name, not email)
      await updateUserProfile(session.access_token, user.id, { name });

      // Update the user's name in Supabase Auth if it changed
      if (user.user_metadata?.full_name !== name) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { ...user.user_metadata, full_name: name },
        });
        if (updateAuthError) {
          throw updateAuthError;
        }
      }

      setSuccess("Perfil actualizado correctamente.");

      // Optionally redirect back after a delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error("Profile update error:", err);
      let errorMessage =
        "Ocurrió un error al actualizar el perfil. Por favor, inténtelo de nuevo.";

      // Define type for error object to avoid 'any'
      if (err && typeof err === "object" && "code" in err && "message" in err) {
        const errorObj = err as SupabaseError;

        // Note: 'weak_password' error is not applicable for profile update,
        // but keeping it in case the service throws it for some reason
        if (errorObj.code === "weak_password") {
          if (errorObj.weak_password?.reasons?.includes("length")) {
            errorMessage = "La contraseña debe tener al menos 6 caracteres.";
          } else {
            errorMessage =
              "La contraseña es demasiado débil. Por favor, use una contraseña más segura.";
          }
        } else if (errorObj.message) {
          errorMessage = translateErrorMessage(errorObj.message);
        }
      } else {
        errorMessage = translateErrorMessage(
          (err as string) || "Error desconocido",
        );
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Editar Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal aquí.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label>Correo Electrónico</Label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-500">{success}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-3">Seguridad</h3>
            <Button
              variant="outline"
              onClick={() => router.push("/auth/update-password")}
              className="w-full"
              disabled={isLoading}
            >
              Cambiar contraseña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
