"use client";

import { useState, useMemo, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type License = "MIT" | "Apache-2.0" | "GPL-3.0" | "BSD-2-Clause" | "BSD-3-Clause" | "ISC" | "MPL-2.0" | "UNLICENSED" | "None";
type Template = "minimal" | "standard" | "detailed";

interface Feature {
  id: string;
  text: string;
}

interface TechItem {
  id: string;
  text: string;
}

interface Sections {
  badges: boolean;
  features: boolean;
  installation: boolean;
  usage: boolean;
  techStack: boolean;
  contributing: boolean;
  license: boolean;
}

interface FormState {
  projectName: string;
  description: string;
  badges: {
    npm: boolean;
    license: boolean;
    build: boolean;
  };
  features: Feature[];
  installation: string;
  usage: string;
  techStack: TechItem[];
  contributing: boolean;
  license: License;
  sections: Sections;
  npmPackage: string;
  repoOwner: string;
  repoName: string;
}

// ── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: Record<Template, Partial<FormState>> = {
  minimal: {
    badges: { npm: false, license: true, build: false },
    features: [],
    installation: "npm install",
    usage: "",
    techStack: [],
    contributing: false,
    sections: {
      badges: true,
      features: false,
      installation: true,
      usage: true,
      techStack: false,
      contributing: false,
      license: true,
    },
  },
  standard: {
    badges: { npm: false, license: true, build: true },
    features: [
      { id: "f1", text: "Easy to use" },
      { id: "f2", text: "Fast and lightweight" },
      { id: "f3", text: "Well documented" },
    ],
    installation: "npm install my-package\n\n# or with yarn\nyarn add my-package",
    usage: '```javascript\nimport { myFunction } from \'my-package\';\n\nmyFunction();\n```',
    techStack: [],
    contributing: true,
    sections: {
      badges: true,
      features: true,
      installation: true,
      usage: true,
      techStack: false,
      contributing: true,
      license: true,
    },
  },
  detailed: {
    badges: { npm: true, license: true, build: true },
    features: [
      { id: "f1", text: "Easy to use API" },
      { id: "f2", text: "TypeScript support" },
      { id: "f3", text: "Zero dependencies" },
      { id: "f4", text: "Fully tested" },
    ],
    installation: "npm install my-package\n\n# or with yarn\nyarn add my-package\n\n# or with pnpm\npnpm add my-package",
    usage: '## Basic Usage\n\n```javascript\nimport { myFunction } from \'my-package\';\n\nconst result = myFunction({ option: true });\nconsole.log(result);\n```\n\n## Advanced Usage\n\n```javascript\nimport { MyClass } from \'my-package\';\n\nconst instance = new MyClass({\n  option1: \'value\',\n  option2: true,\n});\n\ninstance.doSomething();\n```',
    techStack: [
      { id: "t1", text: "TypeScript" },
      { id: "t2", text: "Node.js" },
    ],
    contributing: true,
    sections: {
      badges: true,
      features: true,
      installation: true,
      usage: true,
      techStack: true,
      contributing: true,
      license: true,
    },
  },
};

const DEFAULT_STATE: FormState = {
  projectName: "",
  description: "",
  badges: { npm: false, license: false, build: false },
  features: [],
  installation: "",
  usage: "",
  techStack: [],
  contributing: false,
  license: "MIT",
  npmPackage: "",
  repoOwner: "",
  repoName: "",
  sections: {
    badges: true,
    features: true,
    installation: true,
    usage: true,
    techStack: false,
    contributing: false,
    license: true,
  },
};

// ── Markdown Generator ────────────────────────────────────────────────────────

function generateMarkdown(state: FormState): string {
  const lines: string[] = [];
  const pkg = state.npmPackage || state.projectName.toLowerCase().replace(/\s+/g, "-");
  const owner = state.repoOwner || "username";
  const repo = state.repoName || pkg;

  // Title
  lines.push(`# ${state.projectName || "My Project"}`);
  lines.push("");

  // Badges
  if (state.sections.badges) {
    const badgeLines: string[] = [];
    if (state.badges.npm && pkg) {
      badgeLines.push(`[![npm version](https://badge.fury.io/js/${encodeURIComponent(pkg)}.svg)](https://badge.fury.io/js/${encodeURIComponent(pkg)})`);
    }
    if (state.badges.license && state.license !== "None") {
      badgeLines.push(`[![License: ${state.license}](https://img.shields.io/badge/License-${encodeURIComponent(state.license)}-blue.svg)](https://opensource.org/licenses/${state.license})`);
    }
    if (state.badges.build) {
      badgeLines.push(`[![Build Status](https://github.com/${owner}/${repo}/workflows/CI/badge.svg)](https://github.com/${owner}/${repo}/actions)`);
    }
    if (badgeLines.length > 0) {
      lines.push(badgeLines.join(" "));
      lines.push("");
    }
  }

  // Description
  if (state.description) {
    lines.push(state.description);
    lines.push("");
  }

  // Features
  if (state.sections.features && state.features.length > 0) {
    lines.push("## Features");
    lines.push("");
    for (const f of state.features) {
      if (f.text.trim()) lines.push(`- ${f.text}`);
    }
    lines.push("");
  }

  // Installation
  if (state.sections.installation && state.installation.trim()) {
    lines.push("## Installation");
    lines.push("");
    lines.push("```bash");
    lines.push(state.installation);
    lines.push("```");
    lines.push("");
  }

  // Usage
  if (state.sections.usage && state.usage.trim()) {
    lines.push("## Usage");
    lines.push("");
    lines.push(state.usage);
    lines.push("");
  }

  // Tech Stack
  if (state.sections.techStack && state.techStack.length > 0) {
    lines.push("## Tech Stack");
    lines.push("");
    for (const t of state.techStack) {
      if (t.text.trim()) lines.push(`- ${t.text}`);
    }
    lines.push("");
  }

  // Contributing
  if (state.sections.contributing && state.contributing) {
    lines.push("## Contributing");
    lines.push("");
    lines.push("Contributions are welcome! Please feel free to submit a Pull Request.");
    lines.push("");
    lines.push("1. Fork the project");
    lines.push("2. Create your feature branch (`git checkout -b feature/AmazingFeature`)");
    lines.push("3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)");
    lines.push("4. Push to the branch (`git push origin feature/AmazingFeature`)");
    lines.push("5. Open a Pull Request");
    lines.push("");
  }

  // License
  if (state.sections.license && state.license !== "None") {
    lines.push("## License");
    lines.push("");
    lines.push(`Distributed under the ${state.license} License. See \`LICENSE\` for more information.`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: Array<{ id: string; text: string }>;
  onChange: (items: Array<{ id: string; text: string }>) => void;
  placeholder: string;
}) {
  const addItem = () => {
    onChange([...items, { id: `${Date.now()}`, text: "" }]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, text: string) => {
    onChange(items.map((i) => (i.id === id ? { ...i, text } : i)));
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={item.text}
            onChange={(e) => updateItem(item.id, e.target.value)}
            placeholder={placeholder}
          />
          <button
            onClick={() => removeItem(item.id)}
            className="px-2 py-1 text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        + Add item
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReadmeGenerator() {
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyTemplate = (tpl: Template) => {
    setActiveTemplate(tpl);
    setState((prev) => ({
      ...prev,
      ...TEMPLATES[tpl],
      // preserve project name, description, repo info
      projectName: prev.projectName,
      description: prev.description,
      npmPackage: prev.npmPackage,
      repoOwner: prev.repoOwner,
      repoName: prev.repoName,
    }));
  };

  const markdown = useMemo(() => generateMarkdown(state), [state]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass = "bg-white border border-gray-200 rounded-xl p-6 space-y-4";
  const sectionHeadClass = "text-base font-semibold text-gray-900";

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Start with a template</p>
        <div className="flex flex-wrap gap-2">
          {(["minimal", "standard", "detailed"] as Template[]).map((tpl) => (
            <button
              key={tpl}
              onClick={() => applyTemplate(tpl)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                activeTemplate === tpl
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {tpl}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className={sectionClass}>
            <h2 className={sectionHeadClass}>Project Info</h2>
            <div>
              <label className={labelClass}>Project Name</label>
              <input
                className={inputClass}
                value={state.projectName}
                onChange={(e) => set("projectName", e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={state.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="A short description of what this project does."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>GitHub Owner</label>
                <input
                  className={inputClass}
                  value={state.repoOwner}
                  onChange={(e) => set("repoOwner", e.target.value)}
                  placeholder="username"
                />
              </div>
              <div>
                <label className={labelClass}>Repo Name</label>
                <input
                  className={inputClass}
                  value={state.repoName}
                  onChange={(e) => set("repoName", e.target.value)}
                  placeholder="my-project"
                />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeadClass}>Badges</h2>
              <Toggle
                checked={state.sections.badges}
                onChange={(v) => set("sections", { ...state.sections, badges: v })}
                label="Show section"
              />
            </div>
            {state.sections.badges && (
              <>
                <div className="flex flex-wrap gap-4">
                  <Toggle
                    checked={state.badges.npm}
                    onChange={(v) => set("badges", { ...state.badges, npm: v })}
                    label="npm version"
                  />
                  <Toggle
                    checked={state.badges.license}
                    onChange={(v) => set("badges", { ...state.badges, license: v })}
                    label="License"
                  />
                  <Toggle
                    checked={state.badges.build}
                    onChange={(v) => set("badges", { ...state.badges, build: v })}
                    label="Build status"
                  />
                </div>
                {state.badges.npm && (
                  <div>
                    <label className={labelClass}>npm Package Name</label>
                    <input
                      className={inputClass}
                      value={state.npmPackage}
                      onChange={(e) => set("npmPackage", e.target.value)}
                      placeholder="my-package"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Features */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeadClass}>Features</h2>
              <Toggle
                checked={state.sections.features}
                onChange={(v) => set("sections", { ...state.sections, features: v })}
                label="Show section"
              />
            </div>
            {state.sections.features && (
              <ListEditor
                items={state.features}
                onChange={(items) => set("features", items as Feature[])}
                placeholder="e.g. Fast and lightweight"
              />
            )}
          </div>

          {/* Installation */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeadClass}>Installation</h2>
              <Toggle
                checked={state.sections.installation}
                onChange={(v) => set("sections", { ...state.sections, installation: v })}
                label="Show section"
              />
            </div>
            {state.sections.installation && (
              <textarea
                className={`${inputClass} resize-none font-mono text-xs`}
                rows={4}
                value={state.installation}
                onChange={(e) => set("installation", e.target.value)}
                placeholder={"npm install my-package"}
              />
            )}
          </div>

          {/* Usage */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeadClass}>Usage Examples</h2>
              <Toggle
                checked={state.sections.usage}
                onChange={(v) => set("sections", { ...state.sections, usage: v })}
                label="Show section"
              />
            </div>
            {state.sections.usage && (
              <textarea
                className={`${inputClass} resize-none font-mono text-xs`}
                rows={6}
                value={state.usage}
                onChange={(e) => set("usage", e.target.value)}
                placeholder={"```javascript\nimport { foo } from 'my-package';\nfoo();\n```"}
              />
            )}
          </div>

          {/* Tech Stack */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between">
              <h2 className={sectionHeadClass}>Tech Stack</h2>
              <Toggle
                checked={state.sections.techStack}
                onChange={(v) => set("sections", { ...state.sections, techStack: v })}
                label="Show section"
              />
            </div>
            {state.sections.techStack && (
              <ListEditor
                items={state.techStack}
                onChange={(items) => set("techStack", items as TechItem[])}
                placeholder="e.g. TypeScript"
              />
            )}
          </div>

          {/* Contributing & License */}
          <div className={sectionClass}>
            <h2 className={sectionHeadClass}>Contributing & License</h2>
            <div className="flex items-center justify-between">
              <Toggle
                checked={state.sections.contributing && state.contributing}
                onChange={(v) => {
                  set("contributing", v);
                  set("sections", { ...state.sections, contributing: v });
                }}
                label="Include Contributing section"
              />
            </div>
            <div className="flex items-center justify-between">
              <Toggle
                checked={state.sections.license}
                onChange={(v) => set("sections", { ...state.sections, license: v })}
                label="Include License section"
              />
            </div>
            {state.sections.license && (
              <div>
                <label className={labelClass}>License</label>
                <select
                  className={`${inputClass}`}
                  value={state.license}
                  onChange={(e) => set("license", e.target.value as License)}
                >
                  <option value="MIT">MIT</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="GPL-3.0">GPL-3.0</option>
                  <option value="BSD-2-Clause">BSD 2-Clause</option>
                  <option value="BSD-3-Clause">BSD 3-Clause</option>
                  <option value="ISC">ISC</option>
                  <option value="MPL-2.0">MPL-2.0</option>
                  <option value="UNLICENSED">Unlicensed</option>
                  <option value="None">None</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-sm font-medium text-gray-700">
                Live Markdown Preview
              </span>
              <button
                onClick={handleCopy}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {copied ? "Copied!" : "Copy Markdown"}
              </button>
            </div>
            <pre className="p-5 text-xs font-mono text-gray-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[70vh] overflow-y-auto bg-gray-50">
              {markdown}
            </pre>
          </div>
        </div>
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this README Generator tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Generate professional README.md files from a form. Just enter your values and get instant results.</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this README Generator tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Generate professional README.md files from a form. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "README Generator",
  "description": "Generate professional README.md files from a form",
  "url": "https://tools.loresync.dev/readme-generator",
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
