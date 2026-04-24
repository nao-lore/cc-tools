"use client";

import { useState, useCallback } from "react";

// --- Pure crypto helpers (no external deps, Web Crypto API) ---

function base64UrlEncode(input: string | Uint8Array): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = input;
  }
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function jsonToBase64Url(obj: unknown): string {
  return base64UrlEncode(JSON.stringify(obj));
}

async function hmacSign(
  algorithm: "HS256" | "HS384" | "HS512",
  secret: string,
  data: string
): Promise<string> {
  const hashMap: Record<string, string> = {
    HS256: "SHA-256",
    HS384: "SHA-384",
    HS512: "SHA-512",
  };
  const keyBytes = new TextEncoder().encode(secret);
  const dataBytes = new TextEncoder().encode(data);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: hashMap[algorithm] },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
  return base64UrlEncode(new Uint8Array(sig));
}

// --- Types ---

type Algorithm = "HS256" | "HS384" | "HS512";

const CLAIM_TEMPLATES: Record<string, () => string> = {
  iss: () => "https://example.com",
  sub: () => "user-123",
  aud: () => "https://api.example.com",
  exp: () => String(Math.floor(Date.now() / 1000) + 3600),
  iat: () => String(Math.floor(Date.now() / 1000)),
  nbf: () => String(Math.floor(Date.now() / 1000)),
};

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    sub: "user-123",
    name: "John Doe",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
  null,
  2
);

export default function JwtGenerator() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("HS256");
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [showSecret, setShowSecret] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [payloadError, setPayloadError] = useState<string | null>(null);

  // Parse payload for preview
  const parsedPayload = (() => {
    try {
      return JSON.parse(payloadText);
    } catch {
      return null;
    }
  })();

  const handlePayloadChange = (val: string) => {
    setPayloadText(val);
    try {
      JSON.parse(val);
      setPayloadError(null);
    } catch {
      setPayloadError("Invalid JSON");
    }
  };

  const addClaim = (key: string) => {
    try {
      const obj = JSON.parse(payloadText);
      if (!(key in obj)) {
        obj[key] = isNaN(Number(CLAIM_TEMPLATES[key]()))
          ? CLAIM_TEMPLATES[key]()
          : Number(CLAIM_TEMPLATES[key]());
      }
      setPayloadText(JSON.stringify(obj, null, 2));
      setPayloadError(null);
    } catch {
      // don't modify if payload is broken
    }
  };

  const handleExpPicker = (datetimeLocal: string) => {
    if (!datetimeLocal) return;
    const ts = Math.floor(new Date(datetimeLocal).getTime() / 1000);
    try {
      const obj = JSON.parse(payloadText);
      obj.exp = ts;
      setPayloadText(JSON.stringify(obj, null, 2));
      setPayloadError(null);
    } catch {
      // ignore if payload broken
    }
  };

  const generate = useCallback(async () => {
    setError(null);
    setToken(null);

    if (!secret.trim()) {
      setError("Secret key is required.");
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setError("Payload is not valid JSON.");
      return;
    }

    try {
      const header = { alg: algorithm, typ: "JWT" };
      const headerB64 = jsonToBase64Url(header);
      const payloadB64 = jsonToBase64Url(payload);
      const signingInput = `${headerB64}.${payloadB64}`;
      const signature = await hmacSign(algorithm, secret, signingInput);
      setToken(`${signingInput}.${signature}`);
    } catch (e) {
      setError(`Failed to generate token: ${(e as Error).message}`);
    }
  }, [algorithm, payloadText, secret]);

  const copyToken = async () => {
    if (!token) return;
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Split token into colored parts for display
  const tokenParts = token ? token.split(".") : null;

  // Current exp value from payload for date picker default
  const currentExp =
    parsedPayload?.exp && typeof parsedPayload.exp === "number"
      ? new Date(parsedPayload.exp * 1000).toISOString().slice(0, 16)
      : "";

  return (
    <div className="space-y-6">
      {/* Algorithm */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Algorithm
        </label>
        <div className="flex gap-2">
          {(["HS256", "HS384", "HS512"] as Algorithm[]).map((alg) => (
            <button
              key={alg}
              onClick={() => setAlgorithm(alg)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                algorithm === alg
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
              }`}
            >
              {alg}
            </button>
          ))}
        </div>
      </div>

      {/* Payload Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Payload (JSON)
          </label>
          {payloadError && (
            <span className="text-xs text-red-500">{payloadError}</span>
          )}
        </div>

        {/* Quick-add claim buttons */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(CLAIM_TEMPLATES).map((key) => (
            <button
              key={key}
              onClick={() => addClaim(key)}
              className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer font-mono"
            >
              + {key}
            </button>
          ))}
        </div>

        <textarea
          value={payloadText}
          onChange={(e) => handlePayloadChange(e.target.value)}
          className={`w-full h-40 p-4 rounded-lg bg-slate-50 text-slate-800 font-mono text-sm resize-none border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            payloadError ? "border-red-400" : "border-slate-300"
          }`}
          spellCheck={false}
          autoComplete="off"
          placeholder='{"sub": "user-123", "name": "John Doe"}'
        />
      </div>

      {/* Expiration picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Set Expiration (<code className="text-xs bg-slate-100 px-1 rounded">exp</code> claim)
        </label>
        <input
          type="datetime-local"
          defaultValue={currentExp}
          key={currentExp}
          onChange={(e) => handleExpPicker(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <p className="text-xs text-slate-400">
          Updates the <code>exp</code> field in the payload above.
        </p>
      </div>

      {/* Secret Key */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Secret Key
        </label>
        <div className="relative">
          <input
            type={showSecret ? "text" : "password"}
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="your-256-bit-secret"
            className="w-full px-4 py-2 pr-20 rounded-lg border border-slate-300 text-sm font-mono bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowSecret((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            {showSecret ? "Hide" : "Show"}
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Used for HMAC signing. Never share your secret key.
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={generate}
        disabled={!!payloadError}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Generate JWT
      </button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Output */}
      {token && tokenParts && (
        <div className="space-y-4">
          {/* Encoded token with colored parts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                Generated JWT
              </label>
              <button
                onClick={copyToken}
                className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer font-medium"
              >
                {copied ? "Copied!" : "Copy Token"}
              </button>
            </div>
            <div className="p-4 rounded-lg bg-slate-900 font-mono text-sm break-all leading-relaxed border border-slate-700 select-all">
              <span className="text-red-400">{tokenParts[0]}</span>
              <span className="text-slate-400">.</span>
              <span className="text-purple-400">{tokenParts[1]}</span>
              <span className="text-slate-400">.</span>
              <span className="text-cyan-400">{tokenParts[2]}</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                <span className="text-slate-500">Header</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                <span className="text-slate-500">Payload</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                <span className="text-slate-500">Signature</span>
              </span>
            </div>
          </div>

          {/* Decoded preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-red-500 uppercase tracking-wide">
                Header
              </div>
              <pre className="p-4 text-xs font-mono text-slate-700 overflow-x-auto bg-white">
                {JSON.stringify({ alg: algorithm, typ: "JWT" }, null, 2)}
              </pre>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-purple-500 uppercase tracking-wide">
                Payload
              </div>
              <pre className="p-4 text-xs font-mono text-slate-700 overflow-x-auto bg-white">
                {parsedPayload
                  ? JSON.stringify(parsedPayload, null, 2)
                  : payloadText}
              </pre>
            </div>
          </div>

          {/* Signature note */}
          <div className="p-3 rounded-lg bg-cyan-50 border border-cyan-200 text-xs text-cyan-700">
            <span className="font-semibold">Signature</span> — HMAC-{algorithm.slice(2)} of{" "}
            <code className="bg-cyan-100 px-1 rounded">base64url(header).base64url(payload)</code>{" "}
            signed with your secret key.
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this JWT Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate JSON Web Tokens with custom claims. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this JWT Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate JSON Web Tokens with custom claims. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
