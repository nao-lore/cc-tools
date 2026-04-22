"use client";

import { useState, useCallback } from "react";

type BodyFormat = "json" | "html" | "plain";

interface HeaderRow {
  id: number;
  name: string;
  value: string;
}

interface StatusCode {
  code: number;
  reason: string;
}

const STATUS_GROUPS: { label: string; codes: StatusCode[] }[] = [
  {
    label: "2xx Success",
    codes: [
      { code: 200, reason: "OK" },
      { code: 201, reason: "Created" },
      { code: 202, reason: "Accepted" },
      { code: 204, reason: "No Content" },
      { code: 206, reason: "Partial Content" },
    ],
  },
  {
    label: "3xx Redirection",
    codes: [
      { code: 301, reason: "Moved Permanently" },
      { code: 302, reason: "Found" },
      { code: 304, reason: "Not Modified" },
      { code: 307, reason: "Temporary Redirect" },
      { code: 308, reason: "Permanent Redirect" },
    ],
  },
  {
    label: "4xx Client Error",
    codes: [
      { code: 400, reason: "Bad Request" },
      { code: 401, reason: "Unauthorized" },
      { code: 403, reason: "Forbidden" },
      { code: 404, reason: "Not Found" },
      { code: 405, reason: "Method Not Allowed" },
      { code: 409, reason: "Conflict" },
      { code: 410, reason: "Gone" },
      { code: 422, reason: "Unprocessable Entity" },
      { code: 429, reason: "Too Many Requests" },
    ],
  },
  {
    label: "5xx Server Error",
    codes: [
      { code: 500, reason: "Internal Server Error" },
      { code: 501, reason: "Not Implemented" },
      { code: 502, reason: "Bad Gateway" },
      { code: 503, reason: "Service Unavailable" },
      { code: 504, reason: "Gateway Timeout" },
    ],
  },
];

const ALL_STATUS_CODES: StatusCode[] = STATUS_GROUPS.flatMap((g) => g.codes);

const COMMON_HEADER_NAMES = [
  "Content-Type",
  "Content-Length",
  "Cache-Control",
  "Access-Control-Allow-Origin",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Headers",
  "Authorization",
  "ETag",
  "Last-Modified",
  "Location",
  "Set-Cookie",
  "Strict-Transport-Security",
  "Vary",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "X-Request-Id",
  "Custom...",
];

const HEADER_PRESETS: { label: string; headers: { name: string; value: string }[] }[] = [
  {
    label: "JSON API",
    headers: [
      { name: "Content-Type", value: "application/json; charset=utf-8" },
      { name: "Cache-Control", value: "no-cache" },
    ],
  },
  {
    label: "CORS Open",
    headers: [
      { name: "Access-Control-Allow-Origin", value: "*" },
      { name: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
      { name: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
    ],
  },
  {
    label: "Cache Static",
    headers: [
      { name: "Cache-Control", value: "public, max-age=31536000, immutable" },
      { name: "ETag", value: '"abc123"' },
      { name: "Vary", value: "Accept-Encoding" },
    ],
  },
  {
    label: "No Cache",
    headers: [
      { name: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
    ],
  },
  {
    label: "Security",
    headers: [
      { name: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { name: "X-Content-Type-Options", value: "nosniff" },
      { name: "X-Frame-Options", value: "DENY" },
    ],
  },
];

const BODY_PLACEHOLDERS: Record<BodyFormat, string> = {
  json: '{\n  "status": "ok",\n  "data": {}\n}',
  html: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>",
  plain: "Response body here.",
};

const CONTENT_TYPE_MAP: Record<BodyFormat, string> = {
  json: "application/json; charset=utf-8",
  html: "text/html; charset=utf-8",
  plain: "text/plain; charset=utf-8",
};

let nextId = 1;
function makeRow(name = "", value = ""): HeaderRow {
  return { id: nextId++, name, value };
}

function formatJson(text: string): { result: string; error: string | null } {
  try {
    const parsed = JSON.parse(text);
    return { result: JSON.stringify(parsed, null, 2), error: null };
  } catch (e) {
    return { result: text, error: (e as Error).message };
  }
}

export default function HttpResponseBuilder() {
  const [statusCode, setStatusCode] = useState<number>(200);
  const [headers, setHeaders] = useState<HeaderRow[]>([
    makeRow("Content-Type", "application/json; charset=utf-8"),
  ]);
  const [customNames, setCustomNames] = useState<Record<number, boolean>>({});
  const [bodyFormat, setBodyFormat] = useState<BodyFormat>("json");
  const [body, setBody] = useState('{\n  "status": "ok",\n  "data": {}\n}');
  const [formatError, setFormatError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedStatus =
    ALL_STATUS_CODES.find((s) => s.code === statusCode) ?? { code: statusCode, reason: "Unknown" };

  // Header management
  const addHeader = useCallback(() => {
    setHeaders((prev) => [...prev, makeRow()]);
  }, []);

  const removeHeader = useCallback((id: number) => {
    setHeaders((prev) => prev.filter((r) => r.id !== id));
    setCustomNames((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updateHeader = useCallback((id: number, field: "name" | "value", val: string) => {
    setHeaders((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }, []);

  const handleNameSelect = useCallback(
    (id: number, val: string) => {
      if (val === "Custom...") {
        setCustomNames((prev) => ({ ...prev, [id]: true }));
        updateHeader(id, "name", "");
      } else {
        setCustomNames((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        updateHeader(id, "name", val);
      }
    },
    [updateHeader]
  );

  const applyPreset = useCallback((preset: { name: string; value: string }[]) => {
    const newRows = preset.map((h) => makeRow(h.name, h.value));
    setHeaders((prev) => {
      const nonEmpty = prev.filter((r) => r.name || r.value);
      return [...nonEmpty, ...newRows];
    });
  }, []);

  // Body format change — swap placeholder and update Content-Type header
  const handleFormatChange = useCallback(
    (fmt: BodyFormat) => {
      setBodyFormat(fmt);
      setFormatError(null);
      // Only replace body if it's still a placeholder
      const currentPlaceholders = Object.values(BODY_PLACEHOLDERS);
      if (currentPlaceholders.includes(body)) {
        setBody(BODY_PLACEHOLDERS[fmt]);
      }
      // Update Content-Type header if present
      setHeaders((prev) =>
        prev.map((r) =>
          r.name.toLowerCase() === "content-type"
            ? { ...r, value: CONTENT_TYPE_MAP[fmt] }
            : r
        )
      );
    },
    [body]
  );

  const handleFormatJson = useCallback(() => {
    const { result, error } = formatJson(body);
    setBody(result);
    setFormatError(error);
  }, [body]);

  // Build raw HTTP response string
  const validHeaders = headers.filter((r) => r.name && r.value);
  const statusLine = `HTTP/1.1 ${selectedStatus.code} ${selectedStatus.reason}`;
  const headerLines = validHeaders.map((r) => `${r.name}: ${r.value}`).join("\r\n");
  const rawResponse =
    statusLine +
    "\r\n" +
    (headerLines ? headerLines + "\r\n" : "") +
    "\r\n" +
    (body.trim() ? body : "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rawResponse);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = rawResponse;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rawResponse]);

  const statusColor =
    statusCode >= 500
      ? "text-red-700 bg-red-50 border-red-200"
      : statusCode >= 400
      ? "text-orange-700 bg-orange-50 border-orange-200"
      : statusCode >= 300
      ? "text-blue-700 bg-blue-50 border-blue-200"
      : "text-emerald-700 bg-emerald-50 border-emerald-200";

  return (
    <div className="space-y-6">
      {/* Status code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status Code</label>
        <div className="flex items-center gap-3">
          <select
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            {STATUS_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.codes.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} {s.reason}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span
            className={`px-3 py-1.5 text-sm font-semibold rounded-md border font-mono ${statusColor}`}
          >
            {selectedStatus.code} {selectedStatus.reason}
          </span>
        </div>
      </div>

      {/* Headers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Headers</label>
          <div className="flex flex-wrap gap-1.5">
            {HEADER_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.headers)}
                className="px-2.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-gray-500 px-1">
            <span>Name</span>
            <span>Value</span>
            <span className="w-8" />
          </div>

          {headers.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              {customNames[row.id] ? (
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateHeader(row.id, "name", e.target.value)}
                  placeholder="Header-Name"
                  spellCheck={false}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono"
                />
              ) : (
                <select
                  value={row.name || ""}
                  onChange={(e) => handleNameSelect(row.id, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                >
                  <option value="">-- select --</option>
                  {COMMON_HEADER_NAMES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={row.value}
                onChange={(e) => updateHeader(row.id, "value", e.target.value)}
                placeholder="value"
                spellCheck={false}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono"
              />

              <button
                onClick={() => removeHeader(row.id)}
                disabled={headers.length === 1}
                className="w-8 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Remove header"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addHeader}
            className="mt-1 px-4 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:text-gray-800 transition-colors cursor-pointer w-full"
          >
            + Add Header
          </button>
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Body</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-md">
              {(["json", "html", "plain"] as BodyFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleFormatChange(fmt)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                    bodyFormat === fmt
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {fmt === "plain" ? "Plain" : fmt.toUpperCase()}
                </button>
              ))}
            </div>
            {bodyFormat === "json" && (
              <button
                onClick={handleFormatJson}
                className="px-2.5 py-1 text-xs bg-violet-50 text-violet-700 border border-violet-200 rounded-md hover:bg-violet-100 transition-colors cursor-pointer"
              >
                Format JSON
              </button>
            )}
          </div>
        </div>

        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setFormatError(null);
          }}
          rows={8}
          spellCheck={false}
          placeholder={BODY_PLACEHOLDERS[bodyFormat]}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 font-mono resize-y"
        />

        {formatError && (
          <p className="mt-1 text-xs text-red-600">
            JSON parse error: {formatError}
          </p>
        )}
      </div>

      {/* Output */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Raw HTTP Response</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="p-4 bg-white min-h-32 max-h-80 overflow-auto">
          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-all">
            {/* Status line */}
            <span>
              <span className="text-gray-500">HTTP/1.1 </span>
              <span className={`font-bold ${
                statusCode >= 500 ? "text-red-600" :
                statusCode >= 400 ? "text-orange-600" :
                statusCode >= 300 ? "text-blue-600" :
                "text-emerald-600"
              }`}>
                {selectedStatus.code}
              </span>
              <span className="text-gray-700"> {selectedStatus.reason}</span>
              {"\n"}
            </span>
            {/* Header lines */}
            {validHeaders.map((h, i) => (
              <span key={i}>
                <span className="text-violet-700 font-semibold">{h.name}</span>
                <span className="text-gray-500">: </span>
                <span className="text-emerald-700">{h.value}</span>
                {"\n"}
              </span>
            ))}
            {/* Blank line separator */}
            {"\n"}
            {/* Body */}
            {body.trim() && (
              <span className="text-gray-800">{body}</span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
