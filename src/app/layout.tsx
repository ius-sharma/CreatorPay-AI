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
  title: 'CreatorPay — Contracts, Evidence & Creator Payments',
  description:
    'Review creator contract terms, check deliverable evidence, and track verified PayPal sandbox invoices and collaborator payouts in one workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-background text-foreground font-sans min-h-screen selection:bg-brand-100 selection:text-brand-900 antialiased">
        {children}
      </body>
    </html>
  );
}
