import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "./DashboardSidebar";
import type { ApiEnvelope, AuthMe } from "@/lib/api";

function requestOrigin(): string {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const meResponse = await fetch(`${requestOrigin()}/api/v1/auth/me`, {
    cache: "no-store",
    headers: {
      cookie: headers().get("cookie") ?? "",
    },
  });

  if (meResponse.status === 401) {
    redirect("/sign-in");
  }

  const mePayload = (await meResponse.json()) as ApiEnvelope<AuthMe>;
  if (!meResponse.ok || mePayload.data === null) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <DashboardSidebar user={mePayload.data} />
      <main className="flex-1 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
