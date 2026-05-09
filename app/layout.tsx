import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { tools } from "@/lib/tools-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const toolCount = tools.length;
const siteTitle = `無料オンラインツール集 - ${toolCount}+ Web Tools | cc-tools`;
const siteDescription = `${toolCount}以上の無料オンラインツール集。AI料金、SaaS料金、税金、開発、変換、デザイン計算まで登録不要で使えます。`;

export const metadata: Metadata = {
  metadataBase: new URL("https://tools.loresync.dev"),
  verification: {
    google: "uRTAz7j8N8jDW5BzJaGn-wzrFY5C7KNStVLMKlGzo_4",
  },
  title: {
    default: siteTitle,
    template: "%s | cc-tools",
  },
  description: siteDescription,
  keywords: [
    "無料オンラインツール",
    "AI料金計算",
    "SaaS料金計算",
    "税金計算",
    "開発者ツール",
    "変換ツール",
    "web tools",
  ],
  authors: [{ name: "cc-tools" }],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://tools.loresync.dev",
    siteName: "cc-tools",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-FG307M9WPF" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-FG307M9WPF');`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "cc-tools - 無料オンラインツール集",
              description: siteDescription,
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
