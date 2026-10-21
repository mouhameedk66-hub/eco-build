import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, type SessionPayload } from "@/lib/session";

export async function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  return session;
}

export async function requireSession(): Promise<SessionPayload> {
  const session = getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireContractor() {
  const session = await requireSession();
  const contractor = await prisma.contractor.findUnique({ where: { userId: session.userId } });
  if (!contractor) redirect("/login");
  return { session, contractor };
}

export async function requireCarrier() {
  const session = await requireSession();
  const carrier = await prisma.carrier.findUnique({ where: { userId: session.userId } });
  if (!carrier) redirect("/login");
  return { session, carrier };
}

export async function requireRecycler() {
  const session = await requireSession();
  const center = await prisma.recyclingCenter.findUnique({ where: { userId: session.userId } });
  if (!center) redirect("/login");
  return { session, center };
}

export async function requireAuthority() {
  const session = await requireSession();
  if (session.role !== "AUTHORITY") redirect("/login");
  return { session };
}
