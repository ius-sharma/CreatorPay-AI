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
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-sky-500/30 selection:text-sky-200 antialiased">
        {children}
      </body>
    </html>
  );
}
