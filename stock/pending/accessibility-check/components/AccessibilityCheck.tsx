"use client";
import { useState, useMemo } from "react";

interface A11yIssue {
  id: string;
  severity: "error" | "warning" | "info";
  wcag: string;
  element: string;
  message: string;
  fix: string;
  count: number;
}

const SAMPLE_HTML = `<html>
<head><title>Example Page</title></head>
<body>
  <img src="hero.jpg">
  <img src="logo.png" alt="">
  <a href="#">Click here</a>
  <a href="/about"></a>
  <input type="text" placeholder="Enter name">
  <input type="email" id="email">
  <button></button>
  <button onclick="submit()">Submit</button>
  <h1>Main Title</h1>
  <h3>Skipped heading level</h3>
  <div onclick="openModal()">Open Modal</div>
  <table>
    <tr><td>Name</td><td>Value</td></tr>
    <tr><td>Alice</td><td>100</td></tr>
  </table>
  <form>
    <label>Email</label>
    <input type="text" name="email2">
  </form>
  <video src="intro.mp4"></video>
  <marquee>Important notice!</marquee>
  <blink>Alert!</blink>
  <iframe src="widget.html"></iframe>
</body>
</html>`;

interface ParsedCheck {
  pattern: RegExp;
  check: (html: string) => A11yIssue | null;
}

function runChecks(html: string): A11yIssue[] {
  const issues: A11yIssue[] = [];

  // 1. Images without alt
  const imgNoAlt = [...html.matchAll(/<img(?![^>]*\balt\s*=)[^>]*>/gi)];
  if (imgNoAlt.length > 0) {
    issues.push({
      id: "img-alt-missing",
      severity: "error",
      wcag: "1.1.1 (Level A)",
      element: "<img>",
      message: `${imgNoAlt.length} image(s) missing alt attribute`,
      fix: 'Add alt="" for decorative images or alt="description" for informative images.',
      count: imgNoAlt.length,
    });
  }

  // 2. Images with empty alt (decorative — info)
  const imgEmptyAlt = [...html.matchAll(/<img[^>]*\balt\s*=\s*["']\s*["'][^>]*>/gi)];
  if (imgEmptyAlt.length > 0) {
    issues.push({
      id: "img-alt-empty",
      severity: "info",
      wcag: "1.1.1 (Level A)",
      element: "<img>",
      message: `${imgEmptyAlt.length} image(s) have empty alt (treated as decorative)`,
      fix: "Verify these images are truly decorative. If they convey meaning, add descriptive alt text.",
      count: imgEmptyAlt.length,
    });
  }

  // 3. Links with no text
  const emptyLinks = [...html.matchAll(/<a[^>]*>\s*<\/a>/gi)];
  if (emptyLinks.length > 0) {
    issues.push({
      id: "link-empty",
      severity: "error",
      wcag: "2.4.4 (Level A)",
      element: "<a>",
      message: `${emptyLinks.length} link(s) have no accessible text`,
      fix: "Add descriptive text, aria-label, or aria-labelledby to all links.",
      count: emptyLinks.length,
    });
  }

  // 4. Generic link text
  const genericLinks = [...html.matchAll(/<a[^>]*>\s*(click here|click|here|read more|more|link)\s*<\/a>/gi)];
  if (genericLinks.length > 0) {
    issues.push({
      id: "link-generic",
      severity: "warning",
      wcag: "2.4.6 (Level AA)",
      element: "<a>",
      message: `${genericLinks.length} link(s) use generic text ("click here", "here", etc.)`,
      fix: 'Use descriptive link text that makes sense out of context, e.g. "Read our accessibility guide".',
      count: genericLinks.length,
    });
  }

  // 5. Inputs without labels
  const inputIds = [...html.matchAll(/<input[^>]+\bid\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const labelFors = [...html.matchAll(/<label[^>]+\bfor\s*=\s*["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const unlabeledInputs = inputIds.filter((id) => !labelFors.includes(id));
  if (unlabeledInputs.length > 0) {
    issues.push({
      id: "input-label-missing",
      severity: "error",
      wcag: "1.3.1 (Level A)",
      element: "<input>",
      message: `${unlabeledInputs.length} input(s) not associated with a <label>`,
      fix: `Use <label for="inputId"> or wrap input in <label>. Affected IDs: ${unlabeledInputs.join(", ")}`,
      count: unlabeledInputs.length,
    });
  }

  // 6. Inputs with only placeholder
  const placeholderOnly = [...html.matchAll(/<input[^>]+\bplaceholder\b[^>]*>/gi)].filter((m) => {
    const tag = m[0];
    const id = (tag.match(/\bid\s*=\s*["']([^"']+)["']/) || [])[1];
    return !id || !labelFors.includes(id);
  });
  if (placeholderOnly.length > 0) {
    issues.push({
      id: "input-placeholder-only",
      severity: "warning",
      wcag: "1.3.1 (Level A)",
      element: "<input>",
      message: `${placeholderOnly.length} input(s) rely on placeholder as the only label`,
      fix: "Placeholders disappear on input. Add a persistent <label> element.",
      count: placeholderOnly.length,
    });
  }

  // 7. Empty buttons
  const emptyBtns = [...html.matchAll(/<button[^>]*>\s*<\/button>/gi)];
  if (emptyBtns.length > 0) {
    issues.push({
      id: "button-empty",
      severity: "error",
      wcag: "4.1.2 (Level A)",
      element: "<button>",
      message: `${emptyBtns.length} button(s) have no accessible text`,
      fix: "Add text content, aria-label, or title to all buttons.",
      count: emptyBtns.length,
    });
  }

  // 8. Skipped heading levels
  const headings = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map((m) => parseInt(m[1]));
  let prevH = 0;
  let skipped = 0;
  for (const h of headings) {
    if (prevH > 0 && h > prevH + 1) skipped++;
    prevH = h;
  }
  if (skipped > 0) {
    issues.push({
      id: "heading-skip",
      severity: "warning",
      wcag: "1.3.1 (Level A)",
      element: "<h1>-<h6>",
      message: `Heading level(s) skipped ${skipped} time(s) (e.g. h1 → h3)`,
      fix: "Use heading levels sequentially. Don't skip from h1 to h3 — use h2 in between.",
      count: skipped,
    });
  }

  // 9. Multiple h1
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
  if (h1Count > 1) {
    issues.push({
      id: "multiple-h1",
      severity: "warning",
      wcag: "2.4.6 (Level AA)",
      element: "<h1>",
      message: `${h1Count} <h1> elements found (should be 1 per page)`,
      fix: "Use only one <h1> per page as the main heading. Use <h2>–<h6> for subheadings.",
      count: h1Count,
    });
  }

  // 10. Clickable divs/spans without role
  const clickableDiv = [...html.matchAll(/<(?:div|span)[^>]+onclick\s*=[^>]*>/gi)].filter(
    (m) => !/role\s*=/i.test(m[0]) && !/tabindex\s*=/i.test(m[0])
  );
  if (clickableDiv.length > 0) {
    issues.push({
      id: "div-click-no-role",
      severity: "error",
      wcag: "4.1.2 (Level A)",
      element: "<div onclick>",
      message: `${clickableDiv.length} clickable div/span element(s) missing role and tabindex`,
      fix: 'Use <button> instead, or add role="button" tabindex="0" and keyboard event handlers.',
      count: clickableDiv.length,
    });
  }

  // 11. Table without headers
  const tables = [...html.matchAll(/<table[^>]*>[\s\S]*?<\/table>/gi)];
  const tablesWithoutTh = tables.filter((m) => !/<th/i.test(m[0]));
  if (tablesWithoutTh.length > 0) {
    issues.push({
      id: "table-no-th",
      severity: "error",
      wcag: "1.3.1 (Level A)",
      element: "<table>",
      message: `${tablesWithoutTh.length} data table(s) have no <th> header cells`,
      fix: "Add <th scope=\"col\"> for column headers and <th scope=\"row\"> for row headers.",
      count: tablesWithoutTh.length,
    });
  }

  // 12. Video without captions/track
  const videos = [...html.matchAll(/<video[^>]*>/gi)];
  const videosNoTrack = videos.filter((m) => !/<track/i.test(m[0]));
  if (videosNoTrack.length > 0 || (videos.length > 0 && !html.includes("<track"))) {
    const cnt = videos.length;
    if (cnt > 0) {
      issues.push({
        id: "video-no-captions",
        severity: "error",
        wcag: "1.2.2 (Level A)",
        element: "<video>",
        message: `${cnt} video(s) may lack captions (<track> element not found)`,
        fix: 'Add <track kind="captions" src="captions.vtt" srclang="en" label="English"> inside <video>.',
        count: cnt,
      });
    }
  }

  // 13. iframe without title
  const iframes = [...html.matchAll(/<iframe(?![^>]*\btitle\s*=)[^>]*>/gi)];
  if (iframes.length > 0) {
    issues.push({
      id: "iframe-no-title",
      severity: "error",
      wcag: "4.1.2 (Level A)",
      element: "<iframe>",
      message: `${iframes.length} iframe(s) missing title attribute`,
      fix: 'Add a descriptive title attribute: <iframe title="Payment widget" ...>',
      count: iframes.length,
    });
  }

  // 14. Deprecated elements
  const deprecated = { marquee: 0, blink: 0, font: 0, center: 0, "big/small": 0 };
  if (/<marquee/gi.test(html)) deprecated["marquee"] = (html.match(/<marquee/gi) || []).length;
  if (/<blink/gi.test(html)) deprecated["blink"] = (html.match(/<blink/gi) || []).length;
  if (/<font\s/gi.test(html)) deprecated["font"] = (html.match(/<font\s/gi) || []).length;
  const deprecatedCount = Object.values(deprecated).reduce((a, b) => a + b, 0);
  if (deprecatedCount > 0) {
    const found = Object.entries(deprecated).filter(([, v]) => v > 0).map(([k, v]) => `${k}(${v})`).join(", ");
    issues.push({
      id: "deprecated-elements",
      severity: "warning",
      wcag: "4.1.1 (Level A)",
      element: "deprecated",
      message: `Deprecated HTML elements found: ${found}`,
      fix: "Remove <marquee>, <blink>, <font>, <center>. Use CSS for visual effects instead.",
      count: deprecatedCount,
    });
  }

  return issues;
}

const severityConfig = {
  error: { label: "Error", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700", icon: "✕" },
  warning: { label: "Warning", bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", icon: "!" },
  info: { label: "Info", bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "i" },
};

export default function AccessibilityCheck() {
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [checked, setChecked] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<"all" | "error" | "warning" | "info">("all");

  const issues = useMemo(() => (checked ? runChecks(html) : []), [html, checked]);

  const filtered = filterSeverity === "all" ? issues : issues.filter((i) => i.severity === filterSeverity);

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const infoCount = issues.filter((i) => i.severity === "info").length;

  const score = Math.max(0, 100 - errorCount * 15 - warningCount * 5 - infoCount * 2);
  const scoreColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="space-y-6">
      {/* HTML Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Paste HTML to Analyze</h2>
        <textarea
          value={html}
          onChange={(e) => { setHtml(e.target.value); setChecked(false); }}
          rows={12}
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          placeholder="Paste your HTML here..."
          spellCheck={false}
        />
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setChecked(true)}
            className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Check Accessibility
          </button>
          <button
            onClick={() => { setHtml(SAMPLE_HTML); setChecked(false); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Load sample HTML
          </button>
          <span className="text-xs text-gray-400">{html.length} characters</span>
        </div>
      </div>

      {/* Results */}
      {checked && (
        <>
          {/* Score */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Accessibility Score</h2>
                <p className="text-sm text-gray-500 mt-1">{issues.length} issues found across {errorCount + warningCount + infoCount} checks</p>
              </div>
              <div className={`text-5xl font-bold ${scoreColor}`}>{score}</div>
            </div>

            <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${score}%` }}
              />
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {[
                { label: `${errorCount} Errors`, severity: "error" as const, active: filterSeverity === "error" },
                { label: `${warningCount} Warnings`, severity: "warning" as const, active: filterSeverity === "warning" },
                { label: `${infoCount} Info`, severity: "info" as const, active: filterSeverity === "info" },
              ].map(({ label, severity, active }) => (
                <button
                  key={severity}
                  onClick={() => setFilterSeverity(active ? "all" : severity)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    active ? severityConfig[severity].badge + " ring-2 ring-offset-1" : severityConfig[severity].badge
                  }`}
                >
                  {label}
                </button>
              ))}
              {filterSeverity !== "all" && (
                <button onClick={() => setFilterSeverity("all")} className="text-sm text-gray-400 hover:text-gray-600">
                  Show all
                </button>
              )}
            </div>
          </div>

          {/* Issue list */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((issue) => {
                const cfg = severityConfig[issue.severity];
                return (
                  <div key={issue.id} className={`border rounded-xl p-5 ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${cfg.badge}`}>
                        {cfg.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <code className="text-xs bg-white/70 px-2 py-0.5 rounded font-mono text-gray-700">
                            {issue.element}
                          </code>
                          <span className="text-xs text-gray-500">WCAG {issue.wcag}</span>
                          {issue.count > 1 && (
                            <span className="text-xs text-gray-500">×{issue.count}</span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-2">{issue.message}</p>
                        <p className="text-sm text-gray-600">
                          <strong className="font-medium">Fix: </strong>{issue.fix}
                        </p>
                      </div>
                    </div>
                  
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Accessibility Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Paste HTML code to detect accessibility issues without a URL. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Accessibility Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Paste HTML code to detect accessibility issues without a URL. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-700 font-semibold text-lg">No {filterSeverity === "all" ? "" : filterSeverity + " "}issues found!</p>
              <p className="text-green-600 text-sm mt-1">
                {filterSeverity === "all" ? "Your HTML passed all automated checks." : "Try showing all issue types."}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="text-xs text-gray-400 text-center">
            Automated checks cover common WCAG 2.1 issues but cannot replace manual testing. Always test with real screen readers (NVDA, VoiceOver).
          </div>
        </>
      )}
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Accessibility Checker",
  "description": "Paste HTML code to detect accessibility issues without a URL",
  "url": "https://tools.loresync.dev/accessibility-check",
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
