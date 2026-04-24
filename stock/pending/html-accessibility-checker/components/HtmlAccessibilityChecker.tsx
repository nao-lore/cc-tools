"use client";

import { useState, useCallback } from "react";

type Severity = "error" | "warning";

interface Issue {
  id: string;
  severity: Severity;
  message: string;
  snippet: string;
  fix: string;
}

function getSnippet(el: Element): string {
  const outer = el.outerHTML;
  const firstLine = outer.split("\n")[0];
  return firstLine.length > 80 ? firstLine.slice(0, 77) + "..." : firstLine;
}

function checkAccessibility(html: string): Issue[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const issues: Issue[] = [];
  let idCounter = 0;
  const nextId = () => String(++idCounter);

  // 1. Missing html lang
  const htmlEl = doc.querySelector("html");
  if (htmlEl && !htmlEl.getAttribute("lang")) {
    issues.push({
      id: nextId(),
      severity: "error",
      message: "<html> element is missing a lang attribute",
      snippet: "<html>",
      fix: 'Add lang attribute: <html lang="en">',
    });
  }

  // 2. img without alt
  doc.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("alt")) {
      issues.push({
        id: nextId(),
        severity: "error",
        message: "<img> is missing an alt attribute",
        snippet: getSnippet(img),
        fix: 'Add alt="" for decorative images or a descriptive alt text for informative images.',
      });
    }
  });

  // 3. input without associated label
  doc.querySelectorAll("input, select, textarea").forEach((input) => {
    const type = input.getAttribute("type")?.toLowerCase();
    if (type === "hidden" || type === "submit" || type === "reset" || type === "button") return;

    const id = input.getAttribute("id");
    const ariaLabel = input.getAttribute("aria-label");
    const ariaLabelledby = input.getAttribute("aria-labelledby");

    if (ariaLabel || ariaLabelledby) return;

    if (id) {
      const label = doc.querySelector(`label[for="${id}"]`);
      if (!label) {
        issues.push({
          id: nextId(),
          severity: "error",
          message: `<${input.tagName.toLowerCase()}> has an id but no associated <label for="${id}">`,
          snippet: getSnippet(input),
          fix: `Add <label for="${id}">Description</label> before the input, or use aria-label attribute.`,
        });
      }
    } else {
      // Check if wrapped in a label
      const isWrapped = input.closest("label") !== null;
      if (!isWrapped) {
        issues.push({
          id: nextId(),
          severity: "error",
          message: `<${input.tagName.toLowerCase()}> has no associated label`,
          snippet: getSnippet(input),
          fix: "Add an id and a matching <label for> element, wrap it in a <label>, or add aria-label.",
        });
      }
    }
  });

  // 4. Empty button text
  doc.querySelectorAll("button").forEach((btn) => {
    const text = btn.textContent?.trim() ?? "";
    const ariaLabel = btn.getAttribute("aria-label");
    const ariaLabelledby = btn.getAttribute("aria-labelledby");
    const hasAriaHidden = btn.querySelector("[aria-hidden]");
    const title = btn.getAttribute("title");

    if (!text && !ariaLabel && !ariaLabelledby && !title) {
      // Check if has accessible image (img with alt, or svg with title)
      const imgWithAlt = btn.querySelector("img[alt]");
      const svgTitle = btn.querySelector("svg title");
      if (!imgWithAlt && !svgTitle) {
        issues.push({
          id: nextId(),
          severity: "error",
          message: "<button> has no accessible text",
          snippet: getSnippet(btn),
          fix: "Add visible text inside the button, or use aria-label for icon buttons.",
        });
      }
    }
  });

  // 5. Empty anchor text
  doc.querySelectorAll("a").forEach((a) => {
    const text = a.textContent?.trim() ?? "";
    const ariaLabel = a.getAttribute("aria-label");
    const ariaLabelledby = a.getAttribute("aria-labelledby");
    const title = a.getAttribute("title");
    const imgWithAlt = a.querySelector("img[alt]");
    const svgTitle = a.querySelector("svg title");

    if (!text && !ariaLabel && !ariaLabelledby && !title && !imgWithAlt && !svgTitle) {
      issues.push({
        id: nextId(),
        severity: "error",
        message: "<a> link has no accessible text",
        snippet: getSnippet(a),
        fix: "Add descriptive link text, or use aria-label to describe the link destination.",
      });
    }
  });

  // 6. Heading level skips (e.g. h1 -> h3)
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  for (let i = 1; i < headings.length; i++) {
    const prev = parseInt(headings[i - 1].tagName[1], 10);
    const curr = parseInt(headings[i].tagName[1], 10);
    if (curr > prev + 1) {
      issues.push({
        id: nextId(),
        severity: "warning",
        message: `Heading level skipped: <h${prev}> followed by <h${curr}>`,
        snippet: getSnippet(headings[i]),
        fix: `Use <h${prev + 1}> instead of <h${curr}> to maintain a logical heading order.`,
      });
    }
  }

  // 7. Missing form labels (form elements without fieldset/legend for groups)
  doc.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((input) => {
    const fieldset = input.closest("fieldset");
    if (!fieldset) {
      const name = input.getAttribute("name") ?? "";
      // Only warn once per name group
      const siblings = doc.querySelectorAll(`input[type="${input.getAttribute("type")}"][name="${name}"]`);
      if (siblings.length > 1) {
        const alreadyFlagged = issues.some(
          (iss) => iss.message.includes(`name="${name}"`) && iss.message.includes("fieldset")
        );
        if (!alreadyFlagged) {
          issues.push({
            id: nextId(),
            severity: "warning",
            message: `Group of <${input.tagName.toLowerCase()}> elements with name="${name}" are not wrapped in a <fieldset>`,
            snippet: getSnippet(input),
            fix: "Wrap related radio/checkbox groups in <fieldset><legend>Group Label</legend>…</fieldset>.",
          });
        }
      }
    }
  });

  return issues;
}

export default function HtmlAccessibilityChecker() {
  const [html, setHtml] = useState("");
  const [issues, setIssues] = useState<Issue[] | null>(null);

  const handleCheck = useCallback(() => {
    if (!html.trim()) return;
    setIssues(checkAccessibility(html));
  }, [html]);

  const handleClear = useCallback(() => {
    setHtml("");
    setIssues(null);
  }, []);

  const errors = issues?.filter((i) => i.severity === "error") ?? [];
  const warnings = issues?.filter((i) => i.severity === "warning") ?? [];
  const passed = issues !== null && issues.length === 0;

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Paste HTML to check
        </label>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder={'<html lang="en">\n  <body>\n    <img src="photo.jpg" alt="A cat sitting on a chair">\n    ...\n  </body>\n</html>'}
          spellCheck={false}
          className="w-full h-64 p-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleCheck}
          disabled={!html.trim()}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Check Accessibility
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      {issues !== null && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap gap-3">
            {passed ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm font-medium">
                <span className="text-green-600">&#10003;</span> No issues found — looking good!
              </div>
            ) : (
              <>
                {errors.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    {errors.length} error{errors.length !== 1 ? "s" : ""}
                  </div>
                )}
                {warnings.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm font-medium">
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                    {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Issue list */}
          {issues.length > 0 && (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`rounded-lg border p-4 space-y-2 ${
                    issue.severity === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 shrink-0 text-xs font-semibold uppercase px-1.5 py-0.5 rounded ${
                        issue.severity === "error"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                  </div>

                  {/* Snippet */}
                  <div className="text-xs font-mono bg-white border border-gray-200 rounded px-2 py-1.5 text-gray-700 overflow-x-auto whitespace-pre">
                    {issue.snippet}
                  </div>

                  {/* Fix */}
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Fix: </span>
                    {issue.fix}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ad placeholder */}
      <div className="mt-6 flex items-center justify-center h-24 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-xs text-gray-400 select-none">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this HTML Accessibility Quick Checker tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Check pasted HTML for basic accessibility issues. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this HTML Accessibility Quick Checker tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Check pasted HTML for basic accessibility issues. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HTML Accessibility Quick Checker",
  "description": "Check pasted HTML for basic accessibility issues",
  "url": "https://tools.loresync.dev/html-accessibility-checker",
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
