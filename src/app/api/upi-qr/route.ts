import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { STORE_INFO } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount");
  const orderId = searchParams.get("orderId");

  if (!amount || !orderId) {
    return NextResponse.json(
      { error: "Missing amount or orderId" },
      { status: 400 }
    );
  }

  const upiUrl = `upi://pay?pa=${STORE_INFO.upiId}&pn=${encodeURIComponent(STORE_INFO.name)}&am=${amount}&tn=${encodeURIComponent(`Order ${orderId}`)}&cu=INR`;

  try {
    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      qrCode: qrDataUrl,
      upiUrl,
      upiId: STORE_INFO.upiId,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
