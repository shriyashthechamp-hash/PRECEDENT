"use client";

import { useEffect, useRef } from "react";

interface WaveAnimationProps {
  className?: string;
  opacity?: number;
}

export function WaveAnimation({ className = "", opacity = 0.45 }: WaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;

    // PRECEDENT Curated Aurora Palette: Muted Teal, Electric Violet, Deep Blue-Grey, Soft Indigo
    const palette = [
      "rgba(0, 201, 183, 0.28)",   // Muted teal
      "rgba(10, 147, 150, 0.22)",  // Deep teal
      "rgba(121, 101, 255, 0.30)", // Electric violet
      "rgba(99, 102, 241, 0.22)",  // Soft indigo
      "rgba(148, 210, 189, 0.18)", // Desaturated cyan
      "rgba(121, 101, 255, 0.15)", // Muted violet
      "rgba(0, 201, 183, 0.18)",   // Atmospheric teal
      "rgba(30, 41, 59, 0.25)",    // Blue-grey
    ];

    // Responsive sizing matching parent element or window
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Draw a single graceful static wave frame and exit
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      ctx.fillStyle = "rgba(8, 9, 13, 0.9)";
      ctx.fillRect(0, 0, w, h);
      
      const barWidth = 80;
      const count = Math.ceil(w / barWidth) + 2;
      for (let i = 0; i < count; i++) {
        const barHeight = (Math.sin(i * 0.4) * 0.25 + 0.5) * h * 0.6;
        ctx.fillStyle = palette[i % palette.length];
        ctx.fillRect(i * barWidth, h / 2 - barHeight / 2, barWidth - 4, barHeight);
      }
      return () => {
        window.removeEventListener("resize", resizeCanvas);
      };
    }

    const startTime = performance.now();

    // Single controlled animation loop
    const render = (now: number) => {
      if (!isRunning) return;

      const elapsed = now - startTime;
      const parent = canvas.parentElement;
      const width = parent ? parent.clientWidth : window.innerWidth;
      const height = parent ? parent.clientHeight : window.innerHeight;

      // Soft fading trailing effect blending with PRECEDENT background (#08090D)
      ctx.fillStyle = "rgba(8, 9, 13, 0.05)";
      ctx.fillRect(0, 0, width, height);

      const barWidth = Math.max(60, Math.floor(width / 24));
      const barCount = Math.ceil(width / barWidth) + 2;

      for (let i = 0; i < barCount; i++) {
        // Multi-frequency wave calculation for natural fluid motion
        const wave1 = Math.sin(i * 0.35 + elapsed * 0.0012) * (height * 0.28);
        const wave2 = Math.cos(i * 0.22 - elapsed * 0.0008) * (height * 0.14);
        const waveHeight = Math.abs(wave1 + wave2) + 12;

        ctx.fillStyle = palette[(i + Math.floor(elapsed * 0.0004)) % palette.length];
        const x = i * barWidth;
        const y = height / 2 - waveHeight / 2;
        
        ctx.fillRect(x, y, barWidth - 2, waveHeight);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{
          margin: 0,
          padding: 0,
          display: "block",
        }}
      />
    </div>
  );
}
