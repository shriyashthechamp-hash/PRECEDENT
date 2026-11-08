"use client";

import { useEffect, useState, useRef } from "react";

interface DotTileProps {
  title: string;
  category: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description: string;
  indicatorColor?: "violet" | "teal" | "emerald" | "conflict";
  visualizationType?: "sparkline" | "bars" | "matrix" | "ring";
  trend?: string;
  dataPoints?: number[];
}

export function DotTile({
  title,
  category,
  value,
  suffix = "",
  prefix = "",
  description,
  indicatorColor = "violet",
  visualizationType = "sparkline",
  trend,
  dataPoints = [12, 18, 15, 24, 28, 35, 42, 50]
}: DotTileProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let startTime: number | null = null;
    const duration = 1200; // ms
    const startValue = 0;

    function animate(currentTime: number) {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(startValue + (value - startValue) * easeProgress));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  const colorMap = {
    violet: {
      text: "text-aurora-violet",
      bg: "bg-aurora-violet",
      border: "border-aurora-violet/30",
      glow: "hover:shadow-aurora-violet/10",
      pill: "bg-aurora-violet/10 text-aurora-violet border-aurora-violet/20"
    },
    teal: {
      text: "text-aurora-teal",
      bg: "bg-aurora-teal",
      border: "border-aurora-teal/30",
      glow: "hover:shadow-aurora-teal/10",
      pill: "bg-aurora-teal/10 text-aurora-teal border-aurora-teal/20"
    },
    emerald: {
      text: "text-emerald-400",
      bg: "bg-emerald-400",
      border: "border-emerald-500/30",
      glow: "hover:shadow-emerald-500/10",
      pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    conflict: {
      text: "text-conflict",
      bg: "bg-conflict",
      border: "border-conflict/30",
      glow: "hover:shadow-conflict/10",
      pill: "bg-conflict-subtle text-conflict border-conflict/30"
    }
  };

  const selectedColor = colorMap[indicatorColor];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-5 rounded-xl bg-[#0D0F15]/90 border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${selectedColor.glow} group`}
    >
      {/* Background Dot Grid for Tile */}
      <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${selectedColor.pill}`}>
            {category}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${selectedColor.bg} ${isHovered ? "animate-ping" : ""}`} />
            <span className="text-[10px] font-mono text-[#9295A1] uppercase tracking-widest">
              Live Bank
            </span>
          </div>
        </div>

        <h3 className="text-xs font-medium text-[#9295A1] tracking-wide pt-1">
          {title}
        </h3>
      </div>

      {/* Numerical Dot-Matrix Display */}
      <div className="relative z-10 py-4 my-auto">
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg font-mono text-[#9295A1]">{prefix}</span>}
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center">
            {displayValue.toLocaleString()}
          </div>
          {suffix && <span className={`text-sm font-mono font-medium ${selectedColor.text}`}>{suffix}</span>}
        </div>

        {trend && (
          <div className="text-[11px] font-mono text-[#9295A1] mt-1 flex items-center gap-1">
            <span className="text-aurora-teal">↑</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Mini Data Visualizations */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] space-y-2">
        {visualizationType === "sparkline" && (
          <div className="h-6 w-full flex items-end gap-1">
            {dataPoints.map((dp, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300"
                style={{
                  height: `${(dp / Math.max(...dataPoints)) * 100}%`,
                  backgroundColor: i === dataPoints.length - 1 ? (indicatorColor === "teal" ? "#00C9B7" : "#7965FF") : "rgba(255, 255, 255, 0.12)"
                }}
              />
            ))}
          </div>
        )}

        {visualizationType === "matrix" && (
          <div className="grid grid-cols-8 gap-1 py-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < (displayValue % 16) + 1
                    ? selectedColor.bg
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
        )}

        {visualizationType === "bars" && (
          <div className="space-y-1">
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${selectedColor.bg} transition-all duration-700`}
                style={{ width: `${Math.min(displayValue, 100)}%` }}
              />
            </div>
          </div>
        )}

        {visualizationType === "ring" && (
          <div className="flex items-center justify-between text-[10px] font-mono text-[#9295A1]">
            <span>Deterministic Verified</span>
            <span className={selectedColor.text}>100% Provenance</span>
          </div>
        )}

        <p className="text-[11px] text-[#9295A1] line-clamp-1 leading-normal pt-1">
          {description}
        </p>
      </div>
    </div>
  );
}
