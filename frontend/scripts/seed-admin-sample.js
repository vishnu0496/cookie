// Run: node scripts/seed-admin-sample.js
// Seeds orders.json and order-meta.json with realistic sample data for admin preview.

const fs = require("fs");
const path = require("path");

const ordersPath = path.join(__dirname, "..", "orders.json");
const metaPath = path.join(__dirname, "..", "order-meta.json");

const products = [
  { id: "classic", name: "Classic Chocolate Chip", price: 280 },
  { id: "brown-butter", name: "Brown Butter & Sea Salt", price: 320 },
  { id: "dark-cocoa", name: "Dark Cocoa Espresso", price: 350 },
];

const customers = [
  { firstName: "Priya",    email: "priya.sharma@gmail.com",    whatsapp: "9876543210", locality: "Banjara Hills",    pincode: "500034" },
  { firstName: "Arjun",    email: "arjun.mehta@gmail.com",     whatsapp: "9845123456", locality: "Jubilee Hills",    pincode: "500033" },
  { firstName: "Sneha",    email: "sneha.reddy@gmail.com",     whatsapp: "9988776655", locality: "Gachibowli",      pincode: "500032" },
  { firstName: "Karthik",  email: "karthik.iyer@gmail.com",    whatsapp: "9871234567", locality: "Kondapur",        pincode: "500084" },
  { firstName: "Ananya",   email: "ananya.singh@gmail.com",    whatsapp: "9765432109", locality: "Madhapur",        pincode: "500081" },
  { firstName: "Rahul",    email: "rahul.kumar@gmail.com",     whatsapp: "9654321098", locality: "Hitech City",     pincode: "500081" },
  { firstName: "Meera",    email: "meera.patel@gmail.com",     whatsapp: "9543210987", locality: "Kukatpally",      pincode: "500072" },
  { firstName: "Vijay",    email: "vijay.chandra@gmail.com",   whatsapp: "9432109876", locality: "Ameerpet",        pincode: "500016" },
];

function makeAddress(c) {
  return {
    addressHouse: `Flat ${Math.floor(Math.random() * 8) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 4))}, Sample Residency`,
    addressLocality: c.locality,
    addressCity: "Hyderabad",
    addressState: "Telangana",
    addressPincode: c.pincode,
  };
}

function makeItems(count = 1) {
  const items = [];
  const shuffled = [...products].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, products.length); i++) {
    items.push({ ...shuffled[i], quantity: Math.random() > 0.5 ? 2 : 1 });
  }
  return items;
}

function makeOrder(dropNum, seqNum, custIdx, date) {
  const c = customers[custIdx];
  const items = makeItems(Math.random() > 0.6 ? 2 : 1);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = 60;
  return {
    orderNumber: `DRP0${dropNum}-${String(seqNum).padStart(3, "0")}`,
    customer: { ...c, ...makeAddress(c) },
    items,
    subtotal,
    delivery,
    total: subtotal + delivery,
    timestamp: date,
  };
}

const orders = [];

// Drop 01 — 10 orders (fulfilled)
const drop1Start = new Date("2026-03-30T08:00:00Z");
const drop1Customers = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2]; // 0 and 2 are repeats
drop1Customers.forEach((custIdx, i) => {
  const d = new Date(drop1Start.getTime() + i * 2.5 * 3600 * 1000);
  orders.push(makeOrder(1, i + 1, custIdx, d.toISOString()));
});

// Drop 02 — 7 orders (live, current)
const drop2Start = new Date("2026-04-07T09:00:00Z");
const drop2Customers = [0, 2, 4, 3, 1, 6, 7]; // 0, 2, 4 are repeats from Drop 01
drop2Customers.forEach((custIdx, i) => {
  const d = new Date(drop2Start.getTime() + i * 3 * 3600 * 1000);
  orders.push(makeOrder(2, i + 1, custIdx, d.toISOString()));
});

// Generate realistic meta
const meta = {};
orders.forEach((o) => {
  const isDrop1 = o.orderNumber.startsWith("DRP01");
  meta[o.orderNumber] = {
    orderStatus: isDrop1 ? "Delivered" : "Reserved",
    paymentStatus: isDrop1 ? "Paid" : "Pending",
    notes: "",
  };
});

// Write files
fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
console.log(`✅ Seeded ${orders.length} orders across 2 drops.`);
console.log(`   Drop 01: ${orders.filter(o => o.orderNumber.startsWith("DRP01")).length} orders (Delivered/Paid)`);
console.log(`   Drop 02: ${orders.filter(o => o.orderNumber.startsWith("DRP02")).length} orders (Reserved/Pending)`);
