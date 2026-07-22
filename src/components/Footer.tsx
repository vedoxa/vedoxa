'use client'; // Ye lagana zaroori hai kyunki hum current page/route check kar rahe hain

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();

  // Condition: Sirf Main page ('/') aur About page ('/about') par pura footer dikhega
  const showFullFooter = pathname === '/' || pathname === '/about';

  // Agar user kisi dusre page par hai, toh sirf ek patli premium line dikhegi
  if (!showFullFooter) {
    return (
      <footer className="w-full py-10 mt-auto flex justify-center items-center">
        {/* Apple style soft gradient divider */}
        <div className="w-[85%] max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent"></div>
      </footer>
    );
  }

  // Pura Footer - Home aur About page ke liye (Apple UI/UX Style)
  return (
    <footer className="w-full bg-black border-t border-white/10 py-14 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          
          {/* Brand Name & Copyright */}
          <div className="text-center md:text-left flex flex-col space-y-2">
            <h2 className="text-2xl font-semibold text-gray-100 tracking-widest uppercase">
              VEDOXA
            </h2>
            <p className="text-[#86868b] text-[13px] font-light">
              © {new Date().getFullYear()} Vedoxa Premium Library. All rights reserved.
            </p>
          </div>

          {/* Legal Links - Razorpay Approval ke liye zaroori (Apple Hover Style) */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[13px] font-medium">
            <Link href="/contact" className="text-[#86868b] hover:text-white transition-colors duration-300 ease-out">
              Contact Us
            </Link>
            <Link href="/terms" className="text-[#86868b] hover:text-white transition-colors duration-300 ease-out">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-[#86868b] hover:text-white transition-colors duration-300 ease-out">
              Privacy Policy
            </Link>
            <Link href="/refund" className="text-[#86868b] hover:text-white transition-colors duration-300 ease-out">
              Refund & Cancellation
            </Link>
          </div>

        </div>

        {/* Disclaimer for Digital Goods - Subtle & Minimal */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[12px] text-[#555557] font-light tracking-wide">
          <p>Strict No-Refund Policy applies to all digital library assets once accessed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
