import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'sundays_admin_session';
const SECRET = process.env.ADMIN_SESSION_SECRET || "default_secret";

// Re-implementing verify logic here for Middleware (Edge compatible) 
// using Web Crypto as done in admin-auth.ts
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

async function verifySession(sessionValue: string | undefined): Promise<boolean> {
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

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Track pathname for layout logic
  const response = NextResponse.next();
  response.headers.set('x-pathname', path);

  if (path.startsWith('/admin')) {
    const session = req.cookies.get(COOKIE_NAME)?.value;
    const isAuthenticated = await verifySession(session);

    // If on login page and authenticated, go to overview
    if (path === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin/overview', req.url));
      }
      return response;
    }

    // If on any other admin page and NOT authenticated, go to login
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
