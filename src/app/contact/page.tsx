import React from 'react';

export const metadata = {
  title: 'Contact Us | VEDOXA',
  description: 'Get in touch with the VEDOXA support team.',
};

export default function ContactUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen text-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-yellow-500">Contact Us</h1>
      
      <div className="space-y-6 text-lg leading-relaxed text-gray-300">
        <p>
          At VEDOXA, we are committed to providing seamless access to our premium digital library. If you face any technical difficulties accessing your downloaded file, our support team is here to help.
        </p>

        <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Technical Support Desk</h2>
          <p className="mb-2"><strong>Email:</strong> vedoxa1@gmail.com</p>
          <p className="mb-2"><strong>Response Time:</strong> 24-48 Business Hours</p>
        </section>

        <section className="mt-8 border-l-4 border-red-500 pl-4">
          <h2 className="text-xl font-semibold mb-2 text-white">Important Notice Regarding Refunds</h2>
          <p>
            Please note that as per our platform policies, all sales are absolute and final. <strong>Do not contact support requesting a refund or cancellation</strong>, as our system does not allow for reverse transactions on successfully delivered digital goods under any circumstances. Support is strictly limited to technical assistance for file access.
          </p>
        </section>
      </div>
    </div>
  );
}
