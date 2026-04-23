"use client";

import { useState, useCallback, useEffect } from "react";

type Mode = "encode" | "decode";
type EncodingType = "encodeURI" | "encodeURIComponent" | "full";

interface ParsedUrl {
  protocol: string;
  host: string;
  path: string;
  queryParams: [string, string][];
  fragment: string;
}

interface QueryParam {
  id: string;
  key: string;
  value: string;
}

const CHAR_REFERENCE: { char: string; encoded: string; description: string }[] =
  [
    { char: " ", encoded: "%20", description: "Space" },
    { char: "!", encoded: "%21", description: "Exclamation mark" },
    { char: "#", encoded: "%23", description: "Hash" },
    { char: "$", encoded: "%24", description: "Dollar sign" },
    { char: "%", encoded: "%25", description: "Percent" },
    { char: "&", encoded: "%26", description: "Ampersand" },
    { char: "'", encoded: "%27", description: "Single quote" },
    { char: "(", encoded: "%28", description: "Left parenthesis" },
    { char: ")", encoded: "%29", description: "Right parenthesis" },
    { char: "*", encoded: "%2A", description: "Asterisk" },
    { char: "+", encoded: "%2B", description: "Plus" },
    { char: ",", encoded: "%2C", description: "Comma" },
    { char: "/", encoded: "%2F", description: "Forward slash" },
    { char: ":", encoded: "%3A", description: "Colon" },
    { char: ";", encoded: "%3B", description: "Semicolon" },
    { char: "=", encoded: "%3D", description: "Equals" },
    { char: "?", encoded: "%3F", description: "Question mark" },
    { char: "@", encoded: "%40", description: "At sign" },
    { char: "[", encoded: "%5B", description: "Left bracket" },
    { char: "]", encoded: "%5D", description: "Right bracket" },
    { char: "{", encoded: "%7B", description: "Left brace" },
    { char: "}", encoded: "%7D", description: "Right brace" },
  ];

function fullPercentEncode(str: string): string {
  return Array.from(str)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122) ||
        (code >= 48 && code <= 57) ||
        char === "-" ||
        char === "_" ||
        char === "." ||
        char === "~"
      ) {
        return char;
      }
      if (code > 127) {
        return encodeURIComponent(char);
      }
      return "%" + code.toString(16).toUpperCase().padStart(2, "0");
    })
    .join("");
}

function fullPercentDecode(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

function parseUrl(input: string): ParsedUrl | null {
  try {
    const url = new URL(input);
    const queryParams: [string, string][] = [];
    url.searchParams.forEach((value, key) => {
      queryParams.push([key, value]);
    });
    return {
      protocol: url.protocol.replace(":", ""),
      host: url.host,
      path: url.pathname,
      queryParams,
      fragment: url.hash.replace("#", ""),
    };
  } catch {
    return null;
  }
}

let paramIdCounter = 0;
function newParamId(): string {
  return `p${++paramIdCounter}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={copy}
      className="px-3 py-1.5 text-xs font-medium rounded bg-panel-border hover:bg-muted/30 text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function UrlEncoder() {
  const [mode, setMode] = useState<Mode>("encode");
  const [encodingType, setEncodingType] =
    useState<EncodingType>("encodeURIComponent");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  // URL Parser
  const [urlInput, setUrlInput] = useState("");
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);

  // Query Builder
  const [queryParams, setQueryParams] = useState<QueryParam[]>([
    { id: newParamId(), key: "", value: "" },
  ]);
  const [queryOutput, setQueryOutput] = useState("");

  // Live encode/decode
  useEffect(() => {
    if (!input) {
      setOutput("");
      setError("");
      return;
    }

    try {
      let result: string;
      if (mode === "encode") {
        switch (encodingType) {
          case "encodeURI":
            result = encodeURI(input);
            break;
          case "encodeURIComponent":
            result = encodeURIComponent(input);
            break;
          case "full":
            result = fullPercentEncode(input);
            break;
        }
      } else {
        switch (encodingType) {
          case "encodeURI":
            result = decodeURI(input);
            break;
          case "encodeURIComponent":
            result = decodeURIComponent(input);
            break;
          case "full":
            result = fullPercentDecode(input);
            break;
        }
      }
      setOutput(result);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Invalid input for decoding"
      );
      setOutput("");
    }
  }, [input, mode, encodingType]);

  // URL Parser
  useEffect(() => {
    if (!urlInput) {
      setParsedUrl(null);
      return;
    }
    setParsedUrl(parseUrl(urlInput));
  }, [urlInput]);

  // Query Builder
  useEffect(() => {
    const pairs = queryParams.filter((p) => p.key.trim());
    if (pairs.length === 0) {
      setQueryOutput("");
      return;
    }
    const qs = pairs
      .map(
        (p) =>
          `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`
      )
      .join("&");
    setQueryOutput(`?${qs}`);
  }, [queryParams]);

  const addParam = () => {
    setQueryParams((prev) => [
      ...prev,
      { id: newParamId(), key: "", value: "" },
    ]);
  };

  const removeParam = (id: string) => {
    setQueryParams((prev) => prev.filter((p) => p.id !== id));
  };

  const updateParam = (id: string, field: "key" | "value", val: string) => {
    setQueryParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const swapInputOutput = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="space-y-8">
      {/* Encoder/Decoder */}
      <section>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
          <div className="flex rounded-lg overflow-hidden border border-panel-border">
            <button
              onClick={() => setMode("encode")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                mode === "encode"
                  ? "bg-accent text-white"
                  : "bg-panel-bg text-muted hover:text-foreground"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                mode === "decode"
                  ? "bg-accent text-white"
                  : "bg-panel-bg text-muted hover:text-foreground"
              }`}
            >
              Decode
            </button>
          </div>

          <select
            value={encodingType}
            onChange={(e) =>
              setEncodingType(e.target.value as EncodingType)
            }
            className="bg-panel-bg border border-panel-border text-foreground text-xs sm:text-sm rounded-lg px-2 sm:px-3 py-2 cursor-pointer"
          >
            <option value="encodeURIComponent">encodeURIComponent</option>
            <option value="encodeURI">encodeURI</option>
            <option value="full">Full percent-encoding</option>
          </select>

          <button
            onClick={swapInputOutput}
            className="ml-auto px-3 py-2 text-sm rounded-lg border border-panel-border bg-panel-bg text-muted hover:text-foreground transition-colors"
            title="Swap input and output"
          >
            &#x21C4; Swap
          </button>
        </div>

        {/* Two-panel layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted">
                Input
              </label>
              {input && <CopyButton text={input} />}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "Enter text to encode..."
                  : "Enter encoded URL to decode..."
              }
              className="w-full h-48 p-4 bg-panel-bg border border-panel-border rounded-lg font-mono text-sm text-foreground resize-y placeholder:text-muted/50"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted">
                Output
              </label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea
              value={error || output}
              readOnly
              className={`w-full h-48 p-4 bg-panel-bg border rounded-lg font-mono text-sm resize-y ${
                error
                  ? "border-red-500/50 text-red-400"
                  : "border-panel-border text-foreground"
              }`}
              placeholder="Result will appear here..."
            />
          </div>
        </div>
      </section>

      {/* URL Parser */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          URL Parser
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste a full URL to break it down... (e.g. https://example.com/path?key=value#section)"
            className="w-full p-3 bg-panel-bg border border-panel-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50"
            spellCheck={false}
          />
          {parsedUrl && (
            <div className="bg-panel-bg border border-panel-border rounded-lg p-3 sm:p-4 space-y-2 font-mono text-xs sm:text-sm overflow-x-auto">
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="text-muted sm:min-w-[100px] shrink-0">Protocol:</span>
                <span className="text-accent break-all">{parsedUrl.protocol}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="text-muted sm:min-w-[100px] shrink-0">Host:</span>
                <span className="text-foreground break-all">{parsedUrl.host}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className="text-muted sm:min-w-[100px] shrink-0">Path:</span>
                <span className="text-foreground break-all">{parsedUrl.path}</span>
              </div>
              {parsedUrl.queryParams.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <span className="text-muted sm:min-w-[100px] shrink-0">
                    Query:
                  </span>
                  <div className="space-y-1">
                    {parsedUrl.queryParams.map(
                      ([key, value], i) => (
                        <div key={i}>
                          <span className="text-success">{key}</span>
                          <span className="text-muted"> = </span>
                          <span className="text-foreground">
                            {value}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
              {parsedUrl.fragment && (
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <span className="text-muted sm:min-w-[100px] shrink-0">
                    Fragment:
                  </span>
                  <span className="text-foreground">
                    {parsedUrl.fragment}
                  </span>
                </div>
              )}
            </div>
          )}
          {urlInput && !parsedUrl && (
            <p className="text-sm text-red-400">
              Not a valid URL. Include the protocol (e.g. https://).
            </p>
          )}
        </div>
      </section>

      {/* Query String Builder */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Query String Builder
        </h2>
        <div className="space-y-3">
          {queryParams.map((param) => (
            <div key={param.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={param.key}
                onChange={(e) =>
                  updateParam(param.id, "key", e.target.value)
                }
                placeholder="Key"
                className="flex-1 p-2.5 bg-panel-bg border border-panel-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50"
                spellCheck={false}
              />
              <span className="text-muted">=</span>
              <input
                type="text"
                value={param.value}
                onChange={(e) =>
                  updateParam(param.id, "value", e.target.value)
                }
                placeholder="Value"
                className="flex-1 p-2.5 bg-panel-bg border border-panel-border rounded-lg font-mono text-sm text-foreground placeholder:text-muted/50"
                spellCheck={false}
              />
              <button
                onClick={() => removeParam(param.id)}
                className="p-2 text-muted hover:text-red-400 transition-colors"
                title="Remove parameter"
              >
                &times;
              </button>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button
              onClick={addParam}
              className="px-3 py-1.5 text-sm rounded-lg border border-panel-border bg-panel-bg text-muted hover:text-foreground transition-colors"
            >
              + Add parameter
            </button>
          </div>
          {queryOutput && (
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-panel-bg border border-panel-border rounded-lg font-mono text-sm text-foreground break-all">
                {queryOutput}
              </code>
              <CopyButton text={queryOutput} />
            </div>
          )}
        </div>
      </section>

      {/* Character Reference Table */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Common URL-Encoded Characters
        </h2>
        <div className="bg-panel-bg border border-panel-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-panel-border text-muted">
                  <th className="text-left px-4 py-2.5 font-medium">
                    Character
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium">
                    Encoded
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {CHAR_REFERENCE.map((row) => (
                  <tr
                    key={row.encoded}
                    className="border-b border-panel-border/50 hover:bg-panel-border/20 transition-colors"
                  >
                    <td className="px-4 py-2 text-accent">
                      {row.char === " " ? "␣" : row.char}
                    </td>
                    <td className="px-4 py-2 text-success">
                      {row.encoded}
                    </td>
                    <td className="px-4 py-2 text-muted font-sans">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AdSense Placeholder */}
      <div className="bg-panel-bg border border-panel-border border-dashed rounded-lg p-8 text-center">
        <span className="text-muted text-sm">Ad Space</span>
      </div>
    </div>
  );
}
