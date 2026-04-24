import { NextResponse } from 'next/server';
import { updateOrderMeta } from '@/lib/admin-data';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orderStatus, paymentStatus, notes } = await req.json();
    const { id } = await params;

    await updateOrderMeta(id, {
      ...(orderStatus && { orderStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(notes !== undefined && { notes })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
