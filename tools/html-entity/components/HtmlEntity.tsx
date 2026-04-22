"use client";

import { useState, useMemo, useCallback } from "react";

// --- Entity reference data ---
const ENTITY_TABLE: { char: string; named: string; numeric: string; description: string }[] = [
  { char: "&", named: "&amp;", numeric: "&#38;", description: "Ampersand" },
  { char: "<", named: "&lt;", numeric: "&#60;", description: "Less than" },
  { char: ">", named: "&gt;", numeric: "&#62;", description: "Greater than" },
  { char: '"', named: "&quot;", numeric: "&#34;", description: "Double quote" },
  { char: "'", named: "&apos;", numeric: "&#39;", description: "Apostrophe" },
  { char: "\u00a0", named: "&nbsp;", numeric: "&#160;", description: "Non-breaking space" },
  { char: "\u00a9", named: "&copy;", numeric: "&#169;", description: "Copyright" },
  { char: "\u00ae", named: "&reg;", numeric: "&#174;", description: "Registered" },
  { char: "\u2122", named: "&trade;", numeric: "&#8482;", description: "Trademark" },
  { char: "\u00a2", named: "&cent;", numeric: "&#162;", description: "Cent" },
  { char: "\u00a3", named: "&pound;", numeric: "&#163;", description: "Pound" },
  { char: "\u00a5", named: "&yen;", numeric: "&#165;", description: "Yen" },
  { char: "\u20ac", named: "&euro;", numeric: "&#8364;", description: "Euro" },
  { char: "\u00b0", named: "&deg;", numeric: "&#176;", description: "Degree" },
  { char: "\u00b1", named: "&plusmn;", numeric: "&#177;", description: "Plus-minus" },
  { char: "\u00d7", named: "&times;", numeric: "&#215;", description: "Multiplication" },
  { char: "\u00f7", named: "&divide;", numeric: "&#247;", description: "Division" },
  { char: "\u2260", named: "&ne;", numeric: "&#8800;", description: "Not equal" },
  { char: "\u2264", named: "&le;", numeric: "&#8804;", description: "Less or equal" },
  { char: "\u2265", named: "&ge;", numeric: "&#8805;", description: "Greater or equal" },
  { char: "\u221e", named: "&infin;", numeric: "&#8734;", description: "Infinity" },
  { char: "\u2211", named: "&sum;", numeric: "&#8721;", description: "Summation" },
  { char: "\u221a", named: "&radic;", numeric: "&#8730;", description: "Square root" },
  { char: "\u2190", named: "&larr;", numeric: "&#8592;", description: "Left arrow" },
  { char: "\u2191", named: "&uarr;", numeric: "&#8593;", description: "Up arrow" },
  { char: "\u2192", named: "&rarr;", numeric: "&#8594;", description: "Right arrow" },
  { char: "\u2193", named: "&darr;", numeric: "&#8595;", description: "Down arrow" },
  { char: "\u2194", named: "&harr;", numeric: "&#8596;", description: "Left-right arrow" },
  { char: "\u2022", named: "&bull;", numeric: "&#8226;", description: "Bullet" },
  { char: "\u2026", named: "&hellip;", numeric: "&#8230;", description: "Ellipsis" },
  { char: "\u2013", named: "&ndash;", numeric: "&#8211;", description: "En dash" },
  { char: "\u2014", named: "&mdash;", numeric: "&#8212;", description: "Em dash" },
  { char: "\u2018", named: "&lsquo;", numeric: "&#8216;", description: "Left single quote" },
  { char: "\u2019", named: "&rsquo;", numeric: "&#8217;", description: "Right single quote" },
  { char: "\u201c", named: "&ldquo;", numeric: "&#8220;", description: "Left double quote" },
  { char: "\u201d", named: "&rdquo;", numeric: "&#8221;", description: "Right double quote" },
  { char: "\u00ab", named: "&laquo;", numeric: "&#171;", description: "Left guillemet" },
  { char: "\u00bb", named: "&raquo;", numeric: "&#187;", description: "Right guillemet" },
  { char: "\u00bc", named: "&frac14;", numeric: "&#188;", description: "One quarter" },
  { char: "\u00bd", named: "&frac12;", numeric: "&#189;", description: "One half" },
  { char: "\u00be", named: "&frac34;", numeric: "&#190;", description: "Three quarters" },
  { char: "\u00bf", named: "&iquest;", numeric: "&#191;", description: "Inverted question" },
  { char: "\u00a1", named: "&iexcl;", numeric: "&#161;", description: "Inverted exclamation" },
  { char: "\u00b6", named: "&para;", numeric: "&#182;", description: "Paragraph" },
  { char: "\u00a7", named: "&sect;", numeric: "&#167;", description: "Section" },
  { char: "\u2020", named: "&dagger;", numeric: "&#8224;", description: "Dagger" },
  { char: "\u2021", named: "&Dagger;", numeric: "&#8225;", description: "Double dagger" },
  { char: "\u2660", named: "&spades;", numeric: "&#9824;", description: "Spade" },
  { char: "\u2663", named: "&clubs;", numeric: "&#9827;", description: "Club" },
  { char: "\u2665", named: "&hearts;", numeric: "&#9829;", description: "Heart" },
  { char: "\u2666", named: "&diams;", numeric: "&#9830;", description: "Diamond" },
];

// --- Named entity map for encoding ---
const SPECIAL_CHARS: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

type Mode = "encode" | "decode";
type EntityType = "named" | "numeric";
type EncodeScope = "special" | "all";

function encodeToEntities(
  text: string,
  entityType: EntityType,
  scope: EncodeScope
): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (scope === "special") {
      if (SPECIAL_CHARS[ch]) {
        if (entityType === "named") {
          result += SPECIAL_CHARS[ch];
        } else {
          result += `&#${ch.charCodeAt(0)};`;
        }
      } else {
        result += ch;
      }
    } else {
      // Encode all characters
      if (entityType === "named" && SPECIAL_CHARS[ch]) {
        result += SPECIAL_CHARS[ch];
      } else if (ch.charCodeAt(0) > 127 || scope === "all") {
        if (entityType === "named") {
          // Check entity table for named entity
          const entry = ENTITY_TABLE.find((e) => e.char === ch);
          if (entry) {
            result += entry.named;
          } else {
            result += `&#${ch.charCodeAt(0)};`;
          }
        } else {
          result += `&#${ch.charCodeAt(0)};`;
        }
      } else {
        result += ch;
      }
    }
  }
  return result;
}

function decodeEntities(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export default function HtmlEntity() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("named");
  const [scope, setScope] = useState<EncodeScope>("special");
  const [copied, setCopied] = useState(false);
  const [tableCopied, setTableCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const output = useMemo(() => {
    if (!input) return "";
    if (mode === "encode") {
      return encodeToEntities(input, entityType, scope);
    }
    try {
      return decodeEntities(input);
    } catch {
      return "Error decoding entities";
    }
  }, [input, mode, entityType, scope]);

  const filteredEntities = useMemo(() => {
    if (!search) return ENTITY_TABLE;
    const q = search.toLowerCase();
    return ENTITY_TABLE.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.named.toLowerCase().includes(q) ||
        e.char.includes(q) ||
        e.numeric.includes(q)
    );
  }, [search]);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const copyEntity = useCallback(async (entity: string) => {
    await navigator.clipboard.writeText(entity);
    setTableCopied(entity);
    setTimeout(() => setTableCopied(null), 1500);
  }, []);

  return (
    <div className="space-y-8">
      {/* Encoder/Decoder */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Mode Toggle + Options */}
        <div className="flex flex-wrap items-center gap-4 p-4 border-b border-gray-100">
          {/* Mode */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "encode"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === "decode"
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Decode
            </button>
          </div>

          {/* Encode options */}
          {mode === "encode" && (
            <>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === "special"}
                    onChange={() => setScope("special")}
                    className="accent-gray-900"
                  />
                  Special chars only
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === "all"}
                    onChange={() => setScope("all")}
                    className="accent-gray-900"
                  />
                  All characters
                </label>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="entityType"
                    checked={entityType === "named"}
                    onChange={() => setEntityType("named")}
                    className="accent-gray-900"
                  />
                  Named
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="radio"
                    name="entityType"
                    checked={entityType === "numeric"}
                    onChange={() => setEntityType("numeric")}
                    className="accent-gray-900"
                  />
                  Numeric
                </label>
              </div>
            </>
          )}
        </div>

        {/* Input / Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Input */}
          <div className="p-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              {mode === "encode" ? "Text Input" : "HTML Entities Input"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? 'Paste text here... e.g. <div class="hello">'
                  : "Paste entities here... e.g. &lt;div class=&quot;hello&quot;&gt;"
              }
              className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent bg-gray-50"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                {mode === "encode" ? "HTML Entities Output" : "Decoded Text"}
              </label>
              {output && (
                <button
                  onClick={() => copyToClipboard(output)}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 overflow-auto whitespace-pre-wrap break-all">
              {output || (
                <span className="text-gray-400">
                  Result will appear here...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            HTML Entity Reference
          </h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entities..."
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2.5 font-medium text-gray-500 w-16">Char</th>
                <th className="px-4 py-2.5 font-medium text-gray-500">Named</th>
                <th className="px-4 py-2.5 font-medium text-gray-500">Numeric</th>
                <th className="px-4 py-2.5 font-medium text-gray-500">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntities.map((entity) => (
                <tr
                  key={entity.named}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 text-center text-base">
                    {entity.char === "\u00a0" ? "[ ]" : entity.char}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => copyEntity(entity.named)}
                      className="font-mono text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      title="Click to copy"
                    >
                      {tableCopied === entity.named ? (
                        <span className="text-green-600">Copied!</span>
                      ) : (
                        entity.named
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => copyEntity(entity.numeric)}
                      className="font-mono text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      title="Click to copy"
                    >
                      {tableCopied === entity.numeric ? (
                        <span className="text-green-600">Copied!</span>
                      ) : (
                        entity.numeric
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{entity.description}</td>
                </tr>
              ))}
              {filteredEntities.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No entities found matching &ldquo;{search}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
