import { Navbar } from "@/modules/commons/layout/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Navbar />
      {children}
    </div>
  );
}
