"use client";

import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Edge {
  from: string;
  label: string;
  to: string;
}

interface ParseResult {
  nodes: string[];
  edges: Edge[];
  error: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_DSL = `Start -> Process -> Decision
Decision -> Yes -> End
Decision -> No -> Process`;

const SYNTAX_REF = [
  { syntax: "A -> B", desc: "Edge from A to B (no label)" },
  { syntax: "A -> label -> B", desc: "Edge from A to B with label" },
  { syntax: "Decision", desc: "Node name containing 'Decision' renders as diamond" },
  { syntax: "Start / End", desc: "Terminal nodes render with rounded style" },
];

// ─── Parser ───────────────────────────────────────────────────────────────────

function parseDSL(input: string): ParseResult {
  const nodeSet = new Set<string>();
  const edges: Edge[] = [];
  const errors: string[] = [];

  const lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  for (const line of lines) {
    const parts = line.split("->").map((p) => p.trim());
    if (parts.length < 2) {
      errors.push(`Invalid line: "${line}"`);
      continue;
    }

    if (parts.length === 2) {
      // A -> B
      const [from, to] = parts;
      nodeSet.add(from);
      nodeSet.add(to);
      edges.push({ from, label: "", to });
    } else if (parts.length === 3) {
      // A -> label -> B
      const [from, label, to] = parts;
      nodeSet.add(from);
      nodeSet.add(to);
      edges.push({ from, label, to });
    } else {
      // Chain: A -> B -> C -> D
      for (let i = 0; i < parts.length - 1; i++) {
        nodeSet.add(parts[i]);
        nodeSet.add(parts[i + 1]);
        edges.push({ from: parts[i], label: "", to: parts[i + 1] });
      }
    }
  }

  return {
    nodes: Array.from(nodeSet),
    edges,
    error: errors.length > 0 ? errors.join("\n") : null,
  };
}

// ─── Node type detection ──────────────────────────────────────────────────────

type NodeType = "terminal" | "decision" | "process";

function getNodeType(name: string): NodeType {
  const lower = name.toLowerCase();
  if (
    lower === "start" ||
    lower === "end" ||
    lower === "begin" ||
    lower === "stop" ||
    lower === "terminal"
  ) {
    return "terminal";
  }
  if (
    lower.includes("decision") ||
    lower.includes("check") ||
    lower.includes("if") ||
    lower.includes("?")
  ) {
    return "decision";
  }
  return "process";
}

// ─── Box renderers ────────────────────────────────────────────────────────────

function renderProcess(label: string): string[] {
  const pad = 2;
  const width = label.length + pad * 2;
  const top = "┌" + "─".repeat(width) + "┐";
  const mid = "│" + " ".repeat(pad) + label + " ".repeat(pad) + "│";
  const bot = "└" + "─".repeat(width) + "┘";
  return [top, mid, bot];
}

function renderTerminal(label: string): string[] {
  const pad = 2;
  const width = label.length + pad * 2;
  // Rounded terminal with ( )
  const top = "╭" + "─".repeat(width) + "╮";
  const mid = "│" + " ".repeat(pad) + label + " ".repeat(pad) + "│";
  const bot = "╰" + "─".repeat(width) + "╯";
  return [top, mid, bot];
}

function renderDecision(label: string): string[] {
  // Diamond approximation
  //    /────────\
  //   /  label  \
  //   \          /
  //    \────────/
  const inner = label.length + 4;
  const top = " ".repeat(1) + "/" + "─".repeat(inner) + "\\";
  const mid = "/" + "  " + label + "  " + "\\";
  const bot2 = "\\" + " ".repeat(inner) + "/";
  const bot = " ".repeat(1) + "\\" + "─".repeat(inner) + "/";
  return [top, mid, bot2, bot];
}

function renderNode(label: string): string[] {
  const type = getNodeType(label);
  if (type === "terminal") return renderTerminal(label);
  if (type === "decision") return renderDecision(label);
  return renderProcess(label);
}

// ─── Center a string in a given width ────────────────────────────────────────

function centerStr(s: string, width: number): string {
  if (s.length >= width) return s;
  const total = width - s.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return " ".repeat(left) + s + " ".repeat(right);
}

// ─── ASCII flowchart builder ──────────────────────────────────────────────────

function buildFlowchart(input: string): string {
  const { nodes, edges, error } = parseDSL(input);

  if (nodes.length === 0) return "";

  // Topological ordering: BFS from nodes that have no incoming edges
  const inDeg = new Map<string, number>();
  const adj = new Map<string, { label: string; to: string }[]>();

  for (const n of nodes) {
    inDeg.set(n, 0);
    adj.set(n, []);
  }
  for (const e of edges) {
    inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1);
    adj.get(e.from)!.push({ label: e.label, to: e.to });
  }

  const queue: string[] = [];
  for (const n of nodes) {
    if ((inDeg.get(n) ?? 0) === 0) queue.push(n);
  }

  // If no clear start, use the order nodes were first seen
  const ordered: string[] = [];
  const visited = new Set<string>();

  if (queue.length === 0) {
    // fallback: use insertion order
    for (const n of nodes) ordered.push(n);
  } else {
    // BFS
    const bfsQ = [...queue];
    while (bfsQ.length > 0) {
      const cur = bfsQ.shift()!;
      if (visited.has(cur)) continue;
      visited.add(cur);
      ordered.push(cur);
      for (const { to } of adj.get(cur) ?? []) {
        bfsQ.push(to);
      }
    }
    // append any remaining nodes not reached (cycles)
    for (const n of nodes) {
      if (!visited.has(n)) ordered.push(n);
    }
  }

  // Build lines for each node + connector
  const lines: string[] = [];

  // Track which edges have been rendered
  const renderedEdges = new Set<string>();

  for (let i = 0; i < ordered.length; i++) {
    const node = ordered[i];
    const box = renderNode(node);

    // Compute box width (max line width)
    const boxWidth = Math.max(...box.map((l) => l.length));

    // Pad all box lines to same width
    const paddedBox = box.map((l) => l + " ".repeat(boxWidth - l.length));
    lines.push(...paddedBox);

    // Find edges from this node to the next ordered node
    const outEdges = adj.get(node) ?? [];

    // Render connector to next node (if next node exists in outEdges)
    if (i < ordered.length - 1) {
      const nextNode = ordered[i + 1];
      const matchEdge = outEdges.find((e) => e.to === nextNode);
      const edgeKey = `${node}->${nextNode}`;

      if (matchEdge && !renderedEdges.has(edgeKey)) {
        renderedEdges.add(edgeKey);
        const label = matchEdge.label;
        if (label) {
          lines.push(centerStr("│", boxWidth));
          lines.push(centerStr(`[${label}]`, boxWidth));
          lines.push(centerStr("│", boxWidth));
          lines.push(centerStr("▼", boxWidth));
        } else {
          lines.push(centerStr("│", boxWidth));
          lines.push(centerStr("▼", boxWidth));
        }
      } else if (!matchEdge) {
        // No direct edge, just show separator
        lines.push(centerStr("│", boxWidth));
        lines.push(centerStr("▼", boxWidth));
      }

      // Render any side branches (edges to non-sequential nodes)
      for (const e of outEdges) {
        if (e.to === nextNode) continue;
        const edgeKey2 = `${node}->${e.to}`;
        if (!renderedEdges.has(edgeKey2)) {
          renderedEdges.add(edgeKey2);
          if (e.label) {
            lines.push(centerStr(`──[${e.label}]──► ${e.to}`, boxWidth + 20));
          } else {
            lines.push(centerStr(`──────────► ${e.to}`, boxWidth + 20));
          }
        }
      }
    } else {
      // Last node — render any outgoing edges as side branches
      for (const e of outEdges) {
        const edgeKey = `${node}->${e.to}`;
        if (!renderedEdges.has(edgeKey)) {
          renderedEdges.add(edgeKey);
          if (e.label) {
            lines.push(centerStr(`──[${e.label}]──► ${e.to}`, boxWidth + 20));
          } else {
            lines.push(centerStr(`──────────► ${e.to}`, boxWidth + 20));
          }
        }
      }
    }
  }

  const chart = lines.join("\n");
  if (error) return `# Parse warnings:\n# ${error.replace(/\n/g, "\n# ")}\n\n${chart}`;
  return chart;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AsciiFlowchart() {
  const [dsl, setDsl] = useState(SAMPLE_DSL);
  const [copied, setCopied] = useState(false);

  const output = buildFlowchart(dsl);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  return (
    <div className="space-y-6">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Node &amp; Edge Definition
            </label>
            <button
              onClick={() => setDsl(SAMPLE_DSL)}
              className="text-xs text-[var(--muted-fg)] hover:text-[var(--foreground)] underline underline-offset-2"
            >
              Load sample
            </button>
          </div>
          <textarea
            value={dsl}
            onChange={(e) => setDsl(e.target.value)}
            rows={12}
            spellCheck={false}
            className="w-full font-mono text-sm p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            placeholder={"Start -> Process -> Decision\nDecision -> Yes -> End\nDecision -> No -> Process"}
          />
          <p className="text-xs text-[var(--muted-fg)]">
            One rule per line. Use <code className="bg-[var(--muted)] px-1 rounded">-&gt;</code> to connect nodes. Three parts = labeled edge.
          </p>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--foreground)]">
              ASCII Flowchart
            </label>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="text-xs px-3 py-1 rounded bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={12}
            spellCheck={false}
            className="w-full font-mono text-sm p-3 border border-[var(--border)] rounded-lg bg-[var(--muted)] text-[var(--foreground)] resize-y focus:outline-none"
          />
          <p className="text-xs text-[var(--muted-fg)]">
            Box-drawing characters. Paste directly into README, docs, or comments.
          </p>
        </div>
      </div>

      {/* Syntax reference */}
      <div className="border border-[var(--border)] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
          Syntax Reference
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-1 pr-4 sm:pr-6 font-medium text-[var(--muted-fg)] w-auto sm:w-56">
                  Syntax
                </th>
                <th className="text-left py-1 font-medium text-[var(--muted-fg)]">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {SYNTAX_REF.map((row) => (
                <tr key={row.syntax}>
                  <td className="py-1.5 pr-6">
                    <code className="bg-[var(--muted)] px-1.5 py-0.5 rounded text-xs font-mono">
                      {row.syntax}
                    </code>
                  </td>
                  <td className="py-1.5 text-[var(--muted-fg)]">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-[var(--muted)] rounded text-xs font-mono text-[var(--muted-fg)] leading-relaxed whitespace-pre">
          {`# Node types are auto-detected:\n# "Start" / "End"   → terminal (rounded ╭╮╰╯)\n# "Decision" / "?"  → diamond  (/──\\ shape)\n# Everything else   → process  (┌──┐ box)`}
        </div>
      </div>

      {/* FAQ */}
      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold text-[var(--foreground)]">よくある質問</h2>
        {[
          {
            q: "ASCIIフローチャートをコードに埋め込めますか？",
            a: "はい。生成されたフローチャートはボックス描画文字で構成されており、コメント欄やREADMEに貼り付けるだけで使用できます。等幅フォント環境であればどのエディタでも正しく表示されます。",
          },
          {
            q: "ノードの種類はどうやって決まりますか？",
            a: "ノード名から自動判定されます。「Start」「End」はターミナルノード（丸角）、「Decision」または「?」で終わるノードはダイヤモンド形、それ以外はすべてプロセスボックス（四角）になります。",
          },
          {
            q: "エッジにラベルを付けるにはどうすればいいですか？",
            a: "1行に3要素を記述します。例：「Decision -> Yes -> 処理A」と書くと、DecisionからYesというラベル付きの矢印が処理Aに向かいます。",
          },
        ].map(({ q, a }) => (
          <details key={q} className="border border-[var(--border)] rounded-lg p-4 group">
            <summary className="font-medium text-[var(--foreground)] cursor-pointer list-none flex justify-between items-center">
              {q}
              <span className="text-[var(--muted-fg)] group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <p className="mt-2 text-sm text-[var(--muted-fg)] leading-relaxed">{a}</p>
          </details>
        ))}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "ASCIIフローチャートをコードに埋め込めますか？",
                acceptedAnswer: { "@type": "Answer", text: "はい。生成されたフローチャートはボックス描画文字で構成されており、コメント欄やREADMEに貼り付けるだけで使用できます。等幅フォント環境であればどのエディタでも正しく表示されます。" },
              },
              {
                "@type": "Question",
                name: "ノードの種類はどうやって決まりますか？",
                acceptedAnswer: { "@type": "Answer", text: "ノード名から自動判定されます。「Start」「End」はターミナルノード（丸角）、「Decision」または「?」で終わるノードはダイヤモンド形、それ以外はすべてプロセスボックス（四角）になります。" },
              },
              {
                "@type": "Question",
                name: "エッジにラベルを付けるにはどうすればいいですか？",
                acceptedAnswer: { "@type": "Answer", text: "1行に3要素を記述します。例：「Decision -> Yes -> 処理A」と書くと、DecisionからYesというラベル付きの矢印が処理Aに向かいます。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <div className="mt-4 p-4 border border-[var(--border)] rounded-lg bg-[var(--muted)]">
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">関連ツール</p>
        <div className="flex flex-wrap gap-3">
          <a href="/tools/ascii-art" className="text-sm text-[var(--accent)] hover:underline">ASCIIアート生成</a>
          <a href="/tools/markdown-preview" className="text-sm text-[var(--accent)] hover:underline">Markdownプレビュー</a>
        </div>
      </div>
    </div>
  );
}
