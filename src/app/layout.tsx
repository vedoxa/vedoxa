import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL('https://vedoxa.shop'),
  title: {
    default: 'Vedoxa – Hindi Spirituality, Psychology & Self-Help Digital Books',
    template: '%s | Vedoxa',
  },
  description:
    'Vedoxa Premium Library: Spirituality, mindset, relationship aur psychology par best Hindi digital books aur blogs. Payment ke baad turant access.',
  keywords: [
    'Hindi digital books',
    'spirituality books in Hindi',
    'psychology books in Hindi',
    'self help books Hindi',
    'book summaries in Hindi',
    'Vedoxa',
  ],
  // Har page par automatic Canonical URL banane ke liye (Indexing ke liye bahut zaroori)
  alternates: {
    canonical: './',
  },
  // Google Search, Google Discover aur AI Overviews mein top par suggest hone ke liye
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    siteName: 'Vedoxa Premium Library',
    type: 'website',
    locale: 'hi_IN',
    url: 'https://vedoxa.shop',
    title: 'Vedoxa – Hindi Spirituality, Psychology & Self-Help Digital Books',
    description:
      'Spirituality, mindset aur psychology par Hindi digital books aur practical blogs. Turant access.',
  },
  verification: {
    google: 'VyrJe14oANu7UifdZIx8nDyZNb72fhACt3dv2m9AqM8',
    other: {
      'msvalidate.01': 'F869EDF5C3D1E2BAB4EC07A020186EDF',
      monetag: 'd3a8d1a2e7efeac87a31a2a723b36b6c',
    },
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '48x48' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Google AI aur Search Engine ke liye Structured Data (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Vedoxa',
    alternateName: 'Vedoxa Premium Library',
    url: 'https://vedoxa.shop',
    description:
      'Hindi Digital Books and Blogs on Spirituality, Depth Psychology, and Self-Mastery.',
    inLanguage: ['hi-IN', 'en-IN'],
  };

  return (
    <html lang="hi">
      <body className="bg-black text-white flex flex-col min-h-screen antialiased selection:bg-white/30 selection:text-white">
        {/* Schema Markup for Google & AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <main className="flex-grow">{children}</main>

        <Footer />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
