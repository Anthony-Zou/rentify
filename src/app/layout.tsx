import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Borlo — Rent anything on campus",
  description: "P2P rental marketplace for university students in Singapore. Rent anything from fellow students.",
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Borlo',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Borlo — Rent anything on campus',
    description: 'P2P rental marketplace for university students in Singapore.',
    url: 'https://borlo.app',
    siteName: 'Borlo',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Borlo',
      url: 'https://www.borlo.app',
      description: 'University-first peer-to-peer rental marketplace for Singapore students. Rent cameras, suits, gaming consoles and more from fellow students.',
    },
    {
      '@type': 'Organization',
      name: 'Borlo',
      url: 'https://www.borlo.app',
      email: 'hello@borlo.app',
      foundingDate: '2025',
      foundingLocation: 'Singapore',
      description: 'P2P rental marketplace for university students in Singapore.',
      member: [
        { '@type': 'Person', name: 'Justin', jobTitle: 'Co-Founder & CEO' },
        { '@type': 'Person', name: 'Kenneth', jobTitle: 'Co-Founder & CFO' },
        { '@type': 'Person', name: 'Anthony', jobTitle: 'Co-Founder & CTO' },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
