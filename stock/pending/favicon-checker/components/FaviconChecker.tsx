"use client";

import { useState } from "react";

interface FaviconItem {
  id: string;
  label: string;
  size: string;
  format: string;
  purpose: string;
  htmlTag: (prefix: string) => string;
  manifestEntry?: (prefix: string) => object;
}

const FAVICON_ITEMS: FaviconItem[] = [
  {
    id: "favicon-ico",
    label: "favicon.ico",
    size: "16×16 + 32×32",
    format: "ICO",
    purpose: "Classic browser tab icon. Supported by every major browser.",
    htmlTag: (prefix) =>
      `<link rel="shortcut icon" href="${prefix}favicon.ico">`,
  },
  {
    id: "png-16",
    label: "PNG 16×16",
    size: "16×16",
    format: "PNG",
    purpose: "Small tab icon for browsers that prefer PNG over ICO.",
    htmlTag: (prefix) =>
      `<link rel="icon" type="image/png" sizes="16x16" href="${prefix}favicon-16x16.png">`,
  },
  {
    id: "png-32",
    label: "PNG 32×32",
    size: "32×32",
    format: "PNG",
    purpose: "Standard tab icon at higher density. Preferred by Chrome and Firefox.",
    htmlTag: (prefix) =>
      `<link rel="icon" type="image/png" sizes="32x32" href="${prefix}favicon-32x32.png">`,
  },
  {
    id: "apple-touch",
    label: "Apple Touch Icon",
    size: "180×180",
    format: "PNG",
    purpose: "Home screen icon when iOS users bookmark your site.",
    htmlTag: (prefix) =>
      `<link rel="apple-touch-icon" sizes="180x180" href="${prefix}apple-touch-icon.png">`,
  },
  {
    id: "android-192",
    label: "Android Chrome 192×192",
    size: "192×192",
    format: "PNG",
    purpose: "PWA icon for Android home screen shortcuts.",
    htmlTag: (prefix) =>
      `<link rel="icon" type="image/png" sizes="192x192" href="${prefix}android-chrome-192x192.png">`,
    manifestEntry: (prefix) => ({
      src: `${prefix}android-chrome-192x192.png`,
      sizes: "192x192",
      type: "image/png",
    }),
  },
  {
    id: "android-512",
    label: "Android Chrome 512×512",
    size: "512×512",
    format: "PNG",
    purpose: "PWA splash screen and install icon for Android.",
    htmlTag: (prefix) =>
      `<link rel="icon" type="image/png" sizes="512x512" href="${prefix}android-chrome-512x512.png">`,
    manifestEntry: (prefix) => ({
      src: `${prefix}android-chrome-512x512.png`,
      sizes: "512x512",
      type: "image/png",
    }),
  },
  {
    id: "ms-tile",
    label: "MS Application Tile",
    size: "150×150",
    format: "PNG",
    purpose: "Windows Start menu tile when the site is pinned.",
    htmlTag: (prefix) =>
      `<meta name="msapplication-TileImage" content="${prefix}mstile-150x150.png">`,
  },
  {
    id: "safari-pinned",
    label: "Safari Pinned Tab",
    size: "any (SVG)",
    format: "SVG",
    purpose: "Monochrome SVG icon for macOS Safari pinned tabs.",
    htmlTag: (prefix) =>
      `<link rel="mask-icon" href="${prefix}safari-pinned-tab.svg" color="#000000">`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function FaviconChecker() {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(FAVICON_ITEMS.map((item) => [item.id, true]))
  );
  const [prefix, setPrefix] = useState("/");

  const toggleAll = (value: boolean) => {
    setChecked(Object.fromEntries(FAVICON_ITEMS.map((item) => [item.id, value])));
  };

  const selectedItems = FAVICON_ITEMS.filter((item) => checked[item.id]);

  const htmlOutput = selectedItems
    .map((item) => item.htmlTag(prefix))
    .join("\n");

  const manifestItems = selectedItems
    .filter((item) => item.manifestEntry)
    .map((item) => item.manifestEntry!(prefix));

  const manifestOutput = JSON.stringify({ icons: manifestItems }, null, 2);

  const formatBadgeColor: Record<string, string> = {
    ICO: "bg-amber-100 text-amber-700",
    PNG: "bg-blue-100 text-blue-700",
    SVG: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      {/* Path prefix */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Path Prefix
        </label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="/"
          className="w-full sm:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1.5">
          Set to <code>/</code>, <code>/images/</code>, or wherever you store
          your favicon files.
        </p>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            Favicon Types
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Select all
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        </div>

        <ul className="divide-y divide-gray-100">
          {FAVICON_ITEMS.map((item) => (
            <li key={item.id}>
              <label className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={checked[item.id]}
                  onChange={(e) =>
                    setChecked((prev) => ({
                      ...prev,
                      [item.id]: e.target.checked,
                    }))
                  }
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-500">{item.size}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        formatBadgeColor[item.format] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.format}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{item.purpose}</p>
                  <code className="text-xs text-gray-400 font-mono mt-1 block truncate">
                    {item.htmlTag(prefix)}
                  </code>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* HTML Output */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">
            HTML Link Tags
            <span className="ml-2 text-xs font-normal text-gray-400">
              — paste inside &lt;head&gt;
            </span>
          </h2>
          {htmlOutput && <CopyButton text={htmlOutput} />}
        </div>
        {htmlOutput ? (
          <pre className="p-5 text-xs font-mono text-gray-800 bg-gray-50 overflow-x-auto whitespace-pre-wrap break-all">
            {htmlOutput}
          </pre>
        ) : (
          <p className="p-5 text-sm text-gray-400 text-center">
            Select at least one favicon type above.
          </p>
        )}
      </div>

      {/* Manifest Output */}
      {manifestItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">
              web.manifest Icons
              <span className="ml-2 text-xs font-normal text-gray-400">
                — merge into your manifest.json
              </span>
            </h2>
            <CopyButton text={manifestOutput} />
          </div>
          <pre className="p-5 text-xs font-mono text-gray-800 bg-gray-50 overflow-x-auto whitespace-pre-wrap">
            {manifestOutput}
          </pre>
        </div>
      )}
    </div>
  );
}
