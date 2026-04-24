import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ReviewModeBanner } from "@/components/ui/ReviewModeBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#163126",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://sundays-cookies.vercel.app"),
  title: "Sundays | The Cookie, Mastered",
  description: "Small-batch, 24-hour cookies. Baked every Sunday in Hyderabad. Artisanal quality delivered in weekly drops.",
  keywords: ["Sundays cookies", "Hyderabad bakery", "small-batch cookies", "weekly cookie drops", "artisanal cookies Hyderabad"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sundays | The Cookie, Mastered",
    description: "Small-batch cookies, released in weekly drops. Baked every Sunday in Hyderabad.",
    url: "https://sundays-cookies.vercel.app",
    siteName: "Sundays",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Sundays Cookies - The 24-Hour Cookie",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sundays | The Cookie, Mastered",
    description: "Small-batch cookies, released in weekly drops. Baked every Sunday in Hyderabad.",
    images: ["/images/hero.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sundays Hyderabad",
    "image": "https://sundays-cookies.vercel.app/images/hero.png",
    "@id": "https://sundays-cookies.vercel.app",
    "url": "https://sundays-cookies.vercel.app",
    "telephone": "",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Hyderabad",
      "addressRegion": "Telangana",
      "addressCountry": "IN"
    },
    "description": "Premium small-batch cookies in Hyderabad. The 24-hour cookie, mastered.",
    "sameAs": [
      "https://instagram.com/sundays.hyd"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable} h-full antialiased scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-forest font-sans">
        {children}
        <ReviewModeBanner />
      </body>
    </html>
  );
}
