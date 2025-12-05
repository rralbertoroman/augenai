"use client";

import { cn } from "@/lib/utils";
import { translateErrorMessage } from "@/lib/error-translator";
import { createClient } from "@/lib/supabase/client";
import { SupabaseWeakPasswordError } from "@/lib/supabase/errors";
import { Button } from "@/components/ui/button";
import { Clipboard } from "@/modules/commons/clipboard/clipboard";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check password strength in real-time
  const validatePassword = (value: string) => {
    if (value.length > 0 && value.length < 6) {
      setPasswordError(translateErrorMessage("length"));
      return false;
    } else if (value.length > 0) {
      // Additional checks could go here
      setPasswordError(null);
      return true;
    }
    setPasswordError(null);
    return true;
  };

  // Handle password change with real-time validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    // Additional validation before submitting
    const isPasswordValid = validatePassword(password);
    if (!isPasswordValid) {
      setIsLoading(false);
      return;
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError(translateErrorMessage("contraseñas no coinciden"));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to the main route. The user already has an active session.
      router.push("/");
    } catch (error: unknown) {
      console.error("Password update error:", error);

      // Helper function to safely get reasons array
      const getWeakPasswordReasons = (error: unknown): string[] | null => {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "weak_password" &&
          "weak_password" in error &&
          error.weak_password &&
          typeof error.weak_password === "object" &&
          "reasons" in error.weak_password &&
          error.weak_password.reasons &&
          Array.isArray(error.weak_password.reasons)
        ) {
          return (error as SupabaseWeakPasswordError).weak_password!.reasons!;
        }
        return null;
      };

      // Check if this is a Supabase weak_password error with reasons
      const reasons = getWeakPasswordReasons(error);
      if (reasons) {
        console.log(
          "Handling Supabase weak_password error with reasons:",
          error,
        );
        console.log("Supabase reasons:", reasons);

        if (reasons.includes("characters")) {
          console.log("Setting characters error message");
          setError(translateErrorMessage("characters"));
        } else if (reasons.includes("length")) {
          console.log("Setting length error message");
          setError(translateErrorMessage("length"));
        } else {
          console.log("Setting generic weak password error message");
          setError(translateErrorMessage("weak password"));
        }
      } else if (
        error instanceof Error &&
        (error as { constructor: { name: string } }).constructor.name ===
          "AuthWeakPasswordError"
      ) {
        // Handle AuthWeakPasswordError specifically
        const message = error.message.toLowerCase();

        // Determine the appropriate error message based on the content of the message
        let errorMessageKey = "weak password"; // default

        if (
          (message.includes("length") || message.includes("at least 6")) &&
          message.includes("characters")
        ) {
          // Specific case for "at least 6 characters" - treat as length issue
          errorMessageKey = "length";
        } else if (
          (message.includes("characters") || message.includes("character")) &&
          message.includes("each")
        ) {
          // Specific case for character type requirements (both plural and singular)
          errorMessageKey = "characters";
        } else if (
          message.includes("length") ||
          message.includes("6 characters") ||
          message.includes("at least 6")
        ) {
          errorMessageKey = "length";
        } else if (
          message.includes("characters") ||
          message.includes("character")
        ) {
          errorMessageKey = "characters";
        }

        setError(translateErrorMessage(errorMessageKey));
      } else {
        // For other errors, use the standard translation
        let errorMessage =
          "Ocurrió un error al actualizar la contraseña. Por favor, inténtelo de nuevo.";

        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
        ) {
          errorMessage = translateErrorMessage(error.message);
        } else if (error instanceof Error) {
          errorMessage = translateErrorMessage(error.message);
        } else {
          errorMessage = translateErrorMessage(
            (error as string) || "Error desconocido",
          );
        }

        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Clipboard>
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
                    onChange={handlePasswordChange}
                  />
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirmar contraseña"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Clipboard>
    </div>
  );
}
