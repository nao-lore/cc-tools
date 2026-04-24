"use client";

import { useState, useMemo, useCallback } from "react";

interface MetaState {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robotsIndex: "index" | "noindex";
  robotsFollow: "follow" | "nofollow";
  canonical: string;
  viewport: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  twitterCard: "summary" | "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

const defaultState: MetaState = {
  title: "",
  description: "",
  keywords: "",
  author: "",
  robotsIndex: "index",
  robotsFollow: "follow",
  canonical: "",
  viewport: "width=device-width, initial-scale=1",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogUrl: "",
  ogType: "website",
  ogSiteName: "",
  twitterCard: "summary_large_image",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
};

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color =
    len === 0
      ? "text-gray-400"
      : len <= max
        ? "text-green-600"
        : "text-red-600";
  return (
    <span className={`text-xs ${color}`}>
      {len}/{max}
    </span>
  );
}

export default function MetaTagGenerator() {
  const [meta, setMeta] = useState<MetaState>(defaultState);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "google" | "facebook" | "twitter">("code");

  const set = useCallback(
    <K extends keyof MetaState>(key: K, value: MetaState[K]) => {
      setMeta((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const generatedTags = useMemo(() => {
    const lines: string[] = [];
    lines.push(`<meta charset="UTF-8">`);
    if (meta.viewport)
      lines.push(`<meta name="viewport" content="${meta.viewport}">`);
    if (meta.title) lines.push(`<title>${meta.title}</title>`);
    if (meta.description)
      lines.push(
        `<meta name="description" content="${meta.description}">`
      );
    if (meta.keywords)
      lines.push(`<meta name="keywords" content="${meta.keywords}">`);
    if (meta.author)
      lines.push(`<meta name="author" content="${meta.author}">`);
    lines.push(
      `<meta name="robots" content="${meta.robotsIndex}, ${meta.robotsFollow}">`
    );
    if (meta.canonical)
      lines.push(`<link rel="canonical" href="${meta.canonical}">`);

    // Open Graph
    const ogTitle = meta.ogTitle || meta.title;
    const ogDesc = meta.ogDescription || meta.description;
    const ogUrl = meta.ogUrl || meta.canonical;
    if (ogTitle) lines.push(`<meta property="og:title" content="${ogTitle}">`);
    if (ogDesc)
      lines.push(`<meta property="og:description" content="${ogDesc}">`);
    if (meta.ogImage)
      lines.push(`<meta property="og:image" content="${meta.ogImage}">`);
    if (ogUrl) lines.push(`<meta property="og:url" content="${ogUrl}">`);
    if (meta.ogType)
      lines.push(`<meta property="og:type" content="${meta.ogType}">`);
    if (meta.ogSiteName)
      lines.push(
        `<meta property="og:site_name" content="${meta.ogSiteName}">`
      );

    // Twitter
    lines.push(
      `<meta name="twitter:card" content="${meta.twitterCard}">`
    );
    const twTitle = meta.twitterTitle || ogTitle;
    const twDesc = meta.twitterDescription || ogDesc;
    const twImage = meta.twitterImage || meta.ogImage;
    if (twTitle)
      lines.push(`<meta name="twitter:title" content="${twTitle}">`);
    if (twDesc)
      lines.push(
        `<meta name="twitter:description" content="${twDesc}">`
      );
    if (twImage)
      lines.push(`<meta name="twitter:image" content="${twImage}">`);

    return lines.join("\n");
  }, [meta]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const selectClass =
    "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const googleTitle = meta.title || "Page Title";
  const googleDesc = meta.description || "Page description will appear here.";
  const googleUrl = meta.canonical || "https://example.com";

  const fbTitle = meta.ogTitle || meta.title || "Page Title";
  const fbDesc =
    meta.ogDescription || meta.description || "Page description will appear here.";
  const fbUrl = meta.ogUrl || meta.canonical || "example.com";

  const twTitle = meta.twitterTitle || meta.ogTitle || meta.title || "Page Title";
  const twDesc =
    meta.twitterDescription ||
    meta.ogDescription ||
    meta.description ||
    "Page description will appear here.";
  const twImage = meta.twitterImage || meta.ogImage;

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Basic + Robots */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Meta Tags
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <label className={labelClass}>Title</label>
                  <CharCount value={meta.title} max={60} />
                </div>
                <input
                  className={inputClass}
                  value={meta.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="My Awesome Website"
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <label className={labelClass}>Description</label>
                  <CharCount value={meta.description} max={160} />
                </div>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={meta.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="A brief description of your page for search engines."
                />
              </div>
              <div>
                <label className={labelClass}>Keywords</label>
                <input
                  className={inputClass}
                  value={meta.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input
                  className={inputClass}
                  value={meta.author}
                  onChange={(e) => set("author", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={labelClass}>Canonical URL</label>
                <input
                  className={inputClass}
                  value={meta.canonical}
                  onChange={(e) => set("canonical", e.target.value)}
                  placeholder="https://example.com/page"
                />
              </div>
              <div>
                <label className={labelClass}>Viewport</label>
                <input
                  className={inputClass}
                  value={meta.viewport}
                  onChange={(e) => set("viewport", e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>Robots Index</label>
                  <select
                    className={`${selectClass} w-full`}
                    value={meta.robotsIndex}
                    onChange={(e) =>
                      set("robotsIndex", e.target.value as "index" | "noindex")
                    }
                  >
                    <option value="index">index</option>
                    <option value="noindex">noindex</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Robots Follow</label>
                  <select
                    className={`${selectClass} w-full`}
                    value={meta.robotsFollow}
                    onChange={(e) =>
                      set(
                        "robotsFollow",
                        e.target.value as "follow" | "nofollow"
                      )
                    }
                  >
                    <option value="follow">follow</option>
                    <option value="nofollow">nofollow</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: OG + Twitter */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Open Graph Tags
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>og:title</label>
                <input
                  className={inputClass}
                  value={meta.ogTitle}
                  onChange={(e) => set("ogTitle", e.target.value)}
                  placeholder={meta.title || "Falls back to title"}
                />
              </div>
              <div>
                <label className={labelClass}>og:description</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={meta.ogDescription}
                  onChange={(e) => set("ogDescription", e.target.value)}
                  placeholder={meta.description || "Falls back to description"}
                />
              </div>
              <div>
                <label className={labelClass}>og:image</label>
                <input
                  className={inputClass}
                  value={meta.ogImage}
                  onChange={(e) => set("ogImage", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className={labelClass}>og:url</label>
                <input
                  className={inputClass}
                  value={meta.ogUrl}
                  onChange={(e) => set("ogUrl", e.target.value)}
                  placeholder={meta.canonical || "Falls back to canonical URL"}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelClass}>og:type</label>
                  <select
                    className={`${selectClass} w-full`}
                    value={meta.ogType}
                    onChange={(e) => set("ogType", e.target.value)}
                  >
                    <option value="website">website</option>
                    <option value="article">article</option>
                    <option value="profile">profile</option>
                    <option value="book">book</option>
                    <option value="music.song">music.song</option>
                    <option value="video.movie">video.movie</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>og:site_name</label>
                  <input
                    className={inputClass}
                    value={meta.ogSiteName}
                    onChange={(e) => set("ogSiteName", e.target.value)}
                    placeholder="My Website"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Twitter Card Tags
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Card Type</label>
                <select
                  className={`${selectClass} w-full`}
                  value={meta.twitterCard}
                  onChange={(e) =>
                    set(
                      "twitterCard",
                      e.target.value as "summary" | "summary_large_image"
                    )
                  }
                >
                  <option value="summary">summary</option>
                  <option value="summary_large_image">
                    summary_large_image
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>twitter:title</label>
                <input
                  className={inputClass}
                  value={meta.twitterTitle}
                  onChange={(e) => set("twitterTitle", e.target.value)}
                  placeholder={
                    meta.ogTitle || meta.title || "Falls back to og:title / title"
                  }
                />
              </div>
              <div>
                <label className={labelClass}>twitter:description</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={meta.twitterDescription}
                  onChange={(e) => set("twitterDescription", e.target.value)}
                  placeholder={
                    meta.ogDescription ||
                    meta.description ||
                    "Falls back to og:description / description"
                  }
                />
              </div>
              <div>
                <label className={labelClass}>twitter:image</label>
                <input
                  className={inputClass}
                  value={meta.twitterImage}
                  onChange={(e) => set("twitterImage", e.target.value)}
                  placeholder={meta.ogImage || "Falls back to og:image"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Output & Preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(
            [
              ["code", "Generated Tags"],
              ["google", "Google Preview"],
              ["facebook", "Facebook Preview"],
              ["twitter", "Twitter Preview"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Generated Code */}
          {activeTab === "code" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-gray-500">
                  Copy and paste into your{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                    &lt;head&gt;
                  </code>{" "}
                  section
                </p>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {copied ? "Copied!" : "Copy All Tags"}
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {generatedTags}
              </pre>
            </div>
          )}

          {/* Google Preview */}
          {activeTab === "google" && (
            <div className="max-w-xl">
              <p className="text-xs text-gray-400 mb-3">
                Approximate Google Search Result
              </p>
              <div className="space-y-1">
                <p className="text-sm text-green-700 truncate">{googleUrl}</p>
                <p className="text-xl text-blue-700 hover:underline cursor-pointer leading-snug truncate">
                  {googleTitle}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {googleDesc}
                </p>
              </div>
            </div>
          )}

          {/* Facebook Preview */}
          {activeTab === "facebook" && (
            <div className="max-w-lg">
              <p className="text-xs text-gray-400 mb-3">
                Approximate Facebook Share Preview
              </p>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {meta.ogImage ? (
                  <div className="w-full h-52 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meta.ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-52 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    No og:image set
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {fbUrl.replace(/^https?:\/\//, "").split("/")[0]}
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-1 truncate">
                    {fbTitle}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {fbDesc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Twitter Preview */}
          {activeTab === "twitter" && (
            <div className="max-w-lg">
              <p className="text-xs text-gray-400 mb-3">
                Approximate Twitter Card Preview
              </p>
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                {meta.twitterCard === "summary_large_image" ? (
                  <>
                    {twImage ? (
                      <div className="w-full h-52 bg-gray-200 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twImage}
                          alt="Twitter Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-52 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                        No image set
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {twTitle}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {twDesc}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(meta.ogUrl || meta.canonical || "example.com")
                          .replace(/^https?:\/\//, "")
                          .split("/")[0]}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex">
                    {twImage ? (
                      <div className="w-32 h-32 bg-gray-200 flex-shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twImage}
                          alt="Twitter Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                    <div className="p-3 flex flex-col justify-center min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {twTitle}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {twDesc}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {(meta.ogUrl || meta.canonical || "example.com")
                          .replace(/^https?:\/\//, "")
                          .split("/")[0]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "meta description の最適な文字数は？",
              a: "Google の検索結果では約 120〜160 文字が表示されます。それ以上は省略されます。重要なキーワードを前半に入れ、ページ内容を正確に表す説明文を書きましょう。このツールでは文字数をリアルタイムで表示しています。",
            },
            {
              q: "OG タグと Twitter Card は必須ですか？",
              a: "SNS でシェアされたときのリッチプレビュー表示に必要です。OG タグがなければ URL テキストのみが表示されます。og:image には 1200×630px の画像を推奨します。Twitter Card は OG タグの内容を自動的に参照するため、個別設定は省略できます。",
            },
            {
              q: "canonical URL はなぜ重要ですか？",
              a: "同じ内容が複数の URL でアクセスできる場合（www あり/なし、http/https など）に、正規 URL を検索エンジンに伝えるタグです。重複コンテンツ扱いを防ぎ、SEO 評価を正規 URL に集約できます。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <p className="text-gray-800 font-bold text-sm mb-1">{faq.q}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "meta description の最適な文字数は？",
                "acceptedAnswer": { "@type": "Answer", "text": "Google の検索結果では約 120〜160 文字が表示されます。それ以上は省略されます。重要なキーワードを前半に入れ、ページ内容を正確に表す説明文を書きましょう。" },
              },
              {
                "@type": "Question",
                "name": "OG タグと Twitter Card は必須ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "SNS でシェアされたときのリッチプレビュー表示に必要です。og:image には 1200×630px の画像を推奨します。Twitter Card は OG タグの内容を自動的に参照するため、個別設定は省略できます。" },
              },
              {
                "@type": "Question",
                "name": "canonical URL はなぜ重要ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "同じ内容が複数の URL でアクセスできる場合に、正規 URL を検索エンジンに伝えるタグです。重複コンテンツ扱いを防ぎ、SEO 評価を正規 URL に集約できます。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/og-image-preview", label: "OG 画像プレビュー", desc: "SNS シェア時の OG 画像表示を確認" },
            { href: "/robots-txt-generator", label: "robots.txt 生成", desc: "クローラー制御用 robots.txt を生成" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors"
            >
              <p className="text-gray-800 font-bold text-sm">{link.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
