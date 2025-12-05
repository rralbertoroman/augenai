import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/app-providers";
import { Dancing_Script } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AugenAI",
  description: "Plataforma de diagnóstico ocular con IA",
  icons: "/group4309.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased ${dancingScript.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
