import { NextResponse } from 'next/server';
import { getMergedOrders } from '@/lib/admin-data';

export async function GET() {
  try {
    const orders = await getMergedOrders();
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
