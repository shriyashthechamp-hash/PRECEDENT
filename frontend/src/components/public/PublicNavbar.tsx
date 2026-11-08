"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUpRight, Menu, X, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#08090D]/90 backdrop-blur-md border-b border-white/[0.08] py-3.5 shadow-2xl shadow-black/60"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded border border-white/10 bg-[#111319] flex items-center justify-center font-bold text-white tracking-widest text-sm group-hover:border-aurora-violet/50 transition">
            P
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-[0.2em] text-[#F5F5F7] uppercase">
                PRECEDENT
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-aurora-teal animate-pulse" />
            </div>
            <span className="text-[10px] text-[#9295A1] tracking-wider uppercase font-mono">
              Institutional Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide">
          <Link
            href="#platform"
            className="text-[#9295A1] hover:text-[#F5F5F7] transition"
          >
            Platform
          </Link>
          <Link
            href="#loop"
            className="text-[#9295A1] hover:text-[#F5F5F7] transition"
          >
            Intelligence Loop
          </Link>
          <Link
            href="#metrics"
            className="text-[#9295A1] hover:text-[#F5F5F7] transition"
          >
            DotTiles
          </Link>
          <Link
            href="#how-it-works"
            className="text-[#9295A1] hover:text-[#F5F5F7] transition"
          >
            How It Works
          </Link>
          <Link
            href="/about"
            className="text-[#9295A1] hover:text-[#F5F5F7] transition"
          >
            About
          </Link>
        </nav>

        {/* Enter Platform CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/app"
            className="relative group inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#111319] hover:bg-[#181D26] border border-white/10 hover:border-aurora-violet/50 text-xs font-medium text-[#F5F5F7] transition shadow-sm overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-aurora-violet/10 to-aurora-teal/10 opacity-0 group-hover:opacity-100 transition duration-300" />
            <span className="relative z-10 font-semibold tracking-wide">Enter Platform</span>
            <ArrowUpRight className="relative z-10 w-3.5 h-3.5 text-aurora-teal transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 rounded-md text-[#9295A1] hover:text-white hover:bg-white/5 transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0F15] border-b border-white/10 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 text-sm">
            <Link
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#9295A1] hover:text-white py-1"
            >
              Platform
            </Link>
            <Link
              href="#loop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#9295A1] hover:text-white py-1"
            >
              Intelligence Loop
            </Link>
            <Link
              href="#metrics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#9295A1] hover:text-white py-1"
            >
              DotTiles
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#9295A1] hover:text-white py-1"
            >
              How It Works
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#9295A1] hover:text-white py-1"
            >
              About PRECEDENT
            </Link>
          </div>
          <div className="pt-3 border-t border-white/10">
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md bg-aurora-violet/20 border border-aurora-violet/40 text-xs font-semibold text-white"
            >
              <span>Enter PRECEDENT</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-aurora-teal" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
