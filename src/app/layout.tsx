Import './globals.css'; 
import Script from 'next/script';
import Footer from '../components/Footer'; // YAHAN CHANGE KIYA HAI (@/ hata kar ../ lagaya hai)

export const metadata = {
  title: 'Vedoxa Premium Library',
  description: 'Awaken Your Consciousness',
  verification: {
    google: 'VyrJe14oANu7UifdZIx8nDyZNb72fhACt3dv2m9AqM8',
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      // Google search ke liye 48x48 px PNG zaroori hai, isliye isko add kiya hai
      { url: '/icon.png', type: 'image/png', sizes: '48x48' } 
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* NAYA ADD KIYA GAYA CODE: Browser Favicon ke liye */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <meta name="msvalidate.01" content="F869EDF5C3D1E2BAB4EC07A020186EDF" />
      </head>
      <body className="bg-black text-white flex flex-col min-h-screen">
        
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Footer */}
        <Footer />
        
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
