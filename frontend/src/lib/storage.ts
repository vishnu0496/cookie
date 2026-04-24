import fs from "fs/promises";
import path from "path";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  firstName: string;
  email: string;
  whatsapp: string;
  addressHouse: string;
  addressLocality: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  addressLandmark?: string;
}

export interface OrderEntry {
  orderNumber: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  timestamp: string;
}

let isWriting = false;

async function acquireLock() {
  while (isWriting) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  isWriting = true;
}

function releaseLock() {
  isWriting = false;
}

const getFilePath = () => path.join(process.cwd(), "orders.json");

export async function getOrders(): Promise<OrderEntry[]> {
  const filePath = getFilePath();
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

const WEEKLY_LIMIT = 50;

export async function processOrder(
  customer: CustomerDetails,
  items: OrderItem[],
  subtotal: number,
  delivery: number,
  total: number
): Promise<{ success: boolean; entry?: OrderEntry; error?: string }> {
  await acquireLock();
  
  try {
    const orders = await getOrders();
    
    if (orders.length >= WEEKLY_LIMIT) {
      return { success: false, error: "sold_out" };
    }

    const orderNumber = `DRP01-${String(orders.length + 1).padStart(3, '0')}`;

    const newEntry: OrderEntry = {
      orderNumber,
      customer,
      items,
      subtotal,
      delivery,
      total,
      timestamp: new Date().toISOString()
    };

    orders.push(newEntry);
    await saveOrders(orders);

    return { success: true, entry: newEntry };
  } finally {
    releaseLock();
  }
}

async function saveOrders(orders: OrderEntry[]) {
  const filePath = getFilePath();
  const rawData = JSON.stringify(orders, null, 2);
  await fs.writeFile(filePath, rawData, "utf-8");
}

/** Returns how many orders the same email has placed BEFORE this one. */
export async function getPreviousOrderCount(
  email: string,
  excludeOrderNumber: string
): Promise<number> {
  const orders = await getOrders();
  return orders.filter(
    (o) =>
      o.customer.email.toLowerCase() === email.toLowerCase() &&
      o.orderNumber !== excludeOrderNumber
  ).length;
}
