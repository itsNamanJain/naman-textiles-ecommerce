"use client";

import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-center"
      className="toaster group"
      toastOptions={{
        duration: 1500,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/95 group-[.toaster]:text-ink-1 group-[.toaster]:border group-[.toaster]:border-black/10 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:py-3 group-[.toaster]:px-4",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-2 group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-ink-1 group-[.toast]:text-paper-1 group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-paper-2 group-[.toast]:text-muted-1 group-[.toast]:rounded-lg group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:bg-paper-2 group-[.toast]:border-black/10 group-[.toast]:text-muted-2 group-[.toast]:hover:bg-paper-1",
          success:
            "group-[.toaster]:border-success-2 group-[.toaster]:bg-success-2 group-[.toaster]:text-success-1",
          error:
            "group-[.toaster]:border-danger-5 group-[.toaster]:bg-danger-3 group-[.toaster]:text-danger-4",
          warning:
            "group-[.toaster]:border-paper-11 group-[.toaster]:bg-paper-1 group-[.toaster]:text-brand-3",
          info: "group-[.toaster]:border-info-2 group-[.toaster]:bg-info-2 group-[.toaster]:text-info-1",
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-4 text-success-1" />,
        info: <Info className="size-4 text-info-1" />,
        warning: <AlertTriangle className="size-4 text-brand-3" />,
        error: <XCircle className="size-4 text-danger-4" />,
        loading: <Loader2 className="size-4 animate-spin text-brand-1" />,
      }}
      expand
      closeButton
      {...props}
    />
  );
};

export { Toaster };
