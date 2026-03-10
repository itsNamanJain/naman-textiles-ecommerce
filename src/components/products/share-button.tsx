"use client";

import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STORE_INFO } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

const whatsappNumber = STORE_INFO.whatsapp.replace(/[+\s]/g, "");

type ShareButtonProps = {
  product: {
    name: string;
    slug: string;
    price: string;
    sellingMode: "meter" | "piece";
  };
  /** Render as a small icon-only button (for product cards) */
  compact?: boolean;
};

export function ShareButton({ product, compact }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/product/${product.slug}`
      : `/product/${product.slug}`;

  const unit = product.sellingMode === "piece" ? "piece" : "meter";
  const price = formatPrice(Number(product.price));

  const shareText = `Check out ${product.name} at ${price}/${unit} on Naman Textiles!`;

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent(`${shareText}\n${productUrl}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hi! I'm interested in ${product.name} (${price}/${unit}). ${productUrl}`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: productUrl,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button
            className="absolute top-1.5 right-9 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-muted-3 shadow transition-all hover:scale-110 hover:text-brand-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Button
            variant="outline"
            className="text-ink-1 rounded-full border-black/10 bg-white/80 hover:bg-white"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={handleWhatsAppShare}
          className="cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4 fill-[#25D366]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleWhatsAppInquiry}
          className="cursor-pointer"
        >
          <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
          Inquire on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleCopyLink}
          className="cursor-pointer"
        >
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        {typeof navigator !== "undefined" && "share" in navigator && (
          <DropdownMenuItem
            onClick={handleNativeShare}
            className="cursor-pointer"
          >
            <Share2 className="mr-2 h-4 w-4" />
            More Options
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
