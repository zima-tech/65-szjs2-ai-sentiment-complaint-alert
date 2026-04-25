import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardSnapshot } from "@/lib/service";
import { getRouteBySlug } from "@/lib/domain";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug?: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || "dashboard";
  const route = getRouteBySlug(slug);
  const routeKey = route?.key || "dashboard";

  const snapshot = await getDashboardSnapshot();

  return <DashboardClient initialSnapshot={snapshot} routeKey={routeKey} currentPath={route?.path || "/dashboard"} />;
}
