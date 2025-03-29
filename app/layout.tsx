import type React from 'react';
import type { Metadata } from 'next';
import { Geist, Azeret_Mono as Geist_Mono } from 'next/font/google';
import './globals.css';
import WalletProviderClient from '../clients/walletProviderClient';
import { Toaster } from '@/components/ui/toaster';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Algopotato',
  description: 'A battleground for testing Psuedorandomness on Algorand',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-fit`}
      >
        <WalletProviderClient>
          <Navbar />
          {children}
          <Footer />
          <Toaster />
        </WalletProviderClient>
      </body>
    </html>
  );
}
