import './globals.css'; // Tailwind CSS load karne ke liye
import Script from 'next/script';
import Footer from '@/components/Footer';

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
      {/* flex-col aur min-h-screen ensure karega ki chote pages par bhi Footer sabse niche rahe */}
      <body className="bg-black text-white flex flex-col min-h-screen">
        
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* VEDOXA Footer with Legal Links */}
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
