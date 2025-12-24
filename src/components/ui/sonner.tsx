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
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:py-3 group-[.toaster]:px-4",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          description: "group-[.toast]:text-gray-500 group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-amber-600 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:rounded-lg group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:border-gray-200 group-[.toast]:text-gray-500 group-[.toast]:hover:bg-gray-200",
          success:
            "group-[.toaster]:border-emerald-200 group-[.toaster]:bg-emerald-50 group-[.toaster]:text-emerald-900",
          error:
            "group-[.toaster]:border-red-200 group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900",
          warning:
            "group-[.toaster]:border-amber-200 group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900",
          info: "group-[.toaster]:border-blue-200 group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900",
        },
      }}
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-600" />,
        info: <Info className="size-4 text-blue-600" />,
        warning: <AlertTriangle className="size-4 text-amber-600" />,
        error: <XCircle className="size-4 text-red-600" />,
        loading: <Loader2 className="size-4 animate-spin text-amber-600" />,
      }}
      expand
      closeButton
      {...props}
    />
  );
};

export { Toaster };
