import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { auth } from "@/server/auth";
import { kyselyDb } from "@/server/db";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { STORE_INFO } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID required" },
      { status: 400 }
    );
  }

  const isAdmin = session.user.role === "admin";

  // Fetch the order
  let query = kyselyDb
    .selectFrom("order")
    .selectAll("order")
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("orderItem")
          .selectAll()
          .whereRef("orderItem.orderId", "=", "order.id")
      ).as("items"),
    ])
    .where("order.id", "=", orderId);

  if (!isAdmin) {
    query = query.where("order.userId", "=", session.user.id);
  }

  const order = await query.executeTakeFirst();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fetch user info
  const user = await kyselyDb
    .selectFrom("user")
    .select(["name", "email"])
    .where("id", "=", order.userId)
    .executeTakeFirst();

  // Generate PDF
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const brandColor: [number, number, number] = [26, 26, 26];
  const mutedColor: [number, number, number] = [115, 115, 115];
  const lineColor: [number, number, number] = [229, 229, 224];

  // ─── Header ────────────────────────────────
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(STORE_INFO.name, margin, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(STORE_INFO.tagline, margin, 20);

  doc.setFontSize(7);
  doc.text(
    `${STORE_INFO.address.line1}, ${STORE_INFO.address.line2}`,
    margin,
    25
  );
  doc.text(
    `Phone: ${STORE_INFO.phone} | Email: ${STORE_INFO.email}`,
    margin,
    29
  );

  y = 40;

  // ─── Invoice Title ────────────────────────────────
  doc.setTextColor(...brandColor);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", pageWidth - margin, y, { align: "right" });
  y += 10;

  // ─── Order Info ────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Left column - Bill To
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandColor);
  doc.text("Bill To:", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text(order.name ?? "Customer", margin, y);
  y += 4;
  doc.text(order.addressLineOne ?? "", margin, y);
  y += 4;
  if (order.addressLineTwo) {
    doc.text(order.addressLineTwo, margin, y);
    y += 4;
  }
  doc.text(
    `${order.city}, ${order.state} - ${order.pincode}`,
    margin,
    y
  );
  y += 4;
  doc.text(`Phone: ${order.phone}`, margin, y);
  y += 4;
  if (user?.email) {
    doc.text(`Email: ${user.email}`, margin, y);
    y += 4;
  }
  if (order.gstNumber) {
    doc.setFont("helvetica", "bold");
    doc.text(`GSTIN: ${order.gstNumber}`, margin, y);
    doc.setFont("helvetica", "normal");
    y += 4;
  }

  // Right column - Invoice details
  const rightX = pageWidth - margin;
  let ry = 55;
  doc.setTextColor(...mutedColor);
  doc.text(`Invoice No: ${order.orderNumber}`, rightX, ry, {
    align: "right",
  });
  ry += 5;
  doc.text(`Date: ${orderDate}`, rightX, ry, { align: "right" });
  ry += 5;
  doc.text(
    `Payment: ${order.paymentMethod === "upi" ? "UPI" : "COD"} | ${order.paymentStatus === "paid" ? "PAID" : "PENDING"}`,
    rightX,
    ry,
    { align: "right" }
  );

  y = Math.max(y, ry) + 8;

  // ─── Items Table ────────────────────────────────
  // Table header
  doc.setFillColor(245, 245, 240);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandColor);

  const col1 = margin + 2;
  const col2 = margin + 85;
  const col3 = margin + 110;
  const col4 = margin + 135;
  const col5 = margin + 160;

  doc.text("#", col1, y + 5.5);
  doc.text("Item", col1 + 6, y + 5.5);
  doc.text("Qty", col2, y + 5.5);
  doc.text("Unit", col3, y + 5.5);
  doc.text("Rate", col4, y + 5.5, { align: "right" });
  doc.text("Amount", col5, y + 5.5, { align: "right" });

  y += 10;

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  order.items.forEach((item, index) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(...brandColor);
    doc.text(`${index + 1}`, col1, y + 4);

    // Truncate long product names
    const name =
      item.productName.length > 40
        ? item.productName.substring(0, 37) + "..."
        : item.productName;
    doc.text(name, col1 + 6, y + 4);

    doc.setTextColor(...mutedColor);
    doc.text(Number(item.quantity).toFixed(2), col2, y + 4);
    doc.text(item.unit ?? "meter", col3, y + 4);
    doc.text(formatINR(Number(item.price)), col4, y + 4, { align: "right" });
    doc.setTextColor(...brandColor);
    doc.text(formatINR(Number(item.total)), col5, y + 4, { align: "right" });

    y += 7;

    // Row separator
    doc.setDrawColor(...lineColor);
    doc.setLineWidth(0.2);
    doc.line(margin, y, margin + contentWidth, y);
    y += 1;
  });

  y += 5;

  // ─── Totals ────────────────────────────────
  const totalsX = margin + 110;
  const totalsValX = col5;

  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);

  // Subtotal
  doc.text("Subtotal:", totalsX, y);
  doc.setTextColor(...brandColor);
  doc.text(formatINR(Number(order.subtotal)), totalsValX, y, {
    align: "right",
  });
  y += 6;

  // Discount
  if (Number(order.discount) > 0) {
    doc.setTextColor(22, 163, 74); // green
    doc.text(
      `Discount${order.couponCode ? ` (${order.couponCode})` : ""}:`,
      totalsX,
      y
    );
    doc.text(`-${formatINR(Number(order.discount))}`, totalsValX, y, {
      align: "right",
    });
    y += 6;
  }

  // Shipping
  doc.setTextColor(...mutedColor);
  doc.text("Shipping:", totalsX, y);
  doc.setTextColor(...brandColor);
  doc.text(formatINR(Number(order.shippingCost)), totalsValX, y, {
    align: "right",
  });
  y += 6;

  // Tax breakdown
  if (Number(order.tax) > 0) {
    const halfTax = Number(order.tax) / 2;
    doc.setTextColor(...mutedColor);
    doc.text("SGST (2.5%):", totalsX, y);
    doc.setTextColor(...brandColor);
    doc.text(formatINR(halfTax), totalsValX, y, { align: "right" });
    y += 5;

    doc.setTextColor(...mutedColor);
    doc.text("CGST (2.5%):", totalsX, y);
    doc.setTextColor(...brandColor);
    doc.text(formatINR(halfTax), totalsValX, y, { align: "right" });
    y += 6;
  }

  // Total line
  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX, y, totalsValX, y);
  y += 5;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...brandColor);
  doc.text("Total:", totalsX, y);
  doc.text(formatINR(Number(order.total)), totalsValX, y, {
    align: "right",
  });
  y += 12;

  // ─── Footer ────────────────────────────────
  doc.setDrawColor(...lineColor);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedColor);
  doc.text("Thank you for shopping with Naman Textiles!", margin, y);
  y += 4;
  doc.text(
    "For queries, contact us on WhatsApp: " + STORE_INFO.phone,
    margin,
    y
  );
  y += 8;

  doc.setFontSize(7);
  doc.text("This is a computer-generated invoice.", margin, y);

  // Return PDF
  const pdfBuffer = doc.output("arraybuffer");

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${order.orderNumber}.pdf"`,
    },
  });
}

function formatINR(amount: number): string {
  return (
    "Rs. " +
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
