import Script from 'next/script';

export const metadata = {
  title: 'Vedoxa Premium Library',
  description: 'Awaken Your Consciousness',
  verification: {
    google: 'VyrJe14oANu7UifdZIx8nDyZNb72fhACt3dv2m9AqM8',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Google Analytics Script */}
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
      </body>
    </html>
  );
}
