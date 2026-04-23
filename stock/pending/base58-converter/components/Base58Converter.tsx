"use client";

import { useState, useCallback } from "react";

// Bitcoin Base58 alphabet (no 0, O, I, l)
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// RFC 4648 Base32 alphabet
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const BASE32_PAD = "=";

// ─── Base58 encode/decode ───────────────────────────────────────────────────

function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";

  // Count leading zero bytes
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    leadingZeros++;
  }

  // Convert to BigInt
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }

  // Encode into Base58
  let encoded = "";
  while (num > 0n) {
    const rem = num % 58n;
    num = num / 58n;
    encoded = BASE58_ALPHABET[Number(rem)] + encoded;
  }

  // Add leading '1's for each leading zero byte
  return "1".repeat(leadingZeros) + encoded;
}

function base58Decode(input: string): Uint8Array | null {
  if (input.length === 0) return new Uint8Array(0);

  // Validate characters
  for (const ch of input) {
    if (!BASE58_ALPHABET.includes(ch)) return null;
  }

  // Count leading '1's
  let leadingZeros = 0;
  for (const ch of input) {
    if (ch !== "1") break;
    leadingZeros++;
  }

  // Convert to BigInt
  let num = 0n;
  for (const ch of input) {
    const idx = BASE58_ALPHABET.indexOf(ch);
    num = num * 58n + BigInt(idx);
  }

  // Convert BigInt to bytes
  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num % 256n));
    num = num / 256n;
  }

  return new Uint8Array([...new Array(leadingZeros).fill(0), ...bytes]);
}

// ─── Base32 encode/decode ───────────────────────────────────────────────────

function base32Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  // Pad to multiple of 8
  while (output.length % 8 !== 0) {
    output += BASE32_PAD;
  }

  return output;
}

function base32Decode(input: string): Uint8Array | null {
  // Strip padding and uppercase
  const clean = input.toUpperCase().replace(/=+$/, "");
  if (clean.length === 0) return new Uint8Array(0);

  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function bytesToText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

function hexToBytes(hex: string): Uint8Array | null {
  const clean = hex.replace(/\s+/g, "");
  if (clean.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]*$/.test(clean)) return null;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = "base58" | "base32";
type Mode = "encode" | "decode";
type InputType = "text" | "hex";

// ─── Shared panel ────────────────────────────────────────────────────────────

interface EncoderPanelProps {
  tab: Tab;
}

function EncoderPanel({ tab }: EncoderPanelProps) {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (val: string) => {
    setInput(val);
    setError("");
  };

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setInput("");
    setError("");
  };

  const handleInputTypeChange = (t: InputType) => {
    setInputType(t);
    setInput("");
    setError("");
  };

  const compute = (): { output: string; bytes: Uint8Array | null } => {
    if (!input.trim()) return { output: "", bytes: null };

    if (mode === "encode") {
      // Get bytes from input
      let bytes: Uint8Array | null;
      if (inputType === "hex") {
        bytes = hexToBytes(input);
        if (!bytes) {
          setError("Invalid hex — use pairs like: 48 65 6c 6c 6f");
          return { output: "", bytes: null };
        }
      } else {
        bytes = textToBytes(input);
      }

      const output =
        tab === "base58" ? base58Encode(bytes) : base32Encode(bytes);
      return { output, bytes };
    } else {
      // Decode
      const decoded =
        tab === "base58" ? base58Decode(input.trim()) : base32Decode(input.trim());
      if (!decoded) {
        const alpha = tab === "base58"
          ? "Bitcoin alphabet (1-9, A-H, J-N, P-Z, a-k, m-z)"
          : "RFC 4648 alphabet (A-Z, 2-7)";
        setError(`Invalid ${tab === "base58" ? "Base58" : "Base32"} — check for characters not in the ${alpha}`);
        return { output: "", bytes: null };
      }
      const output = bytesToText(decoded);
      return { output, bytes: decoded };
    }
  };

  const { output, bytes } = compute();
  const hexDisplay = bytes ? bytesToHex(bytes) : "";

  const inputLabel = mode === "encode"
    ? (inputType === "text" ? "Text to encode" : "Hex bytes to encode")
    : `${tab === "base58" ? "Base58" : "Base32"} string to decode`;

  const outputLabel = mode === "encode"
    ? `${tab === "base58" ? "Base58" : "Base32"} encoded`
    : "Decoded text";

  const inputPlaceholder = mode === "encode"
    ? inputType === "text" ? "Enter text…" : "e.g. 48 65 6c 6c 6f"
    : tab === "base58" ? "e.g. 3vQB7B6MrGQZaxCuFg4oh" : "e.g. JBSWY3DPEB3W64TMMQ======";

  return (
    <div className="space-y-5">
      {/* Mode + input type toggles */}
      <div className="flex flex-wrap gap-3">
        {/* Encode / Decode */}
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {m === "encode" ? "Encode" : "Decode"}
            </button>
          ))}
        </div>

        {/* Text / Hex (only for encode) */}
        {mode === "encode" && (
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {(["text", "hex"] as InputType[]).map((t) => (
              <button
                key={t}
                onClick={() => handleInputTypeChange(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  inputType === t
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t === "text" ? "Text" : "Hex"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {inputLabel}
        </label>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={inputPlaceholder}
          rows={3}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
          spellCheck={false}
          autoComplete="off"
        />
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>

      {/* Output */}
      {output && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {outputLabel}
          </label>
          <div className="relative bg-gray-50 border border-gray-200 rounded-lg p-3">
            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-all pr-8">
              {output}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton text={output} />
            </div>
          </div>
        </div>
      )}

      {/* Byte representation */}
      {bytes && bytes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Byte Representation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Hex</p>
              <div className="flex items-start gap-1">
                <p className="font-mono text-xs text-gray-800 break-all flex-1">
                  {hexDisplay || "—"}
                </p>
                <CopyButton text={hexDisplay} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Decimal bytes</p>
              <p className="font-mono text-xs text-gray-800 break-all">
                {Array.from(bytes).join(" ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Length</p>
              <p className="font-mono text-xs text-gray-800">
                {bytes.length} byte{bytes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alphabet reference */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {tab === "base58" ? "Base58 Alphabet" : "Base32 Alphabet (RFC 4648)"}
        </h3>
        <p className="font-mono text-xs text-gray-700 break-all leading-relaxed">
          {tab === "base58" ? BASE58_ALPHABET : BASE32_ALPHABET + " (+ = padding)"}
        </p>
        {tab === "base58" && (
          <p className="mt-2 text-xs text-gray-400">
            Excludes 0 (zero), O (capital-O), I (capital-I), l (lowercase-L) to avoid visual ambiguity.
            Used in Bitcoin addresses and IPFS CIDv0.
          </p>
        )}
        {tab === "base32" && (
          <p className="mt-2 text-xs text-gray-400">
            RFC 4648 standard. Used in TOTP (Google Authenticator), DNS labels, and file names.
            Output is padded to a multiple of 8 characters with <code className="bg-gray-100 px-1 rounded">=</code>.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Base58Converter() {
  const [tab, setTab] = useState<Tab>("base58");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {(["base58", "base32"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {t === "base58" ? "Base58" : "Base32"}
          </button>
        ))}
      </div>

      {/* Panel */}
      <EncoderPanel key={tab} tab={tab} />

      {/* Ad placeholder */}
      <div className="w-full h-24 bg-gray-100 border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-sm">
        Advertisement
      </div>
    </div>
  );
}
