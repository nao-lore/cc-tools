"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cssToTailwind, tailwindToCss } from "../lib/converter";

type Mode = "css-to-tw" | "tw-to-css";

const PLACEHOLDER_CSS = `.card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  background-color: white;
  cursor: pointer;
  transition-property: all;
  transition-duration: 200ms;
}`;

const PLACEHOLDER_TW = `flex flex-col p-6 mb-4 rounded-lg shadow bg-white cursor-pointer transition-all duration-200`;

export default function Converter() {
  const [mode, setMode] = useState<Mode>("css-to-tw");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const convert = useCallback(
    (text: string, currentMode: Mode) => {
      if (!text.trim()) {
        setOutput("");
        return;
      }
      try {
        const result =
          currentMode === "css-to-tw"
            ? cssToTailwind(text)
            : tailwindToCss(text);
        setOutput(result);
      } catch {
        setOutput("/* Error parsing input */");
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setInput(value);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        convert(value, mode);
      }, 200);
    },
    [mode, convert]
  );

  const toggleMode = useCallback(() => {
    const newMode: Mode =
      mode === "css-to-tw" ? "tw-to-css" : "css-to-tw";
    setMode(newMode);
    setInput("");
    setOutput("");
  }, [mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  // Convert on mode change if there's input
  useEffect(() => {
    if (input.trim()) {
      convert(input, mode);
    }
  }, [mode, input, convert]);

  const placeholder =
    mode === "css-to-tw" ? PLACEHOLDER_CSS : PLACEHOLDER_TW;
  const inputLabel =
    mode === "css-to-tw" ? "CSS Input" : "Tailwind Classes Input";
  const outputLabel =
    mode === "css-to-tw" ? "Tailwind Classes Output" : "CSS Output";

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={toggleMode}
          className="group flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200"
          aria-label="Toggle conversion direction"
        >
          <span
            className={`text-sm font-semibold transition-colors ${
              mode === "css-to-tw" ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            CSS
          </span>
          <span className="flex items-center text-gray-400 group-hover:text-indigo-500 transition-colors">
            {mode === "css-to-tw" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            )}
          </span>
          <span
            className={`text-sm font-semibold transition-colors ${
              mode === "tw-to-css" ? "text-indigo-600" : "text-gray-500"
            }`}
          >
            Tailwind
          </span>
        </button>
      </div>

      {/* Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
            <span className="text-sm font-medium text-gray-300">
              {inputLabel}
            </span>
            <button
              onClick={() => {
                setInput("");
                setOutput("");
              }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-72 sm:h-80 lg:h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-b-lg placeholder:text-gray-600"
            spellCheck={false}
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
            <span className="text-sm font-medium text-gray-300">
              {outputLabel}
            </span>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all duration-200 ${
                copied
                  ? "bg-green-600 text-white"
                  : output
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {copied ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="w-full h-72 sm:h-80 lg:h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm leading-relaxed overflow-auto rounded-b-lg whitespace-pre-wrap">
            {output || (
              <span className="text-gray-600">
                {mode === "css-to-tw"
                  ? "Tailwind classes will appear here..."
                  : "CSS output will appear here..."}
              </span>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
