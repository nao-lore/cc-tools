"use client";

import { useState, useCallback, useEffect, useId } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = "picsum" | "placehold" | "via";

interface PicsumConfig {
  width: number;
  height: number;
  seed: string;
  blur: number; // 0 = off, 1-10
  grayscale: boolean;
}

interface PlaceholdConfig {
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  text: string;
  format: "png" | "svg" | "webp" | "jpeg";
}

interface ViaConfig {
  width: number;
  height: number;
  bgColor: string;
  textColor: string;
  text: string;
}

interface UrlEntry {
  id: string;
  label: string;
  url: string;
}

// ─── URL builders ─────────────────────────────────────────────────────────────

function buildPicsum(cfg: PicsumConfig): string {
  const w = Math.max(1, cfg.width);
  const h = Math.max(1, cfg.height);
  let url = `https://picsum.photos`;
  if (cfg.seed.trim()) {
    url += `/seed/${encodeURIComponent(cfg.seed.trim())}`;
  }
  url += `/${w}/${h}`;
  const params: string[] = [];
  if (cfg.grayscale) params.push("grayscale");
  if (cfg.blur > 0) params.push(`blur=${cfg.blur}`);
  if (params.length) url += `?${params.join("&")}`;
  return url;
}

function buildPlacehold(cfg: PlaceholdConfig): string {
  const w = Math.max(1, cfg.width);
  const h = Math.max(1, cfg.height);
  const bg = cfg.bgColor.replace("#", "");
  const tc = cfg.textColor.replace("#", "");
  let url = `https://placehold.co/${w}x${h}/${bg}/${tc}`;
  if (cfg.format !== "png") url += `.${cfg.format}`;
  if (cfg.text.trim()) {
    url += `?text=${encodeURIComponent(cfg.text.trim())}`;
  }
  return url;
}

function buildVia(cfg: ViaConfig): string {
  const w = Math.max(1, cfg.width);
  const h = Math.max(1, cfg.height);
  const bg = cfg.bgColor.replace("#", "");
  const tc = cfg.textColor.replace("#", "");
  let url = `https://via.placeholder.com/${w}x${h}/${bg}/${tc}`;
  if (cfg.text.trim()) {
    url += `?text=${encodeURIComponent(cfg.text.trim())}`;
  }
  return url;
}

function makeHtmlTag(url: string, width: number, height: number): string {
  return `<img src="${url}" width="${width}" height="${height}" alt="placeholder" />`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shrink-0"
      style={{
        borderColor: "var(--border)",
        backgroundColor: copied ? "var(--primary)" : "var(--card)",
        color: copied ? "var(--primary-foreground)" : "inherit",
      }}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min = 1,
  max = 5000,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium opacity-70">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 w-full"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium opacity-70">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 w-full"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium opacity-70">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border cursor-pointer"
          style={{ borderColor: "var(--border)" }}
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 font-mono w-28"
          style={{ borderColor: "var(--border)" }}
          maxLength={7}
        />
      </div>
    </div>
  );
}

// ─── Service config panels ────────────────────────────────────────────────────

function PicsumPanel({
  cfg,
  onChange,
}: {
  cfg: PicsumConfig;
  onChange: (c: PicsumConfig) => void;
}) {
  const blurId = useId();
  const grayscaleId = useId();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Width (px)"
          value={cfg.width}
          onChange={(v) => onChange({ ...cfg, width: v })}
        />
        <NumberInput
          label="Height (px)"
          value={cfg.height}
          onChange={(v) => onChange({ ...cfg, height: v })}
        />
      </div>
      <TextInput
        label="Seed (optional — locks to a specific photo)"
        value={cfg.seed}
        onChange={(v) => onChange({ ...cfg, seed: v })}
        placeholder="e.g. my-seed"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={blurId} className="text-xs font-medium opacity-70">
          Blur (0 = off, 1–10)
        </label>
        <div className="flex items-center gap-3">
          <input
            id={blurId}
            type="range"
            min={0}
            max={10}
            value={cfg.blur}
            onChange={(e) => onChange({ ...cfg, blur: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm font-mono w-5 text-center">{cfg.blur}</span>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          id={grayscaleId}
          type="checkbox"
          checked={cfg.grayscale}
          onChange={(e) => onChange({ ...cfg, grayscale: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm">Grayscale</span>
      </label>
    </div>
  );
}

function PlaceholdPanel({
  cfg,
  onChange,
}: {
  cfg: PlaceholdConfig;
  onChange: (c: PlaceholdConfig) => void;
}) {
  const formatId = useId();
  const formats: PlaceholdConfig["format"][] = ["png", "svg", "webp", "jpeg"];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Width (px)"
          value={cfg.width}
          onChange={(v) => onChange({ ...cfg, width: v })}
        />
        <NumberInput
          label="Height (px)"
          value={cfg.height}
          onChange={(v) => onChange({ ...cfg, height: v })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ColorInput
          label="Background color"
          value={cfg.bgColor}
          onChange={(v) => onChange({ ...cfg, bgColor: v })}
        />
        <ColorInput
          label="Text color"
          value={cfg.textColor}
          onChange={(v) => onChange({ ...cfg, textColor: v })}
        />
      </div>
      <TextInput
        label="Custom text (optional)"
        value={cfg.text}
        onChange={(v) => onChange({ ...cfg, text: v })}
        placeholder="e.g. 800x600"
      />
      <div className="flex flex-col gap-1">
        <label htmlFor={formatId} className="text-xs font-medium opacity-70">
          Format
        </label>
        <select
          id={formatId}
          value={cfg.format}
          onChange={(e) =>
            onChange({ ...cfg, format: e.target.value as PlaceholdConfig["format"] })
          }
          className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: "var(--border)" }}
        >
          {formats.map((f) => (
            <option key={f} value={f}>
              {f.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ViaPanel({
  cfg,
  onChange,
}: {
  cfg: ViaConfig;
  onChange: (c: ViaConfig) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput
          label="Width (px)"
          value={cfg.width}
          onChange={(v) => onChange({ ...cfg, width: v })}
        />
        <NumberInput
          label="Height (px)"
          value={cfg.height}
          onChange={(v) => onChange({ ...cfg, height: v })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ColorInput
          label="Background color"
          value={cfg.bgColor}
          onChange={(v) => onChange({ ...cfg, bgColor: v })}
        />
        <ColorInput
          label="Text color"
          value={cfg.textColor}
          onChange={(v) => onChange({ ...cfg, textColor: v })}
        />
      </div>
      <TextInput
        label="Custom text (optional)"
        value={cfg.text}
        onChange={(v) => onChange({ ...cfg, text: v })}
        placeholder="e.g. No Image"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const SERVICE_LABELS: Record<Service, string> = {
  picsum: "picsum.photos",
  placehold: "placehold.co",
  via: "via.placeholder.com",
};

export default function PlaceholderUrlBuilder() {
  const [service, setService] = useState<Service>("picsum");

  const [picsumCfg, setPicsumCfg] = useState<PicsumConfig>({
    width: 800,
    height: 600,
    seed: "",
    blur: 0,
    grayscale: false,
  });

  const [placeholdCfg, setPlaceholdCfg] = useState<PlaceholdConfig>({
    width: 800,
    height: 600,
    bgColor: "#cccccc",
    textColor: "#333333",
    text: "",
    format: "png",
  });

  const [viaCfg, setViaCfg] = useState<ViaConfig>({
    width: 800,
    height: 600,
    bgColor: "#cccccc",
    textColor: "#333333",
    text: "",
  });

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [imgError, setImgError] = useState(false);
  const [urlList, setUrlList] = useState<UrlEntry[]>([]);
  const [listLabel, setListLabel] = useState("");

  // Live URL generation
  useEffect(() => {
    let url = "";
    if (service === "picsum") url = buildPicsum(picsumCfg);
    else if (service === "placehold") url = buildPlacehold(placeholdCfg);
    else url = buildVia(viaCfg);
    setGeneratedUrl(url);
    setImgError(false);
  }, [service, picsumCfg, placeholdCfg, viaCfg]);

  const currentWidth =
    service === "picsum"
      ? picsumCfg.width
      : service === "placehold"
      ? placeholdCfg.width
      : viaCfg.width;
  const currentHeight =
    service === "picsum"
      ? picsumCfg.height
      : service === "placehold"
      ? placeholdCfg.height
      : viaCfg.height;

  const htmlTag = makeHtmlTag(generatedUrl, currentWidth, currentHeight);

  const handleAddToList = useCallback(() => {
    if (!generatedUrl) return;
    const label = listLabel.trim() || `${SERVICE_LABELS[service]} ${currentWidth}x${currentHeight}`;
    setUrlList((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label, url: generatedUrl },
    ]);
    setListLabel("");
  }, [generatedUrl, service, currentWidth, currentHeight, listLabel]);

  const handleRemove = useCallback((id: string) => {
    setUrlList((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const allUrlsText = urlList.map((e) => e.url).join("\n");

  const cardStyle = {
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Service selector */}
      <div
        className="flex rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        {(Object.keys(SERVICE_LABELS) as Service[]).map((s) => (
          <button
            key={s}
            onClick={() => setService(s)}
            className="flex-1 py-2.5 text-xs sm:text-sm font-medium transition-colors"
            style={{
              backgroundColor: service === s ? "var(--primary)" : "transparent",
              color: service === s ? "var(--primary-foreground)" : "inherit",
            }}
          >
            {SERVICE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Config panel */}
      <div className="rounded-xl border p-5 sm:p-6 space-y-5" style={cardStyle}>
        <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">
          {SERVICE_LABELS[service]} Options
        </h2>

        {service === "picsum" && (
          <PicsumPanel cfg={picsumCfg} onChange={setPicsumCfg} />
        )}
        {service === "placehold" && (
          <PlaceholdPanel cfg={placeholdCfg} onChange={setPlaceholdCfg} />
        )}
        {service === "via" && (
          <ViaPanel cfg={viaCfg} onChange={setViaCfg} />
        )}
      </div>

      {/* Generated URL */}
      {generatedUrl && (
        <div className="rounded-xl border p-5 sm:p-6 space-y-4" style={cardStyle}>
          <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">
            Generated URL
          </h2>

          {/* URL row */}
          <div className="space-y-2">
            <div
              className="rounded-lg border p-3 break-all text-sm font-mono"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
              }}
            >
              {generatedUrl}
            </div>
            <div className="flex justify-end">
              <CopyButton text={generatedUrl} label="Copy URL" />
            </div>
          </div>

          {/* HTML tag row */}
          <div className="space-y-2">
            <p className="text-xs font-medium opacity-60">HTML img tag</p>
            <div
              className="rounded-lg border p-3 break-all text-sm font-mono"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
              }}
            >
              {htmlTag}
            </div>
            <div className="flex justify-end">
              <CopyButton text={htmlTag} label="Copy HTML" />
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <p className="text-xs font-medium opacity-60">Live preview</p>
            <div
              className="rounded-lg border overflow-hidden flex items-center justify-center"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--muted, rgba(0,0,0,0.04))",
                minHeight: "120px",
              }}
            >
              {imgError ? (
                <p className="text-xs opacity-40 py-8">Preview unavailable</p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={generatedUrl}
                  src={generatedUrl}
                  alt="placeholder preview"
                  className="max-w-full max-h-64 object-contain"
                  onError={() => setImgError(true)}
                  onLoad={() => setImgError(false)}
                />
              )}
            </div>
          </div>

          {/* Add to list */}
          <div className="pt-1 space-y-2">
            <p className="text-xs font-medium opacity-60">
              Add to multiple URLs list
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={listLabel}
                onChange={(e) => setListLabel(e.target.value)}
                placeholder="Optional label"
                className="flex-1 rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: "var(--border)" }}
              />
              <button
                onClick={handleAddToList}
                className="px-4 py-2 rounded-md text-sm font-medium transition-opacity hover:opacity-90 shrink-0"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple URLs list */}
      {urlList.length > 0 && (
        <div className="rounded-xl border p-5 sm:p-6 space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold opacity-60 uppercase tracking-wide">
              Multiple URLs ({urlList.length})
            </h2>
            <CopyButton text={allUrlsText} label="Copy All" />
          </div>

          <ul className="space-y-2">
            {urlList.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start gap-2 rounded-lg border p-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs font-medium truncate">{entry.label}</p>
                  <p className="text-xs font-mono opacity-60 break-all">
                    {entry.url}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <CopyButton text={entry.url} label="Copy" />
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--card)",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Placeholder Image URL Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build placeholder image URLs from popular services. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Placeholder Image URL Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build placeholder image URLs from popular services. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Placeholder Image URL Builder",
  "description": "Build placeholder image URLs from popular services",
  "url": "https://tools.loresync.dev/lorem-picsum-builder",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
