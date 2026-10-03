'use client';

import React, { useState } from 'react';
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
  AlertCircle
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
  const [activeFeatureTab, setActiveFeatureTab] = useState<'invoicing' | 'webhooks' | 'payouts'>('invoicing');

  // Interactive calculator derivations
  const calcEditor = Math.round(calcDealSize * 0.15);
  const calcDesigner = Math.round(calcDealSize * 0.05);
  const calcCreator = calcDealSize - calcEditor - calcDesigner;

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden relative">
      
      {/* 1. TOP FLOATING PILL NAVBAR (FIXED ON SCROLL) */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <header className="max-w-6xl mx-auto rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md px-5 sm:px-7 py-3 flex items-center justify-between transition-all pointer-events-auto">
          {/* Brand Typography */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-tight text-slate-950">
              CreatorPay<span className="text-brand-600">.AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">How It Works</a>
            <a href="#interactive-demo" className="hover:text-slate-950 transition-colors">Live Deal Flow</a>
            <a href="#comparison" className="hover:text-slate-950 transition-colors">The Problem</a>
            <a href="#calculator" className="hover:text-slate-950 transition-colors">Split Calculator</a>
            <a href="#security" className="hover:text-slate-950 transition-colors">PayPal Rails</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-1.5 hidden sm:inline"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer group"
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
          <div className="w-[450px] h-[450px] rounded-full border border-slate-200/50 absolute" />
          <div className="w-[750px] h-[750px] rounded-full border border-slate-200/40 absolute" />
          <div className="w-[1050px] h-[1050px] rounded-full border border-slate-200/25 absolute" />
          <div className="w-[1350px] h-[1350px] rounded-full border border-slate-100 absolute" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto">
          
          {/* USER REQUESTED BADGE */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span className="font-bold text-slate-900">The Financial Agent for Digital Creators & Agencies</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] mb-5">
            Never chase a brand <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-950 via-brand-700 to-slate-900 bg-clip-text text-transparent">
              payment again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Turn raw sponsorship agreements into verified PayPal milestone invoices, automated video deliverable checks, and instant team splits — on pure autopilot.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-md hover:shadow-xl transition-all flex items-center space-x-2 cursor-pointer group"
            >
              <span>Launch Studio Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="#interactive-demo"
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5 text-slate-500 fill-slate-500" />
              <span>See Live Deal Flow</span>
            </a>
          </div>

          {/* 3. HERO CENTERPIECE: INTERACTIVE LIVE DEAL TERMINAL SHOWCASE */}
          <div id="interactive-demo" className="relative max-w-4xl mx-auto text-left pt-2">
            
            {/* Ambient Gradient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-200/50 via-sky-200/30 to-purple-200/40 rounded-3xl blur-2xl -z-10" />

            {/* Main Interactive Showcase Card */}
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden transition-all">
              
              {/* Header Bar: Deal Selector Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Autonomous Deal Pipeline
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-950 mt-0.5">
                    {selectedDeal.brand} • ${selectedDeal.amount.toLocaleString()} USD
                  </h3>
                </div>

                {/* Deal Selector Chips */}
                <div className="flex items-center space-x-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
                  {SAMPLE_DEALS.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedDeal.id === deal.id
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      {deal.brand.split(' ')[0]} (${(deal.amount / 1000).toFixed(1)}k)
                    </button>
                  ))}
                </div>
              </div>

              {/* 4-Step Interactive Autonomous Workflow Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                
                {/* Stage 1: Contract Parsing */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">01. INGEST</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Contract Ingested</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    AI extracted payment terms: 50% upfront milestone, 50% on publish.
                  </p>
                  <span className="inline-block text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                    Terms Locked
                  </span>
                </div>

                {/* Stage 2: Milestone Invoicing */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">02. ADVANCE</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Milestone 1 Paid</p>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    ${selectedDeal.advanceMilestone.toLocaleString()} cleared via PayPal Invoicing before camera rolled.
                  </p>
                  <span className="inline-block text-[10px] font-bold text-[#003087] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    PayPal Webhook ✓
                  </span>
                </div>

                {/* Stage 3: AI Deliverable Check */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">03. VERIFY</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Deliverable Verified</p>
                  <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {selectedDeal.deliverable}
                  </p>
                  <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    99.4% Match Verified
                  </span>
                </div>

                {/* Stage 4: Instant Multi-Party Splits */}
                <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 font-mono">04. SETTLE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs font-bold text-brand-950">Instant Team Splits</p>
                  <p className="text-[11px] text-brand-900/80 leading-snug">
                    Zero math. Editor, designer & creator paid in parallel batches.
                  </p>
                  <span className="inline-block text-[10px] font-bold text-white bg-slate-950 px-2 py-0.5 rounded-md">
                    PayPal Payouts Disbursed
                  </span>
                </div>
              </div>

              {/* Bottom Real Payout Breakdown Strip */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-600/30 border border-brand-400/30 flex items-center justify-center text-brand-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100">
                      Disbursed Multi-Party Batch for {selectedDeal.brand}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Settled at {selectedDeal.verifiedTimestamp} • Batch ID #PP-{(selectedDeal.amount * 17).toString().slice(0, 6)}
                    </p>
                  </div>
                </div>

                {/* Split Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                  <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400 font-normal">Aman (Editor 15%):</span>{' '}
                    <span className="text-emerald-400">${selectedDeal.editorCut}</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400 font-normal">Rohan (Design 5%):</span>{' '}
                    <span className="text-blue-400">${selectedDeal.designerCut}</span>
                  </div>
                  <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl">
                    <span className="text-slate-400 font-normal">Creator Net:</span>{' '}
                    <span className="text-white font-black">${selectedDeal.creatorCut}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. LOGO & PLATFORM STRIP */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Engineered on the PayPal Global Merchant Ecosystem • Built for Modern Creator Studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-bold text-sm">
            <span className="hover:text-slate-700 transition-colors font-mono">PayPal Invoicing</span>
            <span className="hover:text-slate-700 transition-colors font-mono">PayPal Payouts API</span>
            <span className="hover:text-slate-700 transition-colors">YouTube Studio</span>
            <span className="hover:text-slate-700 transition-colors">Instagram Creators</span>
            <span className="hover:text-slate-700 transition-colors">TikTok Creator Fund</span>
            <span className="hover:text-slate-700 transition-colors">Substack</span>
            <span className="hover:text-slate-700 transition-colors">Discord Agencies</span>
          </div>
        </div>
      </section>

      {/* 5. THE PROBLEM VS THE SOLUTION: THE CONTRAST SECTION */}
      <section id="comparison" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            The traditional sponsor deal is broken. <br />
            <span className="text-brand-600">CreatorPay fixes it.</span>
          </h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Creators waste 15+ hours every month calculating team percentages, tracking email threads, and praying that brands wire payments on time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Card: The Old Way */}
          <div className="p-8 sm:p-10 rounded-3xl bg-red-50/40 border border-red-200/70 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-6 bg-red-100/60 px-3 py-1 rounded-full border border-red-200">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>The Manual Chaos (Before)</span>
              </div>
              <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
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
            <div className="mt-8 pt-4 border-t border-red-200 text-xs text-red-700 font-medium">
              Average loss: 12-18 hours / month & late contractor resentment.
            </div>
          </div>

          {/* Card: The CreatorPay Autonomous Standard */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 text-white flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-6 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
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
      <section id="calculator" className="py-20 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Interactive Team Split Calculator
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              See how CreatorPay autonomously divides your brand sponsorship between you, your editor, and your designer.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg">
            
            {/* Slider Control */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Brand Sponsorship Deal Size:
                </span>
                <span className="text-2xl font-black text-slate-950 font-mono">
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
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>$1,000 (Single Reel)</span>
                <span>$25,000 (Channel Retainer)</span>
                <span>$50,000 (Studio Agency)</span>
              </div>
            </div>

            {/* Live Calculation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Lead Video Editor (15%)</span>
                <p className="text-2xl font-black text-emerald-600 font-mono mt-1">
                  ${calcEditor.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Instant PayPal Payout</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Thumbnail Designer (5%)</span>
                <p className="text-2xl font-black text-blue-600 font-mono mt-1">
                  ${calcDesigner.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Instant PayPal Payout</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 text-white text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creator Net Retained (80%)</span>
                <p className="text-2xl font-black text-white font-mono mt-1">
                  ${calcCreator.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Direct to Business Account</p>
              </div>

            </div>

            {/* Bottom Insight Strip */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900 font-medium">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All 3 disbursements execute in parallel via a single <strong>PayPal Payouts Batch call</strong>.</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 hidden sm:inline">Execution time: ~4.2s</span>
            </div>

          </div>
        </div>
      </section>

      {/* 7. INSTITUTIONAL SECURITY & PAYPAL ENTERPRISE RAILS */}
      <section id="security" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#003087] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank-Grade Financial Rails</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Zero Custody Risk. <br />Direct Peer-to-Peer Settlement.
          </h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            CreatorPay does not hold your sponsor funds in middleman custodial bank accounts. All transactions move directly over PayPal merchant infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003087] flex items-center justify-center font-bold text-sm mb-4 border border-blue-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">Zero Escrow Custody</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Funds flow directly from the sponsor's PayPal or credit card into your verified PayPal Business merchant balance. We never touch or hold your money.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4 border border-emerald-200">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">Real-Time Webhooks</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every invoice status change, payment completion, and payout delivery is cryptographically verified via PayPal Webhook signatures.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm mb-4 border border-purple-200">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base mb-2">IRS & Tax Compliance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Immutable audit ledger automatically generates 1099-NEC expense exports and contractor receipt logs for clean Schedule C tax deductions.
            </p>
          </div>

        </div>
      </section>

      {/* 8. IMPACT STATS */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              384%
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Average cashflow efficiency gain
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              \$3.9M
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Sponsorship volume modeled
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              0 hrs
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Manual invoice chasing required
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              &lt; 5s
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              PayPal multi-party payout speed
            </p>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA BANNER */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 mb-5">
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
              className="px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all border border-slate-700"
            >
              View GitHub Source Code
            </a>
          </div>
        </div>
      </section>

      {/* 10. CLEAN MINIMALIST FOOTER */}
      <footer className="py-8 bg-white border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900">CreatorPay.AI</span>
            <span>• The Financial Agent for Digital Creators & Agencies</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-950 font-semibold">Studio App</Link>
            <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950">PayPal Developer</a>
            <a href="https://github.com/ius-sharma/CreatorPay-AI" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
