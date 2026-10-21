import { requireRecycler } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default async function RecyclerLayout({ children }: { children: React.ReactNode }) {
  const { session, center } = await requireRecycler();

  const alerts = await prisma.alert.findMany({
    where: { shipment: { recyclingCenterId: center.id }, resolved: false },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const notifications = alerts.map((a) => ({ title: a.message, titleAr: a.messageAr, time: new Date(a.createdAt).toLocaleString() }));

  return (
    <DashboardShell
      user={{ name: session.name, nameAr: session.nameAr, role: session.role, email: session.email }}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
