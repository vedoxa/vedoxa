import React from 'react';

export const metadata = {
  title: 'Refund & Cancellation Policy | VEDOXA',
  description: 'Refund and cancellation policies for VEDOXA digital products.',
};

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Refund & Cancellation Policy</h1>
      
      <div className="space-y-6 text-lg leading-relaxed text-gray-300">
        <p>Last updated: April 14, 2026</p>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">1. Digital Products</h2>
          <p>
            VEDOXA deals exclusively in digital products, including downloadable PDFs and E-books. 
            Due to the nature of digital goods, we do not offer refunds or cancellations once a purchase is successfully completed and the download link has been generated.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">2. Exceptions</h2>
          <p>
            Refunds will only be considered under the following strictly defined technical circumstances:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Multiple accidental deductions for the exact same product within a 1-hour window.</li>
            <li>The downloaded PDF file is proven to be corrupted and our technical team cannot provide a working copy within 48 hours.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3 text-white">3. Contact for Support</h2>
          <p>
            If you face any issues with your payment or download, please reach out to our support desk.
            <br />
            <strong>Email:</strong> vedoxa1@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
