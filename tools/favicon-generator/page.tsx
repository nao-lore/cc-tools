"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  FAVICON_SIZES,
  generateTextFavicon,
  generateEmojiFavicon,
  generateImageFavicon,
  downloadDataURL,
  buildIco,
  generateMetaTags,
} from "./lib/favicon";

type Mode = "text" | "emoji" | "image";

const FONTS = [
  "Arial",
  "Georgia",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
  "Trebuchet MS",
  "Times New Roman",
];

const POPULAR_EMOJIS = [
  "\u{1F680}", "\u{2B50}", "\u{1F525}", "\u{1F4A1}", "\u{2764}\u{FE0F}",
  "\u{26A1}", "\u{1F30D}", "\u{1F3AF}", "\u{1F527}", "\u{1F4BB}",
  "\u{1F3A8}", "\u{1F4DA}", "\u{2705}", "\u{1F389}", "\u{1F4E6}",
  "\u{1F916}", "\u{1F331}", "\u{1F48E}", "\u{1F50D}", "\u{1F3E0}",
];

const SIZE_LABELS: Record<number, string> = {
  16: "16\u00D716",
  32: "32\u00D732",
  48: "48\u00D748",
  180: "180\u00D7180 (Apple Touch)",
  192: "192\u00D7192 (Android)",
  512: "512\u00D7512 (PWA)",
};

export default function Home() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("A");
  const [font, setFont] = useState("Arial");
  const [fontSize, setFontSize] = useState(70);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#4f46e5");
  const [emoji, setEmoji] = useState("\u{1F680}");
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [metaTags, setMetaTags] = useState("");
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreviews = useCallback(() => {
    const results: Record<number, string> = {};
    for (const size of FAVICON_SIZES) {
      if (mode === "text") {
        results[size] = generateTextFavicon(size, {
          text,
          fontFamily: font,
          fontSize,
          textColor,
          bgColor,
        });
      } else if (mode === "emoji") {
        results[size] = generateEmojiFavicon(size, { emoji, bgColor });
      } else if (mode === "image" && uploadedImage) {
        results[size] = generateImageFavicon(size, { image: uploadedImage, bgColor });
      }
    }
    setPreviews(results);
  }, [mode, text, font, fontSize, textColor, bgColor, emoji, uploadedImage]);

  useEffect(() => {
    generatePreviews();
  }, [generatePreviews]);

  useEffect(() => {
    setMetaTags(generateMetaTags(baseUrl || "/"));
  }, [baseUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setUploadedImage(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadPng = (size: number) => {
    const dataURL = previews[size];
    if (!dataURL) return;
    downloadDataURL(dataURL, `favicon-${size}x${size}.png`);
  };

  const handleDownloadIco = () => {
    const icoSizes = [16, 32, 48];
    const pngDataURLs = icoSizes
      .filter((s) => previews[s])
      .map((s) => ({ size: s, dataURL: previews[s] }));
    if (pngDataURLs.length === 0) return;
    const blob = buildIco(pngDataURLs);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "favicon.ico";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyMeta = () => {
    navigator.clipboard.writeText(metaTags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasPreviews = Object.keys(previews).length > 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Favicon Generator
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Create favicons from text, emoji, or uploaded images. Download as ICO
          or PNG in all standard sizes.
        </p>
      </header>

      {/* Mode tabs */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {(["text", "emoji", "image"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "text" ? "Text" : m === "emoji" ? "Emoji" : "Image"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Settings</h2>

            {mode === "text" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text (1-2 characters)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font
                  </label>
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size: {fontSize}%
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "emoji" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pick an Emoji
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {POPULAR_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-2xl p-2 rounded-lg border transition-colors ${
                        emoji === e
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Or type your own
                  </label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl"
                  />
                </div>
              </div>
            )}

            {mode === "image" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors"
                >
                  {uploadedImage ? "Change Image" : "Click to Upload"}
                </button>
                {uploadedImage && (
                  <p className="text-sm text-green-600 mt-2">
                    Image loaded ({uploadedImage.naturalWidth}&times;{uploadedImage.naturalHeight})
                  </p>
                )}
              </div>
            )}

            {/* Background color - shared */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor === "transparent" ? "#ffffff" : bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => setBgColor("transparent")}
                  className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Transparent
                </button>
              </div>
            </div>
          </div>

          {/* Download all */}
          {hasPreviews && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Download</h2>
              <button
                onClick={handleDownloadIco}
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Download .ico (16 + 32 + 48)
              </button>
              <div className="grid grid-cols-2 gap-2">
                {FAVICON_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleDownloadPng(size)}
                    className="py-2 px-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    PNG {size}&times;{size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Previews */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
            {!hasPreviews && mode === "image" && !uploadedImage ? (
              <p className="text-gray-400 text-center py-12">
                Upload an image to see previews
              </p>
            ) : (
              <div className="space-y-4">
                {/* Large preview */}
                <div className="flex justify-center">
                  <div className="checkerboard rounded-lg p-2 inline-block">
                    {previews[512] && (
                      <img
                        src={previews[512]}
                        alt="Favicon preview 512x512"
                        width={128}
                        height={128}
                        className="rounded"
                      />
                    )}
                  </div>
                </div>
                {/* All sizes */}
                <div className="flex flex-wrap items-end justify-center gap-4 pt-4 border-t border-gray-100">
                  {FAVICON_SIZES.map((size) => {
                    const renderPx = Math.min(size, 64);
                    return (
                      <div key={size} className="flex flex-col items-center gap-1">
                        <div className="checkerboard rounded p-0.5 inline-block">
                          {previews[size] && (
                            <img
                              src={previews[size]}
                              alt={`${size}x${size}`}
                              width={renderPx}
                              height={renderPx}
                              style={{ imageRendering: size <= 32 ? "pixelated" : "auto" }}
                            />
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {SIZE_LABELS[size]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Meta tags */}
          {hasPreviews && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">HTML Meta Tags</h2>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Base URL (optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap text-gray-700 border border-gray-100">
                {metaTags}
              </pre>
              <button
                onClick={handleCopyMeta}
                className="w-full py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          )}

          {/* AdSense placeholder */}
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
            Ad Space
          </div>
        </div>
      </div>

      {/* SEO Content */}
      <article className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What is a Favicon and Why Does It Matter?
        </h2>
        <p className="text-gray-600 mb-6">
          A favicon (short for &ldquo;favorite icon&rdquo;) is a small icon associated with a
          website or web page. It appears in browser tabs, bookmarks, history lists,
          and search results. Favicons help users quickly identify and navigate to
          your website among multiple open tabs, making them essential for brand
          recognition and user experience.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Favicon Sizes You Need
        </h2>
        <p className="text-gray-600 mb-4">
          Modern websites require favicons in multiple sizes to look sharp across
          all devices and platforms. The most important sizes are:
        </p>
        <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
          <li>
            <strong>16&times;16</strong> &mdash; Classic browser tab icon, the
            minimum size every site needs
          </li>
          <li>
            <strong>32&times;32</strong> &mdash; Standard favicon used by most
            modern browsers and taskbar shortcuts
          </li>
          <li>
            <strong>48&times;48</strong> &mdash; Windows site icon and higher
            resolution browser display
          </li>
          <li>
            <strong>180&times;180</strong> &mdash; Apple Touch Icon for iOS home
            screen bookmarks on iPhones and iPads
          </li>
          <li>
            <strong>192&times;192</strong> &mdash; Android Chrome icon for home
            screen shortcuts and Progressive Web Apps
          </li>
          <li>
            <strong>512&times;512</strong> &mdash; PWA splash screen icon required
            by the Web App Manifest specification
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          How to Add a Favicon to Your Website
        </h2>
        <p className="text-gray-600 mb-6">
          Adding a favicon to your website involves placing the icon files in your
          project&rsquo;s public directory and adding the appropriate HTML link tags
          to the <code className="bg-gray-100 px-1 rounded text-sm">&lt;head&gt;</code> section of your pages. The ICO format is
          universally supported and can contain multiple sizes in a single file. PNG
          favicons offer better quality and transparency support. For the best
          coverage, include both formats along with Apple Touch Icon and Android
          Chrome specific sizes.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Favicon Best Practices
        </h2>
        <p className="text-gray-600 mb-6">
          Keep your favicon design simple and recognizable at small sizes. Use
          high contrast colors so the icon is visible against both light and dark
          browser themes. Avoid fine details or text longer than one or two
          characters, as these become unreadable at 16&times;16 pixels. Test your
          favicon across different browsers and devices. Use SVG favicons when
          possible for scalability, but always provide PNG and ICO fallbacks for
          maximum compatibility. Remember that Apple requires a 180&times;180 PNG
          specifically named apple-touch-icon.png, and Progressive Web Apps need
          both 192&times;192 and 512&times;512 icons defined in the web app
          manifest file.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          About This Tool
        </h2>
        <p className="text-gray-600 mb-6">
          This favicon generator runs entirely in your browser using the HTML5
          Canvas API. No images are uploaded to any server. You can create favicons
          from text characters with custom fonts and colors, from emoji, or by
          uploading your own image which will be automatically cropped to a square.
          Download individual PNG files for specific sizes or get a complete ICO
          file containing 16&times;16, 32&times;32, and 48&times;48 versions. Copy
          the generated HTML meta tags directly into your project for instant
          integration.
        </p>
      </article>

      <footer className="border-t border-gray-200 py-8 text-center mt-16">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Favicon Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/svg-to-png" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">SVG to PNG</a>
              <a href="/image-compressor" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Image Compressor</a>
              <a href="/placeholder-image" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Placeholder Image</a>
              <a href="/qr-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">QR Generator</a>
              <a href="/color-palette" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Color Palette</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
