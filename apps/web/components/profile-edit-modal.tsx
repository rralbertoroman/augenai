"use client";

import { cn } from "@/lib/utils";
import { translateErrorMessage } from "@/lib/error-translator";
import { createClient } from "@/lib/supabase/client";
import { SupabaseWeakPasswordError } from "@/lib/supabase/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getUserProfileById,
  updateUserProfile,
} from "@/server/services/user_profile";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  // Load user profile data when modal opens
  useEffect(() => {
    const loadProfile = async () => {
      if (user && isOpen) {
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
        } catch (err: unknown) {
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

    if (isOpen) {
      loadProfile();
    }
  }, [user, isOpen]);

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

      // Update user profile in the database if name has changed
      if (user.user_metadata?.full_name !== name) {
        await updateUserProfile(session.access_token, user.id, { name });

        // Update the user's name in Supabase Auth
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { ...user.user_metadata, full_name: name },
        });
        if (updateAuthError) {
          throw updateAuthError;
        }
      }

      // Update password if provided and valid
      if (password || confirmPassword) {
        // If one password field has a value but not both, it's an error
        if (!password || !confirmPassword) {
          throw new Error("Por favor, completa ambos campos de contraseña.");
        }

        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        setSuccess("Perfil actualizado correctamente.");
      } else if (user.user_metadata?.full_name !== name) {
        setSuccess("Nombre actualizado correctamente.");
      } else {
        setSuccess("No se realizaron cambios.");
      }

      // Clear password fields after successful update
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error("Profile update error:", err);


      // Helper function to safely get reasons array
      const getWeakPasswordReasons = (error: unknown): string[] | null => {
        if (error && typeof error === "object" &&
            "code" in error && error.code === "weak_password" &&
            "weak_password" in error && error.weak_password && typeof error.weak_password === "object" &&
            "reasons" in error.weak_password && error.weak_password.reasons && Array.isArray(error.weak_password.reasons)) {
          return (error as SupabaseWeakPasswordError).weak_password!.reasons!;
        }
        return null;
      };

      // Check if this is a Supabase weak_password error with reasons
      const reasons = getWeakPasswordReasons(err);
      if (reasons) {
        if (reasons.includes("characters")) {
          setError(translateErrorMessage("characters"));
        } else if (reasons.includes("length")) {
          setError(translateErrorMessage("length"));
        } else {
          setError(translateErrorMessage("weak password"));
        }
      } else if (err instanceof Error && (err as { constructor: { name: string } }).constructor.name === "AuthWeakPasswordError") {
        // Handle AuthWeakPasswordError specifically
        const message = err.message.toLowerCase();

        // Determine the appropriate error message based on the content of the message
        let errorMessageKey = "weak password"; // default

        if ((message.includes("length") || message.includes("at least 6")) && message.includes("characters")) {
          // Specific case for "at least 6 characters" - treat as length issue
          errorMessageKey = "length";
        } else if ((message.includes("characters") || message.includes("character")) && message.includes("each")) {
          // Specific case for character type requirements (both plural and singular)
          errorMessageKey = "characters";
        } else if (message.includes("length") || message.includes("6 characters") || message.includes("at least 6")) {
          errorMessageKey = "length";
        } else if (message.includes("characters") || message.includes("character")) {
          errorMessageKey = "characters";
        }

        setError(translateErrorMessage(errorMessageKey));
      } else {
        // For other errors, use the standard translation
        let errorMessage = "Ocurrió un error al actualizar el perfil. Por favor, inténtelo de nuevo.";

        if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
          errorMessage = translateErrorMessage(err.message);
        } else if (err instanceof Error) {
          errorMessage = translateErrorMessage(err.message);
        } else {
          errorMessage = translateErrorMessage(
            err as string || "Error desconocido",
          );
        }

        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Email Field (Read-only) */}
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Password Fields */}
              <div className="grid gap-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}