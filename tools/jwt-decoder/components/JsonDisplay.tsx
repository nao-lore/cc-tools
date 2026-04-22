"use client";

import { useState } from "react";

function syntaxHighlight(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
          return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
        }
        cls = "json-string";
      } else if (/true|false/.test(match)) {
        cls = "json-boolean";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function JsonDisplay({
  title,
  data,
  icon,
}: {
  title: string;
  data: Record<string, unknown> | null;
  icon: string;
}) {
  const [copied, setCopied] = useState(false);

  const formatted = data ? JSON.stringify(data, null, 2) : "null";
  const highlighted = syntaxHighlight(formatted);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-panel-bg text-panel-text">
        <span className="text-sm font-semibold flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-accent/20 text-accent hover:bg-accent/30 transition-colors cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-4 bg-panel-bg/95 text-panel-text text-sm font-mono overflow-x-auto leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}
