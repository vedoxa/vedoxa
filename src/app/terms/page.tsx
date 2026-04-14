import React from 'react';

export const metadata = {
  title: 'Terms & Conditions | VEDOXA',
  description: 'Terms and conditions for using VEDOXA services.',
};

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Terms & Conditions</h1>
      
      <div className="space-y-6 text-lg leading-relaxed text-gray-300">
        <p>Last updated: April 14, 2026</p>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and purchasing from VEDOXA, you agree to be bound by these Terms and Conditions. All products sold are digital files (PDFs/E-books) and are subject to copyright protection.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Strict "No Refund" Policy</h2>
          <p>
            <strong>All sales are strictly final.</strong> By completing a purchase on our platform, you explicitly acknowledge and agree that VEDOXA provides immediate access to digital assets. Therefore, <strong>no refunds, cancellations, or exchanges will be processed under any circumstances whatsoever</strong> once the payment is successful.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Intellectual Property</h2>
          <p>
            The content provided is for personal use only. You may not distribute, modify, transmit, reuse, download, repost, copy, or use the content of the VEDOXA library for commercial purposes without explicit permission.
          </p>
        </section>
      </div>
    </div>
  );
}

