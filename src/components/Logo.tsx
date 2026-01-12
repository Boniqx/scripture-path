import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = "md",
  iconOnly = false,
}) => {
  const sizes = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };

  return (
    <div className={cn("flex items-center space-x-3 select-none", className)}>
      <div
        className={cn("relative flex items-center justify-center", sizes[size])}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-auto drop-shadow-2xl overflow-visible"
        >
          <defs>
            <linearGradient
              id="crossGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#d97706" /> {/* amber-600 */}
              <stop offset="100%" stopColor="#b45309" /> {/* amber-700 */}
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Minimalist Cross */}
          <path
            d="M50 10 V90 M20 35 H80"
            stroke="url(#crossGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span
            className={cn(
              "serif-text font-bold tracking-tight text-white leading-none",
              size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-3xl"
            )}
          >
            Scripture<span className="text-amber-600 italic">Path</span>
          </span>
        </div>
      )}
    </div>
  );
};
