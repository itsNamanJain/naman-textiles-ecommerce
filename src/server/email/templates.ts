import { STORE_INFO } from "@/lib/constants";

// ─── Types ─────────────────────────────────────────────────

type OrderItem = {
  productName: string;
  quantity: string;
  unit: string;
  price: string;
  total: string;
};

type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: string;
  shippingCost: string;
  tax: string;
  discount: string;
  total: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressLineOne: string;
    addressLineTwo?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  couponCode?: string | null;
  gstNumber?: string | null;
};

type ShippingEmailData = {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string | null;
};

type DeliveryEmailData = {
  orderNumber: string;
  customerName: string;
};

// ─── Shared Layout ─────────────────────────────────────────

function emailLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f0; font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a1a; padding:24px 32px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:0.5px;">
                ${STORE_INFO.name}
              </h1>
              <p style="margin:4px 0 0; color:#a3a3a3; font-size:12px; letter-spacing:1px; text-transform:uppercase;">
                ${STORE_INFO.tagline}
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#fafaf8; border-top:1px solid #e5e5e0; padding:24px 32px; text-align:center;">
              <p style="margin:0 0 4px; color:#737373; font-size:13px;">
                ${STORE_INFO.name} | ${STORE_INFO.address.line1}
              </p>
              <p style="margin:0 0 8px; color:#737373; font-size:13px;">
                ${STORE_INFO.address.line2}
              </p>
              <p style="margin:0; color:#737373; font-size:13px;">
                Phone: ${STORE_INFO.phone} | Email: ${STORE_INFO.email}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `&#8377;${num.toFixed(2)}`;
}

// ─── Order Confirmation Email ──────────────────────────────

export function orderConfirmationEmail(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px; border-bottom:1px solid #f0f0ec; font-size:14px; color:#1a1a1a;">
            ${item.productName}
            <br><span style="color:#737373; font-size:12px;">${item.quantity} ${item.unit}${parseFloat(item.quantity) > 1 ? "s" : ""}</span>
          </td>
          <td style="padding:10px 12px; border-bottom:1px solid #f0f0ec; font-size:14px; color:#1a1a1a; text-align:right;">
            ${formatCurrency(item.total)}
          </td>
        </tr>`
    )
    .join("");

  const addr = data.shippingAddress;
  const addressLines = [
    addr.name,
    addr.addressLineOne,
    addr.addressLineTwo,
    `${addr.city}, ${addr.state} - ${addr.pincode}`,
    `Phone: ${addr.phone}`,
  ]
    .filter(Boolean)
    .join("<br>");

  const content = `
    <h2 style="margin:0 0 8px; color:#1a1a1a; font-size:22px; font-weight:700;">Order Confirmed!</h2>
    <p style="margin:0 0 24px; color:#525252; font-size:15px; line-height:1.5;">
      Hi ${data.customerName || "there"}, thank you for your order. We've received it and will process it shortly.
    </p>

    <!-- Order Number -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background-color:#fafaf8; border-radius:8px; border:1px solid #e5e5e0;">
      <tr>
        <td style="padding:16px 20px;">
          <span style="color:#737373; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Order Number</span>
          <br>
          <span style="color:#1a1a1a; font-size:18px; font-weight:700;">${data.orderNumber}</span>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="padding:8px 12px; border-bottom:2px solid #1a1a1a; font-size:12px; color:#737373; text-transform:uppercase; letter-spacing:0.5px;">Item</td>
        <td style="padding:8px 12px; border-bottom:2px solid #1a1a1a; font-size:12px; color:#737373; text-transform:uppercase; letter-spacing:0.5px; text-align:right;">Amount</td>
      </tr>
      ${itemRows}
    </table>

    <!-- Totals -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:6px 12px; font-size:14px; color:#525252;">Subtotal</td>
        <td style="padding:6px 12px; font-size:14px; color:#525252; text-align:right;">${formatCurrency(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px; font-size:14px; color:#525252;">Shipping</td>
        <td style="padding:6px 12px; font-size:14px; color:#525252; text-align:right;">${formatCurrency(data.shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px; font-size:14px; color:#525252;">Tax (5%)</td>
        <td style="padding:6px 12px; font-size:14px; color:#525252; text-align:right;">${formatCurrency(data.tax)}</td>
      </tr>
      ${
        parseFloat(data.discount) > 0
          ? `<tr>
        <td style="padding:6px 12px; font-size:14px; color:#16a34a;">Discount${data.couponCode ? ` (${data.couponCode})` : ""}</td>
        <td style="padding:6px 12px; font-size:14px; color:#16a34a; text-align:right;">-${formatCurrency(data.discount)}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:12px 12px 6px; font-size:18px; font-weight:700; color:#1a1a1a; border-top:2px solid #1a1a1a;">Total</td>
        <td style="padding:12px 12px 6px; font-size:18px; font-weight:700; color:#1a1a1a; text-align:right; border-top:2px solid #1a1a1a;">${formatCurrency(data.total)}</td>
      </tr>
    </table>

    ${
      data.gstNumber
        ? `<p style="margin:0 0 16px; color:#737373; font-size:13px;">GST Number: ${data.gstNumber}</p>`
        : ""
    }

    <!-- Shipping Address -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background-color:#fafaf8; border-radius:8px; border:1px solid #e5e5e0;">
      <tr>
        <td style="padding:16px 20px;">
          <span style="color:#737373; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Shipping Address</span>
          <br><br>
          <span style="color:#1a1a1a; font-size:14px; line-height:1.6;">${addressLines}</span>
        </td>
      </tr>
    </table>

    <p style="margin:0; color:#737373; font-size:13px; line-height:1.5;">
      We'll notify you when your order is shipped. If you have any questions, feel free to reach out on WhatsApp at ${STORE_INFO.phone}.
    </p>
  `;

  return emailLayout("Order Confirmed - " + data.orderNumber, content);
}

// ─── Order Shipped Email ───────────────────────────────────

export function orderShippedEmail(data: ShippingEmailData): string {
  const content = `
    <h2 style="margin:0 0 8px; color:#1a1a1a; font-size:22px; font-weight:700;">Your Order is on its way!</h2>
    <p style="margin:0 0 24px; color:#525252; font-size:15px; line-height:1.5;">
      Hi ${data.customerName || "there"}, your order <strong>${data.orderNumber}</strong> has been shipped.
    </p>

    ${
      data.trackingNumber
        ? `
    <!-- Tracking Info -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background-color:#fafaf8; border-radius:8px; border:1px solid #e5e5e0;">
      <tr>
        <td style="padding:20px;">
          <span style="color:#737373; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">Tracking Number</span>
          <br>
          <span style="color:#1a1a1a; font-size:20px; font-weight:700; letter-spacing:1px;">${data.trackingNumber}</span>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background-color:#eff6ff; border-radius:8px; border:1px solid #bfdbfe;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0; color:#1e40af; font-size:14px; line-height:1.5;">
            Your order is expected to arrive within 5-7 business days. You can also track your order on our website.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0; color:#737373; font-size:13px; line-height:1.5;">
      For any queries about your shipment, contact us on WhatsApp at ${STORE_INFO.phone} or email ${STORE_INFO.email}.
    </p>
  `;

  return emailLayout("Order Shipped - " + data.orderNumber, content);
}

// ─── Order Delivered Email ─────────────────────────────────

export function orderDeliveredEmail(data: DeliveryEmailData): string {
  const content = `
    <h2 style="margin:0 0 8px; color:#1a1a1a; font-size:22px; font-weight:700;">Order Delivered!</h2>
    <p style="margin:0 0 24px; color:#525252; font-size:15px; line-height:1.5;">
      Hi ${data.customerName || "there"}, your order <strong>${data.orderNumber}</strong> has been delivered successfully.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px; background-color:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0;">
      <tr>
        <td style="padding:20px; text-align:center;">
          <span style="font-size:40px;">&#10004;</span>
          <p style="margin:8px 0 0; color:#166534; font-size:16px; font-weight:600;">Delivered Successfully</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px; color:#525252; font-size:15px; line-height:1.5;">
      We hope you love your purchase! Thank you for shopping with ${STORE_INFO.name}.
    </p>

    <p style="margin:0; color:#737373; font-size:13px; line-height:1.5;">
      If you have any issues with your order, please contact us within 7 days on WhatsApp at ${STORE_INFO.phone}.
    </p>
  `;

  return emailLayout("Order Delivered - " + data.orderNumber, content);
}

// ─── Admin New Order Alert ─────────────────────────────────

export function adminNewOrderEmail(
  data: OrderEmailData & { customerEmail: string }
): string {
  const itemsList = data.items
    .map(
      (item) =>
        `<li style="padding:4px 0; font-size:14px; color:#1a1a1a;">${item.productName} - ${item.quantity} ${item.unit}(s) - ${formatCurrency(item.total)}</li>`
    )
    .join("");

  const content = `
    <h2 style="margin:0 0 8px; color:#1a1a1a; font-size:22px; font-weight:700;">New Order Received!</h2>
    <p style="margin:0 0 24px; color:#525252; font-size:15px; line-height:1.5;">
      A new order has been placed on ${STORE_INFO.name}.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px; background-color:#fafaf8; border-radius:8px; border:1px solid #e5e5e0;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#737373; width:120px;">Order Number</td>
              <td style="padding:4px 0; font-size:14px; color:#1a1a1a; font-weight:600;">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#737373;">Customer</td>
              <td style="padding:4px 0; font-size:14px; color:#1a1a1a;">${data.customerName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#737373;">Email</td>
              <td style="padding:4px 0; font-size:14px; color:#1a1a1a;">${data.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#737373;">Phone</td>
              <td style="padding:4px 0; font-size:14px; color:#1a1a1a;">${data.shippingAddress.phone}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; font-size:13px; color:#737373;">Total</td>
              <td style="padding:4px 0; font-size:18px; color:#1a1a1a; font-weight:700;">${formatCurrency(data.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <h3 style="margin:24px 0 8px; color:#1a1a1a; font-size:16px;">Items Ordered</h3>
    <ul style="margin:0 0 24px; padding-left:20px;">
      ${itemsList}
    </ul>

    <p style="margin:0; color:#737373; font-size:13px; line-height:1.5;">
      Log in to the admin panel to manage this order.
    </p>
  `;

  return emailLayout("New Order - " + data.orderNumber, content);
}
