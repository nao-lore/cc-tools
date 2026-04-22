"use client";

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type RecordType = "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV" | "NS";

interface BaseRecord {
  id: string;
  type: RecordType;
  hostname: string;
  ttl: number;
}

interface ARecord extends BaseRecord { type: "A"; ip: string; }
interface AAAARecord extends BaseRecord { type: "AAAA"; ip: string; }
interface CNAMERecord extends BaseRecord { type: "CNAME"; target: string; }
interface MXRecord extends BaseRecord { type: "MX"; priority: number; mailserver: string; }
interface TXTRecord extends BaseRecord { type: "TXT"; value: string; }
interface SRVRecord extends BaseRecord { type: "SRV"; service: string; proto: string; priority: number; weight: number; port: number; target: string; }
interface NSRecord extends BaseRecord { type: "NS"; nameserver: string; }

type DnsRecord = ARecord | AAAARecord | CNAMERecord | MXRecord | TXTRecord | SRVRecord | NSRecord;

// ─── Constants ────────────────────────────────────────────────────────────────

const RECORD_TYPES: RecordType[] = ["A", "AAAA", "CNAME", "MX", "TXT", "SRV", "NS"];

const TTL_OPTIONS = [
  { label: "Auto (TTL 3600)", value: 3600 },
  { label: "5 min (300)", value: 300 },
  { label: "15 min (900)", value: 900 },
  { label: "1 hour (3600)", value: 3600 },
  { label: "6 hours (21600)", value: 21600 },
  { label: "12 hours (43200)", value: 43200 },
  { label: "24 hours (86400)", value: 86400 },
];

const RECORD_TYPE_COLORS: Record<RecordType, string> = {
  A:     "bg-blue-100 text-blue-800 border-blue-200",
  AAAA:  "bg-purple-100 text-purple-800 border-purple-200",
  CNAME: "bg-green-100 text-green-800 border-green-200",
  MX:    "bg-orange-100 text-orange-800 border-orange-200",
  TXT:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  SRV:   "bg-pink-100 text-pink-800 border-pink-200",
  NS:    "bg-slate-100 text-slate-800 border-slate-200",
};

// ─── Zone file formatter ──────────────────────────────────────────────────────

function formatZoneLine(record: DnsRecord): string {
  const host = record.hostname || "@";
  const ttl = record.ttl;
  switch (record.type) {
    case "A":
    case "AAAA":
      return `${host}\t${ttl}\tIN\t${record.type}\t${record.ip || "0.0.0.0"}`;
    case "CNAME":
      return `${host}\t${ttl}\tIN\tCNAME\t${record.target || "example.com."}`;
    case "MX":
      return `${host}\t${ttl}\tIN\tMX\t${record.priority}\t${record.mailserver || "mail.example.com."}`;
    case "TXT":
      return `${host}\t${ttl}\tIN\tTXT\t"${record.value || ""}"`;
    case "SRV":
      return `_${record.service || "service"}._${record.proto || "tcp"}.${host}\t${ttl}\tIN\tSRV\t${record.priority}\t${record.weight}\t${record.port}\t${record.target || "target.example.com."}`;
    case "NS":
      return `${host}\t${ttl}\tIN\tNS\t${record.nameserver || "ns1.example.com."}`;
  }
}

// ─── Defaults per type ────────────────────────────────────────────────────────

function defaultRecord(type: RecordType): Omit<DnsRecord, "id"> {
  const base = { hostname: "@", ttl: 3600 };
  switch (type) {
    case "A":     return { ...base, type, ip: "" };
    case "AAAA":  return { ...base, type, ip: "" };
    case "CNAME": return { ...base, type, target: "" };
    case "MX":    return { ...base, type, priority: 10, mailserver: "" };
    case "TXT":   return { ...base, type, value: "" };
    case "SRV":   return { ...base, type, service: "", proto: "tcp", priority: 10, weight: 10, port: 443, target: "" };
    case "NS":    return { ...base, type, nameserver: "" };
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Presets ──────────────────────────────────────────────────────────────────

type Preset = { label: string; description: string; records: Omit<DnsRecord, "id">[] };

const PRESETS: Preset[] = [
  {
    label: "Google Workspace MX",
    description: "MX records for Gmail via Google Workspace",
    records: [
      { type: "MX", hostname: "@", ttl: 3600, priority: 1,  mailserver: "aspmx.l.google.com." },
      { type: "MX", hostname: "@", ttl: 3600, priority: 5,  mailserver: "alt1.aspmx.l.google.com." },
      { type: "MX", hostname: "@", ttl: 3600, priority: 5,  mailserver: "alt2.aspmx.l.google.com." },
      { type: "MX", hostname: "@", ttl: 3600, priority: 10, mailserver: "alt3.aspmx.l.google.com." },
      { type: "MX", hostname: "@", ttl: 3600, priority: 10, mailserver: "alt4.aspmx.l.google.com." },
    ],
  },
  {
    label: "SPF — Allow Google",
    description: "TXT record authorising Google servers to send mail",
    records: [
      { type: "TXT", hostname: "@", ttl: 3600, value: "v=spf1 include:_spf.google.com ~all" },
    ],
  },
  {
    label: "Basic DMARC",
    description: "Minimal DMARC policy — quarantine failures, reports to your address",
    records: [
      { type: "TXT", hostname: "_dmarc", ttl: 3600, value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@example.com; pct=100" },
    ],
  },
];

// ─── Form fields per type ─────────────────────────────────────────────────────

function RecordForm({
  record,
  onChange,
}: {
  record: DnsRecord;
  onChange: (updated: DnsRecord) => void;
}) {
  const inputCls =
    "w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400";
  const labelCls = "block text-xs font-medium text-slate-600 mb-1";

  const set = (patch: Partial<DnsRecord>) => onChange({ ...record, ...patch } as DnsRecord);

  const sharedFields = (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className={labelCls}>Hostname</label>
        <input
          className={inputCls}
          value={record.hostname}
          onChange={(e) => set({ hostname: e.target.value })}
          placeholder="@ or subdomain"
        />
      </div>
      <div>
        <label className={labelCls}>TTL</label>
        <select
          className={inputCls}
          value={record.ttl}
          onChange={(e) => set({ ttl: Number(e.target.value) })}
        >
          {TTL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );

  switch (record.type) {
    case "A":
    case "AAAA":
      return (
        <div className="space-y-3">
          {sharedFields}
          <div>
            <label className={labelCls}>{record.type === "A" ? "IPv4 Address" : "IPv6 Address"}</label>
            <input
              className={inputCls}
              value={record.ip}
              onChange={(e) => set({ ip: e.target.value })}
              placeholder={record.type === "A" ? "1.2.3.4" : "2001:db8::1"}
            />
          </div>
        </div>
      );

    case "CNAME":
      return (
        <div className="space-y-3">
          {sharedFields}
          <div>
            <label className={labelCls}>Target (FQDN)</label>
            <input
              className={inputCls}
              value={record.target}
              onChange={(e) => set({ target: e.target.value })}
              placeholder="example.com."
            />
          </div>
        </div>
      );

    case "MX":
      return (
        <div className="space-y-3">
          {sharedFields}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={record.priority}
                onChange={(e) => set({ priority: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>Mail Server (FQDN)</label>
              <input
                className={inputCls}
                value={record.mailserver}
                onChange={(e) => set({ mailserver: e.target.value })}
                placeholder="mail.example.com."
              />
            </div>
          </div>
        </div>
      );

    case "TXT":
      return (
        <div className="space-y-3">
          {sharedFields}
          <div>
            <label className={labelCls}>Value</label>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              value={record.value}
              onChange={(e) => set({ value: e.target.value })}
              placeholder='v=spf1 include:_spf.google.com ~all'
            />
          </div>
        </div>
      );

    case "SRV":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Service</label>
              <input
                className={inputCls}
                value={record.service}
                onChange={(e) => set({ service: e.target.value })}
                placeholder="sip"
              />
            </div>
            <div>
              <label className={labelCls}>Protocol</label>
              <select
                className={inputCls}
                value={record.proto}
                onChange={(e) => set({ proto: e.target.value })}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="tls">TLS</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Hostname</label>
              <input
                className={inputCls}
                value={record.hostname}
                onChange={(e) => set({ hostname: e.target.value })}
                placeholder="@ or subdomain"
              />
            </div>
            <div>
              <label className={labelCls}>TTL</label>
              <select
                className={inputCls}
                value={record.ttl}
                onChange={(e) => set({ ttl: Number(e.target.value) })}
              >
                {TTL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={record.priority}
                onChange={(e) => set({ priority: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>Weight</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={record.weight}
                onChange={(e) => set({ weight: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelCls}>Port</label>
              <input
                type="number"
                min={1}
                max={65535}
                className={inputCls}
                value={record.port}
                onChange={(e) => set({ port: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Target (FQDN)</label>
            <input
              className={inputCls}
              value={record.target}
              onChange={(e) => set({ target: e.target.value })}
              placeholder="sip.example.com."
            />
          </div>
        </div>
      );

    case "NS":
      return (
        <div className="space-y-3">
          {sharedFields}
          <div>
            <label className={labelCls}>Nameserver (FQDN)</label>
            <input
              className={inputCls}
              value={record.nameserver}
              onChange={(e) => set({ nameserver: e.target.value })}
              placeholder="ns1.example.com."
            />
          </div>
        </div>
      );
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DnsRecordBuilder() {
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [selectedType, setSelectedType] = useState<RecordType>("A");
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addRecord = useCallback(() => {
    const id = makeId();
    const rec = { id, ...defaultRecord(selectedType) } as DnsRecord;
    setRecords((prev) => [...prev, rec]);
    setExpandedId(id);
  }, [selectedType]);

  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
  }, []);

  const updateRecord = useCallback((updated: DnsRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    const newRecords = preset.records.map((r) => ({ ...r, id: makeId() } as DnsRecord));
    setRecords((prev) => [...prev, ...newRecords]);
  }, []);

  const zoneOutput = records.map(formatZoneLine).join("\n");

  const handleCopy = useCallback(() => {
    if (!zoneOutput) return;
    navigator.clipboard.writeText(zoneOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [zoneOutput]);

  const clearAll = useCallback(() => {
    setRecords([]);
    setExpandedId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Output panel ── */}
      <section className="bg-slate-900 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Zone File Output
          </h2>
          <button
            onClick={handleCopy}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer border border-slate-600"
          >
            {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy all</>}
          </button>
        </div>

        {records.length === 0 ? (
          <p className="font-mono text-sm text-slate-500 italic">
            Add records below to generate zone file entries.
          </p>
        ) : (
          <pre className="font-mono text-xs text-green-300 whitespace-pre overflow-x-auto leading-relaxed">
            {zoneOutput}
          </pre>
        )}
      </section>

      {/* ── Presets ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Quick Presets</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Add common record sets in one click.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              title={preset.description}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Add record ── */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Add Record</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {RECORD_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                selectedType === type
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
          <button
            onClick={addRecord}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer font-semibold"
          >
            <PlusIcon /> Add {selectedType} Record
          </button>
        </div>
      </section>

      {/* ── Record list ── */}
      {records.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">
              Records ({records.length})
            </h3>
            <button
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-600 transition-colors cursor-pointer underline underline-offset-2"
            >
              Clear all
            </button>
          </div>

          {records.map((record, idx) => {
            const isExpanded = expandedId === record.id;
            const zoneLine = formatZoneLine(record);
            return (
              <div
                key={record.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden"
              >
                {/* Record header row */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-slate-400 font-mono w-5 text-right flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded border flex-shrink-0 ${RECORD_TYPE_COLORS[record.type]}`}
                  >
                    {record.type}
                  </span>
                  <span className="font-mono text-xs text-slate-600 truncate flex-1 min-w-0">
                    {zoneLine}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : record.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title={isExpanded ? "Collapse" : "Edit"}
                    >
                      {isExpanded ? <ChevronUpIcon /> : <PencilIcon />}
                    </button>
                    <button
                      onClick={() => removeRecord(record.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* Expanded edit form */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-4 py-4 bg-slate-50">
                    <RecordForm record={record} onChange={updateRecord} />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* ── Reference table ── */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Record Type Reference</h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Purpose</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Example Use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { type: "A",     purpose: "Maps a hostname to an IPv4 address.",               example: "Point domain to server IP" },
                { type: "AAAA", purpose: "Maps a hostname to an IPv6 address.",               example: "IPv6-enabled hosting" },
                { type: "CNAME",purpose: "Alias one name to another (canonical name).",       example: "www → root domain" },
                { type: "MX",   purpose: "Directs email to mail servers with priority.",      example: "Google Workspace / Outlook" },
                { type: "TXT",  purpose: "Stores arbitrary text — used for verification.",    example: "SPF, DKIM, DMARC" },
                { type: "SRV",  purpose: "Specifies host/port for specific services.",        example: "SIP, XMPP, Teams" },
                { type: "NS",   purpose: "Delegates a zone to authoritative nameservers.",    example: "Subdomain delegation" },
              ].map(({ type, purpose, example }) => (
                <tr key={type} className="hover:bg-slate-50 transition-colors">
                  <td className={`px-4 py-3 font-mono text-xs font-bold align-top whitespace-nowrap`}>
                    <span className={`inline-flex px-2 py-0.5 rounded border ${RECORD_TYPE_COLORS[type as RecordType]}`}>
                      {type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell align-top">{purpose}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 align-top">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Ad placeholder */}
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-400 text-sm">
        Ad Space — Google AdSense
      </div>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.415.586H9v-1.414a2 2 0 01.586-1.414z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1H5" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
    </svg>
  );
}
