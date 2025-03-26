"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = "md", text = "Loading", className = "" }: SpinnerProps) {
  const [dots, setDots] = useState(".");

  const sizeMap = {
    sm: "w-12 h-12 sm:w-16 sm:h-16",
    md: "w-16 h-16 sm:w-24 sm:h-24",
    lg: "w-24 h-24 sm:w-32 sm:h-32",
    xl: "w-32 h-32 sm:w-40 sm:h-40",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center p-2 sm:p-4", className)}>
      <div className={cn("relative", sizeMap[size])}>
        <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-blue-100 dark:border-blue-900">
          <div
            className="absolute inset-0 rounded-full border-2 sm:border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"
            style={{ animationDuration: "2s" }}
          />
        </div>
      </div>
      {text && (
        <div className="mt-2 sm:mt-4 text-center font-semibold">
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ">
            {text}
            <span className="inline-block min-w-[12px] sm:min-w-[18px]">{dots}</span>
          </p>
        </div>
      )}
    </div>
  );
}
