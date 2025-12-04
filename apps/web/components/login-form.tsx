"use client";

import { cn } from "@/lib/utils";
import { translateErrorMessage } from "@/lib/error-translator";
import { createClient } from "@/lib/supabase/client";
import { createUserProfile } from "@/server/services/user_profile";
import { Button } from "@/components/ui/button";
import { Clipboard } from "@/components/common/clipboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Try to create user profile (will succeed if doesn't exist)
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (accessToken) {
        // Get profile data from localStorage (from sign-up)
        const pendingProfileData = localStorage.getItem("pending_profile");

        if (pendingProfileData) {
          try {
            const parsed = JSON.parse(pendingProfileData);
            if (!parsed.name) {
              throw new Error("No se encontró el nombre del perfil pendiente");
            }
            const name = parsed.name;

            if (name) {
              // Call server action directly to create profile
              await createUserProfile(accessToken, { name });
            }
          } catch {
            // Silent fail - profile creation is not critical
          } finally {
            // Always clear pending data
            localStorage.removeItem("pending_profile");
          }
        }
      }

      router.push("/");
    } catch (error: unknown) {
      const userFriendlyMessage = translateErrorMessage(
        error instanceof Error ? error.message : String(error),
      );
      setError(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6  min-w-[25vw]", className)}
      {...props}
    >
      <Clipboard>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Contraseña</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
                <div className="text-center text-xs text-muted-foreground mt-2">
                  Al iniciar sesión, aceptas nuestros{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Términos y Condiciones
                  </Link>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/auth/sign-up"
                  className="underline underline-offset-4"
                >
                  Regístrate
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </Clipboard>
    </div>
  );
}
