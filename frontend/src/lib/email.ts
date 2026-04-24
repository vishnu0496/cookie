import nodemailer from "nodemailer";
import { OrderEntry } from "./storage";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER || "sundayshyd@gmail.com",
    pass: process.env.SMTP_PASS || "",
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || "Sundays <sundayshyd@gmail.com>";
const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL || "sundayshyd@gmail.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatIST(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      })
      .replace(" am", " AM")
      .replace(" pm", " PM");
  } catch {
    return iso;
  }
}

function addressLines(c: OrderEntry["customer"]): string[] {
  const lines = [c.addressHouse, c.addressLocality, `${c.addressCity}, ${c.addressState} – ${c.addressPincode}`];
  if (c.addressLandmark) lines.push(`Near ${c.addressLandmark}`);
  return lines;
}

function dropLabel(orderNumber: string): string {
  return "Handcrafted";
}

// ── Customer Confirmation Email ───────────────────────────────────────────────

export async function sendCustomerOrderConfirmation(data: OrderEntry) {
  const subject = `Order Confirmed — ${data.orderNumber} | Sundays`;

  const addrLines = addressLines(data.customer);
  const addrHtml = addrLines.join("<br>");
  const addrText = addrLines.join("\n");

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E8DFC8; vertical-align: top;">
        <span style="display: block; font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #163126; margin-bottom: 2px;">${item.name}</span>
        <span style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #9A7B4F; text-transform: uppercase; letter-spacing: 1px;">Qty ${item.quantity} &bull; ₹${item.price} each</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E8DFC8; text-align: right; font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #163126; vertical-align: top;">
        ₹${item.price * item.quantity}
      </td>
    </tr>`
    )
    .join("");

  const itemsText = data.items
    .map((item) => `  ${item.quantity}× ${item.name}   ₹${item.price * item.quantity}`)
    .join("\n");

  const textBody = `
Thank you, ${data.customer.firstName}.

We've received your order and we're getting ready to bake your handcrafted treats.

ORDER: ${data.orderNumber}
${itemsText}

Subtotal:  ₹${data.subtotal}
Delivery:  ₹${data.delivery}
Total:     ₹${data.total}

Delivering to:
${addrText}

WHAT HAPPENS NEXT:
01  We confirm your order details and delivery window.
02  Your cookies are baked fresh specifically for your order.
03  Your box is hand-delivered to your doorstep in Hyderabad.

Until then,
Team Sundays

Follow the bake — instagram.com/sundays.hyd`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0; padding:0; background-color:#F0EBE1;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0EBE1; padding: 40px 16px;">
  <tr>
    <td align="center">
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px; width:100%; background-color:#ffffff; border:1px solid #D6CDB8;">

        <!-- Header -->
        <tr>
          <td style="background-color:#163126; padding: 44px 40px 38px; text-align:center; border-bottom: 2px solid #C7A44C;">
            <p style="margin:0 0 14px; font-family:Arial,Helvetica,sans-serif; font-size:9px; letter-spacing:5px; text-transform:uppercase; color:#C7A44C;">The Art of the Cookie &middot; Hyderabad</p>
            <h1 style="margin:0 0 14px; font-family:'Times New Roman',Times,serif; font-size:38px; font-weight:normal; color:#F6F0E7; letter-spacing:4px;">SUNDAYS</h1>
            <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:10px; letter-spacing:3px; color:#C7A44C; opacity:0.8;">ORDER ${data.orderNumber}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 44px 40px 0; background-color:#ffffff;">

            <!-- Greeting -->
            <p style="margin:0 0 6px; font-family:'Times New Roman',Times,serif; font-size:22px; color:#163126;">Thank you, ${data.customer.firstName}.</p>
            <p style="margin:0 0 36px; font-family:'Times New Roman',Times,serif; font-size:17px; color:#163126; line-height:1.75; opacity:0.85;">We&rsquo;ve received your order. Our bakers are preparing to handcraft your selection using the finest ingredients. Below is a copy of your order details.</p>

            <!-- Order Summary Card -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAF7F2; border:1px solid #DDD0B8; margin-bottom:32px;">
              <tr>
                <td style="padding: 24px 24px 0;">
                  <p style="margin:0 0 16px; font-family:Arial,Helvetica,sans-serif; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#9A7B4F; padding-bottom:14px; border-bottom:1px solid #DDD0B8;">Your Selection</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 24px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #DDD0B8; margin-top:4px;">
                    <tr>
                      <td style="padding:12px 0 4px; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#9A7B4F;">Subtotal</td>
                      <td style="padding:12px 0 4px; text-align:right; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#9A7B4F;">₹${data.subtotal}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#9A7B4F;">Delivery</td>
                      <td style="padding:4px 0; text-align:right; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:#9A7B4F;">₹${data.delivery}</td>
                    </tr>
                    <tr>
                      <td style="padding:14px 0 0; font-family:'Times New Roman',Times,serif; font-size:20px; color:#163126; font-weight:bold;">Total</td>
                      <td style="padding:14px 0 0; text-align:right; font-family:'Times New Roman',Times,serif; font-size:20px; color:#C7A44C; font-weight:bold;">₹${data.total}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Delivery Address -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
              <tr>
                <td>
                  <p style="margin:0 0 10px; font-family:Arial,Helvetica,sans-serif; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#9A7B4F;">Delivering To</p>
                  <p style="margin:0; font-family:'Times New Roman',Times,serif; font-size:16px; color:#163126; line-height:1.9;">${addrHtml}</p>
                </td>
              </tr>
            </table>

            <!-- What Happens Next -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px dashed #D6CDB8; padding-top:28px; margin-bottom:36px;">
              <tr><td style="padding-top:28px;">
                <p style="margin:0 0 20px; font-family:Arial,Helvetica,sans-serif; font-size:9px; letter-spacing:3px; text-transform:uppercase; color:#9A7B4F;">What Happens Next</p>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                  <tr>
                    <td width="28" style="vertical-align:top; padding-top:3px; font-family:Arial,Helvetica,sans-serif; font-size:9px; color:#C7A44C; font-weight:bold; letter-spacing:1px;">01</td>
                    <td style="font-family:'Times New Roman',Times,serif; font-size:16px; color:#163126; line-height:1.7;">We confirm your order details and your specific delivery window.</td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                  <tr>
                    <td width="28" style="vertical-align:top; padding-top:3px; font-family:Arial,Helvetica,sans-serif; font-size:9px; color:#C7A44C; font-weight:bold; letter-spacing:1px;">02</td>
                    <td style="font-family:'Times New Roman',Times,serif; font-size:16px; color:#163126; line-height:1.7;">Your cookies are baked fresh to order using our signature recipes.</td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="28" style="vertical-align:top; padding-top:3px; font-family:Arial,Helvetica,sans-serif; font-size:9px; color:#C7A44C; font-weight:bold; letter-spacing:1px;">03</td>
                    <td style="font-family:'Times New Roman',Times,serif; font-size:16px; color:#163126; line-height:1.7;">Your box is hand-delivered to your doorstep in Hyderabad.</td>
                  </tr>
                </table>
              </td></tr>
            </table>

            <!-- Closing -->
            <p style="margin:0 0 44px; font-family:'Times New Roman',Times,serif; font-size:17px; color:#163126; line-height:1.8;">With joy,<br><em>Team Sundays</em></p>

          </td>
        </tr>

        <!-- Footer CTA -->
        <tr>
          <td style="background-color:#163126; padding:32px 40px; text-align:center; border-top:2px solid #C7A44C;">
            <a href="https://instagram.com/sundays.hyd" style="display:inline-block; padding:13px 30px; background-color:#C7A44C; color:#163126; font-family:Arial,Helvetica,sans-serif; font-size:10px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; text-decoration:none; border-radius:1px;">Follow our Story</a>
            <p style="margin:18px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:10px; color:#F6F0E7; opacity:0.35; letter-spacing:2px; text-transform:uppercase;">Sundays &middot; Hyderabad &middot; Handcrafted Weekly</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;

  return transporter.sendMail({
    from: FROM_EMAIL,
    to: data.customer.email,
    subject,
    text: textBody,
    html: htmlBody,
  });
}

// ── Owner Notification Email ──────────────────────────────────────────────────

export async function sendOwnerOrderNotification(data: OrderEntry, previousOrderCount: number = 0) {
  const isReturning = previousOrderCount > 0;
  const customerLabel = isReturning
    ? `Returning &middot; ${previousOrderCount} previous order${previousOrderCount > 1 ? "s" : ""}`
    : "New customer";
  const customerLabelText = isReturning
    ? `Returning (${previousOrderCount} previous)`
    : "New customer";

  const receivedAt = formatIST(data.timestamp);
  const totalItems = data.items.reduce((n, i) => n + i.quantity, 0);
  const addrLines = addressLines(data.customer);

  const subject = `New Order: ₹${data.total} — ${data.customer.firstName} (${customerLabelText})`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; font-size:14px; color:#163126;">${item.quantity}&times; ${item.name}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #f0f0f0; text-align:right; font-size:14px; color:#163126;">₹${item.price * item.quantity}</td>
    </tr>`
    )
    .join("");

  const textBody = `
NEW ORDER — ${data.orderNumber}
${totalItems} item${totalItems > 1 ? "s" : ""} · ₹${data.total} · ${receivedAt}
Customer: ${customerLabelText}

ITEMS:
${data.items.map((i) => `  ${i.quantity}× ${i.name}   ₹${i.price * i.quantity}`).join("\n")}
  Subtotal:  ₹${data.subtotal}
  Delivery:  ₹${data.delivery}
  TOTAL:     ₹${data.total}

CUSTOMER:
  Name:      ${data.customer.firstName}
  Email:     ${data.customer.email}
  WhatsApp:  ${data.customer.whatsapp || "—"}

DELIVERY:
  ${addrLines.join("\n  ")}

Received: ${receivedAt}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background-color:#F6F0E7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6F0E7; padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px; width:100%; background:#ffffff; border:1px solid #E0D8CC; border-radius:6px; overflow:hidden;">

        <!-- Header bar -->
        <tr>
          <td style="background-color:#163126; padding:20px 24px; border-bottom:3px solid #C7A44C;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px; font-size:11px; color:#C7A44C; letter-spacing:2px; text-transform:uppercase;">Sundays &middot; New Order</p>
                  <p style="margin:0; font-size:18px; font-weight:600; color:#F6F0E7; letter-spacing:0.5px;">${data.orderNumber} &mdash; ${data.customer.firstName}</p>
                </td>
                <td align="right">
                  <span style="background-color:#C7A44C; color:#163126; font-size:18px; font-weight:700; padding:6px 14px; border-radius:4px; letter-spacing:0.5px;">₹${data.total}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Metadata strip -->
        <tr>
          <td style="background-color:#F9F6F1; padding:12px 24px; border-bottom:1px solid #E8E0D0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:11px; color:#888; padding-right:16px;">
                  <span style="display:inline-block; background-color:${isReturning ? "#EBF5FB" : "#EAFAF1"}; color:${isReturning ? "#2471A3" : "#1D8348"}; font-weight:700; font-size:10px; letter-spacing:1px; text-transform:uppercase; padding:3px 8px; border-radius:3px;">${customerLabel}</span>
                </td>
                <td style="font-size:11px; color:#888; text-align:center;">${totalItems} item${totalItems > 1 ? "s" : ""}</td>
                <td style="font-size:11px; color:#888; text-align:right;">${receivedAt}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 24px 0;">

            <!-- Items -->
            <p style="margin:0 0 10px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#888;">Order Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #f0f0f0; border-radius:4px; margin-bottom:24px; overflow:hidden;">
              ${itemsHtml}
              <tr>
                <td style="padding:8px 12px; font-size:12px; color:#999;">Subtotal</td>
                <td style="padding:8px 12px; text-align:right; font-size:12px; color:#999;">₹${data.subtotal}</td>
              </tr>
              <tr>
                <td style="padding:4px 12px 8px; font-size:12px; color:#999;">Delivery</td>
                <td style="padding:4px 12px 8px; text-align:right; font-size:12px; color:#999;">₹${data.delivery}</td>
              </tr>
              <tr style="background-color:#FAFAF8;">
                <td style="padding:10px 12px; font-size:15px; font-weight:700; color:#163126;">Total</td>
                <td style="padding:10px 12px; text-align:right; font-size:15px; font-weight:700; color:#C7A44C;">₹${data.total}</td>
              </tr>
            </table>

            <!-- Customer -->
            <p style="margin:0 0 10px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:#888;">Customer</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #f0f0f0; border-radius:4px; margin-bottom:24px; overflow:hidden;">
              <tr>
                <td style="padding:10px 12px; width:28%; font-size:12px; color:#999; border-bottom:1px solid #f8f8f8; vertical-align:top;">Name</td>
                <td style="padding:10px 12px; font-size:14px; font-weight:500; color:#163126; border-bottom:1px solid #f8f8f8;">${data.customer.firstName}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px; font-size:12px; color:#999; border-bottom:1px solid #f8f8f8; vertical-align:top;">Email</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f8f8f8;"><a href="mailto:${data.customer.email}" style="font-size:14px; color:#163126; text-decoration:none;">${data.customer.email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 12px; font-size:12px; color:#999; border-bottom:1px solid #f8f8f8; vertical-align:top;">WhatsApp</td>
                <td style="padding:10px 12px; border-bottom:1px solid #f8f8f8;">${data.customer.whatsapp ? `<a href="https://wa.me/${data.customer.whatsapp.replace(/\D/g, "")}" style="font-size:14px; color:#163126; text-decoration:none;">${data.customer.whatsapp}</a>` : '<span style="font-size:14px; color:#aaa;">&mdash;</span>'}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px; font-size:12px; color:#999; vertical-align:top;">Delivery</td>
                <td style="padding:10px 12px; font-size:14px; color:#163126; line-height:1.7;">${addrLines.join("<br>")}</td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#FAFAF8; padding:14px 24px; border-top:1px solid #E8E0D0; text-align:center;">
            <p style="margin:0; font-size:10px; color:#aaa; text-transform:uppercase; letter-spacing:2px;">Sundays &middot; Operations</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;

  return transporter.sendMail({
    from: FROM_EMAIL,
    to: OWNER_EMAIL,
    subject,
    text: textBody,
    html: htmlBody,
  });
}
