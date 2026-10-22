import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sh_session";
export const SESSION_HOURS = 8;

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET belum diisi (minimal 32 karakter).");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { uid: string; v: string };

export async function signSession(p: SessionPayload) {
  return new SignJWT(p)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.uid !== "string" || typeof payload.v !== "string") return null;
    return { uid: payload.uid, v: payload.v };
  } catch {
    return null;
  }
}
