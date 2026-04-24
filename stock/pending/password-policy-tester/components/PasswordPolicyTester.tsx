"use client";

import { useState, useMemo } from "react";

// --- Types ---

interface Policy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  noRepeatedChars: boolean;
  noCommonWords: boolean;
}

interface RuleResult {
  id: string;
  label: string;
  passed: boolean;
}

// --- Common words list (top passwords / dictionary words) ---

const COMMON_WORDS = [
  "password", "passw0rd", "123456", "qwerty", "abc123", "letmein",
  "monkey", "dragon", "master", "shadow", "sunshine", "princess",
  "welcome", "admin", "login", "iloveyou", "superman", "batman",
  "football", "baseball", "starwars", "michael", "jessica", "charlie",
];

// --- Helpers ---

function hasRepeatedChars(password: string, maxRepeat: number = 2): boolean {
  let count = 1;
  for (let i = 1; i < password.length; i++) {
    if (password[i] === password[i - 1]) {
      count++;
      if (count > maxRepeat) return true;
    } else {
      count = 1;
    }
  }
  return false;
}

function containsCommonWord(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_WORDS.some((word) => lower.includes(word));
}

function evaluatePolicy(password: string, policy: Policy): RuleResult[] {
  const rules: RuleResult[] = [];

  rules.push({
    id: "minLength",
    label: `Minimum ${policy.minLength} characters`,
    passed: password.length >= policy.minLength,
  });

  rules.push({
    id: "maxLength",
    label: `Maximum ${policy.maxLength} characters`,
    passed: password.length <= policy.maxLength,
  });

  if (policy.requireUppercase) {
    rules.push({
      id: "uppercase",
      label: "Contains uppercase letter (A–Z)",
      passed: /[A-Z]/.test(password),
    });
  }

  if (policy.requireLowercase) {
    rules.push({
      id: "lowercase",
      label: "Contains lowercase letter (a–z)",
      passed: /[a-z]/.test(password),
    });
  }

  if (policy.requireNumber) {
    rules.push({
      id: "number",
      label: "Contains number (0–9)",
      passed: /[0-9]/.test(password),
    });
  }

  if (policy.requireSymbol) {
    rules.push({
      id: "symbol",
      label: "Contains symbol (!@#$%^&*…)",
      passed: /[^A-Za-z0-9]/.test(password),
    });
  }

  if (policy.noRepeatedChars) {
    rules.push({
      id: "noRepeated",
      label: "No repeated characters (3+ in a row)",
      passed: !hasRepeatedChars(password, 2),
    });
  }

  if (policy.noCommonWords) {
    rules.push({
      id: "noCommonWords",
      label: "Does not contain common words",
      passed: !containsCommonWord(password),
    });
  }

  return rules;
}

// --- Sub-components ---

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, onChange }: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted">{label}</label>
        <span className="text-xs font-mono font-semibold text-foreground w-8 text-right">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full accent-accent h-1.5 rounded-full cursor-pointer"
      />
      <div className="flex justify-between text-xs text-muted/60">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none group">
      <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
          checked ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

interface RuleItemProps {
  rule: RuleResult;
}

function RuleItem({ rule }: RuleItemProps) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      rule.passed ? "bg-emerald-500/10" : "bg-red-500/10"
    }`}>
      {rule.passed ? (
        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-sm ${rule.passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
        {rule.label}
      </span>
    </div>
  );
}

// --- Main component ---

const DEFAULT_POLICY: Policy = {
  minLength: 8,
  maxLength: 64,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: false,
  noRepeatedChars: false,
  noCommonWords: true,
};

export default function PasswordPolicyTester() {
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const set = <K extends keyof Policy>(key: K, value: Policy[K]) =>
    setPolicy((p) => ({ ...p, [key]: value }));

  const rules = useMemo(() => {
    if (password.length === 0) return [];
    return evaluatePolicy(password, policy);
  }, [password, policy]);

  const passed = rules.filter((r) => r.passed).length;
  const total = rules.length;
  const scorePercent = total > 0 ? Math.round((passed / total) * 100) : 0;

  const scoreColor =
    scorePercent === 100
      ? "text-emerald-500"
      : scorePercent >= 70
      ? "text-amber-500"
      : "text-red-500";

  const barColor =
    scorePercent === 100
      ? "bg-emerald-500"
      : scorePercent >= 70
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Config Panel */}
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-sm font-semibold text-foreground">Policy Configuration</h2>

          {/* Sliders */}
          <div className="space-y-5">
            <SliderRow
              label="Minimum Length"
              value={policy.minLength}
              min={4}
              max={32}
              onChange={(v) => set("minLength", Math.min(v, policy.maxLength))}
            />
            <SliderRow
              label="Maximum Length"
              value={policy.maxLength}
              min={8}
              max={128}
              onChange={(v) => set("maxLength", Math.max(v, policy.minLength))}
            />
          </div>

          <div className="border-t border-border" />

          {/* Toggles */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Required Characters</p>
            <ToggleRow label="Require uppercase (A–Z)" checked={policy.requireUppercase} onChange={(v) => set("requireUppercase", v)} />
            <ToggleRow label="Require lowercase (a–z)" checked={policy.requireLowercase} onChange={(v) => set("requireLowercase", v)} />
            <ToggleRow label="Require number (0–9)" checked={policy.requireNumber} onChange={(v) => set("requireNumber", v)} />
            <ToggleRow label="Require symbol (!@#$…)" checked={policy.requireSymbol} onChange={(v) => set("requireSymbol", v)} />
          </div>

          <div className="border-t border-border" />

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Pattern Rules</p>
            <ToggleRow label="No repeated chars (3+ in a row)" checked={policy.noRepeatedChars} onChange={(v) => set("noRepeatedChars", v)} />
            <ToggleRow label="No common words / patterns" checked={policy.noCommonWords} onChange={(v) => set("noCommonWords", v)} />
          </div>
        </div>

        {/* Password Input + Results */}
        <div className="space-y-4">
          {/* Password input */}
          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Test Password</h2>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password to test…"
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow placeholder:text-muted/50"
                autoComplete="new-password"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <p className="mt-2 text-xs text-muted">{password.length} characters</p>
            )}
          </div>

          {/* Compliance score */}
          {password.length > 0 && total > 0 && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Compliance Score</h3>
                <span className={`text-2xl font-bold font-mono ${scoreColor}`}>
                  {passed}/{total}
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted text-right">{scorePercent}% rules passed</p>
            </div>
          )}

          {/* Per-rule results */}
          {password.length > 0 && rules.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Rule Results</h3>
              <div className="space-y-2">
                {rules.map((rule) => (
                  <RuleItem key={rule.id} rule={rule} />
                ))}
              </div>
            </div>
          )}

          {password.length === 0 && (
            <div className="bg-surface rounded-2xl border border-border p-6 flex items-center justify-center min-h-32">
              <p className="text-muted text-sm text-center">
                Enter a password above to see rule results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="w-full h-24 rounded-xl border border-dashed border-border flex items-center justify-center text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Password Policy Tester tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Test a password against configurable policy rules. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Password Policy Tester tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Test a password against configurable policy rules. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
  );
}
