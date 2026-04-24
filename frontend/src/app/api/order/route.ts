import { NextResponse } from "next/server";
import { processOrder, getOrders, getPreviousOrderCount, CustomerDetails, OrderItem } from "@/lib/storage";
import { sendCustomerOrderConfirmation, sendOwnerOrderNotification } from "@/lib/email";

const REVIEW_MODE = process.env.NEXT_PUBLIC_REVIEW_MODE === "true";

export async function POST(req: Request) {
  // ── REVIEW MODE: Return mock success. No emails, no file writes. ──────────
  if (REVIEW_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return NextResponse.json({
      success: true,
      order: { orderNumber: "PREVIEW-001" },
      _preview: true,
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const body = await req.json();
    const { customer, items, subtotal, delivery, total } = body as {
      customer: CustomerDetails;
      items: OrderItem[];
      subtotal: number;
      delivery: number;
      total: number;
    };

    if (
      !customer ||
      !customer.email ||
      !customer.firstName ||
      !customer.addressHouse ||
      !customer.addressLocality ||
      !customer.addressCity ||
      !customer.addressState ||
      !customer.addressPincode ||
      !items || items.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required order fields or empty cart" },
        { status: 400 }
      );
    }

    const result = await processOrder(customer, items, subtotal, delivery, total);

    if (!result.success || !result.entry) {
      return NextResponse.json(
        { success: false, status: result.error, error: "Weekly drop limit reached. Sold out." },
        { status: 400 }
      );
    }

    // Check for previous orders from this customer (for owner email insight)
    const previousOrderCount = await getPreviousOrderCount(
      result.entry.customer.email,
      result.entry.orderNumber
    );

    // Trigger emails asynchronously — non-fatal if they fail
    Promise.all([
      sendCustomerOrderConfirmation(result.entry),
      sendOwnerOrderNotification(result.entry, previousOrderCount),
    ]).catch((err) => {
      console.error("Non-fatal email dispatch error:", err);
    });

    return NextResponse.json({ success: true, order: result.entry });
  } catch (error) {
    console.error("Order processing error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // ── REVIEW MODE: Return mock status. Drop is always "live". ──────────────
  if (REVIEW_MODE) {
    return NextResponse.json({ success: true, count: 0, isSoldOut: false });
  }
  // ─────────────────────────────────────────────────────────────────────────

  try {
    const orders = await getOrders();
    const isSoldOut = orders.length >= 50;
    return NextResponse.json({
      success: true,
      count: orders.length,
      isSoldOut,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}
