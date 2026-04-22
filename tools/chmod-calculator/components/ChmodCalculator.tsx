"use client";

import { useState, useCallback } from "react";

type Permissions = [boolean, boolean, boolean]; // read, write, execute
type AllPermissions = [Permissions, Permissions, Permissions]; // owner, group, others

const LABELS = ["Owner", "Group", "Others"] as const;
const BITS = ["Read", "Write", "Execute"] as const;
const BIT_VALUES = [4, 2, 1] as const;

const PRESETS: { label: string; value: string }[] = [
  { label: "644", value: "644" },
  { label: "755", value: "755" },
  { label: "777", value: "777" },
  { label: "600", value: "600" },
  { label: "700", value: "700" },
  { label: "444", value: "444" },
];

function permToDigit(perm: Permissions): number {
  return perm.reduce((sum, v, i) => sum + (v ? BIT_VALUES[i] : 0), 0);
}

function digitToPerm(digit: number): Permissions {
  return [
    (digit & 4) !== 0,
    (digit & 2) !== 0,
    (digit & 1) !== 0,
  ];
}

function permToSymbolic(perm: Permissions): string {
  return (
    (perm[0] ? "r" : "-") +
    (perm[1] ? "w" : "-") +
    (perm[2] ? "x" : "-")
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
      title={`Copy ${label}`}
    >
      {copied ? (
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function ChmodCalculator() {
  const [perms, setPerms] = useState<AllPermissions>([
    [true, true, true],   // owner: rwx
    [true, false, true],  // group: r-x
    [true, false, true],  // others: r-x
  ]); // default 755

  const numericStr = perms.map(permToDigit).join("");
  const symbolicStr = perms.map(permToSymbolic).join("");
  const chmodCmd = `chmod ${numericStr} filename`;

  const toggleBit = useCallback((category: number, bit: number) => {
    setPerms((prev) => {
      const next: AllPermissions = prev.map((p) => [...p]) as AllPermissions;
      next[category][bit] = !next[category][bit];
      return next;
    });
  }, []);

  const handleNumericInput = useCallback((value: string) => {
    // Allow typing - only process when we have valid digits
    const digits = value.replace(/[^0-7]/g, "").slice(0, 3);
    if (digits.length === 3) {
      const newPerms: AllPermissions = [
        digitToPerm(parseInt(digits[0])),
        digitToPerm(parseInt(digits[1])),
        digitToPerm(parseInt(digits[2])),
      ];
      setPerms(newPerms);
    }
  }, []);

  const applyPreset = useCallback((value: string) => {
    const newPerms: AllPermissions = [
      digitToPerm(parseInt(value[0])),
      digitToPerm(parseInt(value[1])),
      digitToPerm(parseInt(value[2])),
    ];
    setPerms(newPerms);
  }, []);

  return (
    <div className="space-y-6">
      {/* Permission Grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold text-gray-500 pb-3 pr-4 w-24"></th>
                {BITS.map((bit) => (
                  <th key={bit} className="text-center text-sm font-semibold text-gray-500 pb-3 px-4">
                    {bit}
                  </th>
                ))}
                <th className="text-center text-sm font-semibold text-gray-500 pb-3 px-4">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {LABELS.map((label, catIdx) => (
                <tr key={label} className="border-t border-gray-100">
                  <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                    {label}
                  </td>
                  {BITS.map((bit, bitIdx) => (
                    <td key={bit} className="py-3 px-4 text-center">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perms[catIdx][bitIdx]}
                          onChange={() => toggleBit(catIdx, bitIdx)}
                          className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-500 cursor-pointer"
                        />
                      </label>
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block w-8 text-center font-mono text-lg font-semibold text-gray-900">
                      {permToDigit(perms[catIdx])}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Numeric Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter numeric value
        </label>
        <input
          type="text"
          value={numericStr}
          onChange={(e) => handleNumericInput(e.target.value)}
          maxLength={3}
          className="w-32 px-4 py-2 text-2xl font-mono font-bold text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
          placeholder="755"
        />
      </div>

      {/* Presets */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Common presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => applyPreset(preset.value)}
              className={`px-4 py-2 text-sm font-mono font-semibold rounded-lg border transition-colors cursor-pointer ${
                numericStr === preset.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Result
        </h2>

        {/* Numeric */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Numeric</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{numericStr}</p>
          </div>
          <CopyButton text={numericStr} label="Copy" />
        </div>

        <hr className="border-gray-100" />

        {/* Symbolic */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Symbolic</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{symbolicStr}</p>
          </div>
          <CopyButton text={symbolicStr} label="Copy" />
        </div>

        <hr className="border-gray-100" />

        {/* Command */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Command</p>
            <p className="text-lg font-mono text-gray-900">{chmodCmd}</p>
          </div>
          <CopyButton text={chmodCmd} label="Copy" />
        </div>
      </div>

      {/* Visual Permission Display */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Who can do what
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {LABELS.map((label, catIdx) => (
            <div key={label} className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className={perms[catIdx][0] ? "text-green-600" : "text-gray-300"}>
                    {perms[catIdx][0] ? "+" : "-"}
                  </span>
                  <span className={perms[catIdx][0] ? "text-gray-900" : "text-gray-400"}>
                    Read
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={perms[catIdx][1] ? "text-green-600" : "text-gray-300"}>
                    {perms[catIdx][1] ? "+" : "-"}
                  </span>
                  <span className={perms[catIdx][1] ? "text-gray-900" : "text-gray-400"}>
                    Write
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={perms[catIdx][2] ? "text-green-600" : "text-gray-300"}>
                    {perms[catIdx][2] ? "+" : "-"}
                  </span>
                  <span className={perms[catIdx][2] ? "text-gray-900" : "text-gray-400"}>
                    Execute
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
