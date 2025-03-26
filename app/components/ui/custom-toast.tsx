"use client";

import { Loader2, CheckCircle, XCircle, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const toastVariants = cva("flex items-center gap-3 rounded-md border p-4 shadow-sm relative", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      loading: "border-[#289ECC] bg-[#EBF8FF] text-[#289ECC]",
      success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-50",
      error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id: string;
  title: string;
  description?: string;
  className?: string;
}

export function CustomToast({ id, title, description, variant, className }: ToastProps) {
  const { dismiss } = useToast();

  return (
    <div className={cn(toastVariants({ variant }), className)}>
      {variant === "loading" && <Loader2 className="h-5 w-5 animate-spin text-[#289ECC]" />}
      {variant === "success" && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
      {variant === "error" && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
      <div>
        <h3 className="font-medium">{title}</h3>
        {description && <p className="text-sm opacity-90">{description}</p>}
      </div>
      <button onClick={() => dismiss(id)} className="absolute top-1 right-1 p-1 rounded-md text-foreground/50 hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
