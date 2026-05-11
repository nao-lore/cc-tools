"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type CharacterOption = "uppercase" | "lowercase" | "numbers" | "symbols";

type PasswordOptions = Record<CharacterOption, boolean> & {
  length: number;
  count: number;
  excludeAmbiguous: boolean;
  requireEachSelected: boolean;
};

type Preset = {
  label: string;
  options: PasswordOptions;
};

const CHARSETS: Record<CharacterOption, { label: string; chars: string }> = {
  uppercase: { label: "大文字 A-Z", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ" },
  lowercase: { label: "小文字 a-z", chars: "abcdefghijklmnopqrstuvwxyz" },
  numbers: { label: "数字 0-9", chars: "0123456789" },
  symbols: { label: "記号", chars: "!@#$%^&*()_+-=[]{}|;:,.<>?" },
};

const AMBIGUOUS_CHARS = new Set("0O1lI".split(""));
const DEFAULT_OPTIONS: PasswordOptions = {
  length: 20,
  count: 5,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
  requireEachSelected: true,
};

const PRESETS: Preset[] = [
  { label: "Password manager", options: DEFAULT_OPTIONS },
  {
    label: "Easy to type",
    options: { ...DEFAULT_OPTIONS, length: 18, symbols: false, excludeAmbiguous: true },
  },
  {
    label: "API token",
    options: { ...DEFAULT_OPTIONS, length: 32, count: 3, symbols: false, excludeAmbiguous: false },
  },
  {
    label: "Short temporary",
    options: { ...DEFAULT_OPTIONS, length: 12, count: 5, symbols: true },
  },
];

function getEnabledOptions(options: PasswordOptions) {
  return (Object.keys(CHARSETS) as CharacterOption[]).filter((key) => options[key]);
}

function filterCharacters(chars: string, excludeAmbiguous: boolean) {
  if (!excludeAmbiguous) return chars;
  return chars
    .split("")
    .filter((char) => !AMBIGUOUS_CHARS.has(char))
    .join("");
}

function buildCharacterPool(options: PasswordOptions) {
  return getEnabledOptions(options)
    .map((key) => filterCharacters(CHARSETS[key].chars, options.excludeAmbiguous))
    .join("");
}

function secureRandomIndex(maxExclusive: number) {
  if (maxExclusive <= 0) return 0;
  const maxUint = 0xffffffff;
  const limit = maxUint - (maxUint % maxExclusive);
  const buffer = new Uint32Array(1);

  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % maxExclusive;
}

function pickOne(chars: string) {
  return chars[secureRandomIndex(chars.length)] ?? "";
}

function shuffleSecure(chars: string[]) {
  const copy = [...chars];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomIndex(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy.join("");
}

function generatePassword(options: PasswordOptions) {
  const enabled = getEnabledOptions(options);
  const pool = buildCharacterPool(options);
  if (!pool) return "";

  const requiredChars =
    options.requireEachSelected && options.length >= enabled.length
      ? enabled.map((key) => pickOne(filterCharacters(CHARSETS[key].chars, options.excludeAmbiguous))).filter(Boolean)
      : [];

  const remainingLength = Math.max(0, options.length - requiredChars.length);
  const remainingChars = Array.from({ length: remainingLength }, () => pickOne(pool));
  return shuffleSecure([...requiredChars, ...remainingChars]);
}

function calculateEntropy(options: PasswordOptions) {
  const poolLength = buildCharacterPool(options).length;
  if (!poolLength) return 0;
  return Math.round(options.length * Math.log2(poolLength));
}

function getStrength(entropy: number) {
  if (entropy < 50) return { label: "弱い", tone: "text-red-700 bg-red-50 border-red-200", bar: "bg-red-500", width: "25%" };
  if (entropy < 75) return { label: "普通", tone: "text-amber-700 bg-amber-50 border-amber-200", bar: "bg-amber-500", width: "50%" };
  if (entropy < 100) return { label: "強い", tone: "text-sky-700 bg-sky-50 border-sky-200", bar: "bg-sky-500", width: "75%" };
  return { label: "非常に強い", tone: "text-emerald-700 bg-emerald-50 border-emerald-200", bar: "bg-emerald-500", width: "100%" };
}

function getError(options: PasswordOptions) {
  if (options.length < 8) return "長さは8文字以上にしてください。";
  if (options.length > 128) return "長さは128文字以下にしてください。";
  if (options.count < 1 || options.count > 20) return "生成数は1から20個の範囲にしてください。";
  if (!buildCharacterPool(options)) return "少なくとも1つの文字種を選択してください。";
  return "";
}

export default function PasswordGenerator() {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_OPTIONS);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [copied, setCopied] = useState("");

  const entropy = useMemo(() => calculateEntropy(options), [options]);
  const strength = getStrength(entropy);
  const error = getError(options);
  const poolSize = buildCharacterPool(options).length;

  const generate = useCallback(() => {
    const currentError = getError(options);
    if (currentError) {
      setPasswords([]);
      return;
    }
    setPasswords(Array.from({ length: options.count }, () => generatePassword(options)));
    setCopied("");
  }, [options]);

  useEffect(() => {
    generate();
  }, [generate]);

  function updateOption<T extends keyof PasswordOptions>(key: T, value: PasswordOptions[T]) {
    setOptions((current) => ({ ...current, [key]: value }));
    setCopied("");
  }

  function applyPreset(preset: Preset) {
    setOptions(preset.options);
    setCopied("");
  }

  function reset() {
    setOptions(DEFAULT_OPTIONS);
    setCopied("");
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(""), 1600);
  }

  function downloadTxt() {
    if (!passwords.length) return;
    const blob = new Blob([passwords.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "passwords.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-950">生成条件</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Web Crypto APIでランダムなパスワードを端末内生成します。
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              リセット
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">サンプル</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:border-slate-900 hover:bg-slate-50"
                >
                  {preset.label} <span className="text-slate-400">{preset.options.length} chars</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberInput
              id="password-length"
              label="長さ"
              value={options.length}
              min={8}
              max={128}
              unit="文字"
              onChange={(value) => updateOption("length", value)}
            />
            <NumberInput
              id="password-count"
              label="生成数"
              value={options.count}
              min={1}
              max={20}
              unit="個"
              onChange={(value) => updateOption("count", value)}
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {(Object.keys(CHARSETS) as CharacterOption[]).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">{CHARSETS[key].label}</span>
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(event) => updateOption(key, event.target.checked)}
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span>
                <span className="font-medium text-slate-700">紛らわしい文字を除外</span>
                <span className="ml-2 text-slate-400">0/O, 1/l/I</span>
              </span>
              <input
                type="checkbox"
                checked={options.excludeAmbiguous}
                onChange={(event) => updateOption("excludeAmbiguous", event.target.checked)}
                className="h-5 w-5 rounded border-slate-300"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="font-medium text-slate-700">選択した文字種を最低1文字ずつ含める</span>
              <input
                type="checkbox"
                checked={options.requireEachSelected}
                onChange={(event) => updateOption("requireEachSelected", event.target.checked)}
                className="h-5 w-5 rounded border-slate-300"
              />
            </label>
          </div>

          <p className={`mt-3 min-h-5 text-sm ${error ? "text-red-600" : "text-slate-500"}`}>
            {error || `文字プール ${poolSize} 種類。生成結果は外部に送信されません。`}
          </p>

          <button
            type="button"
            onClick={generate}
            disabled={Boolean(error)}
            className="mt-4 w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            パスワードを再生成
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className={`rounded-2xl border p-5 ${strength.tone}`}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold opacity-80">強度</p>
                <p className="mt-1 text-3xl font-bold">{strength.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold opacity-80">推定エントロピー</p>
                <p className="mt-1 font-mono text-2xl font-bold">{entropy} bits</p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/70">
              <div className={`h-full rounded-full ${strength.bar}`} style={{ width: strength.width }} />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {passwords.map((password, index) => (
              <div key={`${password}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start gap-3">
                  <code className="min-w-0 flex-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-950 ring-1 ring-slate-200">
                    {password}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText(password, `password-${index}`)}
                    className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {copied === `password-${index}` ? "コピー済み" : "コピー"}
                  </button>
                </div>
              </div>
            ))}
            {!passwords.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
                条件を確認すると生成結果が表示されます。
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText(passwords.join("\n"), "all")}
              disabled={!passwords.length}
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied === "all" ? "全件コピー済み" : "全件コピー"}
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={!passwords.length}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              TXT保存
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function NumberInput({
  id,
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-slate-900">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value.replace(/[^0-9]/g, ""), 10);
            onChange(Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min);
          }}
          className="min-w-0 flex-1 px-4 py-3 text-right font-mono text-lg outline-none"
        />
        <span className="flex min-w-14 items-center justify-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
          {unit}
        </span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
