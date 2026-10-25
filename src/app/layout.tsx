import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  // Isse sabhi page ke link (canonical, share image) sahi domain se bante hain
  metadataBase: new URL('https://vedoxa.shop'),
  title: {
    default: 'Vedoxa – Hindi Spirituality & Psychology Digital Books',
    template: '%s | Vedoxa',
  },
  description:
    'Vedoxa Premium Library: spirituality, mindset aur psychology par Hindi digital books. Payment ke baad turant access, surakshit Razorpay payment.',
  openGraph: {
    siteName: 'Vedoxa Premium Library',
    type: 'website',
    locale: 'hi_IN',
    url: '/',
    title: 'Vedoxa – Hindi Spirituality & Psychology Digital Books',
    description:
      'Spirituality, mindset aur psychology par Hindi digital books. Turant access.',
  },
  verification: {
    google: 'VyrJe14oANu7UifdZIx8nDyZNb72fhACt3dv2m9AqM8',
    other: {
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
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <meta name="msvalidate.01" content="F869EDF5C3D1E2BAB4EC07A020186EDF" />
        <meta name="monetag" content="d3a8d1a2e7efeac87a31a2a723b36b6c" />
      </head>
      <body className="bg-black text-white flex flex-col min-h-screen antialiased selection:bg-white/30 selection:text-white">
        <main className="flex-grow">{children}</main>

        <Footer />

        {/* Google Analytics: sirf tab chalega jab Vercel me NEXT_PUBLIC_GA_ID set ho */}
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
