import { cookies } from "next/headers";

export const SESSION_COOKIE = "eb_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "CONTRACTOR" | "CARRIER" | "RECYCLER" | "AUTHORITY";
  name: string;
  nameAr: string;
}

export function encodeSession(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const json = Buffer.from(token, "base64url").toString("utf-8");
    return JSON.parse(json) as SessionPayload;
  } catch {
    return null;
  }
}

export function getSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export const roleHome: Record<SessionPayload["role"], string> = {
  CONTRACTOR: "/dashboard/contractor",
  CARRIER: "/dashboard/carrier",
  RECYCLER: "/dashboard/recycler",
  AUTHORITY: "/dashboard/authority",
};
