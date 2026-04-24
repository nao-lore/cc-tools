"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildForm {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

interface ParsedParam {
  key: string;
  value: string;
}

type Mode = "build" | "parse";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUtmUrl(form: BuildForm): string {
  const { baseUrl, source, medium, campaign, term, content } = form;
  if (!baseUrl || !source || !medium || !campaign) return "";

  let base = baseUrl.trim();
  // Ensure protocol
  if (!/^https?:\/\//i.test(base)) base = "https://" + base;

  const params = new URLSearchParams();
  params.set("utm_source", source.trim());
  params.set("utm_medium", medium.trim());
  params.set("utm_campaign", campaign.trim());
  if (term.trim()) params.set("utm_term", term.trim());
  if (content.trim()) params.set("utm_content", content.trim());

  const separator = base.includes("?") ? "&" : "?";
  return base + separator + params.toString();
}

function parseUtmUrl(raw: string): ParsedParam[] | null {
  if (!raw.trim()) return null;
  try {
    const url = new URL(raw.trim().startsWith("http") ? raw.trim() : "https://" + raw.trim());
    const results: ParsedParam[] = [
      { key: "Base URL", value: url.origin + url.pathname },
    ];
    url.searchParams.forEach((value, key) => {
      results.push({ key, value });
    });
    return results;
  } catch {
    return null;
  }
}

// ─── QR Code (via Google Charts API — no dependency needed) ──────────────────

function QrCode({ url }: { url: string }) {
  const encoded = encodeURIComponent(url);
  const src = `https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encoded}&choe=UTF-8`;
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <p className="text-xs opacity-50 uppercase tracking-wide">QR Code</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="QR code for tagged URL"
        width={180}
        height={180}
        className="rounded-lg border"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
      style={{
        borderColor: "var(--border)",
        backgroundColor: copied ? "var(--primary)" : "var(--card)",
        color: copied ? "var(--primary-foreground)" : "inherit",
      }}
    >
      {copied ? "Copied!" : "Copy URL"}
    </button>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UtmBuilder() {
  const [mode, setMode] = useState<Mode>("build");

  // Build mode state
  const [form, setForm] = useState<BuildForm>({
    baseUrl: "",
    source: "",
    medium: "",
    campaign: "",
    term: "",
    content: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BuildForm, string>>>({});
  const [taggedUrl, setTaggedUrl] = useState("");

  // Parse mode state
  const [parseInput, setParseInput] = useState("");
  const [parsedParams, setParsedParams] = useState<ParsedParam[] | null>(null);
  const [parseError, setParseError] = useState("");

  // Live build
  useEffect(() => {
    if (form.baseUrl && form.source && form.medium && form.campaign) {
      setTaggedUrl(buildUtmUrl(form));
    } else {
      setTaggedUrl("");
    }
  }, [form]);

  const setField = useCallback((key: keyof BuildForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  const handleBuild = useCallback(() => {
    const newErrors: Partial<Record<keyof BuildForm, string>> = {};
    if (!form.baseUrl.trim()) newErrors.baseUrl = "Base URL is required";
    if (!form.source.trim()) newErrors.source = "Source is required";
    if (!form.medium.trim()) newErrors.medium = "Medium is required";
    if (!form.campaign.trim()) newErrors.campaign = "Campaign is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setTaggedUrl(buildUtmUrl(form));
  }, [form]);

  const handleParse = useCallback(() => {
    if (!parseInput.trim()) {
      setParseError("Paste a URL to parse.");
      setParsedParams(null);
      return;
    }
    const result = parseUtmUrl(parseInput);
    if (!result) {
      setParseError("Could not parse the URL. Make sure it's a valid URL.");
      setParsedParams(null);
    } else {
      setParseError("");
      setParsedParams(result);
    }
  }, [parseInput]);

  const cardStyle = {
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Mode toggle */}
      <div
        className="flex rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        {(["build", "parse"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="flex-1 py-2.5 text-sm font-medium transition-colors capitalize"
            style={{
              backgroundColor: mode === m ? "var(--primary)" : "transparent",
              color: mode === m ? "var(--primary-foreground)" : "inherit",
            }}
          >
            {m === "build" ? "Build URL" : "Parse URL"}
          </button>
        ))}
      </div>

      {/* ── BUILD MODE ── */}
      {mode === "build" && (
        <div
          className="rounded-xl border p-5 sm:p-6 space-y-4"
          style={cardStyle}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Base URL full width */}
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-sm font-medium">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.baseUrl}
                onChange={(e) => setField("baseUrl")(e.target.value)}
                placeholder="https://example.com/landing"
                className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.baseUrl ? "#ef4444" : "var(--border)" }}
              />
              {errors.baseUrl && (
                <p className="text-xs text-red-500">{errors.baseUrl}</p>
              )}
            </div>

            {/* utm_source */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                utm_source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setField("source")(e.target.value)}
                placeholder="google, newsletter"
                className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.source ? "#ef4444" : "var(--border)" }}
              />
              {errors.source && (
                <p className="text-xs text-red-500">{errors.source}</p>
              )}
            </div>

            {/* utm_medium */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                utm_medium <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.medium}
                onChange={(e) => setField("medium")(e.target.value)}
                placeholder="cpc, email, social"
                className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.medium ? "#ef4444" : "var(--border)" }}
              />
              {errors.medium && (
                <p className="text-xs text-red-500">{errors.medium}</p>
              )}
            </div>

            {/* utm_campaign */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                utm_campaign <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.campaign}
                onChange={(e) => setField("campaign")(e.target.value)}
                placeholder="spring_sale_2025"
                className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: errors.campaign ? "#ef4444" : "var(--border)" }}
              />
              {errors.campaign && (
                <p className="text-xs text-red-500">{errors.campaign}</p>
              )}
            </div>

            {/* utm_term */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium opacity-70">
                utm_term <span className="text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={form.term}
                onChange={(e) => setField("term")(e.target.value)}
                placeholder="running shoes"
                className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            {/* utm_content */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium opacity-70">
                utm_content <span className="text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={form.content}
                onChange={(e) => setField("content")(e.target.value)}
                placeholder="hero_button, sidebar_link"
                className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          <button
            onClick={handleBuild}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Generate URL
          </button>

          {/* Output */}
          {taggedUrl && (
            <div className="space-y-3 pt-2">
              <div
                className="rounded-lg border p-3 break-all text-sm font-mono"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--muted, rgba(0,0,0,0.04))" }}
              >
                {taggedUrl}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs opacity-50">
                  {taggedUrl.length} characters
                </p>
                <CopyButton text={taggedUrl} />
              </div>
              <QrCode url={taggedUrl} />
            </div>
          )}
        </div>
      )}

      {/* ── PARSE MODE ── */}
      {mode === "parse" && (
        <div
          className="rounded-xl border p-5 sm:p-6 space-y-4"
          style={cardStyle}
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Paste a UTM URL</label>
            <textarea
              value={parseInput}
              onChange={(e) => {
                setParseInput(e.target.value);
                setParsedParams(null);
                setParseError("");
              }}
              placeholder="https://example.com/page?utm_source=google&utm_medium=cpc&utm_campaign=spring"
              rows={3}
              className="rounded-md border px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
              style={{ borderColor: "var(--border)" }}
            />
          </div>

          <button
            onClick={handleParse}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            Parse URL
          </button>

          {parseError && (
            <p className="text-sm text-red-500">{parseError}</p>
          )}

          {parsedParams && (
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--border)" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="text-xs uppercase tracking-wide opacity-50"
                    style={{ backgroundColor: "var(--muted, rgba(0,0,0,0.04))" }}
                  >
                    <th className="text-left px-4 py-2 font-semibold">Parameter</th>
                    <th className="text-left px-4 py-2 font-semibold">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedParams.map((p, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="px-4 py-2 font-mono text-xs opacity-70 whitespace-nowrap">
                        {p.key}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs break-all">
                        {decodeURIComponent(p.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this UTM Parameter Builder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Build UTM-tagged URLs for campaign tracking. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this UTM Parameter Builder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Build UTM-tagged URLs for campaign tracking. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
