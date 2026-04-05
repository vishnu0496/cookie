import os
import uuid
import asyncio
import re
import smtplib
import ssl
from datetime import datetime
from html import escape
from typing import Optional, List
from contextlib import asynccontextmanager
from email.message import EmailMessage

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import motor.motor_asyncio

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/sunday_cookies")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.get_default_database() if "sunday_cookies" in MONGO_URL else client["sunday_cookies"]

# Collections
products_col = db["products"]
orders_col = db["orders"]
email_contacts_col = db["email_contacts"]

OWNER_NOTIFICATION_EMAIL = os.environ.get("OWNER_NOTIFICATION_EMAIL", "").strip()
SMTP_HOST = os.environ.get("SMTP_HOST", "").strip()
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "").strip()
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "").strip()
SMTP_FROM_EMAIL = os.environ.get("SMTP_FROM_EMAIL", SMTP_USERNAME).strip()
SMTP_USE_TLS = os.environ.get("SMTP_USE_TLS", "true").lower() == "true"
ADMIN_DASHBOARD_KEY = os.environ.get("ADMIN_DASHBOARD_KEY", "").strip()

# Product data - seed on startup
SEED_PRODUCTS = [
    {
        "id": str(uuid.uuid4()),
        "name": "The Lazy Legend",
        "subtitle": "Classic Chocolate Chip",
        "price": 109,
        "category": "signature",
        "tag": None,
        "description": "Our take on the timeless classic. Loaded with premium chocolate chips, crispy on the outside, irresistibly gooey on the inside.",
        "ingredients": "Butter, Brown Sugar, White Sugar, Eggs, Vanilla Extract, All-Purpose Flour, Baking Soda, Salt, Premium Chocolate Chips",
        "allergens": "Milk, Gluten, Eggs",
        "texture": "Crispy outside, gooey center",
        "heating": "Microwave 10-15 seconds for that fresh-from-the-oven taste",
        "image_url": None,
        "is_available": True,
        "sort_order": 1
    },
    {
        "id": str(uuid.uuid4()),
        "name": "The Dark Side",
        "subtitle": "Double Chocolate Cookie",
        "price": 119,
        "category": "signature",
        "tag": "New",
        "description": "For the true chocolate lover. Rich cocoa dough loaded with dark and white chocolate chunks.",
        "ingredients": "Butter, Brown Sugar, Cocoa Powder, Eggs, Vanilla Extract, All-Purpose Flour, Baking Soda, Dark Chocolate Chunks, White Chocolate Chips",
        "allergens": "Milk, Gluten, Eggs",
        "texture": "Crispy outside, gooey center",
        "heating": "Microwave 10-15 seconds for that fresh-from-the-oven taste",
        "image_url": None,
        "is_available": True,
        "sort_order": 2
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Nutella Lava",
        "subtitle": "Nutella Filled Cookie",
        "price": 129,
        "category": "most_loved",
        "tag": "Bestseller",
        "description": "A warm cookie with a molten Nutella center that oozes with every bite. Pure indulgence.",
        "ingredients": "Butter, Brown Sugar, Eggs, Vanilla Extract, All-Purpose Flour, Baking Soda, Nutella, Hazelnuts, Chocolate Chips",
        "allergens": "Milk, Gluten, Eggs, Tree Nuts",
        "texture": "Crispy outside, gooey center",
        "heating": "Microwave 10-15 seconds for that fresh-from-the-oven taste",
        "image_url": None,
        "is_available": True,
        "sort_order": 3
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Lotus Biscoff",
        "subtitle": "Biscoff Cookie",
        "price": 129,
        "category": "most_loved",
        "tag": "Trending",
        "description": "Caramelized Lotus Biscoff cookie butter swirled into our signature dough with Biscoff crumbles on top.",
        "ingredients": "Butter, Brown Sugar, Eggs, Vanilla Extract, All-Purpose Flour, Baking Soda, Lotus Biscoff Spread, Lotus Biscoff Crumbles",
        "allergens": "Milk, Gluten, Eggs, Soy",
        "texture": "Crispy outside, gooey center",
        "heating": "Microwave 10-15 seconds for that fresh-from-the-oven taste",
        "image_url": None,
        "is_available": True,
        "sort_order": 4
    },
    {
        "id": str(uuid.uuid4()),
        "name": "S'mores",
        "subtitle": "S'mores Cookie",
        "price": 129,
        "category": "most_loved",
        "tag": "Limited",
        "description": "Graham cracker base, toasted marshmallow, and melty chocolate. Campfire vibes in every bite.",
        "ingredients": "Butter, Brown Sugar, Eggs, Vanilla Extract, Graham Crackers, All-Purpose Flour, Marshmallows, Chocolate Chips",
        "allergens": "Milk, Gluten, Eggs",
        "texture": "Crispy outside, gooey center",
        "heating": "Microwave 10-15 seconds for that fresh-from-the-oven taste",
        "image_url": None,
        "is_available": True,
        "sort_order": 5
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Chocolate Chip Bites",
        "subtitle": "~10 bite-sized cookies",
        "price": 199,
        "category": "little_rebels",
        "tag": None,
        "description": "Perfect for snacking. Mini versions of our classic chocolate chip cookie — pop 'em like candy.",
        "ingredients": "Butter, Brown Sugar, White Sugar, Eggs, Vanilla Extract, All-Purpose Flour, Baking Soda, Mini Chocolate Chips",
        "allergens": "Milk, Gluten, Eggs",
        "texture": "Crispy bite-sized pieces",
        "heating": "Best enjoyed at room temperature or lightly warmed",
        "image_url": None,
        "is_available": True,
        "sort_order": 6
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Box of 6",
        "subtitle": "Choose any 6 cookies, including premium flavours",
        "price": 599,
        "category": "build_your_box",
        "tag": "Most Popular",
        "description": "Build your dream box! Pick any 6 of our freshly baked cookies. Mix and match to your heart's content.",
        "ingredients": "Varies based on selection",
        "allergens": "Milk, Gluten, Eggs (varies based on selection)",
        "texture": "Crispy outside, gooey center",
        "heating": "Microwave 10-15 seconds for that fresh-from-the-oven taste",
        "image_url": None,
        "is_available": True,
        "sort_order": 7
    }
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed products if empty
    count = await products_col.count_documents({})
    if count == 0:
        await products_col.insert_many(SEED_PRODUCTS)
        print(f"Seeded {len(SEED_PRODUCTS)} products")
    yield

app = FastAPI(title="Sunday Cookies API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Models ----
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    selected_cookies: Optional[List[str]] = None  # for build your box

class OrderCreate(BaseModel):
    items: List[OrderItem]
    full_name: str
    phone: str
    email: str
    marketing_opt_in: Optional[bool] = False
    address_line1: str
    address_line2: Optional[str] = ""
    city: str
    state: str
    pincode: str
    landmark: Optional[str] = ""
    special_instructions: Optional[str] = ""
    subtotal: float
    delivery_fee: float
    total: float

class PaymentConfirm(BaseModel):
    order_id: str
    utr_id: Optional[str] = None
    screenshot_uploaded: bool = False


class AdminOrderAction(BaseModel):
    action: str


def notifications_enabled() -> bool:
    return all([OWNER_NOTIFICATION_EMAIL, SMTP_HOST, SMTP_FROM_EMAIL])


def smtp_enabled() -> bool:
    return all([SMTP_HOST, SMTP_FROM_EMAIL])


def require_admin(admin_key: Optional[str]) -> None:
    if not ADMIN_DASHBOARD_KEY or (admin_key or "").strip() != ADMIN_DASHBOARD_KEY:
        raise HTTPException(status_code=401, detail="Owner access required.")


def format_currency(value) -> str:
    amount = float(value or 0)
    return f"Rs.{amount:.0f}"


def format_order_datetime(value) -> str:
    if isinstance(value, datetime):
        parsed = value
    else:
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except Exception:
            return str(value or "")
    return parsed.strftime("%d %b %Y, %I:%M %p")


def clean_line(value, fallback: str = "Not provided") -> str:
    text = str(value or "").strip()
    return text or fallback


def normalize_email(value: str) -> str:
    return str(value or "").strip().lower()


def is_valid_email(value: str) -> bool:
    return bool(re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalize_email(value)))


def format_order_stage(value: str) -> str:
    labels = {
        "pending": "Awaiting payment",
        "payment_review": "Payment under review",
        "confirmed": "Payment confirmed",
        "packed": "Packed for dispatch",
        "delivered": "Delivered",
        "payment_issue": "Payment needs attention",
    }
    return labels.get(str(value or "").strip(), clean_line(value, "Awaiting payment"))


def format_payment_stage(value: str) -> str:
    labels = {
        "pending": "Awaiting payment proof",
        "proof_submitted": "Awaiting manual verification",
        "verified": "Verified",
        "rejected": "Needs correction",
        "submitted": "Awaiting manual verification",
    }
    return labels.get(str(value or "").strip(), clean_line(value, "Awaiting payment proof"))


def build_address_lines(order_data: dict) -> List[str]:
    lines = [
        clean_line(order_data.get("address_line1")),
        clean_line(order_data.get("address_line2"), "") or None,
        f"{clean_line(order_data.get('city'))}, {clean_line(order_data.get('state'))} - {clean_line(order_data.get('pincode'))}",
        f"Landmark: {order_data.get('landmark').strip()}" if str(order_data.get("landmark") or "").strip() else None,
    ]
    return [line for line in lines if line]


def normalize_utr_id(value) -> str:
    return str(value or "").strip().replace(" ", "").upper()


def is_valid_utr_id(value) -> bool:
    normalized = normalize_utr_id(value)
    return bool(re.fullmatch(r"[A-Z0-9]{12,22}", normalized))


def apply_order_action(order_data: dict, action: str) -> dict:
    normalized = str(action or "").strip()
    updated = {**order_data}

    if normalized == "verify_payment":
        updated["payment_status"] = "verified"
        updated["order_status"] = "confirmed"
        return updated

    if normalized == "reject_payment":
        updated["payment_status"] = "rejected"
        updated["order_status"] = "payment_issue"
        return updated

    if normalized == "mark_packed":
        updated["order_status"] = "packed"
        return updated

    if normalized == "mark_delivered":
        updated["order_status"] = "delivered"
        return updated

    if normalized == "mark_review":
        if updated.get("payment_status") != "verified":
            updated["payment_status"] = "proof_submitted"
        updated["order_status"] = "payment_review"
        return updated

    raise HTTPException(status_code=400, detail="Invalid order action.")


def build_order_items_text(items: List[dict]) -> str:
    return "\n".join(
        f"- {item.get('product_name', 'Item')} x{item.get('quantity', 1)} | {format_currency(item.get('price', 0))}"
        for item in items
    )


def build_order_items_html(items: List[dict]) -> str:
    return "".join(
        f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #ece8df;color:#132014;">{escape(str(item.get('product_name', 'Item')))}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #ece8df;color:#55635a;text-align:center;">{escape(str(item.get('quantity', 1)))}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #ece8df;color:#132014;text-align:right;">{escape(format_currency(item.get('price', 0)))}</td>
        </tr>
        """
        for item in items
    )


def build_owner_order_email(order_data: dict) -> tuple[str, str, str]:
    subject = f"Sundays order sheet | #{order_data['id']}"
    address_lines = build_address_lines(order_data)
    note = str(order_data.get("special_instructions") or "").strip() or "No special instructions"
    text = "\n".join([
        "SUNDAYS",
        "Order Sheet",
        "============================================================",
        f"Order ID: {order_data['id']}",
        f"Placed On: {format_order_datetime(order_data.get('created_at'))}",
        f"Status: {format_order_stage(order_data.get('order_status', 'pending'))} | Payment: {format_payment_stage(order_data.get('payment_status', 'pending'))}",
        "",
        "CUSTOMER",
        f"Name: {clean_line(order_data.get('full_name'))}",
        f"Phone: {clean_line(order_data.get('phone'))}",
        f"Email: {clean_line(order_data.get('email'))}",
        "",
        "DELIVERY",
        *address_lines,
        "",
        "ORDER ITEMS",
        build_order_items_text(order_data["items"]),
        "",
        "TOTALS",
        f"Subtotal: {format_currency(order_data.get('subtotal'))}",
        f"Delivery: {format_currency(order_data.get('delivery_fee'))}",
        f"Grand Total: {format_currency(order_data.get('total'))}",
        "",
        "PACKING NOTE",
        f"Label Name: {clean_line(order_data.get('full_name'))}",
        f"Label Phone: {clean_line(order_data.get('phone'))}",
        f"Special Instructions: {note}",
        "",
        "Prepared for internal order handling and packing.",
    ])

    html = f"""
    <div style="background:#f5f1e8;padding:32px;font-family:Georgia,'Times New Roman',serif;color:#132014;">
      <div style="max-width:760px;margin:0 auto;background:#fffdf8;border:1px solid #e8dfcf;">
        <div style="padding:28px 32px;border-bottom:1px solid #ece8df;background:#132014;">
          <div style="font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#c9a84c;">Sundays</div>
          <h1 style="margin:10px 0 0;font-size:32px;line-height:1.15;color:#fdfbf7;font-weight:600;">Order Sheet</h1>
          <p style="margin:10px 0 0;color:rgba(253,251,247,0.72);font-family:Arial,sans-serif;font-size:14px;">Prepared for premium packing, dispatch review, and easy printing.</p>
        </div>
        <div style="padding:28px 32px;">
          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="width:50%;padding:0 12px 16px 0;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fbf8f0;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Order Details</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    <strong>Order ID:</strong> {escape(order_data['id'])}<br/>
                    <strong>Placed On:</strong> {escape(format_order_datetime(order_data.get('created_at')))}<br/>
                    <strong>Order Status:</strong> {escape(format_order_stage(order_data.get('order_status', 'pending')))}<br/>
                    <strong>Payment Status:</strong> {escape(format_payment_stage(order_data.get('payment_status', 'pending')))}
                  </div>
                </div>
              </td>
              <td style="width:50%;padding:0 0 16px 12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fbf8f0;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Customer</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    <strong>{escape(clean_line(order_data.get('full_name')))}</strong><br/>
                    {escape(clean_line(order_data.get('phone')))}<br/>
                    {escape(clean_line(order_data.get('email')))}<br/>
                    {"<br/>".join(escape(line) for line in address_lines)}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-bottom:24px;border:1px solid #ece8df;">
            <div style="padding:16px 18px;border-bottom:1px solid #ece8df;background:#fbf8f0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Items</div>
            <table role="presentation" width="100%" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              <thead>
                <tr style="background:#fff;">
                  <th style="padding:12px;text-align:left;color:#55635a;font-weight:600;border-bottom:1px solid #ece8df;">Product</th>
                  <th style="padding:12px;text-align:center;color:#55635a;font-weight:600;border-bottom:1px solid #ece8df;">Qty</th>
                  <th style="padding:12px;text-align:right;color:#55635a;font-weight:600;border-bottom:1px solid #ece8df;">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {build_order_items_html(order_data["items"])}
              </tbody>
            </table>
          </div>

          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="width:58%;padding-right:12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fff;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Packing Note</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    <strong>Label Name:</strong> {escape(clean_line(order_data.get('full_name')))}<br/>
                    <strong>Label Phone:</strong> {escape(clean_line(order_data.get('phone')))}<br/>
                    <strong>Instructions:</strong> {escape(note)}
                  </div>
                </div>
              </td>
              <td style="width:42%;padding-left:12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#132014;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;">Totals</div>
                  <table role="presentation" width="100%" style="margin-top:12px;border-collapse:collapse;font-family:Arial,sans-serif;color:#fdfbf7;font-size:14px;">
                    <tr><td style="padding:6px 0;">Subtotal</td><td style="padding:6px 0;text-align:right;">{escape(format_currency(order_data.get('subtotal')))}</td></tr>
                    <tr><td style="padding:6px 0;">Delivery</td><td style="padding:6px 0;text-align:right;">{escape(format_currency(order_data.get('delivery_fee')))}</td></tr>
                    <tr><td style="padding:10px 0 0;border-top:1px solid rgba(253,251,247,0.18);font-weight:700;">Grand Total</td><td style="padding:10px 0 0;border-top:1px solid rgba(253,251,247,0.18);text-align:right;font-weight:700;color:#c9a84c;">{escape(format_currency(order_data.get('total')))}</td></tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    """
    return subject, text, html


def build_owner_payment_email(order_data: dict, payment: PaymentConfirm) -> tuple[str, str, str]:
    subject = f"Sundays payment review | #{order_data['id']}"
    proof_value = "Screenshot uploaded for review" if payment.screenshot_uploaded else f"UTR: {payment.utr_id or 'Not provided'}"
    note = str(order_data.get("special_instructions") or "").strip() or "No special instructions"
    text = "\n".join([
        "SUNDAYS",
        "Payment Review Sheet",
        "============================================================",
        f"Order ID: {order_data['id']}",
        f"Customer: {clean_line(order_data.get('full_name'))}",
        f"Phone: {clean_line(order_data.get('phone'))}",
        f"Email: {clean_line(order_data.get('email'))}",
        f"Grand Total: {format_currency(order_data.get('total'))}",
        f"Proof Received: {proof_value}",
        f"Order Status: {format_order_stage(order_data.get('order_status', 'payment_review'))}",
        f"Payment Status: {format_payment_stage(order_data.get('payment_status', 'submitted'))}",
        "",
        "PACKING NOTE",
        f"Label Name: {clean_line(order_data.get('full_name'))}",
        f"Label Phone: {clean_line(order_data.get('phone'))}",
        f"Special Instructions: {note}",
    ])

    html = f"""
    <div style="background:#f5f1e8;padding:32px;font-family:Georgia,'Times New Roman',serif;color:#132014;">
      <div style="max-width:760px;margin:0 auto;background:#fffdf8;border:1px solid #e8dfcf;">
        <div style="padding:28px 32px;border-bottom:1px solid #ece8df;background:#132014;">
          <div style="font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#c9a84c;">Sundays</div>
          <h1 style="margin:10px 0 0;font-size:32px;line-height:1.15;color:#fdfbf7;font-weight:600;">Payment Review</h1>
          <p style="margin:10px 0 0;color:rgba(253,251,247,0.72);font-family:Arial,sans-serif;font-size:14px;">A customer has submitted payment proof for verification.</p>
        </div>
        <div style="padding:28px 32px;">
          <table role="presentation" width="100%" style="border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:0 12px 16px 0;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fbf8f0;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Order</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    <strong>Order ID:</strong> {escape(order_data['id'])}<br/>
                    <strong>Customer:</strong> {escape(clean_line(order_data.get('full_name')))}<br/>
                    <strong>Phone:</strong> {escape(clean_line(order_data.get('phone')))}<br/>
                    <strong>Email:</strong> {escape(clean_line(order_data.get('email')))}
                  </div>
                </div>
              </td>
              <td style="width:50%;padding:0 0 16px 12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#132014;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;">Payment</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#fdfbf7;">
                    <strong>Grand Total:</strong> {escape(format_currency(order_data.get('total')))}<br/>
                    <strong>Proof:</strong> {escape(proof_value)}<br/>
                    <strong>Status:</strong> {escape(format_payment_stage(order_data.get('payment_status', 'submitted')))}
                  </div>
                </div>
              </td>
            </tr>
          </table>
          <div style="padding:18px;border:1px solid #ece8df;background:#fff;">
            <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Packing Note</div>
            <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
              <strong>Label Name:</strong> {escape(clean_line(order_data.get('full_name')))}<br/>
              <strong>Label Phone:</strong> {escape(clean_line(order_data.get('phone')))}<br/>
              <strong>Instructions:</strong> {escape(note)}
            </div>
          </div>
        </div>
      </div>
    </div>
    """
    return subject, text, html


def build_customer_email_layout(order_data: dict, eyebrow: str, title: str, intro: str, body_html: str, body_text: str, footer_note: str) -> tuple[str, str]:
    address_lines = build_address_lines(order_data)
    note = str(order_data.get("special_instructions") or "").strip() or "No special instructions"
    text = "\n".join([
        "SUNDAYS",
        title,
        "============================================================",
        f"Order ID: {order_data['id']}",
        f"Placed On: {format_order_datetime(order_data.get('created_at'))}",
        f"Customer: {clean_line(order_data.get('full_name'))}",
        f"Phone: {clean_line(order_data.get('phone'))}",
        f"Email: {clean_line(order_data.get('email'))}",
        "",
        body_text,
        "",
        "DELIVERY",
        *address_lines,
        "",
        "ORDER ITEMS",
        build_order_items_text(order_data["items"]),
        "",
        "TOTALS",
        f"Subtotal: {format_currency(order_data.get('subtotal'))}",
        f"Delivery: {format_currency(order_data.get('delivery_fee'))}",
        f"Grand Total: {format_currency(order_data.get('total'))}",
        "",
        f"Notes: {note}",
        "",
        footer_note,
    ])

    html = f"""
    <div style="background:#f5f1e8;padding:32px;font-family:Georgia,'Times New Roman',serif;color:#132014;">
      <div style="max-width:760px;margin:0 auto;background:#fffdf8;border:1px solid #e8dfcf;">
        <div style="padding:28px 32px;border-bottom:1px solid #ece8df;background:#132014;">
          <div style="font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#c9a84c;">{escape(eyebrow)}</div>
          <h1 style="margin:10px 0 0;font-size:32px;line-height:1.15;color:#fdfbf7;font-weight:600;">{escape(title)}</h1>
          <p style="margin:10px 0 0;color:rgba(253,251,247,0.72);font-family:Arial,sans-serif;font-size:14px;">{escape(intro)}</p>
        </div>
        <div style="padding:28px 32px;">
          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="width:52%;padding:0 12px 16px 0;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fbf8f0;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Order Details</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    <strong>Order ID:</strong> {escape(order_data['id'])}<br/>
                    <strong>Placed On:</strong> {escape(format_order_datetime(order_data.get('created_at')))}<br/>
                    <strong>Status:</strong> {escape(format_order_stage(order_data.get('order_status', 'pending')))}<br/>
                    <strong>Payment:</strong> {escape(format_payment_stage(order_data.get('payment_status', 'pending')))}
                  </div>
                </div>
              </td>
              <td style="width:48%;padding:0 0 16px 12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fbf8f0;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Delivery</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    <strong>{escape(clean_line(order_data.get('full_name')))}</strong><br/>
                    {escape(clean_line(order_data.get('phone')))}<br/>
                    {"<br/>".join(escape(line) for line in address_lines)}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <div style="padding:20px 22px;margin-bottom:24px;border:1px solid #ece8df;background:#fff;">
            {body_html}
          </div>

          <div style="margin-bottom:24px;border:1px solid #ece8df;">
            <div style="padding:16px 18px;border-bottom:1px solid #ece8df;background:#fbf8f0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Order Summary</div>
            <table role="presentation" width="100%" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              <thead>
                <tr style="background:#fff;">
                  <th style="padding:12px;text-align:left;color:#55635a;font-weight:600;border-bottom:1px solid #ece8df;">Product</th>
                  <th style="padding:12px;text-align:center;color:#55635a;font-weight:600;border-bottom:1px solid #ece8df;">Qty</th>
                  <th style="padding:12px;text-align:right;color:#55635a;font-weight:600;border-bottom:1px solid #ece8df;">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {build_order_items_html(order_data["items"])}
              </tbody>
            </table>
          </div>

          <table role="presentation" width="100%" style="border-collapse:collapse;">
            <tr>
              <td style="width:58%;padding-right:12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fff;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Order Notes</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">{escape(note)}</div>
                </div>
              </td>
              <td style="width:42%;padding-left:12px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#132014;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;">Totals</div>
                  <table role="presentation" width="100%" style="margin-top:12px;border-collapse:collapse;font-family:Arial,sans-serif;color:#fdfbf7;font-size:14px;">
                    <tr><td style="padding:6px 0;">Subtotal</td><td style="padding:6px 0;text-align:right;">{escape(format_currency(order_data.get('subtotal')))}</td></tr>
                    <tr><td style="padding:6px 0;">Delivery</td><td style="padding:6px 0;text-align:right;">{escape(format_currency(order_data.get('delivery_fee')))}</td></tr>
                    <tr><td style="padding:10px 0 0;border-top:1px solid rgba(253,251,247,0.18);font-weight:700;">Grand Total</td><td style="padding:10px 0 0;border-top:1px solid rgba(253,251,247,0.18);text-align:right;font-weight:700;color:#c9a84c;">{escape(format_currency(order_data.get('total')))}</td></tr>
                  </table>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    """
    return text, html


def build_customer_welcome_email(order_data: dict) -> tuple[str, str, str]:
    opted_in = bool(order_data.get("marketing_opt_in"))
    subject = "Welcome to Sundays"
    text = "\n".join([
        "SUNDAYS",
        "Welcome to Sundays",
        "============================================================",
        f"Email: {clean_line(order_data.get('email'))}",
        f"Order Ref: {order_data['id']}",
        "",
        "You are officially on our list now.",
        "This is your one welcome note from us.",
        "",
        "Because you ticked the box at checkout, we will occasionally send first-drop updates and early offers to this email."
        if opted_in
        else "You did not opt into future drops and offers, so after this we will keep emails limited to your order updates unless you join later.",
        "",
        "If the cookies hit, tag @sundays.hyd.",
        "If they miss, tag us anyway and tell us what to fix.",
        "Honest reviews help us make the next batch better.",
        "",
        "Thank you for trying Sundays.",
    ])

    html = f"""
    <div style="background:#f5f1e8;padding:32px;font-family:Georgia,'Times New Roman',serif;color:#132014;">
      <div style="max-width:760px;margin:0 auto;background:#fffdf8;border:1px solid #e8dfcf;">
        <div style="padding:28px 32px;border-bottom:1px solid #ece8df;background:#132014;">
          <div style="font-size:12px;letter-spacing:0.35em;text-transform:uppercase;color:#c9a84c;">Sundays</div>
          <h1 style="margin:10px 0 0;font-size:34px;line-height:1.1;color:#fdfbf7;font-weight:600;">Welcome to Sundays</h1>
          <p style="margin:10px 0 0;color:rgba(253,251,247,0.72);font-family:Arial,sans-serif;font-size:14px;">A slower bake, an honest tag, and the occasional first-drop note.</p>
        </div>
        <div style="padding:28px 32px;">
          <div style="padding:22px;border:1px solid #ece8df;background:#fff;margin-bottom:22px;">
            <p style="margin:0 0 14px;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
              You are officially on our list now. This is your one welcome note from us.
            </p>
            <p style="margin:0;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
              {"Because you ticked the box at checkout, we will occasionally send first-drop updates and early offers to this email." if opted_in else "You did not opt into future drops and offers, so after this we will keep emails limited to your order updates unless you join later."}
            </p>
          </div>

          <table role="presentation" width="100%" style="border-collapse:collapse;margin-bottom:22px;">
            <tr>
              <td style="width:50%;padding:0 10px 0 0;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#fbf8f0;height:100%;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Tag us honestly</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#132014;">
                    If the cookies hit, tag <strong>@sundays.hyd</strong>.<br/>
                    If they miss, tag us anyway and tell us what to fix.
                  </div>
                </div>
              </td>
              <td style="width:50%;padding:0 0 0 10px;vertical-align:top;">
                <div style="padding:18px;border:1px solid #ece8df;background:#132014;height:100%;">
                  <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a84c;font-family:Arial,sans-serif;">Order reference</div>
                  <div style="margin-top:12px;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;color:#fdfbf7;">
                    <strong>Email:</strong> {escape(clean_line(order_data.get('email')))}<br/>
                    <strong>Order Ref:</strong> {escape(order_data['id'])}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <a href="https://www.instagram.com/sundays.hyd/" style="display:inline-block;padding:14px 28px;background:#132014;color:#fdfbf7;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
            Tag Sundays
          </a>
        </div>
      </div>
    </div>
    """
    return subject, text, html


def build_customer_payment_review_email(order_data: dict, payment: PaymentConfirm) -> tuple[str, str, str]:
    proof_value = "Screenshot uploaded for review" if payment.screenshot_uploaded else f"UTR: {payment.utr_id or 'Not provided'}"
    subject = f"Sundays order received, payment under review | #{order_data['id']}"
    text, html = build_customer_email_layout(
        order_data,
        eyebrow="Sundays",
        title="Order Received",
        intro="Thank you. Your order has been received, and your payment is now under review.",
        body_html=f"""
          <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Review status</div>
          <div style="margin-top:12px;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;color:#132014;">
            <strong>Proof submitted:</strong> {escape(proof_value)}<br/>
            <strong>Status:</strong> Payment under review<br/>
            We are matching your payment with our records now. You will receive a confirmation email as soon as it is verified.
          </div>
        """,
        body_text=f"Your order has been received and the payment is now under review for order {order_data['id']}. Proof submitted: {proof_value}. We will email you again as soon as the payment is verified.",
        footer_note="Please keep this order ID handy if you need support.",
    )
    return subject, text, html


def build_customer_status_email(order_data: dict, action: str) -> Optional[tuple[str, str, str]]:
    content_map = {
        "verify_payment": {
            "subject": f"Sundays payment confirmed | #{order_data['id']}",
            "title": "Payment Confirmed",
            "intro": "Your payment has been verified and your order is now moving into the baking queue.",
            "body_html": """
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Status update</div>
              <div style="margin-top:12px;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;color:#132014;">
                Your payment has been successfully verified.<br/>
                We are now preparing your order for baking and dispatch.<br/>
                You will receive another update when the order is packed.
              </div>
            """,
            "body_text": "Your payment has been verified. We are now preparing your order for baking and dispatch.",
            "footer_note": "Fresh cookies are worth the wait.",
        },
        "reject_payment": {
            "subject": f"Sundays payment needs attention | #{order_data['id']}",
            "title": "Payment Could Not Be Matched",
            "intro": "We reviewed the payment proof but could not match it to a successful transfer yet.",
            "body_html": """
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">What to do next</div>
              <div style="margin-top:12px;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;color:#132014;">
                Please review the amount and the screenshot or UTR you submitted.<br/>
                If the payment has gone through, reply with the correct reference details so we can help quickly.
              </div>
            """,
            "body_text": "We could not match the submitted payment proof yet. Please review the amount and submit the correct details if needed.",
            "footer_note": "Our team will be happy to help sort this out.",
        },
        "mark_packed": {
            "subject": f"Sundays order packed | #{order_data['id']}",
            "title": "Your Order Is Packed",
            "intro": "Your box is packed and ready for the next handoff.",
            "body_html": """
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Packing update</div>
              <div style="margin-top:12px;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;color:#132014;">
                Your order has been packed carefully and is now queued for dispatch.<br/>
                We will update you again once it has been marked delivered.
              </div>
            """,
            "body_text": "Your order has been packed and is queued for dispatch.",
            "footer_note": "Almost there.",
        },
        "mark_delivered": {
            "subject": f"Sundays delivered | #{order_data['id']}",
            "title": "Delivered",
            "intro": "Your Sundays order has been marked delivered.",
            "body_html": """
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8e7a49;font-family:Arial,sans-serif;">Delivery update</div>
              <div style="margin-top:12px;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;color:#132014;">
                Your order has been delivered.<br/>
                Thank you for trusting Sundays with your cookie cravings.
              </div>
            """,
            "body_text": "Your order has been marked delivered. Thank you for choosing Sundays.",
            "footer_note": "We hope the box disappears fast.",
        },
    }
    content = content_map.get(str(action or "").strip())
    if not content:
        return None

    text, html = build_customer_email_layout(
        order_data,
        eyebrow="Sundays",
        title=content["title"],
        intro=content["intro"],
        body_html=content["body_html"],
        body_text=content["body_text"],
        footer_note=content["footer_note"],
    )
    return content["subject"], text, html


def send_email_notification(recipient: str, subject: str, body: str, html_body: Optional[str] = None) -> None:
    if not smtp_enabled() or not recipient:
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = SMTP_FROM_EMAIL
    message["To"] = recipient
    message.set_content(body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    if SMTP_USE_TLS:
        context = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls(context=context)
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
    else:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)


async def notify_owner_new_order(order_data: dict) -> None:
    if not notifications_enabled():
        return

    subject, body, html_body = build_owner_order_email(order_data)
    await asyncio.to_thread(send_email_notification, OWNER_NOTIFICATION_EMAIL, subject, body, html_body)


async def notify_owner_payment_update(order_data: dict, payment: PaymentConfirm) -> None:
    if not notifications_enabled():
        return

    subject, body, html_body = build_owner_payment_email(order_data, payment)
    await asyncio.to_thread(send_email_notification, OWNER_NOTIFICATION_EMAIL, subject, body, html_body)


async def notify_customer_email(recipient: str, subject: str, body: str, html_body: Optional[str] = None) -> None:
    if not smtp_enabled() or not recipient:
        return
    await asyncio.to_thread(send_email_notification, recipient, subject, body, html_body)


async def maybe_send_customer_welcome_email(order_data: dict) -> None:
    email = normalize_email(order_data.get("email", ""))
    if not email:
        return

    existing = await email_contacts_col.find_one({"email": email}, {"_id": 0})
    update_payload = {
        "email": email,
        "marketing_opt_in": bool(order_data.get("marketing_opt_in")),
        "last_order_id": order_data["id"],
        "updated_at": datetime.utcnow().isoformat(),
    }

    if existing and existing.get("welcome_sent_at"):
        await email_contacts_col.update_one({"email": email}, {"$set": update_payload}, upsert=True)
        return

    subject, body, html_body = build_customer_welcome_email(order_data)
    await notify_customer_email(email, subject, body, html_body)
    update_payload["first_order_id"] = order_data["id"]
    update_payload["welcome_sent_at"] = datetime.utcnow().isoformat()
    await email_contacts_col.update_one({"email": email}, {"$set": update_payload}, upsert=True)

# ---- API Routes ----

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Sunday Cookies API"}

@app.get("/api/products")
async def get_products():
    products = await products_col.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return {"products": products}

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = await products_col.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/api/orders")
async def create_order(order: OrderCreate):
    if not is_valid_email(order.email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    order_id = str(uuid.uuid4())[:8].upper()
    order_data = {
        "id": order_id,
        "items": [item.dict() for item in order.items],
        "full_name": order.full_name,
        "phone": order.phone,
        "email": normalize_email(order.email),
        "marketing_opt_in": bool(order.marketing_opt_in),
        "address_line1": order.address_line1,
        "address_line2": order.address_line2,
        "city": order.city,
        "state": order.state,
        "pincode": order.pincode,
        "landmark": order.landmark,
        "special_instructions": order.special_instructions,
        "subtotal": order.subtotal,
        "delivery_fee": order.delivery_fee,
        "total": order.total,
        "payment_status": "pending",
        "order_status": "pending",
        "utr_id": None,
        "screenshot_url": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    await orders_col.insert_one(order_data)
    try:
        await notify_owner_new_order(order_data)
    except Exception as exc:
        print(f"Owner notification failed for order {order_id}: {exc}")
    try:
        await maybe_send_customer_welcome_email(order_data)
    except Exception as exc:
        print(f"Customer welcome notification failed for order {order_id}: {exc}")
    return {"order_id": order_id, "message": "Order created successfully"}

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    order = await orders_col.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@app.get("/api/admin/orders")
async def get_admin_orders(x_admin_key: Optional[str] = Header(None, alias="x-admin-key")):
    require_admin(x_admin_key)
    cursor = orders_col.find({}, {"_id": 0}).sort("created_at", -1)
    orders = await cursor.to_list(length=500)
    return {"orders": orders}


@app.post("/api/admin/orders/{order_id}/status")
async def update_admin_order_status(order_id: str, payload: AdminOrderAction, x_admin_key: Optional[str] = Header(None, alias="x-admin-key")):
    require_admin(x_admin_key)
    order = await orders_col.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    updated_order = apply_order_action(order, payload.action)
    update_fields = {
        "payment_status": updated_order.get("payment_status"),
        "order_status": updated_order.get("order_status"),
    }
    await orders_col.update_one({"id": order_id}, {"$set": update_fields})
    try:
        customer_email = build_customer_status_email(updated_order, payload.action)
        if customer_email:
            subject, body, html_body = customer_email
            await notify_customer_email(updated_order.get("email", ""), subject, body, html_body)
    except Exception as exc:
        print(f"Customer status notification failed for order {order_id}: {exc}")
    return {"order": updated_order}

@app.post("/api/orders/{order_id}/confirm-payment")
async def confirm_payment(order_id: str, payment: PaymentConfirm):
    order = await orders_col.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    cleaned_utr_id = normalize_utr_id(payment.utr_id)
    if not payment.screenshot_uploaded and not cleaned_utr_id:
        raise HTTPException(status_code=400, detail="Submit a payment screenshot or a valid UTR.")

    if not payment.screenshot_uploaded and not is_valid_utr_id(cleaned_utr_id):
        raise HTTPException(status_code=400, detail="Enter a valid UTR with at least 12 letters or numbers.")

    update_data = {
        "payment_status": "proof_submitted",
        "order_status": "payment_review",
    }
    if cleaned_utr_id:
        update_data["utr_id"] = cleaned_utr_id
    if payment.screenshot_uploaded:
        update_data["screenshot_url"] = "uploaded"

    payment.utr_id = cleaned_utr_id or None
    await orders_col.update_one({"id": order_id}, {"$set": update_data})
    merged_order = {**order, **update_data}
    try:
        await notify_owner_payment_update(merged_order, payment)
    except Exception as exc:
        print(f"Payment notification failed for order {order_id}: {exc}")
    try:
        subject, body, html_body = build_customer_payment_review_email(merged_order, payment)
        await notify_customer_email(merged_order.get("email", ""), subject, body, html_body)
    except Exception as exc:
        print(f"Customer payment notification failed for order {order_id}: {exc}")
    return {"message": "Payment proof received. The order is pending manual verification."}

@app.post("/api/orders/{order_id}/upload-screenshot")
async def upload_screenshot(order_id: str, file: UploadFile = File(...)):
    order = await orders_col.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Save file relative to the backend so this works in local and hosted environments.
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{order_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    await orders_col.update_one({"id": order_id}, {"$set": {"screenshot_url": file_path}})
    return {"message": "Screenshot uploaded successfully"}
