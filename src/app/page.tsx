'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  CreditCard, 
  Clock, 
  FileText, 
  ExternalLink,
  Layers,
  Send,
  Video,
  Play,
  Check,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

interface SampleDeal {
  id: string;
  brand: string;
  amount: number;
  dealType: string;
  advanceMilestone: number;
  completionMilestone: number;
  editorCut: number;
  designerCut: number;
  creatorCut: number;
  deliverable: string;
  verifiedTimestamp: string;
}

const SAMPLE_DEALS: SampleDeal[] = [
  {
    id: 'nordvpn',
    brand: 'NordVPN Security',
    amount: 5000,
    dealType: '60s Dedicated YouTube Segment',
    advanceMilestone: 2500,
    completionMilestone: 2500,
    editorCut: 750, // 15%
    designerCut: 250, // 5%
    creatorCut: 4000, // 80%
    deliverable: 'YouTube Segment verified at 02:45 • Tag #nordvpn & custom discount link verified',
    verifiedTimestamp: 'Today, 2:14 PM',
  },
  {
    id: 'shopify',
    brand: 'Shopify Global',
    amount: 12000,
    dealType: '3-Month Dedicated Retainer',
    advanceMilestone: 4000,
    completionMilestone: 8000,
    editorCut: 1800, // 15%
    designerCut: 600, // 5%
    creatorCut: 9600, // 80%
    deliverable: 'Podcast Audio & Video Feed #184 • Verified live sponsor mention & UTM parameters',
    verifiedTimestamp: 'Yesterday, 11:30 AM',
  },
  {
    id: 'gymshark',
    brand: 'Gymshark Apparel',
    amount: 3500,
    dealType: 'Instagram Reel + Story Series',
    advanceMilestone: 1400,
    completionMilestone: 2100,
    editorCut: 525, // 15%
    designerCut: 175, // 5%
    creatorCut: 2800, // 80%
    deliverable: 'Instagram Reel Audio ID Scanned • Tag @gymshark & promo code "CREATOR20" active',
    verifiedTimestamp: '3 days ago',
  },
];

export default function LandingPage() {
  const [selectedDeal, setSelectedDeal] = useState<SampleDeal>(SAMPLE_DEALS[0]);
  const [calcDealSize, setCalcDealSize] = useState<number>(10000);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(4); // default all completed

  const runWorkflowSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 700);
    setTimeout(() => setSimStep(3), 1400);
    setTimeout(() => {
      setSimStep(4);
      setIsSimulating(false);
    }, 2200);
  };

  // Initialize Theme from localStorage or document class
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('creatorpay_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('creatorpay_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('creatorpay_theme', 'light');
    }
  };

  // Interactive calculator derivations
  const calcEditor = Math.round(calcDealSize * 0.15);
  const calcDesigner = Math.round(calcDealSize * 0.05);
  const calcCreator = calcDealSize - calcEditor - calcDesigner;

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#07090e] text-slate-900 dark:text-slate-100 font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden relative transition-colors duration-500 ease-in-out">
      
      {/* 1. TOP FLOATING PILL NAVBAR (FIXED ON SCROLL) */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <header className="max-w-6xl mx-auto rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 shadow-md dark:shadow-2xl px-5 sm:px-7 py-3 flex items-center justify-between transition-all duration-500 pointer-events-auto">
          {/* Brand Typography */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-950 dark:text-white transition-colors duration-300">
              CreatorPay<span className="text-brand-600 dark:text-brand-400">.AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#how-it-works" className="hover:text-slate-950 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#interactive-demo" className="hover:text-slate-950 dark:hover:text-white transition-colors">Live Deal Flow</a>
            <a href="#comparison" className="hover:text-slate-950 dark:hover:text-white transition-colors">The Problem</a>
            <a href="#calculator" className="hover:text-slate-950 dark:hover:text-white transition-colors">Split Calculator</a>
            <a href="#security" className="hover:text-slate-950 dark:hover:text-white transition-colors">PayPal Rails</a>
          </nav>

          {/* Right Controls: Theme Switch & CTA */}
          <div className="flex items-center space-x-3">
            {/* Sleek Dark Mode Switcher */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="relative flex items-center p-1.5 w-14 h-8 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 transition-colors duration-500 cursor-pointer focus:outline-hidden"
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-200/60 dark:border-slate-700 flex items-center justify-center transform transition-transform duration-500 ease-out ${
                    isDark ? 'translate-x-6' : 'translate-x-0'
                  }`}
                >
                  {isDark ? (
                    <Moon className="w-3 h-3 text-brand-300 transition-opacity duration-300" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500 transition-opacity duration-300" />
                  )}
                </div>
              </button>
            )}

            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-2 py-1.5 hidden sm:inline transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </header>
      </div>

      {/* 2. HERO SECTION */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        
        {/* Background Concentric Orbital Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-slate-200/50 dark:border-slate-800/50 absolute transition-colors duration-500" />
          <div className="w-[750px] h-[750px] rounded-full border border-slate-200/40 dark:border-slate-800/40 absolute transition-colors duration-500" />
          <div className="w-[1050px] h-[1050px] rounded-full border border-slate-200/25 dark:border-slate-800/25 absolute transition-colors duration-500" />
          <div className="w-[1350px] h-[1350px] rounded-full border border-slate-100 dark:border-slate-900 absolute transition-colors duration-500" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* USER REQUESTED BADGE */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 mb-6 shadow-2xs transition-colors duration-500">
            <span className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-slate-100">The Financial Agent for Digital Creators & Agencies</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.08] mb-5 transition-colors duration-500">
            Never chase a brand <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-950 via-brand-700 to-slate-900 dark:from-white dark:via-brand-400 dark:to-slate-300 bg-clip-text text-transparent">
              payment again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 font-normal leading-relaxed transition-colors duration-500">
            Turn raw sponsorship agreements into verified PayPal milestone invoices, automated video deliverable checks, and instant team splits — on pure autopilot.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-slate-950 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white text-sm font-bold shadow-md hover:shadow-xl dark:shadow-brand-600/30 transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>Launch Studio Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#interactive-demo"
              className="px-7 py-3.5 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-800 transition-all shadow-2xs flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 fill-slate-500 dark:fill-slate-400" />
              <span>See Live Deal Flow</span>
            </a>
          </div>

          {/* 3. HERO CENTERPIECE: OPEN VISUAL NODE WORKFLOW (SEPARATE FLOATING NODES CONNECTED BY DOTTED THREADS) */}
          <div id="interactive-demo" className="relative max-w-4xl mx-auto text-left pt-6 pb-2">
            
            {/* Top Toolbar: Deal Switcher & Simulation Controller */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 px-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-mono">
                  Autonomous Agent Workflow Flow
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedDeal.brand} (${(selectedDeal.amount / 1000).toFixed(1)}k)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Deal Switchers */}
                <div className="flex items-center space-x-1 bg-white/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  {SAMPLE_DEALS.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedDeal.id === deal.id
                          ? 'bg-slate-950 dark:bg-brand-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      {deal.brand.split(' ')[0]} (${(deal.amount / 1000).toFixed(1)}k)
                    </button>
                  ))}
                </div>

                {/* Simulation Trigger */}
                <button
                  onClick={runWorkflowSimulation}
                  disabled={isSimulating}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-75"
                >
                  {isSimulating ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing Flow...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Test Run Workflow</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* SEPARATE FLOATING NODE 1: AGREEMENT INGESTION */}
            <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-md relative ${
              simStep >= 1 ? 'border-brand-500 dark:border-brand-500 ring-2 ring-brand-500/20 shadow-brand-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
              {/* Bottom Connector Socket Pin */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500 flex items-center justify-center shadow-xs z-20">
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 font-mono">
                      Trigger · Agreement Ingestion
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Sponsorship_Agreement_{selectedDeal.brand.split(' ')[0]}.pdf
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Terms Extracted in 0.8s ✓
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 text-[10px]">TOTAL VALUE:</span>
                  <p className="font-bold text-slate-900 dark:text-white">${selectedDeal.amount.toLocaleString()} USD</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">MILESTONE 1 ADVANCE:</span>
                  <p className="font-bold text-blue-600 dark:text-sky-400">50% (${selectedDeal.advanceMilestone.toLocaleString()})</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">DELIVERABLE:</span>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{selectedDeal.dealType}</p>
                </div>
              </div>
            </div>

            {/* DOTTED THREAD CONNECTOR 1 (VERTICAL DASHED LINE) */}
            <div className="flex flex-col items-center justify-center my-0 py-1">
              <div className="w-0.5 h-5 border-l-2 border-dashed border-slate-400 dark:border-slate-600" />
              <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-all duration-300 ${
                simStep >= 2 ? 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/80 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
              }`} />
              <div className="w-0.5 h-5 border-l-2 border-dashed border-slate-400 dark:border-slate-600" />
            </div>

            {/* SEPARATE FLOATING NODE 2: PAYPAL MILESTONE ESCROW */}
            <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-md relative ${
              simStep >= 2 ? 'border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
              {/* Top Socket */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center shadow-xs z-20">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              {/* Bottom Socket */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center shadow-xs z-20">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-[#003087] dark:text-sky-400 flex items-center justify-center font-black text-sm border border-blue-200 dark:border-blue-800">
                    P
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#003087] dark:text-sky-300 font-mono">
                      Action · PayPal Milestone Invoicing v2
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Invoice #INV-883901 Generated & Dispatched
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Webhook: INVOICING.INVOICE.PAID ✓
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Milestone 1 Advance Cleared:</span>
                  <p className="font-bold text-[#003087] dark:text-sky-300 font-mono text-base">
                    ${selectedDeal.advanceMilestone.toLocaleString()}.00 USD
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Production Unlocked:</span> Advance secured in Creator PayPal balance before recording.
                </div>
              </div>
            </div>

            {/* DOTTED THREAD CONNECTOR 2 (VERTICAL DASHED LINE) */}
            <div className="flex flex-col items-center justify-center my-0 py-1">
              <div className="w-0.5 h-5 border-l-2 border-dashed border-slate-400 dark:border-slate-600" />
              <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-all duration-300 ${
                simStep >= 3 ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/80 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
              }`} />
              <div className="w-0.5 h-5 border-l-2 border-dashed border-slate-400 dark:border-slate-600" />
            </div>

            {/* SEPARATE FLOATING NODE 3: MULTIMODAL DELIVERABLE VERIFIER */}
            <div className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-md relative ${
              simStep >= 3 ? 'border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-800'
            }`}>
              {/* Top Socket */}
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-xs z-20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              {/* Bottom Socket */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-xs z-20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-mono">
                      Condition · Multimodal Deliverable Verifier
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Automated Video Proof & FTC Compliance Scan
                    </h4>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  99.4% Match Confirmed ✓
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mb-3">
                {selectedDeal.deliverable}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] font-mono bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 text-[10px]">TIMESTAMP:</span>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">02:45 Verified ✓</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">PROMO LINK:</span>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold">Active in Bio ✓</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">TRIGGER:</span>
                  <p className="text-brand-600 dark:text-brand-400 font-bold">Release Splits →</p>
                </div>
              </div>
            </div>

            {/* BRANCHING DOTTED THREAD TREE (SVG CONNECTOR WIRES SPREADING TO COLLABORATORS) */}
            <div className="relative py-2 my-1">
              {/* Desktop SVG Branching Lines */}
              <div className="hidden sm:block">
                <svg className="w-full h-12 overflow-visible" viewBox="0 0 800 48" fill="none">
                  {/* Center stem coming down from Node 3 */}
                  <line x1="400" y1="0" x2="400" y2="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400 dark:text-slate-600" />
                  {/* Central Node Pin */}
                  <circle cx="400" cy="20" r="4" className={`fill-brand-500 transition-colors ${simStep >= 4 ? 'animate-pulse' : ''}`} />
                  {/* Horizontal Crossbar Bus */}
                  <line x1="100" y1="20" x2="700" y2="20" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400 dark:text-slate-600" />
                  {/* Drop lines to 4 separate cards */}
                  <line x1="100" y1="20" x2="100" y2="48" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400 dark:text-slate-600" />
                  <line x1="300" y1="20" x2="300" y2="48" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400 dark:text-slate-600" />
                  <line x1="500" y1="20" x2="500" y2="48" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400 dark:text-slate-600" />
                  <line x1="700" y1="20" x2="700" y2="48" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="text-slate-400 dark:text-slate-600" />
                </svg>
              </div>

              {/* Mobile Single Dotted Drop */}
              <div className="sm:hidden flex flex-col items-center justify-center">
                <div className="w-0.5 h-6 border-l-2 border-dashed border-slate-400 dark:border-slate-600" />
                <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                <div className="w-0.5 h-6 border-l-2 border-dashed border-slate-400 dark:border-slate-600" />
              </div>
            </div>

            {/* SEPARATE FLOATING COLLABORATOR BRANCH NODES (THE ROSTER HUB) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Connected Collaborator Splits · Auto-Settled via PayPal Payouts
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Connect any role & set custom %
                </span>
              </div>

              {/* 4 INDEPENDENT COLLABORATOR CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* Collaborator Card 1: Video Editor */}
                <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-md relative group hover:border-emerald-300 ${
                  simStep >= 4 ? 'border-emerald-500/80 dark:border-emerald-500/80 ring-1 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}>
                  {/* Top Connector Pin */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Video Editor
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      15% Cut
                    </span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    +${selectedDeal.editorCut}.00 <span className="text-[10px] font-normal text-slate-400">USD</span>
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PayPal Payout ✓</span>
                  </div>
                </div>

                {/* Collaborator Card 2: Thumbnail Designer */}
                <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 shadow-md relative group hover:border-blue-300 ${
                  simStep >= 4 ? 'border-blue-500/80 dark:border-blue-500/80 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}>
                  {/* Top Connector Pin */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 flex items-center justify-center shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Thumbnail Designer
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                      5% Cut
                    </span>
                  </div>
                  <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                    +${selectedDeal.designerCut}.00 <span className="text-[10px] font-normal text-slate-400">USD</span>
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-blue-600 dark:text-sky-400 font-medium pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>PayPal Payout ✓</span>
                  </div>
                </div>

                {/* Collaborator Card 3: Creator / Studio Treasury */}
                <div className={`p-4 rounded-3xl bg-slate-950 dark:bg-black text-white border transition-all duration-300 shadow-lg relative ${
                  simStep >= 4 ? 'border-brand-500/80 ring-1 ring-brand-500/30' : 'border-slate-800'
                }`}>
                  {/* Top Connector Pin */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border-2 border-brand-500 flex items-center justify-center shadow-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Creator Net
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-300 bg-slate-800 px-1.5 py-0.5 rounded">
                      80% Retained
                    </span>
                  </div>
                  <p className="text-lg font-black text-white font-mono">
                    +${selectedDeal.creatorCut}.00 <span className="text-[10px] font-normal text-slate-400">USD</span>
                  </p>
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-400 font-medium pt-2 mt-2 border-t border-slate-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Direct Balance ✓</span>
                  </div>
                </div>

                {/* Collaborator Card 4: Add Any Collaborator (Dashed Floating Card) */}
                <div className="p-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 flex flex-col justify-between transition-colors shadow-xs relative">
                  {/* Top Connector Pin */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-dashed border-slate-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                        + Connect Role
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">Custom %</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Scriptwriter / Manager
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-2 border-t border-slate-100 dark:border-slate-800">
                    Auto-split via PayPal email
                  </span>
                </div>

              </div>

              {/* Bottom Assurance Strip */}
              <div className="mt-4 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 shadow-xs">
                <span className="flex items-center space-x-1.5 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Single PayPal Batch API call • 3 parallel transactions settled in 4.2s</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  IRS 1099 Expense Logged ✓
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. LOGO & PLATFORM STRIP */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
            Engineered on the PayPal Global Merchant Ecosystem • Built for Modern Creator Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 dark:text-slate-500 font-bold text-sm">
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-mono">PayPal Invoicing</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-mono">PayPal Payouts API</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">YouTube Studio</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Instagram Creators</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">TikTok Creator Fund</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Substack</span>
            <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Discord Agencies</span>
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM VS THE SOLUTION: THE CONTRAST SECTION */}
      <section id="comparison" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight transition-colors duration-500">
            The traditional sponsor deal is broken. <br />
            <span className="text-brand-600 dark:text-brand-400">CreatorPay fixes it.</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed transition-colors duration-500">
            Creators waste 15+ hours every month calculating team percentages, tracking email threads, and praying that brands wire payments on time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card: The Old Way */}
          <div className="p-8 sm:p-10 rounded-3xl bg-red-50/40 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 flex flex-col justify-between transition-colors duration-500">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-6 bg-red-100/60 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>The Manual Chaos (Before)</span>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold text-base leading-none">✕</span>
                  <span><strong>Net-60 / Net-90 Delay:</strong> Brands hold payments for 3 months after your video goes live.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold text-base leading-none">✕</span>
                  <span><strong>Awkward WhatsApp Chasing:</strong> "Hey checking in on invoice #24" sent 10 times a week.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold text-base leading-none">✕</span>
                  <span><strong>Manual Spreadsheet Math:</strong> Calculating 15% editor cut and 5% designer cut on your personal calculator.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold text-base leading-none">✕</span>
                  <span><strong>1099 Tax Nightmare:</strong> Scrambling at tax time to find contractor receipts and transfer screenshots.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-400 font-medium">
              Average loss: 12-18 hours / month & late contractor resentment.
            </div>
          </div>

          {/* Card: The CreatorPay Autonomous Standard */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 dark:bg-slate-900 text-white flex flex-col justify-between shadow-xl border border-slate-800 transition-colors duration-500">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-6 bg-slate-800 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>The CreatorPay Standard</span>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Enforced Advance Milestone:</strong> Official PayPal Invoicing locks in 30-50% advance before you start filming.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Real-Time Webhooks:</strong> Payment clearances trigger production state changes immediately without manual checking.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Parallel Multi-Party Payouts:</strong> When sponsor clears balance, your editor & designer get paid in milliseconds via PayPal Payouts.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Immutable 1-Click Tax Ledger:</strong> Export IRS Schedule C & 1099-NEC contractor expense logs instantly.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-medium">
              Zero manual follow-ups. Zero custody risk. 100% automated settlement.
            </div>
          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE ROSTER SPLIT CALCULATOR */}
      <section id="calculator" className="py-20 bg-slate-50/70 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/80 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight transition-colors duration-500">
              Interactive Team Split Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors duration-500">
              See how CreatorPay autonomously divides your brand sponsorship between you, your editor, and your designer.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-lg transition-colors duration-500">
            
            {/* Slider Control */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Brand Sponsorship Deal Size:
                </span>
                <span className="text-2xl font-black text-slate-950 dark:text-white font-mono transition-colors duration-500">
                  ${calcDealSize.toLocaleString()} USD
                </span>
              </div>
              <input 
                type="range" 
                min="1000" 
                max="50000" 
                step="500"
                value={calcDealSize}
                onChange={(e) => setCalcDealSize(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-950 dark:accent-brand-500 transition-colors"
              />
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                <span>$1,000 (Single Reel)</span>
                <span>$25,000 (Channel Retainer)</span>
                <span>$50,000 (Studio Agency)</span>
              </div>
            </div>

            {/* Live Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center transition-colors duration-500">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Video Editor (15%)</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                  ${calcEditor.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Instant PayPal Payout</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center transition-colors duration-500">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thumbnail Designer (5%)</span>
                <p className="text-2xl font-black text-blue-600 dark:text-sky-400 font-mono mt-1">
                  ${calcDesigner.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Instant PayPal Payout</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 dark:bg-black/90 text-white border border-transparent dark:border-slate-800 text-center transition-colors duration-500">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creator Net Retained (80%)</span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  ${calcCreator.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct to Business Account</p>
              </div>

            </div>

            {/* Bottom Insight Strip */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-medium transition-colors duration-500">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>All 3 disbursements execute in parallel via a single <strong>PayPal Payouts Batch call</strong>.</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 hidden sm:inline">Execution time: ~4.2s</span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. INSTITUTIONAL SECURITY & PAYPAL ENTERPRISE RAILS */}
      <section id="security" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#003087] dark:text-sky-300 mb-3 transition-colors duration-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank-Grade Financial Rails</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight transition-colors duration-500">
            Zero Custody Risk. <br />Direct Peer-to-Peer Settlement.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed transition-colors duration-500">
            CreatorPay does not hold your sponsor funds in middleman custodial bank accounts. All transactions move directly over PayPal merchant infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#003087] dark:text-sky-300 flex items-center justify-center font-bold text-sm mb-4 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Zero Escrow Custody</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Funds flow directly from the sponsor's PayPal or credit card into your verified PayPal Business merchant balance. We never touch or hold your money.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Real-Time Webhooks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every invoice status change, payment completion, and payout delivery is cryptographically verified via PayPal Webhook signatures.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-brand-300 flex items-center justify-center font-bold text-sm mb-4 border border-purple-200 dark:border-purple-800">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">IRS & Tax Compliance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Immutable audit ledger automatically generates 1099-NEC expense exports and contractor receipt logs for clean Schedule C tax deductions.
            </p>
          </div>

        </div>
      </section>

      {/* 8. IMPACT STATS */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white font-mono tracking-tight tabular-nums transition-colors duration-500">
              384%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Average cashflow efficiency gain
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white font-mono tracking-tight tabular-nums transition-colors duration-500">
              \$3.9M
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Sponsorship volume modeled
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white font-mono tracking-tight tabular-nums transition-colors duration-500">
              0 hrs
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Manual invoice chasing required
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white font-mono tracking-tight tabular-nums transition-colors duration-500">
              &lt; 5s
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              PayPal multi-party payout speed
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="py-20 bg-slate-950 dark:bg-black text-white relative overflow-hidden transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-800 text-xs font-bold text-slate-300 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Built for High-Growth Creators & Talent Agencies</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Start getting paid like an institutional studio
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Stop losing hours on spreadsheets and unpaid invoices. Launch your CreatorPay financial co-pilot today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-600/30 transition-all cursor-pointer flex items-center space-x-2 group"
            >
              <span>Launch Studio App Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://github.com/ius-sharma/CreatorPay-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all border border-slate-700 dark:border-slate-800"
            >
              View GitHub Source Code
            </a>
          </div>
        </div>
      </section>

      {/* 10. CLEAN MINIMALIST FOOTER */}
      <footer className="py-8 bg-white dark:bg-[#07090e] border-t border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900 dark:text-slate-100">CreatorPay.AI</span>
            <span>• The Financial Agent for Digital Creators & Agencies</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-950 dark:hover:text-white font-semibold transition-colors">Studio App</Link>
            <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors">PayPal Developer</a>
            <a href="https://github.com/ius-sharma/CreatorPay-AI" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950 dark:hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
