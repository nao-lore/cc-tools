"use client";

import { useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Severity = "error" | "warning" | "info";

interface ValidationResult {
  line: number;
  raw: string;
  type: string;
  issues: { severity: Severity; message: string }[];
  valid: boolean;
}

// ── Validation Helpers ───────────────────────────────────────────────────────

const IPV4_RE =
  /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/;

const IPV6_RE =
  /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]+|::(ffff(:0{1,4})?:)?((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?\d)?\d)\.){3}(25[0-5]|(2[0-4]|1?\d)?\d))$/;

// Hostname label: letters, digits, hyphens; not starting/ending with hyphen
const LABEL_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/;

function isValidHostname(h: string): boolean {
  // Allow trailing dot (FQDN)
  const s = h.endsWith(".") ? h.slice(0, -1) : h;
  if (!s || s.length > 253) return false;
  return s.split(".").every((label) => label.length > 0 && label.length <= 63 && LABEL_RE.test(label));
}

function hasTrailingDot(h: string): boolean {
  return h.endsWith(".");
}

function isPositiveInteger(s: string): boolean {
  return /^\d+$/.test(s) && parseInt(s, 10) >= 0;
}

// ── Per-type validators ──────────────────────────────────────────────────────

function validateA(parts: string[]): { severity: Severity; message: string }[] {
  // Expected: NAME [TTL] IN A address
  // After stripping type, remaining = [address]
  const issues: { severity: Severity; message: string }[] = [];
  if (parts.length < 1) {
    issues.push({ severity: "error", message: "A record is missing the IP address." });
    return issues;
  }
  const ip = parts[parts.length - 1];
  if (!IPV4_RE.test(ip)) {
    issues.push({ severity: "error", message: `"${ip}" is not a valid IPv4 address.` });
  }
  if (IPV6_RE.test(ip)) {
    issues.push({ severity: "error", message: "IPv6 address used in A record — use AAAA instead." });
  }
  return issues;
}

function validateAAAA(parts: string[]): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  if (parts.length < 1) {
    issues.push({ severity: "error", message: "AAAA record is missing the IPv6 address." });
    return issues;
  }
  const ip = parts[parts.length - 1];
  if (!IPV6_RE.test(ip)) {
    issues.push({ severity: "error", message: `"${ip}" is not a valid IPv6 address.` });
  }
  if (IPV4_RE.test(ip)) {
    issues.push({ severity: "error", message: "IPv4 address used in AAAA record — use A instead." });
  }
  return issues;
}

function validateCNAME(parts: string[]): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  if (parts.length < 1) {
    issues.push({ severity: "error", message: "CNAME record is missing the target hostname." });
    return issues;
  }
  const target = parts[parts.length - 1];
  if (!isValidHostname(target)) {
    issues.push({ severity: "error", message: `"${target}" is not a valid hostname for a CNAME target.` });
  }
  if (!hasTrailingDot(target)) {
    issues.push({ severity: "warning", message: `Missing trailing dot on CNAME target "${target}" — without it, some parsers treat it as relative.` });
  }
  return issues;
}

function validateMX(parts: string[]): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  // After type: [priority, hostname]
  if (parts.length < 2) {
    issues.push({ severity: "error", message: "MX record requires both a priority (integer) and a mail server hostname." });
    return issues;
  }
  const [priority, hostname] = [parts[parts.length - 2], parts[parts.length - 1]];
  if (!isPositiveInteger(priority)) {
    issues.push({ severity: "error", message: `MX priority "${priority}" must be a non-negative integer (e.g. 10).` });
  } else {
    const p = parseInt(priority, 10);
    if (p > 65535) {
      issues.push({ severity: "error", message: `MX priority ${p} exceeds maximum value of 65535.` });
    }
  }
  if (!isValidHostname(hostname)) {
    issues.push({ severity: "error", message: `"${hostname}" is not a valid MX mail server hostname.` });
  }
  if (!hasTrailingDot(hostname)) {
    issues.push({ severity: "warning", message: `Missing trailing dot on MX target "${hostname}".` });
  }
  return issues;
}

function validateTXT(rdata: string): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  const trimmed = rdata.trim();
  if (!trimmed) {
    issues.push({ severity: "error", message: "TXT record has no data." });
    return issues;
  }
  // Must start with a double-quote (or multiple quoted strings)
  if (!trimmed.startsWith('"')) {
    issues.push({ severity: "error", message: `TXT record data must be enclosed in double quotes. Got: ${trimmed.slice(0, 40)}` });
  } else {
    // Check balanced quotes
    let inQuote = false;
    let i = 0;
    while (i < trimmed.length) {
      if (trimmed[i] === '"' && (i === 0 || trimmed[i - 1] !== "\\")) {
        inQuote = !inQuote;
      }
      i++;
    }
    if (inQuote) {
      issues.push({ severity: "error", message: "TXT record has unbalanced quotes." });
    }
    // Warn if a single string exceeds 255 chars
    const stringRe = /"((?:[^"\\]|\\.)*)"/g;
    let m: RegExpExecArray | null;
    while ((m = stringRe.exec(trimmed)) !== null) {
      if (m[1].length > 255) {
        issues.push({ severity: "warning", message: `TXT string segment is ${m[1].length} characters — RFC 1035 limits each to 255 bytes.` });
      }
    }
  }
  return issues;
}

function validateSRV(parts: string[]): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  // After type: [priority, weight, port, target]
  if (parts.length < 4) {
    issues.push({ severity: "error", message: "SRV record requires priority, weight, port, and target (4 fields after type)." });
    return issues;
  }
  const [priority, weight, port, target] = [
    parts[parts.length - 4],
    parts[parts.length - 3],
    parts[parts.length - 2],
    parts[parts.length - 1],
  ];
  if (!isPositiveInteger(priority) || parseInt(priority, 10) > 65535) {
    issues.push({ severity: "error", message: `SRV priority "${priority}" must be an integer 0–65535.` });
  }
  if (!isPositiveInteger(weight) || parseInt(weight, 10) > 65535) {
    issues.push({ severity: "error", message: `SRV weight "${weight}" must be an integer 0–65535.` });
  }
  const portNum = parseInt(port, 10);
  if (!isPositiveInteger(port) || portNum < 1 || portNum > 65535) {
    issues.push({ severity: "error", message: `SRV port "${port}" must be an integer 1–65535.` });
  }
  if (target === "." ) {
    issues.push({ severity: "info", message: `SRV target "." means the service is not available at this domain.` });
  } else {
    if (!isValidHostname(target)) {
      issues.push({ severity: "error", message: `"${target}" is not a valid SRV target hostname.` });
    }
    if (!hasTrailingDot(target)) {
      issues.push({ severity: "warning", message: `Missing trailing dot on SRV target "${target}".` });
    }
  }
  return issues;
}

function validateNS(parts: string[]): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  if (parts.length < 1) {
    issues.push({ severity: "error", message: "NS record is missing the nameserver hostname." });
    return issues;
  }
  const ns = parts[parts.length - 1];
  if (!isValidHostname(ns)) {
    issues.push({ severity: "error", message: `"${ns}" is not a valid NS nameserver hostname.` });
  }
  if (!hasTrailingDot(ns)) {
    issues.push({ severity: "warning", message: `Missing trailing dot on NS target "${ns}" — may be interpreted as relative.` });
  }
  if (IPV4_RE.test(ns) || IPV6_RE.test(ns)) {
    issues.push({ severity: "error", message: "NS record value must be a hostname, not an IP address." });
  }
  return issues;
}

function validateSOA(parts: string[]): { severity: Severity; message: string }[] {
  const issues: { severity: Severity; message: string }[] = [];
  // After type: mname rname serial refresh retry expire minimum
  if (parts.length < 7) {
    issues.push({
      severity: "error",
      message: `SOA record requires 7 fields after type: mname rname serial refresh retry expire minimum. Got ${parts.length}.`,
    });
    return issues;
  }
  const [mname, rname, serial, refresh, retry, expire, minimum] = parts.slice(parts.length - 7);
  if (!isValidHostname(mname)) {
    issues.push({ severity: "error", message: `SOA mname "${mname}" is not a valid hostname.` });
  }
  if (!hasTrailingDot(mname)) {
    issues.push({ severity: "warning", message: `Missing trailing dot on SOA mname "${mname}".` });
  }
  if (!isValidHostname(rname)) {
    issues.push({ severity: "error", message: `SOA rname "${rname}" is not a valid hostname (use dot-escaped email, e.g. admin.example.com.).` });
  }
  if (!hasTrailingDot(rname)) {
    issues.push({ severity: "warning", message: `Missing trailing dot on SOA rname "${rname}".` });
  }
  for (const [field, val] of [["serial", serial], ["refresh", refresh], ["retry", retry], ["expire", expire], ["minimum", minimum]] as [string, string][]) {
    if (!isPositiveInteger(val)) {
      issues.push({ severity: "error", message: `SOA ${field} "${val}" must be a non-negative integer.` });
    }
  }
  const serialNum = parseInt(serial, 10);
  if (!isNaN(serialNum) && serial.length === 10) {
    // YYYYMMDDNN format check
    const year = parseInt(serial.slice(0, 4), 10);
    if (year < 1970 || year > 2100) {
      issues.push({ severity: "warning", message: `SOA serial "${serial}" looks like a date-format serial but the year ${year} seems unusual.` });
    }
  }
  return issues;
}

// ── Line Parser ──────────────────────────────────────────────────────────────

function parseLine(raw: string, lineNum: number): ValidationResult | null {
  const trimmed = raw.trim();

  // Skip blank lines and comments
  if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("//")) return null;

  // Skip $ORIGIN, $TTL directives with info
  if (trimmed.startsWith("$")) {
    return {
      line: lineNum,
      raw,
      type: trimmed.split(/\s+/)[0].toUpperCase(),
      issues: [{ severity: "info", message: `Directive ${trimmed.split(/\s+/)[0].toUpperCase()} — not validated.` }],
      valid: true,
    };
  }

  // Tokenize (but preserve quoted TXT data)
  // Split on whitespace, but we need to handle TXT specially
  const tokens = trimmed.split(/\s+/);

  // Find the record type token (A, AAAA, CNAME, MX, TXT, SRV, NS, SOA)
  const KNOWN_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS", "SOA"];
  let typeIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (KNOWN_TYPES.includes(tokens[i].toUpperCase())) {
      typeIdx = i;
      break;
    }
  }

  if (typeIdx === -1) {
    return {
      line: lineNum,
      raw,
      type: "UNKNOWN",
      issues: [{ severity: "warning", message: `Unrecognized record type. Known types: ${KNOWN_TYPES.join(", ")}.` }],
      valid: false,
    };
  }

  const recordType = tokens[typeIdx].toUpperCase();

  // For TXT, rdata is everything after the type token (preserve spaces/quotes)
  let issues: { severity: Severity; message: string }[] = [];

  if (recordType === "TXT") {
    // Find the position of the type token in the original string, then take everything after
    const typeMatch = new RegExp(`\\bTXT\\b`, "i").exec(trimmed);
    const rdata = typeMatch ? trimmed.slice(typeMatch.index + 3).trim() : "";
    issues = validateTXT(rdata);
  } else {
    const afterType = tokens.slice(typeIdx + 1);
    switch (recordType) {
      case "A":     issues = validateA(afterType); break;
      case "AAAA":  issues = validateAAAA(afterType); break;
      case "CNAME": issues = validateCNAME(afterType); break;
      case "MX":    issues = validateMX(afterType); break;
      case "SRV":   issues = validateSRV(afterType); break;
      case "NS":    issues = validateNS(afterType); break;
      case "SOA":   issues = validateSOA(afterType); break;
    }
  }

  // Common misconfiguration warnings
  if (recordType === "CNAME") {
    const name = tokens[0];
    if (name === "@" || name === "") {
      issues.push({ severity: "error", message: "CNAME cannot be used at the zone apex (@). Use A/AAAA records instead." });
    }
  }

  return {
    line: lineNum,
    raw,
    type: recordType,
    issues,
    valid: issues.every((i) => i.severity !== "error"),
  };
}

function validateZone(text: string): ValidationResult[] {
  const lines = text.split("\n");
  const results: ValidationResult[] = [];
  for (let i = 0; i < lines.length; i++) {
    const result = parseLine(lines[i], i + 1);
    if (result) results.push(result);
  }
  return results;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    error:   "bg-red-100 text-red-700 border border-red-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    info:    "bg-blue-50 text-blue-700 border border-blue-200",
  };
  const labels: Record<Severity, string> = {
    error:   "Error",
    warning: "Warning",
    info:    "Info",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${styles[severity]}`}>
      {labels[severity]}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
      {type}
    </span>
  );
}

const EXAMPLE_ZONE = `; Example DNS zone file
$ORIGIN example.com.
$TTL 3600

; SOA record
@  IN  SOA  ns1.example.com.  admin.example.com. (
              2024010101 ; serial
              3600       ; refresh
              900        ; retry
              604800     ; expire
              300 )      ; minimum

; Name servers
@      IN  NS   ns1.example.com.
@      IN  NS   ns2.example.com.

; A records
@      IN  A    93.184.216.34
www    IN  A    93.184.216.34
mail   IN  A    93.184.216.34

; AAAA record
@      IN  AAAA  2606:2800:220:1:248:1893:25c8:1946

; CNAME — note: missing trailing dot (will warn)
ftp    IN  CNAME  www.example.com

; MX records
@      IN  MX   10  mail.example.com.
@      IN  MX   20  backup.example.com.

; TXT records
@      IN  TXT  "v=spf1 include:_spf.google.com ~all"

; SRV record
_sip._tcp  IN  SRV  10 20 5060 sip.example.com.`.trim();

// ── Main Component ───────────────────────────────────────────────────────────

export default function DnsPropagationSim() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<ValidationResult[] | null>(null);

  const handleValidate = useCallback(() => {
    setResults(validateZone(input));
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setResults(null);
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(EXAMPLE_ZONE);
    setResults(null);
  }, []);

  const errorCount   = results ? results.reduce((n, r) => n + r.issues.filter((i) => i.severity === "error").length, 0) : 0;
  const warningCount = results ? results.reduce((n, r) => n + r.issues.filter((i) => i.severity === "warning").length, 0) : 0;
  const recordCount  = results ? results.filter((r) => r.type !== "UNKNOWN" && !r.type.startsWith("$")).length : 0;

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            DNS Zone File Records
          </label>
          <button
            onClick={handleLoadExample}
            className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Load example
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setResults(null); }}
          placeholder={`Paste DNS zone file records here, e.g.\n\n@ IN A 93.184.216.34\nwww IN CNAME example.com\n@ IN MX 10 mail.example.com.`}
          spellCheck={false}
          className="w-full h-64 p-4 font-mono text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-500">
          Supports A, AAAA, CNAME, MX, TXT, SRV, NS, SOA records. Comments starting with <code className="bg-gray-100 px-1 rounded">;</code> are ignored.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleValidate}
          disabled={!input.trim()}
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Validate
        </button>
        {input && (
          <button
            onClick={handleClear}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Summary bar */}
      {results !== null && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm">
            <span className="text-gray-500">Records parsed:</span>
            <span className="font-semibold text-gray-900">{recordCount}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${errorCount > 0 ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
            <span className={errorCount > 0 ? "text-red-600" : "text-gray-500"}>Errors:</span>
            <span className={`font-semibold ${errorCount > 0 ? "text-red-700" : "text-gray-900"}`}>{errorCount}</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${warningCount > 0 ? "border-yellow-200 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
            <span className={warningCount > 0 ? "text-yellow-700" : "text-gray-500"}>Warnings:</span>
            <span className={`font-semibold ${warningCount > 0 ? "text-yellow-700" : "text-gray-900"}`}>{warningCount}</span>
          </div>
          {errorCount === 0 && warningCount === 0 && recordCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 bg-green-50 text-sm">
              <span className="text-green-700 font-medium">All records valid</span>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results !== null && results.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Validation Results</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {results.map((result, idx) => (
              <li key={idx} className={`px-4 py-3 ${result.issues.some((i) => i.severity === "error") ? "bg-red-50/40" : result.issues.some((i) => i.severity === "warning") ? "bg-yellow-50/40" : ""}`}>
                {/* Line header */}
                <div className="flex items-start gap-2 flex-wrap mb-1.5">
                  <span className="text-xs text-gray-400 font-mono mt-0.5 whitespace-nowrap">
                    Line {result.line}
                  </span>
                  <TypeBadge type={result.type} />
                  <code className="text-xs text-gray-600 font-mono bg-gray-100 px-1.5 py-0.5 rounded max-w-full truncate flex-1">
                    {result.raw.trim()}
                  </code>
                </div>
                {/* Issues */}
                <ul className="space-y-1 mt-2">
                  {result.issues.map((issue, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-sm text-gray-700 leading-relaxed">{issue.message}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results !== null && results.length === 0 && (
        <div className="border border-gray-200 rounded-lg px-4 py-8 text-center text-sm text-gray-500">
          No recognizable DNS records found. Check that lines contain a valid record type (A, AAAA, CNAME, MX, TXT, SRV, NS, SOA).
        </div>
      )}

      {/* Common misconfigurations reference */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Common Misconfigurations</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          {[
            { label: "Missing trailing dot", detail: "CNAME, MX, NS, SRV, SOA targets must end with . to be fully qualified (e.g. mail.example.com.)" },
            { label: "CNAME at zone apex (@)", detail: "RFC 1034 prohibits CNAME at the zone root. Use A/AAAA or ALIAS/ANAME records." },
            { label: "IP address in NS record", detail: "NS values must be hostnames, not IP addresses." },
            { label: "Unquoted TXT data", detail: "TXT record strings must be wrapped in double quotes." },
            { label: "IPv6 in A record", detail: "A records hold IPv4 addresses only. Use AAAA for IPv6." },
            { label: "MX pointing to CNAME", detail: "RFC 2181 prohibits MX targets that are CNAME aliases." },
          ].map(({ label, detail }, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 mt-2" />
              <span><span className="font-medium text-gray-800">{label}:</span> {detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400 tracking-wide">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this DNS Record Validator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Validate the syntax of DNS zone file records. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this DNS Record Validator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Validate the syntax of DNS zone file records. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
