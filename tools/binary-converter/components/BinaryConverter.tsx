"use client";

import { useState, useCallback } from "react";

type Base = "binary" | "decimal" | "hex" | "octal";

interface FieldState {
  binary: string;
  decimal: string;
  hex: string;
  octal: string;
}

interface ErrorState {
  binary: string;
  decimal: string;
  hex: string;
  octal: string;
}

const ZERO = BigInt(0);
const ONE = BigInt(1);

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

const ASCII_TABLE = [
  { char: "Space", dec: 32 },
  { char: "!", dec: 33 },
  { char: "0", dec: 48 },
  { char: "9", dec: 57 },
  { char: "A", dec: 65 },
  { char: "Z", dec: 90 },
  { char: "a", dec: 97 },
  { char: "z", dec: 122 },
  { char: "\\n", dec: 10 },
  { char: "\\t", dec: 9 },
  { char: "@", dec: 64 },
  { char: "#", dec: 35 },
  { char: "$", dec: 36 },
  { char: "%", dec: 37 },
  { char: "&", dec: 38 },
  { char: "*", dec: 42 },
];

function validateBinary(s: string): boolean {
  return /^-?[01]+$/.test(s);
}

function validateDecimal(s: string): boolean {
  return /^-?\d+$/.test(s);
}

function validateHex(s: string): boolean {
  return /^-?[0-9a-fA-F]+$/.test(s);
}

function validateOctal(s: string): boolean {
  return /^-?[0-7]+$/.test(s);
}

function toTwosComplement(n: bigint, bits: number): string {
  if (n >= ZERO) {
    return n.toString(2).padStart(bits, "0");
  }
  const mask = (ONE << BigInt(bits)) - ONE;
  return ((mask + ONE + n) & mask).toString(2).padStart(bits, "0");
}

function getBitWidth(n: bigint): number {
  const abs = n < ZERO ? -n : n;
  let bits = 8;
  while (bits < 64 && abs >= ONE << BigInt(n < ZERO ? bits - 1 : bits)) {
    bits += 8;
  }
  return bits;
}

export default function BinaryConverter() {
  const [fields, setFields] = useState<FieldState>({
    binary: "",
    decimal: "",
    hex: "",
    octal: "",
  });
  const [errors, setErrors] = useState<ErrorState>({
    binary: "",
    decimal: "",
    hex: "",
    octal: "",
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleChange = useCallback(
    (base: Base, raw: string) => {
      setFields((prev) => ({ ...prev, [base]: raw }));

      if (raw === "" || raw === "-") {
        setFields({ binary: "", decimal: "", hex: "", octal: "", [base]: raw } as FieldState);
        setErrors({ binary: "", decimal: "", hex: "", octal: "" });
        return;
      }

      const validators: Record<Base, (s: string) => boolean> = {
        binary: validateBinary,
        decimal: validateDecimal,
        hex: validateHex,
        octal: validateOctal,
      };

      if (!validators[base](raw)) {
        const labels: Record<Base, string> = {
          binary: "Only 0 and 1 allowed",
          decimal: "Only digits allowed",
          hex: "Only 0-9 and A-F allowed",
          octal: "Only 0-7 allowed",
        };
        setErrors((prev) => ({ ...prev, [base]: labels[base] }));
        return;
      }

      setErrors((prev) => ({ ...prev, [base]: "" }));

      try {
        const isNeg = raw.startsWith("-");
        const abs = isNeg ? raw.slice(1) : raw;
        let value: bigint;

        if (base === "decimal") {
          value = BigInt(raw);
        } else {
          const prefixes: Record<string, string> = { binary: "0b", hex: "0x", octal: "0o" };
          value = BigInt(prefixes[base] + abs);
          if (isNeg) value = -value;
        }

        const absVal = value < ZERO ? -value : value;
        const prefix = value < ZERO ? "-" : "";

        setFields({
          binary: base === "binary" ? raw : prefix + absVal.toString(2),
          decimal: base === "decimal" ? raw : value.toString(10),
          hex: base === "hex" ? raw : prefix + absVal.toString(16).toUpperCase(),
          octal: base === "octal" ? raw : prefix + absVal.toString(8),
        });
      } catch {
        setErrors((prev) => ({ ...prev, [base]: "Invalid number" }));
      }
    },
    []
  );

  const handleCopy = useCallback(async (base: string, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedField(base);
    setTimeout(() => setCopiedField(null), 1500);
  }, []);

  const decimalValue = fields.decimal && validateDecimal(fields.decimal) ? BigInt(fields.decimal) : null;
  const bitWidth = decimalValue !== null ? getBitWidth(decimalValue) : 8;
  const binaryBits = decimalValue !== null ? toTwosComplement(decimalValue, bitWidth) : null;

  const bitGroups: string[][] = [];
  if (binaryBits) {
    for (let i = 0; i < binaryBits.length; i += 8) {
      bitGroups.push(binaryBits.slice(i, i + 8).split(""));
    }
  }

  const fieldConfig: { base: Base; label: string; placeholder: string }[] = [
    { base: "binary", label: "Binary", placeholder: "e.g. 1010" },
    { base: "decimal", label: "Decimal", placeholder: "e.g. 42" },
    { base: "hex", label: "Hexadecimal", placeholder: "e.g. 2A" },
    { base: "octal", label: "Octal", placeholder: "e.g. 52" },
  ];

  return (
    <div className="space-y-8">
      {/* Converter Fields */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fieldConfig.map(({ base, label, placeholder }) => (
            <div key={base}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fields[base]}
                  onChange={(e) => handleChange(base, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full px-3 py-2.5 pr-10 border rounded-lg font-mono text-sm outline-none transition-colors ${
                    errors[base]
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  onClick={() => handleCopy(base, fields[base])}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title={`Copy ${label}`}
                >
                  {copiedField === base ? CHECK_ICON : COPY_ICON}
                </button>
              </div>
              {errors[base] && (
                <p className="mt-1 text-xs text-red-500">{errors[base]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bit Visualization */}
      {binaryBits && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Bit Visualization
            {decimalValue !== null && decimalValue < ZERO && (
              <span className="ml-2 text-xs font-normal text-gray-500">
                (two&apos;s complement, {bitWidth}-bit)
              </span>
            )}
          </h3>
          <div className="flex flex-wrap gap-4">
            {bitGroups.map((group, gi) => (
              <div key={gi} className="flex gap-0.5">
                {group.map((bit, bi) => {
                  const pos = bitWidth - 1 - (gi * 8 + bi);
                  return (
                    <div key={bi} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded text-sm font-mono font-bold ${
                          bit === "1"
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {bit}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5">
                        {pos}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASCII Quick Reference */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          ASCII Quick Reference
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Char</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Dec</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Hex</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Binary</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Char</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Dec</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Hex</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Binary</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil(ASCII_TABLE.length / 2) }).map(
                (_, i) => {
                  const left = ASCII_TABLE[i * 2];
                  const right = ASCII_TABLE[i * 2 + 1];
                  return (
                    <tr
                      key={i}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-1.5 px-3 font-mono">{left.char}</td>
                      <td className="py-1.5 px-3 font-mono text-gray-600">{left.dec}</td>
                      <td className="py-1.5 px-3 font-mono text-gray-600">
                        {left.dec.toString(16).toUpperCase()}
                      </td>
                      <td className="py-1.5 px-3 font-mono text-gray-600">
                        {left.dec.toString(2).padStart(8, "0")}
                      </td>
                      {right ? (
                        <>
                          <td className="py-1.5 px-3 font-mono">{right.char}</td>
                          <td className="py-1.5 px-3 font-mono text-gray-600">{right.dec}</td>
                          <td className="py-1.5 px-3 font-mono text-gray-600">
                            {right.dec.toString(16).toUpperCase()}
                          </td>
                          <td className="py-1.5 px-3 font-mono text-gray-600">
                            {right.dec.toString(2).padStart(8, "0")}
                          </td>
                        </>
                      ) : (
                        <>
                          <td />
                          <td />
                          <td />
                          <td />
                        </>
                      )}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
