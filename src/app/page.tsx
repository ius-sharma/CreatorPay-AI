'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  CreditCard, 
  Clock, 
  FileText, 
  ChevronRight, 
  ExternalLink,
  Layers,
  Send,
  Video
} from 'lucide-react';

export default function LandingPage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'invoicing' | 'webhooks' | 'payouts'>('invoicing');

  return (
    <div className="min-h-screen bg-[#ffffff] text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden relative">
      
      {/* 1. TOP FLOATING PILL NAVBAR (FIXED ON SCROLL) */}
      <div className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <header className="max-w-6xl mx-auto rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md px-5 sm:px-7 py-3 flex items-center justify-between transition-all pointer-events-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="font-extrabold text-xl tracking-tight text-slate-950">
              CreatorPay<span className="text-brand-600">.AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">Workflow</a>
            <a href="#paypal-tech" className="hover:text-slate-950 transition-colors">PayPal Tech</a>
            <a href="#splits" className="hover:text-slate-950 transition-colors">Team Splits</a>
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
              className="flex items-center space-x-1.5 px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>Launch Studio App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>
      </div>

      {/* 2. HERO SECTION WITH CONCENTRIC ORBIT RINGS */}
      <section className="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        
        {/* Background Concentric Orbital Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[450px] h-[450px] rounded-full border border-slate-200/60 absolute" />
          <div className="w-[750px] h-[750px] rounded-full border border-slate-200/50 absolute" />
          <div className="w-[1050px] h-[1050px] rounded-full border border-slate-200/30 absolute" />
          <div className="w-[1350px] h-[1350px] rounded-full border border-slate-100 absolute" />
        </div>

        {/* Orbiting App Integration Badges */}
        <div className="hidden lg:block absolute inset-0 pointer-events-none max-w-6xl mx-auto">
          {/* Left Ring Badges */}
          <div className="absolute top-24 left-16 w-11 h-11 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center animate-pulse">
            <span className="font-bold text-xs text-[#003087]">PayPal</span>
          </div>
          <div className="absolute top-56 left-6 w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-red-600" />
          </div>
          <div className="absolute bottom-40 left-20 w-11 h-11 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
            <span className="font-bold text-xs text-sky-600">Slack</span>
          </div>

          {/* Right Ring Badges */}
          <div className="absolute top-24 right-16 w-11 h-11 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center animate-pulse">
            <span className="font-bold text-xs text-brand-600">Stripe</span>
          </div>
          <div className="absolute top-60 right-8 w-10 h-10 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
            <span className="font-bold text-xs text-slate-800">Notion</span>
          </div>
          <div className="absolute bottom-40 right-20 w-11 h-11 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center">
            <span className="font-bold text-xs text-emerald-600">Shopify</span>
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PayPal AI Hackathon 2026</span>
            <span className="text-slate-300">•</span>
            <span className="text-brand-700 font-bold">Track 2: Merchant Solutions</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] mb-6">
            AI-powered tools to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-slate-950 via-brand-700 to-slate-900 bg-clip-text text-transparent">
              stay organized & settled
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            From raw sponsorship contracts to automated milestone PayPal invoices, webhook payment tracking, and instant multi-party team splits — manage everything autonomously in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <Link
              href="/dashboard"
              className="px-7 py-3 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Launch Studio App Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-all shadow-2xs"
            >
              Explore 5-Phase Architecture
            </a>
          </div>

          {/* 3. FLOATING GLASSMORPHISM ACTIVITY STACK OVER RADIANT AURA */}
          <div className="relative max-w-md mx-auto pt-2">
            {/* Dreamy Soft Radial Glow Aura */}
            <div className="absolute -inset-8 bg-gradient-to-tr from-sky-200/50 via-brand-200/40 to-indigo-100/40 rounded-full blur-2xl -z-10" />

            {/* Stacked Interactive Activity Pills */}
            <div className="space-y-2.5">
              {/* Card 1: Payout Disbursed */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg text-left flex items-center justify-between hover:scale-[1.02] transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Aman Verma <span className="font-normal text-slate-500">(Lead Editor) received $300.00</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">2 min ago • via PayPal Payouts API (15% Cut)</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Settled
                </span>
              </div>

              {/* Card 2: Webhook Clearance */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg text-left flex items-center justify-between hover:scale-[1.02] transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#003087] flex items-center justify-center font-bold text-xs border border-blue-200">
                    P
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      CloudHost Inc. <span className="font-normal text-slate-500">cleared Milestone 1 ($600)</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Real-time Webhook: INVOICING.INVOICE.PAID</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#003087] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Verified
                </span>
              </div>

              {/* Card 3: AI Deliverable Verified */}
              <div className="p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-lg text-left flex items-center justify-between hover:scale-[1.02] transition-transform">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs border border-brand-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      AI Agent <span className="font-normal text-slate-500">verified YouTube Sponsor Tag</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Tag #cloudhost & UTM discount confirmed at 02:15</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                  98% Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LOGO CLOUD STRIP */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Engineered on the PayPal Developer Ecosystem • Built for Modern Digital Merchants
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-bold text-sm">
            <span className="hover:text-slate-700 transition-colors font-mono">PayPal Sandbox</span>
            <span className="hover:text-slate-700 transition-colors">YouTube</span>
            <span className="hover:text-slate-700 transition-colors">Stripe</span>
            <span className="hover:text-slate-700 transition-colors">Shopify</span>
            <span className="hover:text-slate-700 transition-colors">Gumroad</span>
            <span className="hover:text-slate-700 transition-colors">Notion</span>
            <span className="hover:text-slate-700 transition-colors">Discord</span>
          </div>
        </div>
      </section>

      {/* 5. SECTION 2: SIMPLIFY TASK MANAGEMENT (BENTO 4-CARD GRID) */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            Simplify deal management <br />for modern creator teams
          </h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Break down complex brand contracts into manageable milestone invoices, track progress in real time, and help your crew get paid on time.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center mb-5 shadow-2xs">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Entire team aligned</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Keep editors, thumbnail artists, and scriptwriters on the same page with clear milestone splits, shared goals, and instant automated payout alerts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
              <span>Automated Payout Rule</span>
              <span className="text-brand-700">15% Video Editor Cut</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center mb-5 shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">5+ hours saved every week</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Eliminate manual invoice drafting in Word, chasing late brand wire transfers, and calculating contractor percentages on personal calculators.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
              <span>PayPal Invoicing API v2</span>
              <span className="text-emerald-700">0 Manual Steps</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#003087] flex items-center justify-center mb-5 shadow-2xs">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">Zero payment chasing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enforce mandatory 30% or 50% upfront milestone advances before camera rolling begins. Brands pay securely via official PayPal payment links.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
              <span>Advance Escrow Lock</span>
              <span className="text-[#003087]">Cleared Before Production</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-8 rounded-3xl bg-slate-50/60 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-purple-600 flex items-center justify-center mb-5 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">100% Tax & Audit compliance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Immutable ledger recording official PayPal Payout Batch IDs, verified contractor W-9s, and 1099-NEC deductible contractor expense export.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono font-bold text-slate-800">
              <span>IRS Schedule C Deductions</span>
              <span className="text-purple-700">1-Click CSV Export</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 3: MANAGE DEALS FASTER WITH YOUR TEAM (INTERACTIVE PILL SHOWCASE) */}
      <section id="how-it-works" className="py-20 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Manage deals faster with your team
            </h2>
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">
              Collaborate with your video editors, designers, and sponsors in real time with an autonomous payment workflow.
            </p>

            {/* Interactive Feature Pills */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {[
                { id: 'invoicing', label: '1. Invoicing API v2' },
                { id: 'webhooks', label: '2. Webhook Engine' },
                { id: 'payouts', label: '3. Multi-Party Payouts' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeatureTab(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeFeatureTab === tab.id
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Feature Card Preview */}
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
            {activeFeatureTab === 'invoicing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900">Milestone Invoice Generator</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#003087]">
                    PayPal Invoicing API v2
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Creator drops raw brand agreement: <code className="bg-slate-100 px-2 py-0.5 rounded text-brand-700 font-mono font-bold">"$2,000 deal with CloudHost, 30% advance"</code>. The AI agent generates and transmits an official, compliant PayPal invoice with one-click payment links.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Invoice Number:</span>
                    <span className="font-bold text-slate-900">#INV-883901</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Recipient Brand:</span>
                    <span className="font-bold text-slate-900">sponsorships@cloudhost.com</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Advance Milestone (30%):</span>
                    <span className="font-bold text-[#003087]">$600.00 USD</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'webhooks' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900">Real-Time Event Listener</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    PayPal Webhooks API
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The millisecond brand accounts payable clicks "Pay with PayPal", the webhook emits <code className="bg-slate-100 px-2 py-0.5 rounded text-emerald-700 font-mono font-bold">INVOICING.INVOICE.PAID</code>, advancing contract state and alerting editors without polling.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Webhook Event:</span>
                    <span className="font-bold text-emerald-700">INVOICING.INVOICE.PAID</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>State Transition:</span>
                    <span className="font-bold text-slate-900">advance_invoiced ➔ in_production</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Automated Notification:</span>
                    <span className="font-bold text-slate-900">"Production unlocked for Aman (Editor)"</span>
                  </div>
                </div>
              </div>
            )}

            {activeFeatureTab === 'payouts' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-900">Multi-Party Batch Disbursement</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                    PayPal Payouts API v1
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upon verified video delivery and final settlement ($1,400 balance), the agent routes exact cuts: 15% ($300) to editor Aman, $50 to designer Rohan, and $1,650 net remainder to creator.
                </p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Batch ID:</span>
                    <span className="font-bold text-brand-700">#CP-BATCH-77491</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Editor Aman (15%):</span>
                    <span className="font-bold text-slate-900">$300.00 Transferred ✓</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Designer Rohan (Fixed):</span>
                    <span className="font-bold text-slate-900">$50.00 Transferred ✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. SECTION 4: IMPACT NUMBERS STRIP */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              384%
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Average creator cashflow efficiency gain
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              \$3.9M
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Deal volume modeled in sandbox
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              92,400
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Hours of manual chasing saved
            </p>
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight tabular-nums">
              &lt; 10s
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Instant multi-party PayPal Payout speed
            </p>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Your all-in-one creator dealmaker workspace
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-8 font-normal leading-relaxed">
            Experience the future of agentic commerce. Watch how AI and the PayPal Developer Platform automate the entire sponsorship lifecycle.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
            >
              Launch Live Sandbox Demo ➔
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

      {/* 9. MINIMALIST FOOTER */}
      <footer className="py-8 bg-white border-t border-slate-200/80 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900">CreatorPay.AI</span>
            <span>• Built for the PayPal AI Hackathon 2026</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-950">Studio Dashboard</Link>
            <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950">PayPal Developer</a>
            <a href="https://github.com/ius-sharma/CreatorPay-AI" target="_blank" rel="noopener noreferrer" className="hover:text-slate-950">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
