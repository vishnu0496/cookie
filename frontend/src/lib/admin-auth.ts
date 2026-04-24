import { cookies } from "next/headers";

const SECRET = process.env.ADMIN_SESSION_SECRET || "default_secret";
const COOKIE_NAME = "sundays_admin_session";

// Simple HMAC-like signature for MVP without external JWT library
// In a real prod app with high stakes, jose/iron-session is preferred.
// For Sundays MVP, a base64 encoded payload + signature is sufficient and dependency-free.

async function sign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function verify(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sigBytes = new Uint8Array(
    atob(signature)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  return await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(payload));
}

export async function createSession() {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ authenticated: true, expiresAt });
  const signature = await sign(payload, SECRET);
  const sessionValue = `${btoa(payload)}.${signature}`;

  (await cookies()).set(COOKIE_NAME, sessionValue, {
    expires: new Date(expiresAt),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession(sessionValue: string | undefined): Promise<boolean> {
  if (!sessionValue) return false;
  const [b64Payload, signature] = sessionValue.split(".");
  if (!b64Payload || !signature) return false;

  try {
    const payloadStr = atob(b64Payload);
    const verified = await verify(payloadStr, signature, SECRET);
    if (!verified) return false;

    const payload = JSON.parse(payloadStr);
    return payload.authenticated && payload.expiresAt > Date.now();
  } catch (error) {
    return false;
  }
}

export async function deleteSession() {
  (await cookies()).set(COOKIE_NAME, "", { expires: new Date(0), path: "/" });
}

export async function getSession() {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  return verifySession(cookie);
}
