'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Github, ChevronDown } from 'lucide-react';
import { SECTIONS } from '@/config/sections';
import { useScrollProgress } from '@/hooks/useScrollProgress';

// Dynamically load 3D Scene client-side to prevent SSR issues
const Scene = dynamic(() => import('@/components/Scene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-[#fbfbfe]" />
  ),
});

export default function LandingPage() {
  const {
    progress,
    lerpedProgress,
    activeSectionIndex,
    activeSection,
    prefersReducedMotion,
    isMobile,
    scrollToSection,
  } = useScrollProgress();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative min-h-screen text-slate-900 bg-[#fbfbfe] selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. Full-screen 3D Scene Background Canvas */}
      {mounted && (
        <Scene
          lerpedProgress={lerpedProgress}
          prefersReducedMotion={prefersReducedMotion}
          isMobile={isMobile}
        />
      )}

      {/* 2. Fixed Minimal Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-white/70 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="text-lg font-black tracking-tight text-slate-950 hover:opacity-80 transition-opacity"
          >
            CreatorPay<span className="text-[#635bff]">.AI</span>
          </Link>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-[#635bff] border border-indigo-100">
            PayPal Hackathon 2026
          </span>
        </div>

        <nav className="flex items-center space-x-3 text-sm font-medium">
          <a
            href="https://github.com/ius-sharma/CreatorPay-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>

          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5"
          >
            <span>Try sandbox demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* 3. Floating Scroll Sync HUD (Stage 1 Scaffold Verification) */}
      <aside
        aria-label="Scroll stage progress"
        className="fixed bottom-6 right-6 z-40 hidden md:flex flex-col items-end space-y-2"
      >
        <div className="px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg text-right">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Stage 1 Scaffold
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#635bff] animate-pulse" />
            <span>{activeSection.name}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-500">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Section Quick Jump Dots */}
        <div className="flex flex-col space-y-1.5 pr-2">
          {SECTIONS.map((sec, idx) => {
            const isActive = activeSectionIndex === idx;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(idx)}
                aria-label={`Jump to ${sec.name}`}
                className={`group flex items-center space-x-2 cursor-pointer transition-all ${
                  isActive ? 'scale-110' : 'opacity-40 hover:opacity-100'
                }`}
              >
                <span
                  className={`text-[10px] font-medium transition-opacity ${
                    isActive ? 'opacity-100 text-slate-900 font-bold' : 'opacity-0 group-hover:opacity-100 text-slate-500'
                  }`}
                >
                  {sec.name}
                </span>
                <span
                  className={`w-2 h-2 rounded-full transition-all ${
                    isActive
                      ? 'bg-[#635bff] ring-2 ring-indigo-200 scale-125'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {/* 4. HTML Text Sections Overlay (Strict Copy Rules Applied) */}
      <div className="relative z-10">
        {/* Section 1: Hero */}
        <section
          id="hero"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto pt-24 pb-16"
        >
          <div className="max-w-xl">
            <span className="inline-block text-xs font-semibold text-[#635bff] mb-3">
              {SECTIONS[0].badge}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] mb-4">
              {SECTIONS[0].headline}
            </h1>
            <p className="text-lg text-slate-600 mb-8 font-normal leading-relaxed">
              {SECTIONS[0].supporting}
            </p>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
              >
                <span>Try the sandbox demo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => scrollToSection(1)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
              >
                <span>Scroll to explore path</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Deal */}
        <section
          id="deal"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto py-24"
        >
          <div className="max-w-md ml-auto">
            <span className="inline-block text-xs font-semibold text-[#635bff] mb-3">
              {SECTIONS[1].badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
              {SECTIONS[1].headline}
            </h2>
            <p className="text-base text-slate-600 font-normal leading-relaxed">
              {SECTIONS[1].supporting}
            </p>
          </div>
        </section>

        {/* Section 3: Invoice */}
        <section
          id="invoice"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto py-24"
        >
          <div className="max-w-md">
            <span className="inline-block text-xs font-semibold text-[#003087] mb-3">
              {SECTIONS[2].badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
              {SECTIONS[2].headline}
            </h2>
            <p className="text-base text-slate-600 font-normal leading-relaxed">
              {SECTIONS[2].supporting}
            </p>
          </div>
        </section>

        {/* Section 4: Payment */}
        <section
          id="payment"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto py-24"
        >
          <div className="max-w-md ml-auto">
            <span className="inline-block text-xs font-semibold text-[#00b8d9] mb-3">
              {SECTIONS[3].badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
              {SECTIONS[3].headline}
            </h2>
            <p className="text-base text-slate-600 font-normal leading-relaxed">
              {SECTIONS[3].supporting}
            </p>
          </div>
        </section>

        {/* Section 5: Verify */}
        <section
          id="verify"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto py-24"
        >
          <div className="max-w-md">
            <span className="inline-block text-xs font-semibold text-[#ff7a59] mb-3">
              {SECTIONS[4].badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
              {SECTIONS[4].headline}
            </h2>
            <p className="text-base text-slate-600 font-normal leading-relaxed">
              {SECTIONS[4].supporting}
            </p>
          </div>
        </section>

        {/* Section 6: Split payout */}
        <section
          id="split"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-12 max-w-4xl mx-auto py-24 text-center"
        >
          <div className="max-w-xl mx-auto">
            <span className="inline-block text-xs font-semibold text-[#635bff] mb-3">
              {SECTIONS[5].badge}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-[1.1] mb-3">
              {SECTIONS[5].headline}
            </h2>
            <p className="text-base text-slate-600 font-normal leading-relaxed">
              {SECTIONS[5].supporting}
            </p>
          </div>
        </section>

        {/* Section 7: CTA and footer */}
        <section
          id="cta"
          className="min-h-screen flex flex-col justify-center items-center px-6 text-center max-w-3xl mx-auto py-24"
        >
          <span className="inline-block text-xs font-semibold text-[#635bff] mb-3">
            {SECTIONS[6].badge}
          </span>
          <h2 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.08] mb-4">
            {SECTIONS[6].headline}
          </h2>
          <p className="text-lg text-slate-600 max-w-lg mb-8 font-normal leading-relaxed">
            {SECTIONS[6].supporting}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-16">
            <Link
              href="https://github.com/ius-sharma/CreatorPay-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <span>Try the sandbox demo</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/ius-sharma/CreatorPay-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex items-center space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>

          <footer className="w-full pt-8 border-t border-slate-200 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 CreatorPay AI · PayPal AI Hackathon Track 2 (Merchant Solutions)</p>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="hover:text-slate-600">
                Dashboard App
              </Link>
              <a
                href="https://github.com/ius-sharma/CreatorPay-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-600"
              >
                Source Repository
              </a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
