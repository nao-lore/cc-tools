"use client";

import { useState, useCallback, useMemo } from "react";
import { LICENSE_TEMPLATES, fillTemplate, type LicenseTemplate } from "../lib/license-templates";

const PERMISSION_COLOR = "text-green-700 bg-green-50";
const CONDITION_COLOR = "text-blue-700 bg-blue-50";
const LIMITATION_COLOR = "text-red-700 bg-red-50";

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  );
}

function LicenseCard({
  license,
  selected,
  onSelect,
}: {
  license: LicenseTemplate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left border rounded-lg p-3 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className={`font-semibold text-sm ${selected ? "text-blue-800" : "text-gray-900"}`}>
          {license.name}
        </span>
        <span className="text-xs text-gray-400 font-mono">{license.spdx}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {license.permissions.slice(0, 2).map((p) => (
          <Badge key={p} label={p} color={PERMISSION_COLOR} />
        ))}
        {license.conditions.length === 0 && (
          <Badge label="No conditions" color="text-gray-500 bg-gray-100" />
        )}
      </div>
    </button>
  );
}

export default function LicenseGenerator() {
  const currentYear = new Date().getFullYear().toString();
  const [selectedId, setSelectedId] = useState("mit");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState(currentYear);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"output" | "compare">("output");

  const selectedLicense = useMemo(
    () => LICENSE_TEMPLATES.find((l) => l.id === selectedId) ?? LICENSE_TEMPLATES[0],
    [selectedId]
  );

  const licenseText = useMemo(
    () => fillTemplate(selectedLicense.text, year, author),
    [selectedLicense, year, author]
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(licenseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [licenseText]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([licenseText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LICENSE.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [licenseText]);

  return (
    <div className="space-y-6">
      {/* License selection */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Select a License</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {LICENSE_TEMPLATES.map((license) => (
            <LicenseCard
              key={license.id}
              license={license}
              selected={license.id === selectedId}
              onSelect={() => setSelectedId(license.id)}
            />
          ))}
        </div>
      </div>

      {/* Inputs + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: inputs + badges */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>

          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author / Organization Name
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your Name or Company"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min="1970"
                max="2100"
                className="w-32 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* License summary badges */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              {selectedLicense.name} — License Summary
            </h3>

            {selectedLicense.permissions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLicense.permissions.map((p) => (
                    <Badge key={p} label={p} color={PERMISSION_COLOR} />
                  ))}
                </div>
              </div>
            )}

            {selectedLicense.conditions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLicense.conditions.map((c) => (
                    <Badge key={c} label={c} color={CONDITION_COLOR} />
                  ))}
                </div>
              </div>
            )}

            {selectedLicense.limitations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Limitations</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLicense.limitations.map((l) => (
                    <Badge key={l} label={l} color={LIMITATION_COLOR} />
                  ))}
                </div>
              </div>
            )}

            {selectedLicense.conditions.length === 0 && (
              <p className="text-xs text-gray-500">
                No conditions — this license places no requirements on distribution.
              </p>
            )}
          </div>
        </div>

        {/* Right: output */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("output")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "output"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              License Text
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "compare"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Comparison Table
            </button>
          </div>

          {activeTab === "output" && (
            <>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download .txt
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs font-mono leading-relaxed overflow-auto max-h-[480px] whitespace-pre-wrap text-gray-800">
                {licenseText}
              </pre>
            </>
          )}

          {activeTab === "compare" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 border border-gray-200 min-w-[80px]">
                      License
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-green-700 border border-gray-200">
                      Permissions
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-blue-700 border border-gray-200">
                      Conditions
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-red-700 border border-gray-200">
                      Limitations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LICENSE_TEMPLATES.map((license) => (
                    <tr
                      key={license.id}
                      onClick={() => { setSelectedId(license.id); setActiveTab("output"); }}
                      className={`cursor-pointer transition-colors ${
                        license.id === selectedId
                          ? "bg-blue-50"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-2 px-3 border border-gray-200 font-medium text-gray-900 whitespace-nowrap">
                        {license.name}
                      </td>
                      <td className="py-2 px-3 border border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {license.permissions.map((p) => (
                            <span key={p} className="inline-block bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-xs">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-3 border border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {license.conditions.length === 0 ? (
                            <span className="text-gray-400 italic">None</span>
                          ) : (
                            license.conditions.map((c) => (
                              <span key={c} className="inline-block bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                                {c}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 border border-gray-200">
                        <div className="flex flex-wrap gap-1">
                          {license.limitations.map((l) => (
                            <span key={l} className="inline-block bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs">
                              {l}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-400 mt-2">Click a row to select that license and view its text.</p>
            </div>
          )}
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this License Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate open source license files with your details. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this License Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate open source license files with your details. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "License Generator",
  "description": "Generate open source license files with your details",
  "url": "https://tools.loresync.dev/license-generator",
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
