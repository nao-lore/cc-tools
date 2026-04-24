"use client";

import { useState, useCallback } from "react";

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  ipClass: string;
  binaryIp: string;
  binaryMask: string;
  cidr: number;
}

const COPY_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
  </svg>
);

const CHECK_ICON = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SUBNET_REFERENCE = [
  { cidr: 8,  mask: "255.0.0.0",       hosts: 16777214, wildcard: "0.255.255.255" },
  { cidr: 16, mask: "255.255.0.0",     hosts: 65534,    wildcard: "0.0.255.255" },
  { cidr: 24, mask: "255.255.255.0",   hosts: 254,      wildcard: "0.0.0.255" },
  { cidr: 25, mask: "255.255.255.128", hosts: 126,      wildcard: "0.0.0.127" },
  { cidr: 26, mask: "255.255.255.192", hosts: 62,       wildcard: "0.0.0.63" },
  { cidr: 27, mask: "255.255.255.224", hosts: 30,       wildcard: "0.0.0.31" },
  { cidr: 28, mask: "255.255.255.240", hosts: 14,       wildcard: "0.0.0.15" },
  { cidr: 29, mask: "255.255.255.248", hosts: 6,        wildcard: "0.0.0.7" },
  { cidr: 30, mask: "255.255.255.252", hosts: 2,        wildcard: "0.0.0.3" },
];

function ipToNum(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function numToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
}

function maskToCidr(mask: number): number {
  let bits = 0;
  let m = mask;
  while (m) {
    bits += m & 1;
    m >>>= 1;
  }
  return bits;
}

function ipToBinary(ip: string): string {
  return ip
    .split(".")
    .map((o) => parseInt(o).toString(2).padStart(8, "0"))
    .join(".");
}

function getIpClass(firstOctet: number): string {
  if (firstOctet < 128) return "A";
  if (firstOctet < 192) return "B";
  if (firstOctet < 224) return "C";
  if (firstOctet < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function validateIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

function validateMask(mask: string): boolean {
  if (!validateIp(mask)) return false;
  const num = ipToNum(mask);
  // Valid masks have contiguous 1s followed by contiguous 0s
  const inverted = (~num) >>> 0;
  return (inverted & (inverted + 1)) === 0;
}

function calculateSubnet(ip: string, cidr: number): SubnetInfo {
  const ipNum = ipToNum(ip);
  const maskNum = cidrToMask(cidr);
  const wildcardNum = (~maskNum) >>> 0;
  const networkNum = (ipNum & maskNum) >>> 0;
  const broadcastNum = (networkNum | wildcardNum) >>> 0;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  const firstHostNum = cidr >= 31 ? networkNum : (networkNum + 1) >>> 0;
  const lastHostNum = cidr >= 31 ? broadcastNum : (broadcastNum - 1) >>> 0;
  const subnetMask = numToIp(maskNum);
  const wildcardMask = numToIp(wildcardNum);

  return {
    networkAddress: numToIp(networkNum),
    broadcastAddress: numToIp(broadcastNum),
    firstHost: numToIp(firstHostNum),
    lastHost: numToIp(lastHostNum),
    totalHosts,
    usableHosts,
    subnetMask,
    wildcardMask,
    ipClass: getIpClass(ipNum >>> 24),
    binaryIp: ipToBinary(ip),
    binaryMask: ipToBinary(subnetMask),
    cidr,
  };
}

export default function IpCalculator() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [cidrRange, setCidrRange] = useState("");
  const [cidrRangeResult, setCidrRangeResult] = useState<{ start: string; end: string; count: number } | null>(null);
  const [cidrRangeError, setCidrRangeError] = useState("");

  const handleCalculate = useCallback(() => {
    setError("");
    setResult(null);

    const trimmed = input.trim();
    let ip = "";
    let cidr = -1;

    if (trimmed.includes("/")) {
      // CIDR notation: 192.168.1.0/24
      const [ipPart, cidrPart] = trimmed.split("/");
      ip = ipPart.trim();
      cidr = parseInt(cidrPart.trim(), 10);
      if (!validateIp(ip)) { setError("Invalid IP address."); return; }
      if (isNaN(cidr) || cidr < 0 || cidr > 32) { setError("CIDR must be between 0 and 32."); return; }
    } else if (trimmed.includes(" ")) {
      // IP + subnet mask: 192.168.1.0 255.255.255.0
      const parts = trimmed.split(/\s+/);
      if (parts.length !== 2) { setError("Enter IP/CIDR (e.g. 192.168.1.0/24) or IP + mask (e.g. 192.168.1.0 255.255.255.0)."); return; }
      ip = parts[0];
      const mask = parts[1];
      if (!validateIp(ip)) { setError("Invalid IP address."); return; }
      if (!validateMask(mask)) { setError("Invalid subnet mask."); return; }
      cidr = maskToCidr(ipToNum(mask));
    } else {
      setError("Enter IP/CIDR (e.g. 192.168.1.0/24) or IP + mask (e.g. 192.168.1.0 255.255.255.0).");
      return;
    }

    setResult(calculateSubnet(ip, cidr));
  }, [input]);

  const handleCidrRange = useCallback(() => {
    setCidrRangeError("");
    setCidrRangeResult(null);
    const trimmed = cidrRange.trim();
    if (!trimmed.includes("/")) { setCidrRangeError("Enter CIDR notation, e.g. 10.0.0.0/8"); return; }
    const [ipPart, cidrPart] = trimmed.split("/");
    const ip = ipPart.trim();
    const cidr = parseInt(cidrPart.trim(), 10);
    if (!validateIp(ip)) { setCidrRangeError("Invalid IP address."); return; }
    if (isNaN(cidr) || cidr < 0 || cidr > 32) { setCidrRangeError("CIDR must be between 0 and 32."); return; }
    const maskNum = cidrToMask(cidr);
    const wildcardNum = (~maskNum) >>> 0;
    const networkNum = (ipToNum(ip) & maskNum) >>> 0;
    const broadcastNum = (networkNum | wildcardNum) >>> 0;
    setCidrRangeResult({
      start: numToIp(networkNum),
      end: numToIp(broadcastNum),
      count: Math.pow(2, 32 - cidr),
    });
  }, [cidrRange]);

  const handleCopy = useCallback(async (key: string, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const resultRows: { label: string; key: string; value: string }[] = result
    ? [
        { label: "Network Address", key: "network", value: result.networkAddress },
        { label: "Broadcast Address", key: "broadcast", value: result.broadcastAddress },
        { label: "First Usable Host", key: "first", value: result.firstHost },
        { label: "Last Usable Host", key: "last", value: result.lastHost },
        { label: "Subnet Mask", key: "mask", value: result.subnetMask },
        { label: "Wildcard Mask", key: "wildcard", value: result.wildcardMask },
        { label: "Usable Hosts", key: "usable", value: result.usableHosts.toLocaleString() },
        { label: "Total Addresses", key: "total", value: result.totalHosts.toLocaleString() },
        { label: "IP Class", key: "class", value: result.ipClass },
        { label: "CIDR", key: "cidr", value: `/${result.cidr}` },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Main Calculator */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          IP Address / CIDR
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            placeholder="e.g. 192.168.1.0/24 or 192.168.1.0 255.255.255.0"
            className={`flex-1 px-3 py-2.5 border rounded-lg font-mono text-sm outline-none transition-colors ${
              error
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={handleCalculate}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Calculate
          </button>
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        <p className="mt-1.5 text-xs text-gray-400">
          Accepts CIDR notation (192.168.1.0/24) or IP + subnet mask (192.168.1.0 255.255.255.0)
        </p>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Subnet Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {resultRows.map(({ label, key, value }) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5">
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">{value}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(key, value)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                    title={`Copy ${label}`}
                  >
                    {copiedKey === key ? CHECK_ICON : COPY_ICON}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Binary Representation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Binary Representation</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">IP Address</p>
                <p className="font-mono text-sm text-gray-800 bg-gray-50 rounded px-3 py-2 break-all">{result.binaryIp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Subnet Mask</p>
                <p className="font-mono text-sm text-gray-800 bg-gray-50 rounded px-3 py-2 break-all">{result.binaryMask}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CIDR to IP Range Converter */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">CIDR to IP Range</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={cidrRange}
            onChange={(e) => setCidrRange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCidrRange()}
            placeholder="e.g. 10.0.0.0/8"
            className={`flex-1 px-3 py-2.5 border rounded-lg font-mono text-sm outline-none transition-colors ${
              cidrRangeError
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={handleCidrRange}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Convert
          </button>
        </div>
        {cidrRangeError && <p className="mt-1.5 text-xs text-red-500">{cidrRangeError}</p>}
        {cidrRangeResult && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg px-4 py-2.5">
              <p className="text-xs text-gray-500">Start IP</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{cidrRangeResult.start}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2.5">
              <p className="text-xs text-gray-500">End IP</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{cidrRangeResult.end}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-2.5">
              <p className="text-xs text-gray-500">Total Addresses</p>
              <p className="font-mono text-sm font-semibold text-gray-900">{cidrRangeResult.count.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Subnet Reference Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Common Subnet Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">CIDR</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Subnet Mask</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Wildcard Mask</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Usable Hosts</th>
              </tr>
            </thead>
            <tbody>
              {SUBNET_REFERENCE.map(({ cidr, mask, hosts, wildcard }) => (
                <tr
                  key={cidr}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => { setInput(`0.0.0.0/${cidr}`); setError(""); setResult(null); }}
                  title={`Click to use /${cidr}`}
                >
                  <td className="py-1.5 px-3 font-mono font-semibold text-blue-700">/{cidr}</td>
                  <td className="py-1.5 px-3 font-mono text-gray-700">{mask}</td>
                  <td className="py-1.5 px-3 font-mono text-gray-500">{wildcard}</td>
                  <td className="py-1.5 px-3 font-mono text-gray-700 text-right">{hosts.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-gray-400">Click a row to load that prefix length into the calculator.</p>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this IP Subnet Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate IP subnets, CIDR ranges, and network details. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this IP Subnet Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate IP subnets, CIDR ranges, and network details. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
