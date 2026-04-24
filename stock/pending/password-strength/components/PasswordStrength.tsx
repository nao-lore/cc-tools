"use client";

import { useState, useCallback } from "react";

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  bgColor: string;
  crackTime: string;
  suggestions: string[];
}

const COMMON_PATTERNS = [
  "123", "234", "345", "456", "567", "678", "789", "890",
  "abc", "bcd", "cde", "def", "efg", "fgh", "ghi", "hij",
  "ijk", "jkl", "klm", "lmn", "mno", "nop", "opq", "pqr",
  "qrs", "rst", "stu", "tuv", "uvw", "vwx", "wxy", "xyz",
  "qwerty", "asdf", "zxcv", "qazwsx", "1234", "12345", "123456",
  "password", "pass", "admin", "login", "letmein", "welcome",
  "monkey", "dragon", "master", "hello", "shadow", "sunshine",
];

function hasSequential(password: string): boolean {
  const lower = password.toLowerCase();
  for (let i = 0; i < lower.length - 2; i++) {
    const a = lower.charCodeAt(i);
    const b = lower.charCodeAt(i + 1);
    const c = lower.charCodeAt(i + 2);
    if (b === a + 1 && c === a + 2) return true;
    if (b === a - 1 && c === a - 2) return true;
  }
  return false;
}

function hasRepeated(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

function hasCommonPattern(password: string): boolean {
  const lower = password.toLowerCase();
  return COMMON_PATTERNS.some((p) => lower.includes(p));
}

function estimateCrackTime(score: number, length: number): string {
  // Rough brute-force estimates at 10B guesses/sec
  if (score < 20) return "instantly";
  if (score < 35) return "a few seconds";
  if (score < 50) return "a few minutes";
  if (score < 65) {
    if (length < 10) return "a few hours";
    return "a few days";
  }
  if (score < 80) {
    if (length < 12) return "a few months";
    return "a few years";
  }
  if (length >= 16) return "centuries";
  return "decades";
}

function analyzePassword(password: string): StrengthResult {
  if (!password) {
    return {
      score: 0,
      label: "—",
      color: "text-gray-400",
      bgColor: "bg-gray-300",
      crackTime: "—",
      suggestions: [],
    };
  }

  let score = 0;
  const suggestions: string[] = [];

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const len = password.length;

  // Length scoring
  if (len >= 8) score += 10;
  if (len >= 12) score += 10;
  if (len >= 16) score += 10;
  if (len >= 20) score += 10;

  // Character variety
  if (hasUpper) score += 10;
  if (hasLower) score += 10;
  if (hasNumber) score += 10;
  if (hasSymbol) score += 15;

  // Both upper and lower
  if (hasUpper && hasLower) score += 5;

  // Penalties
  const sequential = hasSequential(password);
  const repeated = hasRepeated(password);
  const commonPat = hasCommonPattern(password);

  if (sequential) score -= 10;
  if (repeated) score -= 10;
  if (commonPat) score -= 15;

  score = Math.max(0, Math.min(100, score));

  // Suggestions
  if (len < 8) suggestions.push("Use at least 8 characters");
  else if (len < 12) suggestions.push("Use at least 12 characters for better security");
  else if (len < 16) suggestions.push("Consider using 16+ characters for strong security");

  if (!hasUpper) suggestions.push("Add uppercase letters (A-Z)");
  if (!hasLower) suggestions.push("Add lowercase letters (a-z)");
  if (!hasNumber) suggestions.push("Add numbers (0-9)");
  if (!hasSymbol) suggestions.push("Add symbols (!@#$%^&*...)");
  if (commonPat) suggestions.push("Avoid common patterns like '123', 'abc', or 'qwerty'");
  if (sequential) suggestions.push("Avoid sequential characters (e.g., abcd, 1234)");
  if (repeated) suggestions.push("Avoid repeated characters (e.g., aaa, 111)");

  // Label and color
  let label: string;
  let color: string;
  let bgColor: string;

  if (score < 20) {
    label = "Very Weak";
    color = "text-red-500";
    bgColor = "bg-red-500";
  } else if (score < 40) {
    label = "Weak";
    color = "text-orange-500";
    bgColor = "bg-orange-500";
  } else if (score < 60) {
    label = "Fair";
    color = "text-yellow-500";
    bgColor = "bg-yellow-500";
  } else if (score < 80) {
    label = "Strong";
    color = "text-blue-500";
    bgColor = "bg-blue-500";
  } else {
    label = "Very Strong";
    color = "text-green-500";
    bgColor = "bg-green-500";
  }

  return {
    score,
    label,
    color,
    bgColor,
    crackTime: estimateCrackTime(score, len),
    suggestions,
  };
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function CheckItem({ passed, label }: { passed: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm ${passed ? "opacity-100" : "opacity-40"}`}>
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${passed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}>
        {passed ? "✓" : "×"}
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const result = analyzePassword(password);

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const isLong = password.length >= 12;
  const noCommon = password.length > 0 && !hasCommonPattern(password);
  const noSequential = password.length > 0 && !hasSequential(password);
  const noRepeated = password.length > 0 && !hasRepeated(password);

  const barWidth = password ? `${result.score}%` : "0%";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Input card */}
      <div
        className="rounded-xl p-6 shadow-sm border"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <label className="block font-medium text-sm mb-2">Enter your password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type or paste your password..."
            className="w-full rounded-lg px-4 py-3 pr-12 font-mono text-sm border outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        {/* Security notice */}
        <div className="flex items-center gap-1.5 mt-2 text-xs opacity-50">
          <ShieldIcon />
          <span>All analysis happens in your browser — no data is sent anywhere</span>
        </div>
      </div>

      {/* Strength meter card */}
      <div
        className="rounded-xl p-6 shadow-sm border"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-sm">Strength Score</span>
          <div className="flex items-center gap-3">
            <span className={`font-bold text-sm ${result.color}`}>{result.label}</span>
            {password && (
              <span className="font-mono text-sm font-bold opacity-70">{result.score}/100</span>
            )}
          </div>
        </div>

        {/* Bar */}
        <div
          className="h-3 rounded-full overflow-hidden mb-4"
          style={{ backgroundColor: "var(--border)" }}
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${result.bgColor}`}
            style={{ width: barWidth }}
          />
        </div>

        {/* Stats row */}
        {password && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="text-lg font-bold font-mono">{password.length}</div>
              <div className="text-xs opacity-50 mt-0.5">Length</div>
            </div>
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className={`text-lg font-bold ${result.color}`}>{result.label}</div>
              <div className="text-xs opacity-50 mt-0.5">Rating</div>
            </div>
            <div
              className="rounded-lg p-3"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="text-sm font-bold leading-tight">{result.crackTime}</div>
              <div className="text-xs opacity-50 mt-0.5">To crack</div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist */}
      {password && (
        <div
          className="rounded-xl p-6 shadow-sm border"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-medium text-sm mb-3">Security Checks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <CheckItem passed={password.length >= 8} label="At least 8 characters" />
            <CheckItem passed={isLong} label="12+ characters (recommended)" />
            <CheckItem passed={hasUpper} label="Uppercase letters (A-Z)" />
            <CheckItem passed={hasLower} label="Lowercase letters (a-z)" />
            <CheckItem passed={hasNumber} label="Numbers (0-9)" />
            <CheckItem passed={hasSymbol} label="Symbols (!@#$%...)" />
            <CheckItem passed={noCommon} label="No common patterns" />
            <CheckItem passed={noSequential} label="No sequential chars" />
            <CheckItem passed={noRepeated} label="No repeated chars (aaa)" />
          </div>
        </div>
      )}

      {/* Suggestions */}
      {password && result.suggestions.length > 0 && (
        <div
          className="rounded-xl p-6 shadow-sm border"
          style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
        >
          <h2 className="font-medium text-sm mb-3">Improvement Suggestions</h2>
          <ul className="space-y-2">
            {result.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-orange-500 mt-0.5 flex-shrink-0">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* All clear state */}
      {password && result.suggestions.length === 0 && (
        <div
          className="rounded-xl p-6 shadow-sm border border-green-200 text-center"
          style={{ backgroundColor: "var(--card)" }}
        >
          <div className="text-green-500 font-bold text-sm">Your password passes all checks!</div>
          <div className="text-xs opacity-50 mt-1">Consider using a password manager to store it safely.</div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Password Strength Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Check password strength and get improvement suggestions. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Password Strength Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Check password strength and get improvement suggestions. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Password Strength Checker",
  "description": "Check password strength and get improvement suggestions",
  "url": "https://tools.loresync.dev/password-strength",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
