import { NextResponse } from 'next/server';
import { createSession } from '@/lib/admin-auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (password === process.env.ADMIN_PASSWORD) {
      await createSession();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
