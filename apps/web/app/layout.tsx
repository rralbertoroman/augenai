import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AugenAI",
  description: "AI-powered eye diagnosis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-[#FAFAFA]">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main
              id="main-content"
              className="flex-1 container mx-auto px-6 py-8"
              role="main"
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
