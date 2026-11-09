"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";

// ============================================================================
// PART 4: TYPES & INTERFACES
// ============================================================================

export type DotTileIconName =
  | "memory"
  | "proposal"
  | "shield"
  | "decision"
  | "conflict"
  | "learning"
  | "pulse"
  | "zap"
  | "activity"
  | "database"
  | "scale"
  | "sparkles";

export type DotTileVisual = "slider" | "steps" | "dots" | "blocks" | "rise";

export interface DotTileData {
  id?: string;
  title: string;
  value: number | string;
  unit?: string;
  prevValue?: number | string;
  icon?: DotTileIconName;
  visual?: DotTileVisual;
  progress?: number; // 0..100
  status?: string;
  change?: string;
  color?: "violet" | "teal" | "emerald" | "conflict";
  description?: string;
  dataPoints?: number[];
}

export interface DotTileProps {
  data: DotTileData;
  className?: string;
  accentColor?: string;
}

export interface DotTilesProps {
  tiles?: DotTileData[];
  className?: string;
  columns?: number;
}

// ============================================================================
// 5x7 DOT-MATRIX GLYPH DEFINITIONS
// Represents characters on a 5x7 grid (1 = lit dot, 0 = unlit)
// ============================================================================

const GLYPHS: Record<string, number[]> = {
  "0": [
    0b01110,
    0b10001,
    0b10011,
    0b10101,
    0b11001,
    0b10001,
    0b01110
  ],
  "1": [
    0b00100,
    0b01100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b01110
  ],
  "2": [
    0b01110,
    0b10001,
    0b00001,
    0b00110,
    0b01000,
    0b10000,
    0b11111
  ],
  "3": [
    0b11110,
    0b00001,
    0b00001,
    0b01110,
    0b00001,
    0b00001,
    0b11110
  ],
  "4": [
    0b00010,
    0b00110,
    0b01010,
    0b10010,
    0b11111,
    0b00010,
    0b00010
  ],
  "5": [
    0b11111,
    0b10000,
    0b11110,
    0b00001,
    0b00001,
    0b10001,
    0b01110
  ],
  "6": [
    0b00110,
    0b01000,
    0b10000,
    0b11110,
    0b10001,
    0b10001,
    0b01110
  ],
  "7": [
    0b11111,
    0b00001,
    0b00010,
    0b00100,
    0b01000,
    0b01000,
    0b01000
  ],
  "8": [
    0b01110,
    0b10001,
    0b10001,
    0b01110,
    0b10001,
    0b10001,
    0b01110
  ],
  "9": [
    0b01110,
    0b10001,
    0b10001,
    0b01111,
    0b00001,
    0b00010,
    0b01100
  ],
  "%": [
    0b11001,
    0b11010,
    0b00100,
    0b01000,
    0b01011,
    0b10011,
    0b00000
  ],
  "+": [
    0b00000,
    0b00100,
    0b00100,
    0b11111,
    0b00100,
    0b00100,
    0b00000
  ],
  "-": [
    0b00000,
    0b00000,
    0b00000,
    0b11111,
    0b00000,
    0b00000,
    0b00000
  ],
  ".": [
    0b00000,
    0b00000,
    0b00000,
    0b00000,
    0b00000,
    0b01100,
    0b01100
  ],
  "/": [
    0b00001,
    0b00010,
    0b00100,
    0b01000,
    0b10000,
    0b00000,
    0b00000
  ],
  ":": [
    0b00000,
    0b01100,
    0b01100,
    0b00000,
    0b01100,
    0b01100,
    0b00000
  ],
  "k": [
    0b10001,
    0b10010,
    0b10100,
    0b11000,
    0b10100,
    0b10010,
    0b10001
  ],
  "M": [
    0b10001,
    0b11011,
    0b10101,
    0b10001,
    0b10001,
    0b10001,
    0b10001
  ],
  " ": [
    0b00000,
    0b00000,
    0b00000,
    0b00000,
    0b00000,
    0b00000,
    0b00000
  ]
};

// ============================================================================
// HELPER FUNCTIONS: LAYOUT, PARSE, FORMAT, EASING
// ============================================================================

export function layoutText(text: string) {
  const chars = text.split("");
  const glyphWidth = 5;
  const glyphHeight = 7;
  const spacing = 1;
  const dots: { x: number; y: number }[] = [];

  let currentX = 0;
  for (const char of chars) {
    const glyph = GLYPHS[char] || GLYPHS[" "];
    for (let row = 0; row < glyphHeight; row++) {
      const bitRow = glyph[row];
      for (let col = 0; col < glyphWidth; col++) {
        if ((bitRow >> (glyphWidth - 1 - col)) & 1) {
          dots.push({ x: currentX + col, y: row });
        }
      }
    }
    currentX += glyphWidth + spacing;
  }

  const totalCols = Math.max(currentX - spacing, 1);
  return { dots, cols: totalCols, rows: glyphHeight };
}

export function parseValue(val: number | string): { num: number; prefix: string; suffix: string } {
  if (typeof val === "number") {
    return { num: val, prefix: "", suffix: "" };
  }
  const match = String(val).match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);
  if (match) {
    return {
      prefix: match[1] || "",
      num: parseFloat(match[2]) || 0,
      suffix: match[3] || ""
    };
  }
  return { num: 0, prefix: "", suffix: String(val) };
}

export function formatValue(num: number, hasDecimals: boolean = false): string {
  if (hasDecimals) {
    return num.toFixed(1);
  }
  return Math.round(num).toLocaleString();
}

export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ============================================================================
// SVG ICONS
// ============================================================================

export function DotTileIcon({ name, className = "w-4 h-4" }: { name?: DotTileIconName; className?: string }) {
  switch (name) {
    case "memory":
    case "database":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5V19A9 3 0 0 0 21 19V5" />
          <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
      );
    case "proposal":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case "shield":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "decision":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "conflict":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "learning":
    case "sparkles":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

// ============================================================================
// VISUALISATIONS: SLIDER, STEPS, DOTS, BLOCKS, RISE
// ============================================================================

export function DotVisualisation({
  type,
  progress = 50,
  colorClass = "bg-aurora-teal",
  dataPoints = [15, 25, 20, 35, 40, 32, 48, 55]
}: {
  type: DotTileVisual;
  progress?: number;
  colorClass?: string;
  dataPoints?: number[];
}) {
  switch (type) {
    case "slider":
      return (
        <div className="w-full space-y-1.5" aria-hidden="true">
          <div className="flex justify-between text-[9px] font-mono text-[#9295A1]">
            <span>MIN</span>
            <span>CAPACITY {Math.round(progress)}%</span>
            <span>MAX</span>
          </div>
          <div className="flex gap-1 h-2 w-full">
            {Array.from({ length: 20 }).map((_, i) => {
              const active = i / 20 <= progress / 100;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 ${
                    active ? colorClass : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>
        </div>
      );

    case "steps":
      return (
        <div className="w-full flex items-center justify-between gap-1.5" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => {
            const active = i < Math.ceil((progress / 100) * 6);
            return (
              <div
                key={i}
                className={`flex-1 h-3 rounded-sm flex items-center justify-center border transition-all ${
                  active
                    ? `${colorClass} border-transparent`
                    : "bg-[#111319] border-white/10"
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-white/40" />
              </div>
            );
          })}
        </div>
      );

    case "dots":
      return (
        <div className="grid grid-cols-12 gap-1 py-1" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => {
            const active = i < Math.ceil((progress / 100) * 24);
            return (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  active ? colorClass : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
      );

    case "blocks":
      return (
        <div className="flex items-end gap-1.5 h-6 w-full" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => {
            const barHeight = ((i + 1) / 10) * 100;
            const active = (i + 1) / 10 <= progress / 100;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all duration-300 ${
                  active ? colorClass : "bg-white/10"
                }`}
                style={{ height: `${barHeight}%` }}
              />
            );
          })}
        </div>
      );

    case "rise":
    default:
      const max = Math.max(...dataPoints, 1);
      return (
        <div className="flex items-end gap-1.5 h-6 w-full" aria-hidden="true">
          {dataPoints.map((dp, i) => {
            const heightPercent = (dp / max) * 100;
            const isLatest = i === dataPoints.length - 1;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-all duration-300 ${
                  isLatest ? colorClass : "bg-white/15 hover:bg-white/30"
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            );
          })}
        </div>
      );
  }
}

// ============================================================================
// DYNAMIC DOT-MATRIX CANVAS DISPLAY
// ============================================================================

export function DotMatrixText({ text, activeColor = "#7965FF" }: { text: string; activeColor?: string }) {
  const { dots, cols, rows } = useMemo(() => layoutText(text), [text]);
  const dotSize = 3;
  const dotGap = 2;
  const width = cols * (dotSize + dotGap);
  const height = rows * (dotSize + dotGap);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
      aria-label={text}
      role="img"
    >
      {/* Background unlit dots */}
      {Array.from({ length: cols }).map((_, col) =>
        Array.from({ length: rows }).map((__, row) => (
          <circle
            key={`bg-${col}-${row}`}
            cx={col * (dotSize + dotGap) + dotSize / 2}
            cy={row * (dotSize + dotGap) + dotSize / 2}
            r={dotSize / 2}
            fill="rgba(255, 255, 255, 0.06)"
          />
        ))
      )}

      {/* Lit dots */}
      {dots.map((d, i) => (
        <circle
          key={`lit-${i}`}
          cx={d.x * (dotSize + dotGap) + dotSize / 2}
          cy={d.y * (dotSize + dotGap) + dotSize / 2}
          r={dotSize / 2}
          fill={activeColor}
        />
      ))}
    </svg>
  );
}

// ============================================================================
// DOT TILE COMPONENT
// ============================================================================

export function DotTile({ data, className = "", accentColor }: DotTileProps) {
  const { title, value, unit, icon, visual = "rise", progress = 65, status, change, color = "violet", description, dataPoints } = data;
  const [currentVal, setCurrentVal] = useState<number>(0);
  const parsed = useMemo(() => parseValue(value), [value]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setCurrentVal(parsed.num);
      return;
    }

    let start: number | null = null;
    const duration = 1000;
    let frame: number;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(t);
      setCurrentVal(parsed.num * eased);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setCurrentVal(parsed.num);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [parsed.num]);

  const colorStyles = {
    violet: {
      accent: "#7965FF",
      textClass: "text-aurora-violet",
      bgClass: "bg-aurora-violet",
      pillClass: "bg-aurora-violet/10 text-aurora-violet border-aurora-violet/20",
      borderGlow: "hover:border-aurora-violet/40"
    },
    teal: {
      accent: "#00C9B7",
      textClass: "text-aurora-teal",
      bgClass: "bg-aurora-teal",
      pillClass: "bg-aurora-teal/10 text-aurora-teal border-aurora-teal/20",
      borderGlow: "hover:border-aurora-teal/40"
    },
    emerald: {
      accent: "#34D399",
      textClass: "text-emerald-400",
      bgClass: "bg-emerald-400",
      pillClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      borderGlow: "hover:border-emerald-500/40"
    },
    conflict: {
      accent: "#EF4444",
      textClass: "text-conflict",
      bgClass: "bg-conflict",
      pillClass: "bg-conflict-subtle text-conflict border-conflict/30",
      borderGlow: "hover:border-conflict"
    }
  }[color];

  const formattedStr = `${parsed.prefix}${formatValue(currentVal)}${parsed.suffix}${unit || ""}`;

  return (
    <div
      className={`relative p-5 rounded-xl bg-[#0D0F15]/95 backdrop-blur-md border border-white/[0.08] ${colorStyles.borderGlow} transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl group ${className}`}
    >
      {/* Background Subtle Dot-Grid Texture */}
      <div className="absolute inset-0 bg-dot-grid opacity-15 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`p-1 rounded border ${colorStyles.pillClass}`}>
              <DotTileIcon name={icon} className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-[#9295A1]">
              {status || "Telemetry"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9295A1]">
            <span className={`w-1.5 h-1.5 rounded-full ${colorStyles.bgClass} animate-pulse`} />
            <span className="hidden sm:inline">PRECEDENT</span>
          </div>
        </div>

        <h3 className="text-xs font-medium text-white tracking-wide pt-1">
          {title}
        </h3>
      </div>

      {/* Center: Dot-Matrix Value */}
      <div className="relative z-10 py-4 my-auto">
        <div className="flex items-center gap-2">
          <DotMatrixText text={formattedStr} activeColor={accentColor || colorStyles.accent} />
          {unit && <span className={`text-xs font-mono font-bold ${colorStyles.textClass}`}>{unit}</span>}
        </div>

        {change && (
          <div className="text-[10px] font-mono text-aurora-teal mt-1 flex items-center gap-1">
            <span>↑</span>
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Footer Visualisation */}
      <div className="relative z-10 pt-3 border-t border-white/[0.06] space-y-2">
        <DotVisualisation
          type={visual}
          progress={progress}
          colorClass={colorStyles.bgClass}
          dataPoints={dataPoints}
        />

        {description && (
          <p className="text-[11px] text-[#9295A1] line-clamp-1 leading-normal pt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// DOT TILES GRID WRAPPER
// ============================================================================

export function DotTiles({ tiles = DOT_TILES_SAMPLE, className = "", columns = 3 }: DotTilesProps) {
  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridColsClass} gap-5 ${className}`}>
      {tiles.map((tile, i) => (
        <DotTile key={tile.id || i} data={tile} />
      ))}
    </div>
  );
}

// ============================================================================
// SAMPLE DATA: ADAPTED TO PRECEDENT DOMAIN METRICS
// (Replaces generic heart rate/sleep with authentic proposal intelligence)
// ============================================================================

export const DOT_TILES_SAMPLE: DotTileData[] = [
  {
    id: "tile-memory",
    title: "Institutional Memory Bank",
    value: 125,
    unit: "EXP",
    icon: "memory",
    visual: "dots",
    progress: 88,
    status: "Persistent Storage",
    change: "+12 verified entries",
    color: "violet",
    description: "Verified domain lead review decisions stored with full context & rationale."
  },
  {
    id: "tile-proposal",
    title: "Proposals & RFPs Analyzed",
    value: 18,
    unit: "RFPS",
    icon: "proposal",
    visual: "slider",
    progress: 72,
    status: "Active Workspaces",
    change: "100% section extraction",
    color: "teal",
    description: "Multi-section RFP specifications parsed into structured proposal workspaces."
  },
  {
    id: "tile-precedent",
    title: "Precedents Recalled into Drafts",
    value: 84,
    unit: "RECALLS",
    icon: "sparkles",
    visual: "rise",
    progress: 94,
    status: "Semantic Grounding",
    change: "96.4% contextual relevance",
    color: "violet",
    description: "Historical revisions injected into active prompt context across cross-bid generation.",
    dataPoints: [14, 28, 42, 53, 67, 74, 80, 84]
  },
  {
    id: "tile-decision",
    title: "Approved Human Corrections",
    value: 42,
    unit: "DECISIONS",
    icon: "decision",
    visual: "steps",
    progress: 84,
    status: "Domain Lead Truth",
    change: "Human-in-the-loop validated",
    color: "emerald",
    description: "Domain lead amendments transformed into durable organizational policy."
  },
  {
    id: "tile-contradiction",
    title: "Contradictions Defended",
    value: 16,
    unit: "GATED",
    icon: "shield",
    visual: "blocks",
    progress: 100,
    status: "Hard Defense Active",
    change: "Zero client concessions leaked",
    color: "conflict",
    description: "Inconsistent pricing, SLA, and compliance claims caught before bid submission."
  },
  {
    id: "tile-efficiency",
    title: "Reviewer Edit Reduction Rate",
    value: 46,
    unit: "%",
    icon: "learning",
    visual: "rise",
    progress: 46,
    status: "Empirical A/B Metric",
    change: "Measured character delta",
    color: "teal",
    description: "Reduction in characters edited by domain reviewers on memory-grounded proposals.",
    dataPoints: [18, 24, 31, 37, 41, 44, 45, 46]
  }
];
