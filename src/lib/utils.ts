import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numPrice);
}

export function formatUnit(unit: string, quantity?: number | string): string {
  const unitLabels: Record<string, { singular: string; plural: string }> = {
    meter: { singular: "meter", plural: "meters" },
    piece: { singular: "piece", plural: "pieces" },
    kg: { singular: "kg", plural: "kg" },
    yard: { singular: "yard", plural: "yards" },
    set: { singular: "set", plural: "sets" },
  };
  const label = unitLabels[unit] ?? { singular: unit, plural: unit };

  // If no quantity provided, return singular (for "per meter" usage)
  if (quantity === undefined) {
    return label.singular;
  }

  const qty = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  return qty === 1 ? label.singular : label.plural;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NT-${timestamp}-${random}`;
}

export function formatQuantity(quantity: number | string, unit?: string): string {
  const qty = typeof quantity === "string" ? parseFloat(quantity) : quantity;
  
  // For meters/yards, show decimal if needed (e.g., 1.5m, 2.5m)
  // For pieces/sets/kg, always show as integer
  if (unit === "meter" || unit === "yard") {
    // Show one decimal place if not a whole number
    return qty % 1 === 0 ? qty.toString() : qty.toFixed(1);
  }
  
  // For pieces and other units, round to integer
  return Math.round(qty).toString();
}
