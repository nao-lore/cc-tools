"use client";

import { useState, useCallback } from "react";

type CardType = "summary" | "summary_large_image";

interface CardData {
  title: string;
  description: string;
  imageUrl: string;
  cardType: CardType;
  site: string;
  creator: string;
}

const DEFAULT: CardData = {
  title: "My Awesome Page Title",
  description: "A short description of the page content that appears below the title in the Twitter card.",
  imageUrl: "https://via.placeholder.com/1200x628/1d9bf0/ffffff?text=Twitter+Card+Preview",
  cardType: "summary_large_image",
  site: "@yourbrand",
  creator: "@yourname",
};

function getDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return "example.com";
  }
}

function generateMetaTags(data: CardData): string {
  const lines: string[] = [
    `<meta name="twitter:card" content="${data.cardType}" />`,
    `<meta name="twitter:title" content="${data.title || "Page Title"}" />`,
    `<meta name="twitter:description" content="${data.description || "Page description"}" />`,
  ];
  if (data.imageUrl) {
    lines.push(`<meta name="twitter:image" content="${data.imageUrl}" />`);
  }
  if (data.site) {
    lines.push(`<meta name="twitter:site" content="${data.site.startsWith("@") ? data.site : "@" + data.site}" />`);
  }
  if (data.creator) {
    lines.push(`<meta name="twitter:creator" content="${data.creator.startsWith("@") ? data.creator : "@" + data.creator}" />`);
  }
  return lines.join("\n");
}

function SummaryCard({ data }: { data: CardData }) {
  const domain = getDomain(data.imageUrl || "example.com");
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-sm bg-white shadow-sm">
      {data.imageUrl && (
        <div className="w-24 h-24 flex-shrink-0 float-left">
          <img
            src={data.imageUrl}
            alt="card"
            className="w-24 h-24 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="p-3 overflow-hidden">
        <p className="text-xs text-gray-500 truncate mb-0.5">{domain}</p>
        <p className="text-sm font-bold text-gray-900 truncate leading-tight">
          {data.title || "Page Title"}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-snug">
          {data.description || "Page description"}
        </p>
      </div>
      <div className="clear-both" />
    </div>
  );
}

function LargeImageCard({ data }: { data: CardData }) {
  const domain = getDomain(data.imageUrl || "example.com");
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-sm bg-white shadow-sm">
      {data.imageUrl && (
        <div className="w-full aspect-[1200/628] bg-gray-100 overflow-hidden">
          <img
            src={data.imageUrl}
            alt="card"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="px-3 py-2.5">
        <p className="text-xs text-gray-500 truncate mb-0.5">{domain}</p>
        <p className="text-sm font-bold text-gray-900 truncate leading-tight">
          {data.title || "Page Title"}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-snug">
          {data.description || "Page description"}
        </p>
      </div>
    </div>
  );
}

export default function TwitterCardPreview() {
  const [data, setData] = useState<CardData>(DEFAULT);
  const [copied, setCopied] = useState(false);

  const set = useCallback(<K extends keyof CardData>(key: K, value: CardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const metaTags = generateMetaTags(data);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(metaTags).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [metaTags]);

  return (
    <div className="space-y-8">
      {/* Card type toggle */}
      <div className="flex gap-2">
        {(["summary", "summary_large_image"] as CardType[]).map((type) => (
          <button
            key={type}
            onClick={() => set("cardType", type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              data.cardType === type
                ? "bg-[#1d9bf0] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type === "summary" ? "Summary" : "Summary Large Image"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Page title"
              maxLength={70}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">{data.title.length}/70</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={data.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Page description"
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{data.description.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={data.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Recommended: 1200×628px for large image, 120×120px for summary
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Handle
              </label>
              <input
                type="text"
                value={data.site}
                onChange={(e) => set("site", e.target.value)}
                placeholder="@yourbrand"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creator Handle
              </label>
              <input
                type="text"
                value={data.creator}
                onChange={(e) => set("creator", e.target.value)}
                placeholder="@yourname"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            {/* Simulate X/Twitter dark-ish feed background */}
            <div className="bg-black rounded-2xl p-6 flex justify-center">
              {data.cardType === "summary" ? (
                <SummaryCard data={data} />
              ) : (
                <LargeImageCard data={data} />
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Appearance may vary slightly on Twitter/X
            </p>
          </div>
        </div>
      </div>

      {/* Generated meta tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Generated Meta Tags</p>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              copied
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
          {metaTags}
        </pre>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Twitter Card Preview tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Preview how your page appears in Twitter/X cards. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Twitter Card Preview tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Preview how your page appears in Twitter/X cards. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
