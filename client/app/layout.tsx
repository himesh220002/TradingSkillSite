import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Trading Skill Trainer | Master Stock Market Trading with Krishna",
    template: "%s | Trading Skill Trainer"
  },
  description: "Join Krishna's premier Trading Skills Class in Katihar, Bihar. Master Technical Analysis, Risk Management, and Market Psychology with the best stock market training in India.",
  keywords: [
    "Trading Skills Class Katihar", 
    "Stock Market Training Bihar", 
    "Krishna Trading Academy", 
    "Technical Analysis Course India", 
    "Best Trading Classes in Katihar", 
    "Learn Stock Trading Bihar",
    "Share Market Classes Hindi",
    "Intraday Trading Course Krishna"
  ],
  authors: [{ name: "Krishna", url: "https://tradingskilltrainer.com" }],
  creator: "Krishna",
  publisher: "Trading Skill Trainer",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tradingskilltrainer.com",
    title: "Trading Skill Trainer | Stock Market Mastery with Krishna",
    description: "Expert-led trading education from Katihar to all of India. Join 100+ students mastering the markets.",
    siteName: "Trading Skill Trainer",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Trading Skill Trainer Academy"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trading Skill Trainer | Master the Markets",
    description: "Premium stock market training in Katihar, Bihar and across India.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Trading Skill Trainer",
              "description": "Premium stock market training and trading skills classes led by Krishna.",
              "url": "https://tradingskilltrainer.com",
              "logo": "https://tradingskilltrainer.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Katihar",
                "addressRegion": "Bihar",
                "addressCountry": "IN"
              },
              "instructor": {
                "@type": "Person",
                "name": "Krishna"
              },
              "hasCourse": {
                "@type": "Course",
                "name": "Master Trading Course",
                "description": "A comprehensive 3-month track to master the stock market.",
                "provider": "Trading Skill Trainer"
              }
            })
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
