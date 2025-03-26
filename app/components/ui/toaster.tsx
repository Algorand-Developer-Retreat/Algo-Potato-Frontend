"use client";

import { useToast } from "@/hooks/use-toast";
import { CustomToast } from "@/components/ui/custom-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 w-full max-w-[420px] p-4">
      {toasts.map(({ id, title, description, variant }) => (
        <CustomToast
          key={id}
          id={id}
          title={title || ""}
          description={description?.toString()}
          variant={variant as "default" | "loading" | "success" | "error"}
        />
      ))}
    </div>
  );
}
