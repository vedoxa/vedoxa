import React from 'react';

export const metadata = {
  title: 'Privacy Policy | VEDOXA',
  description: 'Privacy policy for VEDOXA users.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Privacy Policy</h1>
      
      <div className="space-y-6 text-lg leading-relaxed text-gray-300">
        <p>Last updated: April 14, 2026</p>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Information Collection</h2>
          <p>
            To process your transactions securely, VEDOXA collects basic identifiable information such as your Name, Email Address, and Phone Number. Payment processing is handled exclusively by Razorpay via secure, encrypted API connections. We do not store your credit card or UPI details on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Data Usage & Dispute Resolution</h2>
          <p>
            The data collected is used strictly to deliver your digital product (PDF/E-book) and send transaction receipts. In the event of a payment dispute, access logs and email delivery confirmations will be utilized as definitive proof of service fulfillment to enforce our strict "No Refund" policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Third-Party Services</h2>
          <p>
            We may use third-party analytics and cloud database services (e.g., Supabase, Google Analytics) to monitor website traffic and ensure system stability. These services are bound by their respective strict privacy frameworks.
          </p>
        </section>
      </div>
    </div>
  );
}
