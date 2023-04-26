import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import './globals.css';
import '../lib/polyfills/fetch';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Website Analyzer - SEO, Performance, Security Analysis',
  description: 'Comprehensive website analysis tool for SEO, performance, accessibility, and security.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
