import { DashboardSidebar } from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
