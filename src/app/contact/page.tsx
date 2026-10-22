// src/app/contact/page.jsx  (server component: SEO metadata yahin rehta hai)
import ContactClient from "./ContactClient";

export const metadata = {
  title: "Contact Us | VEDOXA",
  description:
    "Get in touch with the VEDOXA support team for help with file access, downloads, login and payment delivery.",
  openGraph: {
    title: "Contact Us | VEDOXA",
    description: "Get in touch with the VEDOXA support team.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact VEDOXA",
  description: "Technical support for VEDOXA digital books.",
  mainEntity: {
    "@type": "Organization",
    name: "VEDOXA",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "vedoxa1@gmail.com",
      availableLanguage: ["English", "Hindi"],
    },
  },
};

export default function ContactUs() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ContactClient />
    </>
  );
}

