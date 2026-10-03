import type { Metadata } from 'next';
import { Instrument_Sans } from 'next/font/google';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
  weight: ['400', '500', '600', '700'],
});

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
    <html lang="en" className={instrumentSans.variable}>
      <body className={`${instrumentSans.className} bg-[#fbfbfe] text-slate-900 min-h-screen selection:bg-indigo-100 selection:text-indigo-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
