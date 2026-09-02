// src/app/layout.tsx
import { Source_Serif_4, Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import type { Metadata } from 'next'

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif-import",
  weight: ["600", "700"],
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans-import",
});

export const metadata: Metadata = {
  title: 'DST-FIST Smart Microgrid Lab',
  description: 'Academic Website for DST FIST Microgrid Lab',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}