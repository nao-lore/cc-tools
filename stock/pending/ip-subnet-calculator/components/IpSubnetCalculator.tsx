"use client";

import { useState, useCallback } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = parseInt(p, 10);
    if (isNaN(v) || v < 0 || v > 255 || p.trim() === "") return null;
    n = (n << 8) | v;
  }
  return n >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

function ipToBinary(n: number): string {
  return [
    ((n >>> 24) & 0xff).toString(2).padStart(8, "0"),
    ((n >>> 16) & 0xff).toString(2).padStart(8, "0"),
    ((n >>> 8) & 0xff).toString(2).padStart(8, "0"),
    (n & 0xff).toString(2).padStart(8, "0"),
  ].join(".");
}

function maskFromCidr(cidr: number): number {
  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

function cidrFromMask(mask: number): number | null {
  // Validate it's a valid contiguous mask
  const inv = (~mask) >>> 0;
  if ((inv & (inv + 1)) !== 0) return null;
  return 32 - Math.round(Math.log2(inv + 1));
}

interface SubnetInfo {
  cidr: number;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  numHosts: number;
  subnetMask: string;
  wildcardMask: string;
  ipInt: number;
  networkInt: number;
  broadcastInt: number;
  maskInt: number;
}

function calculate(ipInt: number, cidr: number): SubnetInfo {
  const maskInt = maskFromCidr(cidr);
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;
  const numHosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;
  const firstHostInt = cidr >= 31 ? networkInt : (networkInt + 1) >>> 0;
  const lastHostInt = cidr >= 31 ? broadcastInt : (broadcastInt - 1) >>> 0;

  return {
    cidr,
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    firstHost: intToIp(firstHostInt),
    lastHost: intToIp(lastHostInt),
    numHosts,
    subnetMask: intToIp(maskInt),
    wildcardMask: intToIp(wildcardInt),
    ipInt,
    networkInt,
    broadcastInt,
    maskInt,
  };
}

// ── sub-components ────────────────────────────────────────────────────────────

function BinaryRow({ label, value, networkInt, cidr }: { label: string; value: number; networkInt: number; cidr: number }) {
  const bin = ipToBinary(value);
  // Split into network/host parts visually
  const flat = bin.replace(/\./g, "");
  const octets = bin.split(".");

  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      <div className="flex gap-1 flex-wrap">
        {octets.map((oct, oi) => (
          <div key={oi} className="flex">
            {oi > 0 && <span className="text-muted font-mono text-xs mx-0.5 self-center">.</span>}
            <div className="flex">
              {oct.split("").map((bit, bi) => {
                const globalIdx = oi * 8 + bi;
                const isNetwork = globalIdx < cidr;
                const isOne = bit === "1";
                return (
                  <div
                    key={bi}
                    title={`bit ${31 - globalIdx} = ${bit} (${isNetwork ? "network" : "host"})`}
                    className={`w-[18px] h-6 flex items-center justify-center text-[10px] font-mono font-bold border transition-colors ${
                      isOne
                        ? isNetwork
                          ? "bg-accent text-white border-accent/80"
                          : "bg-blue-400 text-white border-blue-500"
                        : isNetwork
                        ? "bg-accent/10 text-accent border-accent/20"
                        : "bg-surface border-border text-muted"
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted mt-0.5 font-mono">{bin}</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      className="p-1 text-muted hover:text-foreground transition-colors shrink-0 ml-2"
      title="Copy"
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
        </svg>
      )}
    </button>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-surface rounded-xl border border-border px-4 py-2.5">
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-mono text-sm font-semibold">{value}</p>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────────

const CIDR_QUICK = [8, 16, 24, 28, 30, 32] as const;

export default function IpSubnetCalculator() {
  const [inputMode, setInputMode] = useState<"cidr" | "mask">("cidr");
  const [ipInput, setIpInput] = useState("192.168.1.0");
  const [cidrInput, setCidrInput] = useState("24");
  const [maskInput, setMaskInput] = useState("255.255.255.0");
  const [result, setResult] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = useCallback(() => {
    setError("");
    setResult(null);

    const ipInt = ipToInt(ipInput);
    if (ipInt === null) {
      setError("Invalid IP address. Enter a valid IPv4 address (e.g. 192.168.1.0).");
      return;
    }

    let cidr: number;
    if (inputMode === "cidr") {
      const c = parseInt(cidrInput, 10);
      if (isNaN(c) || c < 0 || c > 32) {
        setError("CIDR must be between 0 and 32.");
        return;
      }
      cidr = c;
    } else {
      const maskInt = ipToInt(maskInput);
      if (maskInt === null) {
        setError("Invalid subnet mask.");
        return;
      }
      const c = cidrFromMask(maskInt);
      if (c === null) {
        setError("Subnet mask is not a valid contiguous mask.");
        return;
      }
      cidr = c;
    }

    setResult(calculate(ipInt, cidr));
  }, [ipInput, cidrInput, maskInput, inputMode]);

  const handleQuickCidr = useCallback((c: number) => {
    setCidrInput(String(c));
    setMaskInput(intToIp(maskFromCidr(c)));
    setInputMode("cidr");
    setResult(null);
    setError("");
  }, []);

  // Sync mask when cidr changes
  const handleCidrChange = (v: string) => {
    setCidrInput(v);
    const c = parseInt(v, 10);
    if (!isNaN(c) && c >= 0 && c <= 32) {
      setMaskInput(intToIp(maskFromCidr(c)));
    }
    setResult(null);
    setError("");
  };

  // Sync cidr when mask changes
  const handleMaskChange = (v: string) => {
    setMaskInput(v);
    const m = ipToInt(v);
    if (m !== null) {
      const c = cidrFromMask(m);
      if (c !== null) setCidrInput(String(c));
    }
    setResult(null);
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Input card */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="text-sm font-semibold mb-3">Input</h2>

        {/* IP Address */}
        <div className="mb-4">
          <label className="block text-xs text-muted mb-1">IP Address</label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => { setIpInput(e.target.value); setResult(null); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            placeholder="192.168.1.0"
            className="w-full px-3 py-2 border border-border rounded-xl font-mono text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-colors bg-background"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setInputMode("cidr")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              inputMode === "cidr"
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            CIDR Notation
          </button>
          <button
            onClick={() => setInputMode("mask")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              inputMode === "mask"
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            Subnet Mask
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* CIDR input */}
          <div>
            <label className={`block text-xs mb-1 ${inputMode === "cidr" ? "text-muted" : "text-muted/50"}`}>
              CIDR Prefix Length
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted font-mono text-sm">/</span>
              <input
                type="number"
                min={0}
                max={32}
                value={cidrInput}
                onChange={(e) => handleCidrChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                className={`w-full px-3 py-2 border rounded-xl font-mono text-sm outline-none transition-colors bg-background ${
                  inputMode === "cidr"
                    ? "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
                    : "border-border/50 text-muted/50"
                }`}
              />
            </div>
          </div>

          {/* Mask input */}
          <div>
            <label className={`block text-xs mb-1 ${inputMode === "mask" ? "text-muted" : "text-muted/50"}`}>
              Subnet Mask
            </label>
            <input
              type="text"
              value={maskInput}
              onChange={(e) => handleMaskChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              placeholder="255.255.255.0"
              className={`w-full px-3 py-2 border rounded-xl font-mono text-sm outline-none transition-colors bg-background ${
                inputMode === "mask"
                  ? "border-border focus:border-accent focus:ring-2 focus:ring-accent/10"
                  : "border-border/50 text-muted/50"
              }`}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>

        {/* CIDR quick-select */}
        <div className="mb-4">
          <p className="text-xs text-muted mb-1.5">Quick select</p>
          <div className="flex flex-wrap gap-1.5">
            {CIDR_QUICK.map((c) => (
              <button
                key={c}
                onClick={() => handleQuickCidr(c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  cidrInput === String(c)
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-muted hover:text-foreground hover:border-accent/40"
                }`}
              >
                /{c}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <button
          onClick={handleCalculate}
          className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          Calculate
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary banner */}
          <div className="bg-accent/10 border border-accent/20 rounded-2xl px-4 py-3 text-center">
            <p className="font-mono text-lg font-bold text-accent">
              {result.networkAddress}/{result.cidr}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {result.numHosts.toLocaleString()} usable host{result.numHosts !== 1 ? "s" : ""} &nbsp;·&nbsp; Mask: {result.subnetMask}
            </p>
          </div>

          {/* Result rows */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold mb-3">Subnet Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ResultRow label="Network Address" value={result.networkAddress} />
              <ResultRow label="Broadcast Address" value={result.broadcastAddress} />
              <ResultRow label="First Usable Host" value={result.cidr >= 32 ? "N/A" : result.firstHost} />
              <ResultRow label="Last Usable Host" value={result.cidr >= 32 ? "N/A" : result.lastHost} />
              <ResultRow label="Subnet Mask" value={result.subnetMask} />
              <ResultRow label="Wildcard Mask" value={result.wildcardMask} />
              <ResultRow label="CIDR Notation" value={`${result.networkAddress}/${result.cidr}`} />
              <ResultRow label="Usable Hosts" value={result.numHosts.toLocaleString()} />
            </div>
          </div>

          {/* Binary representation */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold mb-1">Binary Representation</h3>
            <p className="text-xs text-muted mb-4">
              <span className="inline-block w-3 h-3 rounded-sm bg-accent mr-1 align-middle" />network bits &nbsp;
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-400 mr-1 align-middle" />host bits
            </p>
            <div className="space-y-4 overflow-x-auto">
              <BinaryRow label="IP Address" value={result.ipInt} networkInt={result.networkInt} cidr={result.cidr} />
              <BinaryRow label="Subnet Mask" value={result.maskInt} networkInt={result.networkInt} cidr={result.cidr} />
              <BinaryRow label="Network Address" value={result.networkInt} networkInt={result.networkInt} cidr={result.cidr} />
              <BinaryRow label="Broadcast Address" value={result.broadcastInt} networkInt={result.networkInt} cidr={result.cidr} />
            </div>
          </div>

          {/* Host count breakdown */}
          <div className="bg-surface rounded-2xl border border-border p-4">
            <h3 className="text-sm font-semibold mb-3">Address Space</h3>
            <div className="space-y-1.5 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-muted">Total addresses</span>
                <span>{Math.pow(2, 32 - result.cidr).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Network address</span>
                <span>1</span>
              </div>
              {result.cidr < 31 && (
                <div className="flex justify-between">
                  <span className="text-muted">Broadcast address</span>
                  <span>1</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
                <span className="text-muted">Usable hosts</span>
                <span>{result.numHosts.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted pt-1">
                Formula: 2^(32−{result.cidr}){result.cidr < 31 ? " − 2" : result.cidr === 31 ? "" : " (host route)"}
                {" = "}{result.numHosts.toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ad placeholder */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex items-center justify-center h-20 text-xs text-muted">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this IP Subnet Calculator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Calculate network address, broadcast, and host range from IP/CIDR. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this IP Subnet Calculator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Calculate network address, broadcast, and host range from IP/CIDR. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
