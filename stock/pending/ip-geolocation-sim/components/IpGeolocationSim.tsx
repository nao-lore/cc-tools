"use client";

import { useState, useCallback } from "react";

interface IpAnalysis {
  ip: string;
  octets: number[];
  ipClass: "A" | "B" | "C" | "D" | "E";
  isPrivate: boolean;
  isLoopback: boolean;
  isLinkLocal: boolean;
  isMulticast: boolean;
  isBroadcast: boolean;
  isPublic: boolean;
  defaultMask: string;
  defaultCidr: number;
  networkBits: number;
  hostBits: number;
  binaryOctets: string[];
}

function validateIp(ip: string): boolean {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

function analyzeIp(ip: string): IpAnalysis {
  const octets = ip.trim().split(".").map(Number);
  const [a, b, c] = octets;

  // Class determination
  let ipClass: IpAnalysis["ipClass"];
  let defaultMask: string;
  let defaultCidr: number;
  let networkBits: number;
  let hostBits: number;

  if (a < 128) {
    ipClass = "A";
    defaultMask = "255.0.0.0";
    defaultCidr = 8;
    networkBits = 8;
    hostBits = 24;
  } else if (a < 192) {
    ipClass = "B";
    defaultMask = "255.255.0.0";
    defaultCidr = 16;
    networkBits = 16;
    hostBits = 16;
  } else if (a < 224) {
    ipClass = "C";
    defaultMask = "255.255.255.0";
    defaultCidr = 24;
    networkBits = 24;
    hostBits = 8;
  } else if (a < 240) {
    ipClass = "D";
    defaultMask = "N/A (Multicast)";
    defaultCidr = 4;
    networkBits = 4;
    hostBits = 28;
  } else {
    ipClass = "E";
    defaultMask = "N/A (Reserved)";
    defaultCidr = 4;
    networkBits = 4;
    hostBits = 28;
  }

  // Special range detection
  const isLoopback = a === 127;
  const isLinkLocal = a === 169 && b === 254;
  const isMulticast = a >= 224 && a <= 239;
  const isBroadcast = octets.every((o) => o === 255);
  const isPrivate =
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168);
  const isPublic =
    !isPrivate && !isLoopback && !isLinkLocal && !isMulticast && !isBroadcast &&
    ipClass !== "D" && ipClass !== "E";

  const binaryOctets = octets.map((o) => o.toString(2).padStart(8, "0"));

  return {
    ip: ip.trim(),
    octets,
    ipClass,
    isPrivate,
    isLoopback,
    isLinkLocal,
    isMulticast,
    isBroadcast,
    isPublic,
    defaultMask,
    defaultCidr,
    networkBits,
    hostBits,
    binaryOctets,
  };
}

const CLASS_INFO: Record<string, { range: string; desc: string; color: string }> = {
  A: { range: "0.0.0.0 – 127.255.255.255", desc: "Large networks (ISPs, large orgs)", color: "bg-blue-100 text-blue-800 border-blue-200" },
  B: { range: "128.0.0.0 – 191.255.255.255", desc: "Medium networks (universities, mid-size orgs)", color: "bg-purple-100 text-purple-800 border-purple-200" },
  C: { range: "192.0.0.0 – 223.255.255.255", desc: "Small networks (home, small orgs)", color: "bg-green-100 text-green-800 border-green-200" },
  D: { range: "224.0.0.0 – 239.255.255.255", desc: "Multicast (not assignable to hosts)", color: "bg-orange-100 text-orange-800 border-orange-200" },
  E: { range: "240.0.0.0 – 255.255.255.255", desc: "Reserved / Experimental", color: "bg-red-100 text-red-800 border-red-200" },
};

type BadgeColor = "gray" | "blue" | "green" | "orange" | "red" | "purple" | "yellow";

function Badge({ label, color }: { label: string; color: BadgeColor }) {
  const colors: Record<BadgeColor, string> = {
    gray:   "bg-gray-100 text-gray-700 border-gray-200",
    blue:   "bg-blue-100 text-blue-700 border-blue-200",
    green:  "bg-green-100 text-green-700 border-green-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    red:    "bg-red-100 text-red-700 border-red-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color]}`}>
      {label}
    </span>
  );
}

const EXAMPLE_IPS = [
  "192.168.1.1",
  "10.0.0.1",
  "172.16.5.10",
  "8.8.8.8",
  "127.0.0.1",
  "169.254.0.1",
  "224.0.0.1",
  "255.255.255.255",
];

export default function IpGeolocationSim() {
  const [input, setInput] = useState("192.168.1.1");
  const [error, setError] = useState("");
  const [result, setResult] = useState<IpAnalysis | null>(null);

  const handleAnalyze = useCallback((ip?: string) => {
    const val = (ip ?? input).trim();
    setError("");
    if (!validateIp(val)) {
      setError("Invalid IPv4 address. Enter four octets 0–255 separated by dots.");
      setResult(null);
      return;
    }
    setResult(analyzeIp(val));
  }, [input]);

  const handleExample = useCallback((ip: string) => {
    setInput(ip);
    setError("");
    setResult(analyzeIp(ip));
  }, []);

  const classInfo = result ? CLASS_INFO[result.ipClass] : null;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          IPv4 Address
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); setResult(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="e.g. 192.168.1.1"
            className={`flex-1 px-3 py-2.5 border rounded-lg font-mono text-sm outline-none transition-colors ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={() => handleAnalyze()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Analyze
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

        {/* Examples */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-gray-400 self-center mr-1">Try:</span>
          {EXAMPLE_IPS.map((ip) => (
            <button
              key={ip}
              onClick={() => handleExample(ip)}
              className="px-2 py-0.5 text-xs font-mono bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              {ip}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && classInfo && (
        <>
          {/* Class summary */}
          <div className={`border rounded-xl p-5 ${classInfo.color}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">IP Class</p>
                <p className="text-4xl font-bold">{result.ipClass}</p>
                <p className="text-sm mt-1 opacity-80">{classInfo.desc}</p>
                <p className="text-xs mt-0.5 opacity-60 font-mono">{classInfo.range}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.isPublic    && <Badge label="Public"      color="blue" />}
                {result.isPrivate   && <Badge label="Private"     color="green" />}
                {result.isLoopback  && <Badge label="Loopback"    color="purple" />}
                {result.isLinkLocal && <Badge label="Link-Local"  color="yellow" />}
                {result.isMulticast && <Badge label="Multicast"   color="orange" />}
                {result.isBroadcast && <Badge label="Broadcast"   color="red" />}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Address Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "IP Address",        value: result.ip },
                { label: "IP Class",          value: `Class ${result.ipClass}` },
                { label: "Default Subnet Mask", value: result.defaultMask },
                { label: "Default CIDR",      value: result.ipClass === "D" || result.ipClass === "E" ? "N/A" : `/${result.defaultCidr}` },
                { label: "Network Bits",      value: result.ipClass === "D" || result.ipClass === "E" ? "N/A" : `${result.networkBits} bits` },
                { label: "Host Bits",         value: result.ipClass === "D" || result.ipClass === "E" ? "N/A" : `${result.hostBits} bits` },
                { label: "Max Hosts / Subnet",value: result.ipClass === "A" ? "16,777,214" : result.ipClass === "B" ? "65,534" : result.ipClass === "C" ? "254" : "N/A" },
                { label: "Type",              value: result.isBroadcast ? "Broadcast" : result.isLoopback ? "Loopback" : result.isLinkLocal ? "Link-Local" : result.isMulticast ? "Multicast" : result.isPrivate ? "Private (RFC 1918)" : "Public" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg px-4 py-2.5">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Binary representation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Binary Representation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-600 w-16">Octet</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600 w-16">Decimal</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">Binary</th>
                  </tr>
                </thead>
                <tbody>
                  {result.octets.map((octet, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-500 text-xs">{i + 1}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-gray-900 text-right">{octet}</td>
                      <td className="py-2 px-3 font-mono text-gray-700">
                        <span className={i < Math.ceil(result.networkBits / 8) && result.ipClass !== "D" && result.ipClass !== "E" ? "text-blue-700 font-bold" : "text-gray-500"}>
                          {result.binaryOctets[i]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-gray-400">
                <span className="text-blue-700 font-bold">Blue</span> octets = network portion (Class {result.ipClass} default mask)
              </p>
            </div>

            {/* Bit-level display */}
            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">All 32 bits</p>
              <div className="flex flex-wrap gap-0.5">
                {result.binaryOctets.flatMap((octet, oi) =>
                  octet.split("").map((bit, bi) => {
                    const bitIndex = oi * 8 + bi;
                    const isNetwork = result.ipClass !== "D" && result.ipClass !== "E" && bitIndex < result.networkBits;
                    const isOne = bit === "1";
                    return (
                      <div
                        key={bitIndex}
                        title={`bit ${31 - bitIndex} = ${bit}`}
                        className={`w-5 h-7 flex items-center justify-center rounded text-xs font-mono font-bold border ${
                          isOne
                            ? isNetwork
                              ? "bg-blue-600 border-blue-700 text-white"
                              : "bg-gray-600 border-gray-700 text-white"
                            : isNetwork
                            ? "bg-blue-100 border-blue-200 text-blue-600"
                            : "bg-gray-100 border-gray-200 text-gray-400"
                        }`}
                      >
                        {bit}
                      </div>
                    );
                  })
                )}
              </div>
              {result.ipClass !== "D" && result.ipClass !== "E" && (
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span><span className="inline-block w-3 h-3 rounded bg-blue-200 border border-blue-300 mr-1 align-middle" />Network ({result.networkBits} bits)</span>
                  <span><span className="inline-block w-3 h-3 rounded bg-gray-200 border border-gray-300 mr-1 align-middle" />Host ({result.hostBits} bits)</span>
                </div>
              )}
            </div>
          </div>

          {/* Special ranges reference */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Special Address Ranges</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">Type</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">Range</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {[
                    { type: "Loopback",   range: "127.0.0.0/8",       purpose: "Local host testing (127.0.0.1 = localhost)" },
                    { type: "Private A",  range: "10.0.0.0/8",        purpose: "RFC 1918 private network" },
                    { type: "Private B",  range: "172.16.0.0/12",     purpose: "RFC 1918 private network" },
                    { type: "Private C",  range: "192.168.0.0/16",    purpose: "RFC 1918 private network" },
                    { type: "Link-Local", range: "169.254.0.0/16",    purpose: "APIPA / auto-config when DHCP fails" },
                    { type: "Multicast",  range: "224.0.0.0/4",       purpose: "One-to-many group communication" },
                    { type: "Broadcast",  range: "255.255.255.255/32", purpose: "Limited broadcast to all hosts" },
                    { type: "Reserved",   range: "240.0.0.0/4",       purpose: "Class E — experimental / future use" },
                  ].map((row) => {
                    const isMatch =
                      (row.type === "Loopback"   && result.isLoopback)  ||
                      (row.type === "Link-Local"  && result.isLinkLocal) ||
                      (row.type === "Multicast"   && result.isMulticast) ||
                      (row.type === "Broadcast"   && result.isBroadcast) ||
                      (row.type === "Reserved"    && result.ipClass === "E") ||
                      ((row.type === "Private A" || row.type === "Private B" || row.type === "Private C") && result.isPrivate);
                    return (
                      <tr
                        key={row.type}
                        className={`border-b border-gray-100 transition-colors ${isMatch ? "bg-yellow-50" : "hover:bg-gray-50"}`}
                      >
                        <td className="py-2 px-3 font-semibold text-gray-800">
                          {row.type}
                          {isMatch && <span className="ml-2 text-xs text-yellow-700 font-normal">(match)</span>}
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-gray-600">{row.range}</td>
                        <td className="py-2 px-3 text-xs text-gray-500">{row.purpose}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center justify-center h-20 text-xs text-gray-400">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this IP Address Class Analyzer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Analyze an IPv4 address: class, type, reserved range check. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this IP Address Class Analyzer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Analyze an IPv4 address: class, type, reserved range check. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "IP Address Class Analyzer",
  "description": "Analyze an IPv4 address: class, type, reserved range check",
  "url": "https://tools.loresync.dev/ip-geolocation-sim",
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
