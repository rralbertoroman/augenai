import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Users, Database } from "lucide-react";
import Image from "next/image";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/augen 2.svg"
              alt="Augen AI Logo"
              width={100}
              height={40}
              className="object-contain"
            />
          </div>
          <Link href="/auth/login">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nuestro compromiso con la comunidad médica y el avance de la tecnología en salud.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunidad Médica</h3>
              <p className="text-muted-foreground">
                Nuestra principal meta en Augen AI es ayudar a la comunidad médica, proporcionando herramientas avanzadas que faciliten el diagnóstico y mejoren la atención al paciente.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mejora Continua</h3>
              <p className="text-muted-foreground">
                Trabajamos constantemente para mejorar nuestros modelos actuales y desarrollar nuevas soluciones que beneficien a la comunidad global de salud.
              </p>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none space-y-6">
            <section className="bg-muted/30 p-8 rounded-2xl border border-border">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold m-0">Uso de Datos y Privacidad</h2>
                  <p className="text-lg leading-relaxed">
                    Para fomentar la mejora continua de la salud y perfeccionar nuestros algoritmos de inteligencia artificial, es importante que comprenda y acepte cómo manejamos la información:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>
                      <strong className="text-foreground">Datos de Predicciones:</strong> Nos reservamos el derecho de almacenar y utilizar los datos de las predicciones generadas por el sistema.
                    </li>
                    <li>
                      <strong className="text-foreground">Feedback y Retroalimentación:</strong> Toda la información proporcionada a través de los mecanismos de feedback será utilizada para reentrenar y calibrar nuestros modelos.
                    </li>
                    <li>
                      <strong className="text-foreground">Información del Sistema:</strong> La información ingresada en el sistema está destinada a ser compartida y analizada con el único propósito de la mejora comunitaria y científica.
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                    Todo este procesamiento se realiza <strong>sin comprometer la seguridad ni la privacidad individual de los usuarios</strong>. Implementamos estrictos protocolos de anonimización y seguridad para garantizar que los datos sensibles estén protegidos mientras contribuimos al conocimiento colectivo.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-8">
              <h3 className="text-xl font-semibold">Aceptación de los Términos</h3>
              <p className="text-muted-foreground">
                Al iniciar sesión y utilizar los servicios de Augen AI, usted reconoce haber leído y aceptado estos términos. Su colaboración es fundamental para construir un futuro donde la tecnología y la medicina trabajen juntas para salvar vidas.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12 bg-muted/20">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Augen AI. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
