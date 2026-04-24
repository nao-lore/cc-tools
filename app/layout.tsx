import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.loresync.dev"),
  verification: {
    google: "uRTAz7j8N8jDW5BzJaGn-wzrFY5C7KNStVLMKlGzo_4",
  },
  title: {
    default: "Free Online Developer Tools - 53+ Web Tools | cc-tools",
    template: "%s | cc-tools",
  },
  description:
    "Collection of 53+ free online developer tools. JSON formatter, regex tester, color converter, CSS generators, encoding/decoding tools, and more. No signup required.",
  keywords: [
    "free developer tools",
    "online tools",
    "web tools",
    "json formatter",
    "css generator",
    "encoding tools",
    "developer utilities",
  ],
  authors: [{ name: "cc-tools" }],
  openGraph: {
    title: "Free Online Developer Tools - 53+ Web Tools | cc-tools",
    description:
      "Collection of 53+ free online developer tools. JSON formatter, regex tester, color converter, CSS generators, encoding/decoding tools, and more. No signup required.",
    url: "https://tools.loresync.dev",
    siteName: "cc-tools",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Developer Tools - 53+ Web Tools | cc-tools",
    description:
      "Collection of 53+ free online developer tools. JSON formatter, regex tester, color converter, CSS generators, encoding/decoding tools, and more. No signup required.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://tools.loresync.dev",
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "cc-tools - Free Online Developer Tools",
              description:
                "Collection of 53+ free online developer tools. JSON formatter, regex tester, color converter, CSS generators, encoding/decoding tools, and more.",
              url: "https://tools.loresync.dev",
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-gray-950 text-gray-100">
        {children}
      </body>
    </html>
  );
}
