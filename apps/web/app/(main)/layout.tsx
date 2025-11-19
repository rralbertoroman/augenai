import { Navbar } from "@/components/layout/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main
        id="main-content"
        className="container mx-auto px-6 py-8"
        role="main"
      >
        {children}
      </main>
    </div>
  );
}
