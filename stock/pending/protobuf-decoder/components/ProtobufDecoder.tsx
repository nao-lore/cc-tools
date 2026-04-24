"use client";

import { useState, useCallback } from "react";

type WireType = 0 | 1 | 2 | 5;

interface DecodedField {
  fieldNumber: number;
  wireType: WireType;
  wireTypeName: string;
  rawValue: string;
  interpretations: Interpretation[];
  nested?: DecodedField[];
}

interface Interpretation {
  label: string;
  value: string;
}

function wireTypeName(wt: number): string {
  switch (wt) {
    case 0: return "varint";
    case 1: return "64-bit";
    case 2: return "length-delimited";
    case 5: return "32-bit";
    default: return `unknown(${wt})`;
  }
}

function readVarint(bytes: Uint8Array, offset: number): { value: bigint; bytesRead: number } | null {
  let value = 0n;
  let shift = 0n;
  let i = offset;
  while (i < bytes.length) {
    const b = bytes[i++];
    value |= BigInt(b & 0x7f) << shift;
    shift += 7n;
    if ((b & 0x80) === 0) {
      return { value, bytesRead: i - offset };
    }
    if (shift > 63n) return null;
  }
  return null;
}

function zigzagDecode32(n: bigint): number {
  const n32 = Number(BigInt.asUintN(32, n));
  return (n32 >>> 1) ^ -(n32 & 1);
}

function zigzagDecode64(n: bigint): bigint {
  return (n >> 1n) ^ -(n & 1n);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join(" ");
}

function tryDecodeUtf8(bytes: Uint8Array): string | null {
  try {
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    // Only return if it looks like printable text
    if ([...decoded].every(c => {
      const cp = c.codePointAt(0)!;
      return cp >= 0x20 || cp === 0x09 || cp === 0x0a || cp === 0x0d;
    })) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

function decodeProto(bytes: Uint8Array): DecodedField[] {
  const fields: DecodedField[] = [];
  let offset = 0;

  while (offset < bytes.length) {
    const tagResult = readVarint(bytes, offset);
    if (!tagResult) break;
    offset += tagResult.bytesRead;

    const tag = tagResult.value;
    const fieldNumber = Number(tag >> 3n);
    const wt = Number(tag & 7n) as WireType;

    if (fieldNumber === 0) break;

    const interps: Interpretation[] = [];
    let rawValue = "";
    let nested: DecodedField[] | undefined;

    if (wt === 0) {
      // varint
      const vr = readVarint(bytes, offset);
      if (!vr) break;
      offset += vr.bytesRead;
      const v = vr.value;
      rawValue = v.toString();
      interps.push({ label: "uint64", value: v.toString() });
      // int64 (two's complement)
      const signed = BigInt.asIntN(64, v);
      if (signed !== v) {
        interps.push({ label: "int64", value: signed.toString() });
      }
      // sint32 zigzag
      interps.push({ label: "sint32 (zigzag)", value: zigzagDecode32(v).toString() });
      // sint64 zigzag
      interps.push({ label: "sint64 (zigzag)", value: zigzagDecode64(v).toString() });
      // bool
      interps.push({ label: "bool", value: v === 0n ? "false" : "true" });

    } else if (wt === 1) {
      // 64-bit little-endian
      if (offset + 8 > bytes.length) break;
      const chunk = bytes.slice(offset, offset + 8);
      offset += 8;
      rawValue = toHex(chunk);
      const view = new DataView(chunk.buffer, chunk.byteOffset, 8);
      interps.push({ label: "double", value: view.getFloat64(0, true).toString() });
      interps.push({ label: "int64 (LE)", value: view.getBigInt64(0, true).toString() });
      interps.push({ label: "uint64 (LE)", value: view.getBigUint64(0, true).toString() });
      interps.push({ label: "hex", value: "0x" + Array.from(chunk).reverse().map(b => b.toString(16).padStart(2, "0")).join("") });

    } else if (wt === 2) {
      // length-delimited
      const lenResult = readVarint(bytes, offset);
      if (!lenResult) break;
      offset += lenResult.bytesRead;
      const len = Number(lenResult.value);
      if (offset + len > bytes.length) break;
      const chunk = bytes.slice(offset, offset + len);
      offset += len;
      rawValue = `${len} bytes`;
      interps.push({ label: "hex", value: toHex(chunk) });

      const str = tryDecodeUtf8(chunk);
      if (str !== null) {
        interps.push({ label: "string (UTF-8)", value: str });
      }

      // try nested proto
      if (len > 0) {
        try {
          const nestedFields = decodeProto(chunk);
          if (nestedFields.length > 0) {
            nested = nestedFields;
            interps.push({ label: "nested message", value: `${nestedFields.length} field(s)` });
          }
        } catch {
          // not a valid nested proto
        }
      }

      if (len <= 8) {
        // try as fixed-size numbers
        const view = new DataView(chunk.buffer, chunk.byteOffset, len);
        if (len === 4) {
          interps.push({ label: "float32", value: view.getFloat32(0, true).toString() });
          interps.push({ label: "int32 (LE)", value: view.getInt32(0, true).toString() });
        }
      }

    } else if (wt === 5) {
      // 32-bit little-endian
      if (offset + 4 > bytes.length) break;
      const chunk = bytes.slice(offset, offset + 4);
      offset += 4;
      rawValue = toHex(chunk);
      const view = new DataView(chunk.buffer, chunk.byteOffset, 4);
      interps.push({ label: "float", value: view.getFloat32(0, true).toString() });
      interps.push({ label: "int32 (LE)", value: view.getInt32(0, true).toString() });
      interps.push({ label: "uint32 (LE)", value: view.getUint32(0, true).toString() });
      interps.push({ label: "hex", value: "0x" + Array.from(chunk).reverse().map(b => b.toString(16).padStart(2, "0")).join("") });

    } else {
      // unknown wire type — stop
      break;
    }

    fields.push({
      fieldNumber,
      wireType: wt,
      wireTypeName: wireTypeName(wt),
      rawValue,
      interpretations: interps,
      nested,
    });
  }

  return fields;
}

function parseInput(input: string): Uint8Array | null {
  const trimmed = input.trim();
  // Try hex: optionally space/colon-separated hex bytes
  const hexClean = trimmed.replace(/[\s:]/g, "");
  if (/^[0-9a-fA-F]+$/.test(hexClean) && hexClean.length % 2 === 0) {
    const bytes = new Uint8Array(hexClean.length / 2);
    for (let i = 0; i < hexClean.length; i += 2) {
      bytes[i / 2] = parseInt(hexClean.slice(i, i + 2), 16);
    }
    return bytes;
  }
  // Try base64 (standard or URL-safe)
  try {
    const b64 = trimmed.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

const WIRE_TYPE_COLORS: Record<number, string> = {
  0: "bg-blue-100 text-blue-800",
  1: "bg-purple-100 text-purple-800",
  2: "bg-green-100 text-green-800",
  5: "bg-orange-100 text-orange-800",
};

function FieldRow({ field, depth = 0 }: { field: DecodedField; depth?: number }) {
  const [expanded, setExpanded] = useState(false);
  const indent = depth * 20;

  return (
    <>
      <tr className={depth > 0 ? "bg-slate-50" : "bg-white hover:bg-slate-50"}>
        <td className="px-3 py-2 text-sm font-mono text-slate-700 whitespace-nowrap" style={{ paddingLeft: `${12 + indent}px` }}>
          {field.nested && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mr-1 text-slate-400 hover:text-slate-700 font-bold"
              aria-label="toggle nested"
            >
              {expanded ? "▾" : "▸"}
            </button>
          )}
          {field.fieldNumber}
        </td>
        <td className="px-3 py-2 text-sm whitespace-nowrap">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${WIRE_TYPE_COLORS[field.wireType] ?? "bg-slate-100 text-slate-700"}`}>
            {field.wireTypeName}
          </span>
        </td>
        <td className="px-3 py-2 text-sm font-mono text-slate-600 max-w-[200px] truncate" title={field.rawValue}>
          {field.rawValue}
        </td>
        <td className="px-3 py-2 text-sm">
          <div className="flex flex-wrap gap-1">
            {field.interpretations.map((interp, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs">
                <span className="text-slate-400">{interp.label}:</span>
                <span className="font-mono text-slate-700 max-w-[160px] truncate" title={interp.value}>{interp.value}</span>
              </span>
            ))}
          </div>
        </td>
      </tr>
      {expanded && field.nested && field.nested.map((nf, i) => (
        <FieldRow key={i} field={nf} depth={depth + 1} />
      ))}
    </>
  );
}

const EXAMPLES = [
  {
    label: "Simple string field",
    value: "CgVoZWxsbw==",
  },
  {
    label: "Integer + string",
    value: "08 96 01 12 07 74 65 73 74 69 6e 67",
  },
  {
    label: "Nested message",
    value: "0a 05 08 01 12 01 61",
  },
];

export default function ProtobufDecoder() {
  const [input, setInput] = useState("");
  const [fields, setFields] = useState<DecodedField[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<"base64" | "hex" | null>(null);

  const decode = useCallback((value: string) => {
    if (!value.trim()) {
      setFields(null);
      setError(null);
      setInputType(null);
      return;
    }
    const bytes = parseInput(value);
    if (!bytes) {
      setError("Could not parse input as base64 or hex. Check your input and try again.");
      setFields(null);
      setInputType(null);
      return;
    }

    // Detect which format was used
    const hexClean = value.trim().replace(/[\s:]/g, "");
    const isHex = /^[0-9a-fA-F]+$/.test(hexClean) && hexClean.length % 2 === 0;
    setInputType(isHex ? "hex" : "base64");

    try {
      const result = decodeProto(bytes);
      if (result.length === 0) {
        setError("No valid Protobuf fields found. The binary data may not be a Protobuf message.");
        setFields(null);
      } else {
        setFields(result);
        setError(null);
      }
    } catch (e) {
      setError("Decode failed: " + (e instanceof Error ? e.message : String(e)));
      setFields(null);
    }
  }, []);

  const handleChange = (v: string) => {
    setInput(v);
    decode(v);
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-700">
            Input <span className="font-normal text-slate-400">(base64 or hex — auto-detected)</span>
          </label>
          {inputType && (
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${inputType === "base64" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
              Detected: {inputType}
            </span>
          )}
        </div>
        <textarea
          className="w-full h-28 font-mono text-sm border border-slate-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-slate-400"
          placeholder="Paste base64 (e.g. CgVoZWxsbw==) or hex bytes (e.g. 0a 05 68 65 6c 6c 6f)..."
          value={input}
          onChange={e => handleChange(e.target.value)}
          spellCheck={false}
        />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500">Examples:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => handleChange(ex.value)}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
            >
              {ex.label}
            </button>
          ))}
          {input && (
            <button
              onClick={() => handleChange("")}
              className="text-xs px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {fields && fields.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Decoded Fields
              <span className="ml-2 text-xs font-normal text-slate-400">{fields.length} top-level field{fields.length !== 1 ? "s" : ""}</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Field #</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-40">Wire Type</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-48">Raw Value</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Interpretations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, i) => (
                  <FieldRow key={i} field={field} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Wire type legend */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Wire Type Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { wt: 0, name: "Varint (0)", desc: "int32, int64, uint32, uint64, sint32, sint64, bool, enum" },
            { wt: 1, name: "64-bit (1)", desc: "fixed64, sfixed64, double" },
            { wt: 2, name: "Length-delimited (2)", desc: "string, bytes, embedded messages, packed repeated" },
            { wt: 5, name: "32-bit (5)", desc: "fixed32, sfixed32, float" },
          ].map(({ wt, name, desc }) => (
            <div key={wt} className="space-y-1">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${WIRE_TYPE_COLORS[wt]}`}>{name}</span>
              <p className="text-slate-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <strong>Schema-free decoding:</strong> Protobuf encodes field numbers and wire types in every message, so basic structure can be decoded without a <code className="bg-blue-100 px-1 rounded">.proto</code> file. Field names are not available — only field numbers. Click <strong>▸</strong> on length-delimited fields to expand nested messages.
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Protobuf Binary Decoder tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Decode base64-encoded Protobuf binary messages. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Protobuf Binary Decoder tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Decode base64-encoded Protobuf binary messages. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Protobuf Binary Decoder",
  "description": "Decode base64-encoded Protobuf binary messages",
  "url": "https://tools.loresync.dev/protobuf-decoder",
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
