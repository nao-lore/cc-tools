"use client";

import { useState, useCallback } from "react";

// 5x7 bitmap font for A-Z, 0-9, space, and common punctuation
const FONT: Record<string, string[]> = {
  A: [
    " ### ",
    "#   #",
    "#   #",
    "#####",
    "#   #",
    "#   #",
    "#   #",
  ],
  B: [
    "#### ",
    "#   #",
    "#   #",
    "#### ",
    "#   #",
    "#   #",
    "#### ",
  ],
  C: [
    " ### ",
    "#   #",
    "#    ",
    "#    ",
    "#    ",
    "#   #",
    " ### ",
  ],
  D: [
    "#### ",
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    "#### ",
  ],
  E: [
    "#####",
    "#    ",
    "#    ",
    "#### ",
    "#    ",
    "#    ",
    "#####",
  ],
  F: [
    "#####",
    "#    ",
    "#    ",
    "#### ",
    "#    ",
    "#    ",
    "#    ",
  ],
  G: [
    " ### ",
    "#   #",
    "#    ",
    "# ###",
    "#   #",
    "#   #",
    " ### ",
  ],
  H: [
    "#   #",
    "#   #",
    "#   #",
    "#####",
    "#   #",
    "#   #",
    "#   #",
  ],
  I: [
    "#####",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "#####",
  ],
  J: [
    "#####",
    "    #",
    "    #",
    "    #",
    "    #",
    "#   #",
    " ### ",
  ],
  K: [
    "#   #",
    "#  # ",
    "# #  ",
    "##   ",
    "# #  ",
    "#  # ",
    "#   #",
  ],
  L: [
    "#    ",
    "#    ",
    "#    ",
    "#    ",
    "#    ",
    "#    ",
    "#####",
  ],
  M: [
    "#   #",
    "## ##",
    "# # #",
    "# # #",
    "#   #",
    "#   #",
    "#   #",
  ],
  N: [
    "#   #",
    "##  #",
    "# # #",
    "# # #",
    "#  ##",
    "#   #",
    "#   #",
  ],
  O: [
    " ### ",
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    " ### ",
  ],
  P: [
    "#### ",
    "#   #",
    "#   #",
    "#### ",
    "#    ",
    "#    ",
    "#    ",
  ],
  Q: [
    " ### ",
    "#   #",
    "#   #",
    "#   #",
    "# # #",
    "#  # ",
    " ## #",
  ],
  R: [
    "#### ",
    "#   #",
    "#   #",
    "#### ",
    "# #  ",
    "#  # ",
    "#   #",
  ],
  S: [
    " ### ",
    "#   #",
    "#    ",
    " ### ",
    "    #",
    "#   #",
    " ### ",
  ],
  T: [
    "#####",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
  ],
  U: [
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    " ### ",
  ],
  V: [
    "#   #",
    "#   #",
    "#   #",
    "#   #",
    " # # ",
    " # # ",
    "  #  ",
  ],
  W: [
    "#   #",
    "#   #",
    "#   #",
    "# # #",
    "# # #",
    "## ##",
    "#   #",
  ],
  X: [
    "#   #",
    "#   #",
    " # # ",
    "  #  ",
    " # # ",
    "#   #",
    "#   #",
  ],
  Y: [
    "#   #",
    "#   #",
    " # # ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
  ],
  Z: [
    "#####",
    "    #",
    "   # ",
    "  #  ",
    " #   ",
    "#    ",
    "#####",
  ],
  "0": [
    " ### ",
    "#   #",
    "#  ##",
    "# # #",
    "##  #",
    "#   #",
    " ### ",
  ],
  "1": [
    "  #  ",
    " ##  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "#####",
  ],
  "2": [
    " ### ",
    "#   #",
    "    #",
    "  ## ",
    " #   ",
    "#    ",
    "#####",
  ],
  "3": [
    " ### ",
    "#   #",
    "    #",
    "  ## ",
    "    #",
    "#   #",
    " ### ",
  ],
  "4": [
    "   # ",
    "  ## ",
    " # # ",
    "#  # ",
    "#####",
    "   # ",
    "   # ",
  ],
  "5": [
    "#####",
    "#    ",
    "#### ",
    "    #",
    "    #",
    "#   #",
    " ### ",
  ],
  "6": [
    " ### ",
    "#   #",
    "#    ",
    "#### ",
    "#   #",
    "#   #",
    " ### ",
  ],
  "7": [
    "#####",
    "    #",
    "   # ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
  ],
  "8": [
    " ### ",
    "#   #",
    "#   #",
    " ### ",
    "#   #",
    "#   #",
    " ### ",
  ],
  "9": [
    " ### ",
    "#   #",
    "#   #",
    " ####",
    "    #",
    "#   #",
    " ### ",
  ],
  " ": [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ],
  "!": [
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "  #  ",
    "     ",
    "  #  ",
  ],
  "?": [
    " ### ",
    "#   #",
    "    #",
    "  ## ",
    "  #  ",
    "     ",
    "  #  ",
  ],
  ".": [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "  #  ",
  ],
  ",": [
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "  #  ",
    " #   ",
  ],
  "-": [
    "     ",
    "     ",
    "     ",
    "#####",
    "     ",
    "     ",
    "     ",
  ],
  "+": [
    "     ",
    "  #  ",
    "  #  ",
    "#####",
    "  #  ",
    "  #  ",
    "     ",
  ],
  "=": [
    "     ",
    "     ",
    "#####",
    "     ",
    "#####",
    "     ",
    "     ",
  ],
  "/": [
    "    #",
    "   # ",
    "   # ",
    "  #  ",
    " #   ",
    " #   ",
    "#    ",
  ],
  "(": [
    "  #  ",
    " #   ",
    "#    ",
    "#    ",
    "#    ",
    " #   ",
    "  #  ",
  ],
  ")": [
    "  #  ",
    "   # ",
    "    #",
    "    #",
    "    #",
    "   # ",
    "  #  ",
  ],
  ":": [
    "     ",
    "  #  ",
    "  #  ",
    "     ",
    "  #  ",
    "  #  ",
    "     ",
  ],
  "'": [
    "  #  ",
    "  #  ",
    " #   ",
    "     ",
    "     ",
    "     ",
    "     ",
  ],
  "@": [
    " ### ",
    "#   #",
    "# ###",
    "# # #",
    "# ###",
    "#    ",
    " ####",
  ],
  "#": [
    " # # ",
    " # # ",
    "#####",
    " # # ",
    "#####",
    " # # ",
    " # # ",
  ],
  "*": [
    "     ",
    "# # #",
    " ### ",
    "#####",
    " ### ",
    "# # #",
    "     ",
  ],
};

const CHAR_STYLES = [
  { label: "#", char: "#" },
  { label: "*", char: "*" },
  { label: "@", char: "@" },
  { label: "+", char: "+" },
  { label: "=", char: "=" },
  { label: "\u2588", char: "\u2588" },
  { label: "\u2593", char: "\u2593" },
  { label: "\u2591", char: "\u2591" },
];

function textToAscii(text: string, fillChar: string): string {
  const upper = text.toUpperCase();
  const lines: string[] = ["", "", "", "", "", "", ""];

  for (let i = 0; i < upper.length; i++) {
    const ch = upper[i];
    const glyph = FONT[ch];
    if (glyph) {
      for (let row = 0; row < 7; row++) {
        lines[row] += glyph[row].replace(/#/g, fillChar) + "  ";
      }
    }
  }

  return lines.map((l) => l.trimEnd()).join("\n");
}

type BoxStyle = "single" | "double" | "rounded";

const BOX_CHARS: Record<BoxStyle, { tl: string; tr: string; bl: string; br: string; h: string; v: string }> = {
  single:  { tl: "\u250C", tr: "\u2510", bl: "\u2514", br: "\u2518", h: "\u2500", v: "\u2502" },
  double:  { tl: "\u2554", tr: "\u2557", bl: "\u255A", br: "\u255D", h: "\u2550", v: "\u2551" },
  rounded: { tl: "\u256D", tr: "\u256E", bl: "\u2570", br: "\u256F", h: "\u2500", v: "\u2502" },
};

function wrapInBox(text: string, style: BoxStyle): string {
  const b = BOX_CHARS[style];
  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length), 0);
  const padded = lines.map((l) => `${b.v} ${l.padEnd(maxLen)} ${b.v}`);
  const top = `${b.tl}${b.h.repeat(maxLen + 2)}${b.tr}`;
  const bottom = `${b.bl}${b.h.repeat(maxLen + 2)}${b.br}`;
  return [top, ...padded, bottom].join("\n");
}

interface Decoration {
  name: string;
  art: string;
}

const DECORATIONS: Decoration[] = [
  { name: "Simple Divider", art: "----------------------------------------" },
  { name: "Double Divider", art: "========================================" },
  { name: "Star Divider", art: "* * * * * * * * * * * * * * * * * * * * " },
  { name: "Dash-Dot Divider", art: "-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-." },
  { name: "Wave Divider", art: "~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~.~." },
  { name: "Arrow Right", art: "------>  ======>  ----->>  ====>>" },
  { name: "Arrow Left", art: "<------  <======  <<-----  <<====" },
  { name: "Arrow Bidirectional", art: "<------>  <======>  <<---->>  <<====>" },
  {
    name: "Simple Face",
    art: `  ____
 /    \\
| o  o |
|  __  |
|  \\/  |
 \\____/`,
  },
  {
    name: "Cat Face",
    art: ` /\\_/\\
( o.o )
 > ^ <`,
  },
  {
    name: "Bear Face",
    art: ` \u3000 \u3000\u3000\u2584\u2584
\u3000\u3000(\u30FB\u03C9\u30FB)
\u3000\u3000|  \u3064 |
\u3000\u3000U \u3000U`,
  },
  {
    name: "Shrug",
    art: "\u00AF\\_(\u30C4)_/\u00AF",
  },
  {
    name: "Table Flip",
    art: "(\u256F\u00B0\u25A1\u00B0)\u256F\uFE35 \u253B\u2501\u253B",
  },
  {
    name: "Simple Border",
    art: `+----------+
|          |
|          |
+----------+`,
  },
  {
    name: "Star Box",
    art: `***********
*         *
*         *
***********`,
  },
  {
    name: "Diamond",
    art: `    *
   * *
  *   *
 *     *
  *   *
   * *
    *`,
  },
  {
    name: "Heart",
    art: `  ** **
 *  *  *
*       *
 *     *
  *   *
   * *
    *`,
  },
  {
    name: "Music Note",
    art: `  __
 /  |
|   |
|   |
|  _|
| |
|_|`,
  },
];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      {copied ? (
        <span className="checkmark-animate text-green-600">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {label || (copied ? "Copied!" : "Copy")}
    </button>
  );
}

type Tab = "banner" | "box" | "decorations";

export default function AsciiArtGenerator() {
  const [activeTab, setActiveTab] = useState<Tab>("banner");
  const [bannerText, setBannerText] = useState("HELLO");
  const [fillChar, setFillChar] = useState("#");
  const [boxText, setBoxText] = useState("Hello, World!");
  const [boxStyle, setBoxStyle] = useState<BoxStyle>("single");

  const bannerOutput = textToAscii(bannerText, fillChar);
  const boxOutput = wrapInBox(boxText, boxStyle);

  const tabs: { key: Tab; label: string }[] = [
    { key: "banner", label: "Text Banner" },
    { key: "box", label: "Box Generator" },
    { key: "decorations", label: "Decorations" },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banner Tab */}
      {activeTab === "banner" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="Type text here..."
              maxLength={20}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            />
            <div className="flex gap-1.5 items-center flex-wrap">
              <span className="text-xs text-gray-500 mr-1">Style:</span>
              {CHAR_STYLES.map((s) => (
                <button
                  key={s.char}
                  onClick={() => setFillChar(s.char)}
                  className={`w-8 h-8 text-sm font-mono rounded border transition-colors cursor-pointer ${
                    fillChar === s.char
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {bannerText && (
            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <pre className="ascii-preview text-gray-800">{bannerOutput}</pre>
              </div>
              <div className="mt-2 flex justify-end">
                <CopyButton text={bannerOutput} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Box Tab */}
      {activeTab === "box" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <textarea
              value={boxText}
              onChange={(e) => setBoxText(e.target.value)}
              placeholder="Type text to wrap in a box..."
              rows={3}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 resize-none"
            />
            <div className="flex sm:flex-col gap-2">
              <span className="text-xs text-gray-500">Border:</span>
              {(["single", "double", "rounded"] as BoxStyle[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setBoxStyle(s)}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors cursor-pointer capitalize ${
                    boxStyle === s
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {boxText && (
            <div className="relative">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <pre className="ascii-preview text-gray-800">{boxOutput}</pre>
              </div>
              <div className="mt-2 flex justify-end">
                <CopyButton text={boxOutput} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decorations Tab */}
      {activeTab === "decorations" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DECORATIONS.map((dec) => (
            <div
              key={dec.name}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {dec.name}
                </span>
                <CopyButton text={dec.art} />
              </div>
              <pre className="ascii-preview text-gray-800 text-xs overflow-x-auto">
                {dec.art}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
