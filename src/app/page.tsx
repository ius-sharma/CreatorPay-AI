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
  Moon,
  X
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
  const [inspectorNode, setInspectorNode] = useState<string | null>(null);

  const openInspector = (nodeId: string) => {
    setInspectorNode(nodeId);
  };

  const closeInspector = () => {
    setInspectorNode(null);
  };

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
    <div className="min-h-screen bg-[#FFFDFC] dark:bg-[#120D0B] text-[#2B1D19] dark:text-[#FDF8F6] font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden relative transition-colors duration-500 ease-in-out">
      
      {/* 1. TOP FLOATING PILL NAVBAR (FIXED ON SCROLL) */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <header className="max-w-6xl mx-auto rounded-full bg-[#FFFDFC]/90 dark:bg-[#1A1310]/90 backdrop-blur-md border border-espresso-200/90 dark:border-espresso-800/90 shadow-md dark:shadow-2xl px-5 sm:px-7 py-3 flex items-center justify-between transition-all duration-500 pointer-events-auto">
          {/* Brand Typography */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-[#2B1D19] dark:text-[#FDF8F6] transition-colors duration-300">
              CreatorPay<span className="text-brand-500 dark:text-brand-400">.AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-[#75645E] dark:text-[#B8A9A2]">
            <a href="#how-it-works" className="hover:text-[#2B1D19] dark:hover:text-[#FDF8F6] transition-colors">How It Works</a>
            <a href="#interactive-demo" className="hover:text-[#2B1D19] dark:hover:text-[#FDF8F6] transition-colors">Live Deal Flow</a>
            <a href="#comparison" className="hover:text-[#2B1D19] dark:hover:text-[#FDF8F6] transition-colors">The Problem</a>
            <a href="#calculator" className="hover:text-[#2B1D19] dark:hover:text-[#FDF8F6] transition-colors">Split Calculator</a>
            <a href="#security" className="hover:text-[#2B1D19] dark:hover:text-[#FDF8F6] transition-colors">PayPal Rails</a>
          </nav>

          {/* Right Controls: Theme Switch & CTA */}
          <div className="flex items-center space-x-3">
            {/* Sleek Dark Mode Switcher */}
            {mounted && (
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="relative flex items-center p-1.5 w-14 h-8 rounded-full bg-espresso-100 dark:bg-espresso-900 border border-espresso-200/80 dark:border-espresso-700/80 transition-colors duration-500 cursor-pointer focus:outline-hidden"
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white dark:bg-[#120D0B] shadow-sm border border-espresso-200/60 dark:border-espresso-700 flex items-center justify-center transform transition-transform duration-500 ease-out ${
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
              className="text-xs font-semibold text-[#75645E] dark:text-[#B8A9A2] hover:text-[#2B1D19] dark:hover:text-[#FDF8F6] px-2 py-1.5 hidden sm:inline transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-[#2B1D19] dark:bg-brand-500 hover:bg-[#3E2B25] dark:hover:bg-brand-600 text-white text-xs font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
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
          <div className="w-[450px] h-[450px] rounded-full border border-espresso-200/50 dark:border-espresso-800/50 absolute transition-colors duration-500" />
          <div className="w-[750px] h-[750px] rounded-full border border-espresso-200/40 dark:border-espresso-800/40 absolute transition-colors duration-500" />
          <div className="w-[1050px] h-[1050px] rounded-full border border-espresso-200/25 dark:border-espresso-800/25 absolute transition-colors duration-500" />
          <div className="w-[1350px] h-[1350px] rounded-full border border-espresso-100 dark:border-espresso-900 absolute transition-colors duration-500" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* USER REQUESTED BADGE */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-espresso-50 dark:bg-espresso-900/70 border border-espresso-200 dark:border-espresso-800 text-xs font-semibold text-[#43322A] dark:text-[#E8D8D0] mb-6 shadow-2xs transition-colors duration-500">
            <span className="w-2 h-2 rounded-full bg-brand-500 dark:bg-brand-400 animate-pulse" />
            <span className="font-bold text-[#2B1D19] dark:text-[#FAF6F4]">The Financial Agent for Digital Creators & Agencies</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#2B1D19] dark:text-[#FAF6F4] tracking-tight leading-[1.08] mb-5 transition-colors duration-500">
            Never chase a brand <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#2B1D19] via-brand-500 to-[#43322A] dark:from-white dark:via-brand-400 dark:to-espresso-200 bg-clip-text text-transparent">
              payment again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#75645E] dark:text-[#B8A9A2] max-w-2xl mx-auto mb-8 font-normal leading-relaxed transition-colors duration-500">
            Turn raw sponsorship agreements into verified PayPal milestone invoices, automated video deliverable checks, and instant team splits — on pure autopilot.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-[#2B1D19] dark:bg-brand-500 hover:bg-[#3E2B25] dark:hover:bg-brand-600 text-white text-sm font-bold shadow-md hover:shadow-xl dark:shadow-brand-500/30 transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>Launch Studio Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#interactive-demo"
              className="px-7 py-3.5 rounded-full bg-white dark:bg-espresso-900/80 hover:bg-espresso-50 dark:hover:bg-espresso-800 text-[#43322A] dark:text-[#E8D8D0] text-sm font-semibold border border-espresso-200 dark:border-espresso-800 transition-all shadow-2xs flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 text-[#75645E] dark:text-[#B8A9A2] fill-[#75645E] dark:fill-[#B8A9A2]" />
              <span>See Live Deal Flow</span>
            </a>
          </div>

          {/* 3. HERO CENTERPIECE: COMPACT SQUARE NODES WITH BORDER SOCKET CIRCLES & CURVED S-LINES */}
          <div id="interactive-demo" className="relative max-w-5xl mx-auto text-left pt-6 pb-6">
            
            {/* Top Toolbar: Clean Live Canvas Indicator & Replay Trigger */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10 px-2 sm:px-4">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#43322A] dark:text-[#E8D8D0] font-sans">
                  Autonomous Agent Workflow Canvas
                </span>
                <span className="text-espresso-300 dark:text-espresso-700 hidden sm:inline">•</span>
                <span className="text-xs text-[#9E8D86] dark:text-[#8C7A72] font-sans hidden sm:inline">
                  Interactive Node Graph · Click any node to inspect agent logic
                </span>
              </div>

              <button
                onClick={runWorkflowSimulation}
                disabled={isSimulating}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-75 hover:scale-[1.02]"
              >
                {isSimulating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Executing Flow...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Replay Agent Execution</span>
                  </>
                )}
              </button>
            </div>

            {/* OPEN CANVAS: INDEPENDENT FLOATING NODES CONNECTED BY S-CURVE THREADS (NO OUTER BOX) */}
            <div className="relative max-w-[820px] mx-auto">
                
                {/* ROW 1: NODE 1 (SQUARE CARD ON LEFT + EXPLANATION ON RIGHT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                  <div className="flex justify-center">
                    <div 
                      onClick={() => openInspector('ingest')}
                      className={`w-60 h-60 sm:w-64 sm:h-64 rounded-3xl bg-white dark:bg-[#1A1310] border transition-all duration-300 shadow-md hover:shadow-2xl relative group cursor-pointer flex flex-col justify-between p-5 sm:p-6 hover:border-brand-500 ${
                        simStep >= 1 ? 'border-brand-500/80 dark:border-brand-500/80 ring-2 ring-brand-500/20' : 'border-espresso-200 dark:border-espresso-800'
                      }`}
                    >
                      {/* BORDER SOCKET CIRCLE: BOTTOM CONNECTOR (Direct origin for S-line 1) */}
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-md z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                      </div>

                      {/* BORDER SOCKET CIRCLE: RIGHT BORDER PIN */}
                      <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500/70 items-center justify-center shadow-xs z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      </div>

                      {/* Card Top: Stage Tag & Live Dot */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 font-sans bg-brand-50 dark:bg-brand-950/70 px-2.5 py-1 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                          Stage 01 · Trigger
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      {/* Card Center: Icon & Title */}
                      <div className="text-center my-auto">
                        <div className="w-13 h-13 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center mx-auto mb-2.5 border border-brand-200 dark:border-brand-800 shadow-2xs group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-[#2B1D19] dark:text-[#FAF6F4] leading-tight">
                          Contract Ingestion
                        </h4>
                        <p className="text-[11px] text-[#75645E] dark:text-[#B8A9A2] font-sans mt-1">
                          AI OCR & Milestone Parser
                        </p>
                      </div>

                      {/* Card Bottom: Metric & Click Prompt */}
                      <div className="text-center space-y-1.5">
                        <div className="px-3 py-1 rounded-xl bg-espresso-50 dark:bg-espresso-950/70 text-[10px] font-sans font-bold text-[#43322A] dark:text-[#E8D8D0] border border-espresso-200/60 dark:border-espresso-800/60">
                          50% Advance Lock Rule
                        </div>
                        <span className="text-[10px] font-bold text-brand-500 dark:text-brand-400 inline-flex items-center space-x-1 group-hover:underline">
                          <span>Inspect Stage Logic</span>
                          <span>↗</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Step Description Side-Panel */}
                  <div className="hidden sm:flex flex-col justify-center pl-6 text-left space-y-2">
                    <div className="inline-flex items-center space-x-2 text-xs font-sans font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-200/60 dark:border-brand-800/60 w-fit">
                      <span>Step 01 · Ingestion Trigger</span>
                    </div>
                    <h5 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                      Autonomous PDF Contract Ingestion
                    </h5>
                    <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] max-w-sm leading-relaxed">
                      Agent continuously listens for sponsorship PDF agreements, extracts fee amounts and deliverable deadlines, and locks mandatory 50% upfront milestone rules into code.
                    </p>
                  </div>
                </div>

                {/* CURVED S-LINE 1: CONNECTS NODE 1 BOTTOM CIRCLE (x: 205) TO NODE 2 TOP CIRCLE (x: 615) */}
                <div className="h-28 sm:h-36 relative flex items-center justify-center my-2">
                  {/* Desktop S-Curve */}
                  <div className="w-full h-full hidden sm:block">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 820 144" fill="none">
                      <path 
                        d="M 205 0 C 205 92, 615 52, 615 144" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        className={`animate-flow-thread ${simStep >= 2 ? 'text-brand-500 dark:text-brand-400' : 'text-slate-300 dark:text-slate-700'}`} 
                      />
                    </svg>
                  </div>

                  {/* Mobile Fallback Vertical Line */}
                  <div className="sm:hidden flex flex-col items-center">
                    <svg className="w-6 h-16 overflow-visible" viewBox="0 0 24 64" fill="none">
                      <line x1="12" y1="0" x2="12" y2="64" stroke="currentColor" strokeWidth="2.5" className="animate-flow-thread text-brand-500" />
                    </svg>
                  </div>
                </div>

                {/* ROW 2: NODE 2 (EXPLANATION ON LEFT + SQUARE CARD ON RIGHT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                  {/* Left Column: Step Description Side-Panel */}
                  <div className="hidden sm:flex flex-col justify-center pr-6 text-right space-y-2">
                    <div className="inline-flex items-center space-x-2 text-xs font-sans font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-200/60 dark:border-brand-800/60 w-fit ml-auto">
                      <span>Step 02 · Escrow Lock Action</span>
                    </div>
                    <h5 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                      PayPal Milestone Invoicing v2
                    </h5>
                    <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] max-w-sm ml-auto leading-relaxed">
                      Automatically constructs and dispatches official PayPal Invoice v2. Production is authorized the exact millisecond funds clear into your business balance.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div 
                      onClick={() => openInspector('invoice')}
                      className={`w-60 h-60 sm:w-64 sm:h-64 rounded-3xl bg-white dark:bg-[#1A1310] border transition-all duration-300 shadow-md hover:shadow-2xl relative group cursor-pointer flex flex-col justify-between p-5 sm:p-6 hover:border-brand-500 ${
                        simStep >= 2 ? 'border-brand-500/80 dark:border-brand-500/80 ring-2 ring-brand-500/20' : 'border-espresso-200 dark:border-espresso-800'
                      }`}
                    >
                      {/* BORDER SOCKET CIRCLE: TOP CONNECTOR (Receiver from S-line 1) */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-md z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                      </div>

                      {/* BORDER SOCKET CIRCLE: BOTTOM CONNECTOR (Origin for S-line 2) */}
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-md z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                      </div>

                      {/* BORDER SOCKET CIRCLE: LEFT BORDER PIN */}
                      <div className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500/70 items-center justify-center shadow-xs z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      </div>

                      {/* Card Top: Stage Tag & Paid Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 font-sans bg-brand-50 dark:bg-brand-950/70 px-2.5 py-1 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                          Stage 02 · Action
                        </span>
                        <span className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          PAID ✓
                        </span>
                      </div>

                      {/* Card Center: Icon & Title */}
                      <div className="text-center my-auto">
                        <div className="w-13 h-13 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center mx-auto mb-2.5 border border-brand-200 dark:border-brand-800 shadow-2xs group-hover:scale-110 transition-transform font-black text-lg">
                          P
                        </div>
                        <h4 className="text-sm font-black text-[#2B1D19] dark:text-[#FAF6F4] leading-tight">
                          Milestone Escrow
                        </h4>
                        <p className="text-[11px] text-[#75645E] dark:text-[#B8A9A2] font-sans mt-1">
                          PayPal Invoicing API v2
                        </p>
                      </div>

                      {/* Card Bottom: Metric & Click Prompt */}
                      <div className="text-center space-y-1.5">
                        <div className="px-3 py-1 rounded-xl bg-espresso-50 dark:bg-espresso-950/70 text-[10px] font-sans text-[#43322A] dark:text-[#E8D8D0] border border-espresso-200/60 dark:border-espresso-800/60 font-bold">
                          ${selectedDeal.advanceMilestone.toLocaleString()}.00 USD Locked
                        </div>
                        <span className="text-[10px] font-bold text-brand-500 dark:text-brand-400 inline-flex items-center space-x-1 group-hover:underline">
                          <span>Inspect Stage Logic</span>
                          <span>↗</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CURVED S-LINE 2: CONNECTS NODE 2 BOTTOM CIRCLE (x: 615) BACK TO NODE 3 TOP CIRCLE (x: 205) */}
                <div className="h-28 sm:h-36 relative flex items-center justify-center my-2">
                  {/* Desktop S-Curve */}
                  <div className="w-full h-full hidden sm:block">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 820 144" fill="none">
                      <path 
                        d="M 615 0 C 615 92, 205 52, 205 144" 
                        stroke="currentColor" 
                        strokeWidth="3" 
                        className={`animate-flow-thread ${simStep >= 3 ? 'text-brand-500 dark:text-brand-400' : 'text-espresso-300 dark:text-espresso-700'}`} 
                      />
                    </svg>
                  </div>

                  {/* Mobile Fallback Vertical Line */}
                  <div className="sm:hidden flex flex-col items-center">
                    <svg className="w-6 h-16 overflow-visible" viewBox="0 0 24 64" fill="none">
                      <line x1="12" y1="0" x2="12" y2="64" stroke="currentColor" strokeWidth="2.5" className="animate-flow-thread text-brand-500" />
                    </svg>
                  </div>
                </div>

                {/* ROW 3: NODE 3 (SQUARE CARD ON LEFT + EXPLANATION ON RIGHT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                  <div className="flex justify-center">
                    <div 
                      onClick={() => openInspector('verify')}
                      className={`w-60 h-60 sm:w-64 sm:h-64 rounded-3xl bg-white dark:bg-[#1A1310] border transition-all duration-300 shadow-md hover:shadow-2xl relative group cursor-pointer flex flex-col justify-between p-5 sm:p-6 hover:border-brand-500 ${
                        simStep >= 3 ? 'border-brand-500/80 dark:border-brand-500/80 ring-2 ring-brand-500/20' : 'border-espresso-200 dark:border-espresso-800'
                      }`}
                    >
                      {/* BORDER SOCKET CIRCLE: TOP CONNECTOR (Receiver from S-line 2) */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-md z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                      </div>

                      {/* BORDER SOCKET CIRCLE: BOTTOM CONNECTOR (Origin for Branching Lines) */}
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-md z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                      </div>

                      {/* BORDER SOCKET CIRCLE: RIGHT BORDER PIN */}
                      <div className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500/70 items-center justify-center shadow-xs z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                      </div>

                      {/* Card Top: Stage Tag & Verified Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 font-sans bg-brand-50 dark:bg-brand-950/70 px-2.5 py-1 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                          Stage 03 · Condition
                        </span>
                        <span className="text-[10px] font-sans font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          VERIFIED ✓
                        </span>
                      </div>

                      {/* Card Center: Icon & Title */}
                      <div className="text-center my-auto">
                        <div className="w-13 h-13 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center mx-auto mb-2.5 border border-brand-200 dark:border-brand-800 shadow-2xs group-hover:scale-110 transition-transform">
                          <Video className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-black text-[#2B1D19] dark:text-[#FAF6F4] leading-tight">
                          Deliverable Audit
                        </h4>
                        <p className="text-[11px] text-[#75645E] dark:text-[#B8A9A2] font-sans mt-1">
                          Multimodal Vision OCR
                        </p>
                      </div>

                      {/* Card Bottom: Metric & Click Prompt */}
                      <div className="text-center space-y-1.5">
                        <div className="px-3 py-1 rounded-xl bg-espresso-50 dark:bg-espresso-950/70 text-[10px] font-sans text-[#43322A] dark:text-[#E8D8D0] border border-espresso-200/60 dark:border-espresso-800/60 font-bold">
                          02:45 Match Confirmed
                        </div>
                        <span className="text-[10px] font-bold text-brand-500 dark:text-brand-400 inline-flex items-center space-x-1 group-hover:underline">
                          <span>Inspect Stage Logic</span>
                          <span>↗</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Step Description Side-Panel */}
                  <div className="hidden sm:flex flex-col justify-center pl-6 text-left space-y-2">
                    <div className="inline-flex items-center space-x-2 text-xs font-sans font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-200/60 dark:border-brand-800/60 w-fit">
                      <span>Step 03 · Deliverable Condition</span>
                    </div>
                    <h5 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                      Multimodal Video & Timestamp Verification
                    </h5>
                    <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] max-w-sm leading-relaxed">
                      AI audits YouTube video feed at timestamp 02:45, verifies live UTM sponsor link and FTC disclosure, authorizing the parallel team settlement.
                    </p>
                  </div>
                </div>

                {/* CURVED BRANCHING S-CABLES: ORIGINATES AT NODE 3 BOTTOM CIRCLE (x: 205) AND SPREADS TO 3 BRANCH CARDS (x: 137, 410, 683) */}
                <div className="h-28 sm:h-36 relative flex items-center justify-center my-2">
                  {/* Desktop SVG Branching Lines */}
                  <div className="w-full h-full hidden sm:block">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 820 144" fill="none">
                      <path d="M 205 0 C 205 76, 137 56, 137 144" stroke="currentColor" strokeWidth="3" className={`animate-flow-thread ${simStep >= 4 ? 'text-brand-500 dark:text-brand-400' : 'text-espresso-300 dark:text-espresso-700'}`} />
                      <path d="M 205 0 C 205 76, 410 56, 410 144" stroke="currentColor" strokeWidth="3" className={`animate-flow-thread ${simStep >= 4 ? 'text-brand-500 dark:text-brand-400' : 'text-espresso-300 dark:text-espresso-700'}`} />
                      <path d="M 205 0 C 205 76, 683 56, 683 144" stroke="currentColor" strokeWidth="3" className={`animate-flow-thread ${simStep >= 4 ? 'text-brand-500 dark:text-brand-400' : 'text-espresso-300 dark:text-espresso-700'}`} />
                    </svg>
                  </div>

                  {/* Mobile Fallback Drop */}
                  <div className="sm:hidden flex flex-col items-center">
                    <svg className="w-6 h-16 overflow-visible" viewBox="0 0 24 64" fill="none">
                      <line x1="12" y1="0" x2="12" y2="64" stroke="currentColor" strokeWidth="2.5" className="animate-flow-thread text-brand-500" />
                    </svg>
                  </div>
                </div>

                {/* ROW 4: 3 COLLABORATOR BRANCH CARDS (SPACIOUS 3-COLUMN ROSTER) */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                      <span className="text-xs sm:text-sm font-bold text-[#43322A] dark:text-[#FAF6F4]">
                        Disbursement Hub · Connected Collaborator Roster
                      </span>
                    </div>
                    <span className="text-[11px] font-sans text-[#9E8D86] dark:text-[#8C7A72]">
                      Connect any team role & set custom %
                    </span>
                  </div>

                  {/* 3 INDEPENDENT COLLABORATOR BRANCH CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    
                    {/* Branch 1: Video Editor */}
                    <div 
                      onClick={() => openInspector('editor')}
                      className={`p-5 rounded-3xl bg-white dark:bg-[#1A1310] border transition-all duration-300 shadow-md relative group cursor-pointer hover:border-brand-400 hover:shadow-xl ${
                        simStep >= 4 ? 'border-brand-500/80 dark:border-brand-500/80 ring-1 ring-brand-500/20' : 'border-espresso-200 dark:border-espresso-800'
                      }`}
                    >
                      {/* BORDER SOCKET CIRCLE: TOP CONNECTOR */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-xs z-10">
                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#75645E] dark:text-[#B8A9A2]">
                          Video Editor
                        </span>
                        <span className="text-[10px] font-sans font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                          15% Cut
                        </span>
                      </div>
                      <p className="text-xl font-extrabold text-[#2B1D19] dark:text-[#FAF6F4] font-sans">
                        +${selectedDeal.editorCut}.00 <span className="text-[11px] font-normal text-[#9E8D86]">USD</span>
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-400 font-medium pt-3 mt-3 border-t border-espresso-100 dark:border-espresso-800">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disbursed ✓</span>
                        </span>
                        <span className="text-[#9E8D86] hover:underline">Inspect ↗</span>
                      </div>
                    </div>

                    {/* Branch 2: Thumbnail Designer */}
                    <div 
                      onClick={() => openInspector('designer')}
                      className={`p-5 rounded-3xl bg-white dark:bg-[#1A1310] border transition-all duration-300 shadow-md relative group cursor-pointer hover:border-brand-400 hover:shadow-xl ${
                        simStep >= 4 ? 'border-brand-500/80 dark:border-brand-500/80 ring-1 ring-brand-500/20' : 'border-espresso-200 dark:border-espresso-800'
                      }`}
                    >
                      {/* BORDER SOCKET CIRCLE: TOP CONNECTOR */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#1A1310] border-2 border-brand-500 flex items-center justify-center shadow-xs z-10">
                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#75645E] dark:text-[#B8A9A2]">
                          Thumbnail Designer
                        </span>
                        <span className="text-[10px] font-sans font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                          5% Cut
                        </span>
                      </div>
                      <p className="text-xl font-extrabold text-[#2B1D19] dark:text-[#FAF6F4] font-sans">
                        +${selectedDeal.designerCut}.00 <span className="text-[11px] font-normal text-[#9E8D86]">USD</span>
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-400 font-medium pt-3 mt-3 border-t border-espresso-100 dark:border-espresso-800">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Disbursed ✓</span>
                        </span>
                        <span className="text-[#9E8D86] hover:underline">Inspect ↗</span>
                      </div>
                    </div>

                    {/* Branch 3: Creator / Studio Treasury */}
                    <div 
                      onClick={() => openInspector('creator')}
                      className={`p-5 rounded-3xl bg-[#2B1D19] dark:bg-[#150F0D] text-white border transition-all duration-300 shadow-lg relative group cursor-pointer hover:border-brand-400 hover:shadow-2xl ${
                        simStep >= 4 ? 'border-brand-500/80 ring-1 ring-brand-500/30' : 'border-espresso-800'
                      }`}
                    >
                      {/* BORDER SOCKET CIRCLE: TOP CONNECTOR */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#2B1D19] dark:bg-[#150F0D] border-2 border-brand-500 flex items-center justify-center shadow-xs z-10">
                        <div className="w-2 h-2 rounded-full bg-brand-500" />
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-300">
                          Creator Net Retained
                        </span>
                        <span className="text-[10px] font-sans font-bold text-brand-300 bg-espresso-800 px-2 py-0.5 rounded-md border border-espresso-700">
                          80% Retained
                        </span>
                      </div>
                      <p className="text-xl font-extrabold text-white font-sans">
                        +${selectedDeal.creatorCut}.00 <span className="text-[11px] font-normal text-espresso-400">USD</span>
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-brand-400 font-medium pt-3 mt-3 border-t border-espresso-800">
                        <span className="flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Merchant Balance ✓</span>
                        </span>
                        <span className="text-espresso-400 hover:underline">Inspect ↗</span>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Assurance Strip */}
                  <div className="mt-6 p-4 rounded-2xl bg-[#FAF6F4] dark:bg-[#1A1310] border border-espresso-200/80 dark:border-espresso-800 flex flex-wrap items-center justify-between gap-2 text-xs text-[#75645E] dark:text-[#B8A9A2] shadow-xs">
                    <span className="flex items-center space-x-2 font-medium">
                      <Zap className="w-4 h-4 text-brand-500" />
                      <span>Single PayPal Batch API call • 3 parallel transactions settled in 4.2s</span>
                    </span>
                    <span className="font-sans text-brand-600 dark:text-brand-400 font-bold">
                      IRS 1099 Expense Logged ✓
                    </span>
                  </div>
                </div>

              </div>

            {/* DEDICATED AGENT STAGE INSPECTOR MODAL ("ALAG SE DESCRIPTION OPEN HOGA") */}
            {inspectorNode && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso-950/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={closeInspector}
              >
                <div 
                  className="bg-white dark:bg-[#1A1310] border border-espresso-200 dark:border-espresso-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-200 text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close Button */}
                  <button 
                    onClick={closeInspector}
                    aria-label="Close inspector"
                    className="absolute top-5 right-5 p-2 rounded-full text-[#9E8D86] hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] hover:bg-espresso-100 dark:hover:bg-espresso-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Header by Node */}
                  {inspectorNode === 'ingest' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                            Stage 01 Inspector
                          </span>
                          <h3 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                            Autonomous Contract Ingestion
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60">
                        <p className="text-xs font-bold text-brand-950 dark:text-brand-200 mb-1 flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                          <span>What the AI Agent Does Here:</span>
                        </p>
                        <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
                          The agent continuously listens for incoming PDF agreements or emails. It executes multimodal OCR extraction to parse brand names, agreed fee totals, deliverable deadlines, and locks in a strict <strong>50% upfront milestone</strong> escrow policy before creator production commences.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-espresso-50 dark:bg-espresso-950/60 text-xs font-sans space-y-1.5 text-[#75645E] dark:text-[#B8A9A2] border border-espresso-200/70 dark:border-espresso-800/60">
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Extraction Model:</span>
                          <span className="font-bold text-[#2B1D19] dark:text-[#FAF6F4]">Gemini 1.5 Flash Multimodal OCR</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Processing Time:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">0.8 seconds (99.8% Confidence)</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Escrow Trigger:</span>
                          <span className="font-bold text-brand-500 dark:text-brand-400">Advance Deposit Enforced ($2,500.00)</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {inspectorNode === 'invoice' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center font-black text-lg border border-brand-200 dark:border-brand-800">
                          P
                        </div>
                        <div>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Stage 02 Inspector
                          </span>
                          <h3 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                            PayPal Milestone Escrow & Invoicing
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60">
                        <p className="text-xs font-bold text-brand-950 dark:text-brand-200 mb-1 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                          <span>What the AI Agent Does Here:</span>
                        </p>
                        <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
                          Constructs and sends an official PayPal Invoicing v2 document to brand finance accounts. The agent monitors PayPal Webhooks (<code className="font-sans font-bold">INVOICING.INVOICE.PAID</code>). The exact millisecond advance payment settles in your merchant balance, video shooting is unlocked.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-espresso-50 dark:bg-espresso-950/60 text-xs font-sans space-y-1.5 text-[#75645E] dark:text-[#B8A9A2] border border-espresso-200/70 dark:border-espresso-800/60">
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Financial Rail:</span>
                          <span className="font-bold text-[#2B1D19] dark:text-[#FAF6F4]">PayPal Merchant Invoicing API v2</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Escrow Security:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Zero Middleman / Direct Merchant Balance</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Webhook Status:</span>
                          <span className="font-bold text-brand-500 dark:text-brand-400">Cryptographically Signed & Verified</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {inspectorNode === 'verify' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
                          <Video className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Stage 03 Inspector
                          </span>
                          <h3 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                            Autonomous Deliverable Audit
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60">
                        <p className="text-xs font-bold text-brand-950 dark:text-brand-200 mb-1 flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                          <span>What the AI Agent Does Here:</span>
                        </p>
                        <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
                          The multimodal vision agent watches the uploaded YouTube video stream, verifies the dedicated sponsor segment timestamp at <strong>02:45</strong>, checks the video description for active tracking UTM links, and verifies FTC disclosure compliance before issuing payouts.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-espresso-50 dark:bg-espresso-950/60 text-xs font-sans space-y-1.5 text-[#75645E] dark:text-[#B8A9A2] border border-espresso-200/70 dark:border-espresso-800/60">
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Timestamp Match:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">02:45 Confirmed (99.4% Match)</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">FTC Compliance:</span>
                          <span className="font-bold text-[#2B1D19] dark:text-[#FAF6F4]">#ad / #sponsored tag verified</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Next Action:</span>
                          <span className="font-bold text-brand-500 dark:text-brand-400">Authorized Instant Parallel Payouts →</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {(inspectorNode === 'editor' || inspectorNode === 'designer' || inspectorNode === 'creator') && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-500 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-500 dark:text-brand-400">
                            Stage 04 Inspector
                          </span>
                          <h3 className="text-base font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">
                            PayPal Multi-Party Payout Settlement
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60">
                        <p className="text-xs font-bold text-brand-950 dark:text-brand-200 mb-1 flex items-center space-x-1.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span>What the AI Agent Does Here:</span>
                        </p>
                        <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
                          Rather than requiring you to manually calculate cuts and send individual transfers, the agent triggers a single <strong>PayPal Payouts Batch API</strong> call. Funds disburse in parallel to your Video Editor, Thumbnail Designer, and Creator balance in under 4.2 seconds.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-espresso-50 dark:bg-espresso-950/60 text-xs font-sans space-y-1.5 text-[#75645E] dark:text-[#B8A9A2] border border-espresso-200/70 dark:border-espresso-800/60">
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Disbursement Rail:</span>
                          <span className="font-bold text-[#2B1D19] dark:text-[#FAF6F4]">PayPal Payouts Batch REST API</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">Parallel Execution:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">3 Transfers Settled in 4.2 Seconds</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-[#9E8D86]">IRS Compliance:</span>
                          <span className="font-bold text-[#2B1D19] dark:text-[#FAF6F4]">1099-NEC Expense Ledger Recorded</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Modal Footer */}
                  <div className="mt-5 pt-4 border-t border-espresso-100 dark:border-espresso-800 flex justify-end">
                    <button
                      onClick={closeInspector}
                      className="px-5 py-2 rounded-xl bg-[#2B1D19] hover:bg-[#3E2B25] dark:bg-brand-500 dark:hover:bg-brand-600 text-white text-xs font-bold transition-colors"
                    >
                      Close Inspector
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 4. LOGO & PLATFORM STRIP */}
      <section className="py-12 border-y border-espresso-100 dark:border-espresso-800/80 bg-espresso-50/50 dark:bg-espresso-950/30 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#9E8D86] dark:text-[#8C7A72] mb-6">
            Engineered on the PayPal Global Merchant Ecosystem • Built for Modern Creator Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-[#9E8D86] dark:text-[#8C7A72] font-bold text-sm">
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors font-sans font-semibold">PayPal Invoicing</span>
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors font-sans font-semibold">PayPal Payouts API</span>
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">YouTube Studio</span>
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">Instagram Creators</span>
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">TikTok Creator Fund</span>
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">Substack</span>
            <span className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">Discord Agencies</span>
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM VS THE SOLUTION: THE CONTRAST SECTION */}
      <section id="comparison" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-[#2B1D19] dark:text-[#FAF6F4] tracking-tight transition-colors duration-500">
            The traditional sponsor deal is broken. <br />
            <span className="text-brand-500 dark:text-brand-400">CreatorPay fixes it.</span>
          </h2>
          <p className="text-sm text-[#75645E] dark:text-[#B8A9A2] mt-3 leading-relaxed transition-colors duration-500">
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
              <ul className="space-y-4 text-xs sm:text-sm text-[#43322A] dark:text-[#E8D8D0]">
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold text-base leading-none">✕</span>
                  <span><strong>Net-60 / Net-90 Delay:</strong> Brands hold payments for 3 months after your video goes live.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-red-500 font-bold text-base leading-none">✕</span>
                  <span><strong>Awkward WhatsApp Chasing:</strong> &ldquo;Hey checking in on invoice #24&rdquo; sent 10 times a week.</span>
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
          <div className="p-8 sm:p-10 rounded-3xl bg-[#1A1310] dark:bg-[#150F0D] text-white flex flex-col justify-between shadow-xl border border-espresso-800 transition-colors duration-500">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-6 bg-espresso-900 dark:bg-espresso-900/80 px-3 py-1 rounded-full border border-espresso-700">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>The CreatorPay Standard</span>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-espresso-200">
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
            <div className="mt-8 pt-4 border-t border-espresso-800 text-xs text-emerald-400 font-medium">
              Zero manual follow-ups. Zero custody risk. 100% automated settlement.
            </div>
          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE ROSTER SPLIT CALCULATOR */}
      <section id="calculator" className="py-20 bg-espresso-50/60 dark:bg-espresso-950/30 border-y border-espresso-100 dark:border-espresso-800/80 transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-[#2B1D19] dark:text-[#FAF6F4] tracking-tight transition-colors duration-500">
              Interactive Team Split Calculator
            </h2>
            <p className="text-xs sm:text-sm text-[#75645E] dark:text-[#B8A9A2] mt-2 transition-colors duration-500">
              See how CreatorPay autonomously divides your brand sponsorship between you, your editor, and your designer.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1A1310] border border-espresso-200/90 dark:border-espresso-800/90 rounded-3xl p-6 sm:p-10 shadow-lg transition-colors duration-500">
            
            {/* Slider Control */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#75645E] dark:text-[#B8A9A2] uppercase tracking-wider">
                  Brand Sponsorship Deal Size:
                </span>
                <span className="text-2xl font-black text-[#2B1D19] dark:text-[#FAF6F4] font-sans tabular-nums transition-colors duration-500">
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
                className="w-full h-2.5 bg-espresso-200 dark:bg-espresso-800 rounded-lg appearance-none cursor-pointer accent-brand-500 transition-colors"
              />
              <div className="flex justify-between text-[11px] text-[#9E8D86] dark:text-[#8C7A72] font-sans mt-1">
                <span>$1,000 (Single Reel)</span>
                <span>$25,000 (Channel Retainer)</span>
                <span>$50,000 (Studio Agency)</span>
              </div>
            </div>

            {/* Live Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              
              <div className="p-4 rounded-2xl bg-espresso-50 dark:bg-espresso-950/60 border border-espresso-200 dark:border-espresso-800/60 text-center transition-colors duration-500">
                <span className="text-[10px] font-bold text-[#75645E] dark:text-[#B8A9A2] uppercase tracking-wider">Lead Video Editor (15%)</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans tabular-nums mt-1">
                  ${calcEditor.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#9E8D86] dark:text-[#8C7A72] mt-0.5">Instant PayPal Payout</p>
              </div>

              <div className="p-4 rounded-2xl bg-espresso-50 dark:bg-espresso-950/60 border border-espresso-200 dark:border-espresso-800/60 text-center transition-colors duration-500">
                <span className="text-[10px] font-bold text-[#75645E] dark:text-[#B8A9A2] uppercase tracking-wider">Thumbnail Designer (5%)</span>
                <p className="text-2xl font-black text-blue-600 dark:text-sky-400 font-sans tabular-nums mt-1">
                  ${calcDesigner.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#9E8D86] dark:text-[#8C7A72] mt-0.5">Instant PayPal Payout</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#2B1D19] dark:bg-[#120D0B] text-white border border-espresso-800 text-center transition-colors duration-500">
                <span className="text-[10px] font-bold text-espresso-300 uppercase tracking-wider">Creator Net Retained (80%)</span>
                <p className="text-2xl font-black text-white font-sans tabular-nums mt-1">
                  ${calcCreator.toLocaleString()}
                </p>
                <p className="text-[10px] text-espresso-400 mt-0.5">Direct to Business Account</p>
              </div>

            </div>

            {/* Bottom Insight Strip */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 font-medium transition-colors duration-500">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>All 3 disbursements execute in parallel via a single <strong>PayPal Payouts Batch call</strong>.</span>
              </div>
              <span className="font-sans font-bold text-emerald-700 dark:text-emerald-300 hidden sm:inline">Execution time: ~4.2s</span>
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
          <h2 className="text-3xl sm:text-4xl font-black text-[#2B1D19] dark:text-[#FAF6F4] tracking-tight transition-colors duration-500">
            Zero Custody Risk. <br />Direct Peer-to-Peer Settlement.
          </h2>
          <p className="text-sm text-[#75645E] dark:text-[#B8A9A2] mt-3 leading-relaxed transition-colors duration-500">
            CreatorPay does not hold your sponsor funds in middleman custodial bank accounts. All transactions move directly over PayPal merchant infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1310] border border-espresso-200/80 dark:border-espresso-800/80 shadow-xs hover:border-espresso-300 dark:hover:border-espresso-700 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#003087] dark:text-sky-300 flex items-center justify-center font-bold text-sm mb-4 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#2B1D19] dark:text-[#FAF6F4] text-base mb-2">Zero Escrow Custody</h3>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
              Funds flow directly from the sponsor's PayPal or credit card into your verified PayPal Business merchant balance. We never touch or hold your money.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1310] border border-espresso-200/80 dark:border-espresso-800/80 shadow-xs hover:border-espresso-300 dark:hover:border-espresso-700 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#2B1D19] dark:text-[#FAF6F4] text-base mb-2">Real-Time Webhooks</h3>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
              Every invoice status change, payment completion, and payout delivery is cryptographically verified via PayPal Webhook signatures.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#1A1310] border border-espresso-200/80 dark:border-espresso-800/80 shadow-xs hover:border-espresso-300 dark:hover:border-espresso-700 transition-all duration-500">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-sm mb-4 border border-brand-200 dark:border-brand-800">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#2B1D19] dark:text-[#FAF6F4] text-base mb-2">IRS & Tax Compliance</h3>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] leading-relaxed">
              Immutable audit ledger automatically generates 1099-NEC expense exports and contractor receipt logs for clean Schedule C tax deductions.
            </p>
          </div>

        </div>
      </section>

      {/* 8. IMPACT STATS */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-espresso-100 dark:border-espresso-800/80 transition-colors duration-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-black text-[#2B1D19] dark:text-[#FAF6F4] font-sans tracking-tight tabular-nums transition-colors duration-500">
              384%
            </p>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] mt-2 font-medium">
              Average cashflow efficiency gain
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-[#2B1D19] dark:text-[#FAF6F4] font-sans tracking-tight tabular-nums transition-colors duration-500">
              \$3.9M
            </p>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] mt-2 font-medium">
              Sponsorship volume modeled
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-[#2B1D19] dark:text-[#FAF6F4] font-sans tracking-tight tabular-nums transition-colors duration-500">
              0 hrs
            </p>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] mt-2 font-medium">
              Manual invoice chasing required
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-[#2B1D19] dark:text-[#FAF6F4] font-sans tracking-tight tabular-nums transition-colors duration-500">
              &lt; 5s
            </p>
            <p className="text-xs text-[#75645E] dark:text-[#B8A9A2] mt-2 font-medium">
              PayPal multi-party payout speed
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="py-20 bg-[#1A1310] dark:bg-[#120D0B] text-white relative overflow-hidden transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-espresso-900 border border-espresso-800 text-xs font-bold text-espresso-200 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Built for High-Growth Creators & Talent Agencies</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Start getting paid like an institutional studio
          </h2>
          <p className="text-sm sm:text-base text-espresso-300 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Stop losing hours on spreadsheets and unpaid invoices. Launch your CreatorPay financial co-pilot today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/30 transition-all cursor-pointer flex items-center space-x-2 group"
            >
              <span>Launch Studio App Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://github.com/ius-sharma/CreatorPay-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-full bg-espresso-900 hover:bg-espresso-800 text-espresso-100 text-sm font-semibold transition-all border border-espresso-700"
            >
              View GitHub Source Code
            </a>
          </div>
        </div>
      </section>

      {/* 10. CLEAN MINIMALIST FOOTER */}
      <footer className="py-8 bg-[#FFFDFC] dark:bg-[#120D0B] border-t border-espresso-200/80 dark:border-espresso-800/80 text-xs text-[#75645E] dark:text-[#B8A9A2] transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#2B1D19] dark:text-[#FAF6F4]">CreatorPay.AI</span>
            <span>• The Financial Agent for Digital Creators & Agencies</span>
          </div>
          <div className="flex items-center space-x-6 text-[#75645E] dark:text-[#B8A9A2]">
            <Link href="/dashboard" className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] font-semibold transition-colors">Studio App</Link>
            <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">PayPal Developer</a>
            <a href="https://github.com/ius-sharma/CreatorPay-AI" target="_blank" rel="noopener noreferrer" className="hover:text-[#2B1D19] dark:hover:text-[#FAF6F4] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
