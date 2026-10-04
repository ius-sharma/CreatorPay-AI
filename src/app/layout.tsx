import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CreatorPay AI — Autonomous Dealmaker & PayPal Payout Agent',
  description:
    'Autonomous AI dealmaker that turns creator contracts into milestone PayPal invoices, monitors payments via webhooks, and auto-settles multi-party team payouts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#fbfbfe] text-slate-900 min-h-screen selection:bg-brand-100 selection:text-brand-900 antialiased">
        {children}
      </body>
    </html>
  );
}
