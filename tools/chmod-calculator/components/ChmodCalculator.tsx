"use client";

import { useMemo, useState } from "react";

type Permissions = [boolean, boolean, boolean];
type AllPermissions = [Permissions, Permissions, Permissions];
type SpecialBits = [boolean, boolean, boolean];

const GROUPS = ["Owner", "Group", "Others"] as const;
const BITS = [
  { label: "Read", short: "r", value: 4 },
  { label: "Write", short: "w", value: 2 },
  { label: "Execute", short: "x", value: 1 },
] as const;

const PRESETS = [
  { value: "644", label: "Regular file", note: "Owner write, everyone read" },
  { value: "755", label: "Executable / directory", note: "Owner write, everyone execute" },
  { value: "700", label: "Private directory", note: "Owner only" },
  { value: "600", label: "SSH key / secret", note: "Owner read/write only" },
  { value: "775", label: "Shared project", note: "Owner/group write" },
  { value: "664", label: "Shared file", note: "Owner/group write, no execute" },
  { value: "750", label: "Private executable", note: "Owner full, group read/execute" },
  { value: "1777", label: "Sticky temp dir", note: "World writable with sticky bit" },
];

function permissionDigit(permission: Permissions) {
  return permission.reduce((sum, enabled, index) => sum + (enabled ? BITS[index].value : 0), 0);
}

function digitToPermission(digit: number): Permissions {
  return [(digit & 4) !== 0, (digit & 2) !== 0, (digit & 1) !== 0];
}

function specialDigit(bits: SpecialBits) {
  return (bits[0] ? 4 : 0) + (bits[1] ? 2 : 0) + (bits[2] ? 1 : 0);
}

function permissionToSymbol(permission: Permissions, groupIndex: number, special: SpecialBits) {
  const chars = [
    permission[0] ? "r" : "-",
    permission[1] ? "w" : "-",
    permission[2] ? "x" : "-",
  ];
  if (groupIndex === 0 && special[0]) chars[2] = permission[2] ? "s" : "S";
  if (groupIndex === 1 && special[1]) chars[2] = permission[2] ? "s" : "S";
  if (groupIndex === 2 && special[2]) chars[2] = permission[2] ? "t" : "T";
  return chars.join("");
}

function parseMode(value: string): { permissions: AllPermissions; special: SpecialBits } | null {
  const digits = value.replace(/[^0-7]/g, "");
  if (digits.length !== 3 && digits.length !== 4) return null;
  const mode = digits.length === 3 ? `0${digits}` : digits;
  const specialValue = Number.parseInt(mode[0], 10);
  return {
    special: [(specialValue & 4) !== 0, (specialValue & 2) !== 0, (specialValue & 1) !== 0],
    permissions: [digitToPermission(Number.parseInt(mode[1], 10)), digitToPermission(Number.parseInt(mode[2], 10)), digitToPermission(Number.parseInt(mode[3], 10))],
  };
}

function modeSummary(mode: string) {
  if (mode === "777" || mode === "0777") return { tone: "border-red-200 bg-red-50 text-red-800", text: "Everyone can read, write, and execute. Avoid for public paths unless you fully understand the risk." };
  if (mode.endsWith("666")) return { tone: "border-amber-200 bg-amber-50 text-amber-800", text: "Everyone can write. This is usually risky for shared servers." };
  if (mode === "600" || mode === "0600") return { tone: "border-emerald-200 bg-emerald-50 text-emerald-800", text: "Good for private keys and secrets: owner read/write only." };
  if (mode === "755" || mode === "0755") return { tone: "border-sky-200 bg-sky-50 text-sky-800", text: "Common for directories and executable scripts." };
  return { tone: "border-slate-200 bg-slate-50 text-slate-800", text: "Check whether this path is a file or directory before applying recursively." };
}

export default function ChmodCalculator() {
  const [permissions, setPermissions] = useState<AllPermissions>([
    [true, true, true],
    [true, false, true],
    [true, false, true],
  ]);
  const [special, setSpecial] = useState<SpecialBits>([false, false, false]);
  const [targetPath, setTargetPath] = useState("path/to/file");
  const [recursive, setRecursive] = useState(false);
  const [manualInput, setManualInput] = useState("755");
  const [inputError, setInputError] = useState("");
  const [copied, setCopied] = useState("");

  const mode = useMemo(() => {
    const base = permissions.map(permissionDigit).join("");
    const prefix = specialDigit(special);
    return prefix > 0 ? `${prefix}${base}` : base;
  }, [permissions, special]);
  const symbolic = permissions.map((permission, index) => permissionToSymbol(permission, index, special)).join("");
  const command = `chmod ${recursive ? "-R " : ""}${mode} ${targetPath.trim() || "path/to/file"}`;
  const summary = modeSummary(mode);

  function updatePermission(groupIndex: number, bitIndex: number) {
    setPermissions((prev) => {
      const next = prev.map((permission) => [...permission]) as AllPermissions;
      next[groupIndex][bitIndex] = !next[groupIndex][bitIndex];
      setManualInput("");
      setInputError("");
      return next;
    });
  }

  function updateSpecial(index: number) {
    setSpecial((prev) => {
      const next = [...prev] as SpecialBits;
      next[index] = !next[index];
      setManualInput("");
      setInputError("");
      return next;
    });
  }

  function applyMode(value: string) {
    const sanitized = value.replace(/[^0-7]/g, "").slice(0, 4);
    setManualInput(sanitized);
    const parsed = parseMode(sanitized);
    if (!sanitized) {
      setInputError("Enter a 3 or 4 digit octal mode.");
      return;
    }
    if (!parsed) {
      setInputError("Use 3 digits like 755, or 4 digits like 1777.");
      return;
    }
    setPermissions(parsed.permissions);
    setSpecial(parsed.special);
    setInputError("");
  }

  function reset() {
    const parsed = parseMode("755");
    if (!parsed) return;
    setPermissions(parsed.permissions);
    setSpecial(parsed.special);
    setTargetPath("path/to/file");
    setRecursive(false);
    setManualInput("755");
    setInputError("");
    setCopied("");
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1500);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Permission grid</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Toggle read, write, and execute for owner, group, and others.</p>
            </div>
            <button type="button" onClick={reset} className="w-fit rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Reset
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[92px_repeat(3,minmax(0,1fr))_54px] bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid-cols-[110px_repeat(3,minmax(0,1fr))_70px]">
              <div className="px-3 py-3">Who</div>
              {BITS.map((bit) => (
                <div key={bit.label} className="px-2 py-3 text-center">
                  <span className="sm:hidden">{bit.short.toUpperCase()}</span>
                  <span className="hidden sm:inline">{bit.label}</span>
                </div>
              ))}
              <div className="px-3 py-3 text-center">
                <span className="sm:hidden">#</span>
                <span className="hidden sm:inline">Value</span>
              </div>
            </div>
            {GROUPS.map((group, groupIndex) => (
              <div key={group} className="grid grid-cols-[92px_repeat(3,minmax(0,1fr))_54px] border-t border-slate-200 sm:grid-cols-[110px_repeat(3,minmax(0,1fr))_70px]">
                <div className="px-3 py-4 text-sm font-semibold text-slate-800">{group}</div>
                {BITS.map((bit, bitIndex) => (
                  <label key={bit.label} className="flex items-center justify-center px-2 py-4">
                    <input
                      type="checkbox"
                      checked={permissions[groupIndex][bitIndex]}
                      onChange={() => updatePermission(groupIndex, bitIndex)}
                      className="h-5 w-5 rounded border-slate-300 accent-slate-950"
                      aria-label={`${group} ${bit.label}`}
                    />
                  </label>
                ))}
                <div className="flex items-center justify-center px-3 py-4 font-mono text-lg font-bold text-slate-950">
                  {permissionDigit(permissions[groupIndex])}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Numeric mode</span>
              <input
                type="text"
                inputMode="numeric"
                value={manualInput || mode}
                onChange={(event) => applyMode(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-2xl font-bold outline-none focus:border-slate-900"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Target path</span>
              <input
                type="text"
                value={targetPath}
                onChange={(event) => setTargetPath(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-slate-900"
              />
            </label>
          </div>
          <p className={`mt-3 min-h-5 text-sm ${inputError ? "text-red-600" : "text-slate-500"}`}>
            {inputError || "3 digits set normal permissions. 4 digits add setuid, setgid, or sticky bit."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { label: "setuid", note: "Run as owner" },
              { label: "setgid", note: "Run as group" },
              { label: "sticky", note: "Protect shared dirs" },
            ].map((item, index) => (
              <label key={item.label} className={`rounded-xl border p-3 ${special[index] ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={special[index]} onChange={() => updateSpecial(index)} className="h-4 w-4 rounded border-slate-300 accent-slate-950" />
                  {item.label}
                </span>
                <span className={`mt-1 block text-xs ${special[index] ? "text-slate-300" : "text-slate-500"}`}>{item.note}</span>
              </label>
            ))}
          </div>

          <label className="mt-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <input type="checkbox" checked={recursive} onChange={(event) => setRecursive(event.target.checked)} className="h-4 w-4 rounded border-amber-300 accent-amber-700" />
            Use <span className="font-mono">-R</span> recursively. Apply this only when you understand every nested file and directory.
          </label>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Presets</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyMode(preset.value)}
                  className={`rounded-xl border p-3 text-left transition ${mode === preset.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
                >
                  <span className="font-mono text-sm font-bold">{preset.value}</span>
                  <span className="ml-2 text-sm font-semibold">{preset.label}</span>
                  <span className={`mt-1 block text-xs ${mode === preset.value ? "text-slate-300" : "text-slate-500"}`}>{preset.note}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className={`rounded-2xl border p-5 ${summary.tone}`}>
            <p className="text-sm font-medium opacity-80">Current mode</p>
            <p className="mt-2 font-mono text-5xl font-bold tracking-tight">{mode}</p>
            <p className="mt-2 text-sm leading-6">{summary.text}</p>
          </div>

          <div className="mt-5 grid gap-3">
            <ResultCard label="Symbolic" value={symbolic} onCopy={() => copy(symbolic, "symbolic")} copied={copied === "symbolic"} />
            <ResultCard label="Numeric" value={mode} onCopy={() => copy(mode, "numeric")} copied={copied === "numeric"} />
            <ResultCard label="Command" value={command} onCopy={() => copy(command, "command")} copied={copied === "command"} />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-950">Who can do what</h2>
            <div className="mt-3 grid gap-3">
              {GROUPS.map((group, groupIndex) => (
                <div key={group} className="rounded-lg bg-white px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-800">{group}</span>
                    <span className="font-mono text-sm text-slate-500">{permissionToSymbol(permissions[groupIndex], groupIndex, special)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {BITS.map((bit, bitIndex) => (
                      <span key={bit.label} className={`rounded-full px-2 py-1 ${permissions[groupIndex][bitIndex] ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {bit.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
            <h2 className="font-semibold text-slate-950">Privacy</h2>
            <p className="mt-1">This tool runs entirely in your browser. Paths and generated commands are not sent anywhere.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultCard({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 break-all font-mono text-lg font-semibold text-slate-950">{value}</p>
        </div>
        <button type="button" onClick={onCopy} className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
