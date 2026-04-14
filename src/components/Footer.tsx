import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand Name & Copyright */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-yellow-500 tracking-wider">VEDOXA</h2>
            <p className="text-gray-500 text-sm mt-2">
              © {new Date().getFullYear()} Vedoxa Premium Library. All rights reserved.
            </p>
          </div>

          {/* Legal Links - Razorpay Approval ke liye zaroori */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/contact" className="text-gray-400 hover:text-yellow-500 transition-colors">
              Contact Us
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-yellow-500 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-yellow-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund" className="text-gray-400 hover:text-yellow-500 transition-colors">
              Refund & Cancellation
            </Link>
          </div>

        </div>

        {/* Disclaimer for Digital Goods */}
        <div className="mt-8 pt-8 border-t border-gray-900 text-center text-xs text-gray-600">
          <p>Strict No-Refund Policy applies to all digital library assets once accessed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
