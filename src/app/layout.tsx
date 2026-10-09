import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
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
    <html lang="en" className={jakarta.variable}>
      <body className="bg-[#FFFDFC] dark:bg-[#120D0B] text-[#2B1D19] dark:text-[#FDF8F6] font-sans min-h-screen selection:bg-brand-100 selection:text-brand-900 antialiased">
        {children}
      </body>
    </html>
  );
}
