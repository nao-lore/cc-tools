"use client";
import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Plan {
  name: string;
  priceMonthly: number | null; // null = usage-based
  priceLabel: string;
  highlights: string[];
}

interface Tool {
  id: string;
  name: string;
  vendor: string;
  color: string;         // Tailwind border/accent color class
  badgeClass: string;    // badge bg+text
  rowClass: string;      // hover row
  plans: Plan[];
  lowestMonthly: number; // for sort (0 = free tier exists)
  platforms: string[];
  models: string[];
  features: FeatureKey[];
  tags: TagKey[];
  url: string;
}

type FeatureKey =
  | "autoComplete"
  | "chat"
  | "agent"
  | "multiFile"
  | "gitIntegration"
  | "prSummary"
  | "browserOp"
  | "localModel"
  | "freeTier";

type TagKey = "個人向け" | "チーム向け" | "エージェント重視" | "OSS/無料";

// ── Data ──────────────────────────────────────────────────────────────────

const FEATURE_LABELS: Record<FeatureKey, string> = {
  autoComplete: "自動補完",
  chat:         "チャット",
  agent:        "エージェント",
  multiFile:    "マルチファイル編集",
  gitIntegration: "Git統合",
  prSummary:    "PR要約",
  browserOp:    "ブラウザ操作",
  localModel:   "ローカルモデル",
  freeTier:     "無料プランあり",
};

const ALL_FEATURES: FeatureKey[] = [
  "autoComplete", "chat", "agent", "multiFile",
  "gitIntegration", "prSummary", "browserOp", "localModel", "freeTier",
];

const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    color: "border-violet-500",
    badgeClass: "bg-violet-900/60 text-violet-300",
    rowClass: "hover:bg-violet-950/30",
    plans: [
      { name: "Hobby", priceMonthly: 0, priceLabel: "無料", highlights: ["月2,000補完", "50高速チャット"] },
      { name: "Pro", priceMonthly: 20, priceLabel: "$20/月", highlights: ["無制限補完", "500高速チャット", "Composer"] },
      { name: "Business", priceMonthly: 40, priceLabel: "$40/月/席", highlights: ["全Pro機能", "一元管理"] },
    ],
    lowestMonthly: 0,
    platforms: ["VSCode fork (Mac/Win/Linux)"],
    models: ["GPT-4o", "Claude Sonnet 4", "cursor-small"],
    features: ["autoComplete", "chat", "agent", "multiFile", "freeTier"],
    tags: ["個人向け", "チーム向け", "エージェント重視"],
    url: "https://cursor.com",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    vendor: "GitHub (Microsoft)",
    color: "border-emerald-500",
    badgeClass: "bg-emerald-900/60 text-emerald-300",
    rowClass: "hover:bg-emerald-950/30",
    plans: [
      { name: "Individual", priceMonthly: 10, priceLabel: "$10/月", highlights: ["Copilot Chat", "全IDE対応"] },
      { name: "Business", priceMonthly: 19, priceLabel: "$19/月/席", highlights: ["ポリシー管理", "監査ログ"] },
      { name: "Enterprise", priceMonthly: 39, priceLabel: "$39/月/席", highlights: ["PR要約", "ナレッジベース", "Copilot Workspace"] },
    ],
    lowestMonthly: 10,
    platforms: ["VS Code", "JetBrains", "Neovim", "Visual Studio", "GitHub.com"],
    models: ["GPT-4o", "Claude Sonnet 4 (preview)"],
    features: ["autoComplete", "chat", "multiFile", "gitIntegration", "prSummary"],
    tags: ["個人向け", "チーム向け"],
    url: "https://github.com/features/copilot",
  },
  {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    color: "border-cyan-500",
    badgeClass: "bg-cyan-900/60 text-cyan-300",
    rowClass: "hover:bg-cyan-950/30",
    plans: [
      { name: "Free", priceMonthly: 0, priceLabel: "無料", highlights: ["基本補完", "限定チャット"] },
      { name: "Pro", priceMonthly: 15, priceLabel: "$15/月", highlights: ["高速補完", "無制限チャット", "Cascade"] },
      { name: "Team", priceMonthly: 35, priceLabel: "$35/月/席", highlights: ["全Pro機能", "チーム管理"] },
    ],
    lowestMonthly: 0,
    platforms: ["VSCode fork (Mac/Win/Linux)", "JetBrains (beta)"],
    models: ["GPT-4o", "Claude Sonnet 4", "Codeium独自モデル"],
    features: ["autoComplete", "chat", "agent", "multiFile", "freeTier"],
    tags: ["個人向け", "チーム向け", "エージェント重視"],
    url: "https://windsurf.ai",
  },
  {
    id: "claudecode",
    name: "Claude Code",
    vendor: "Anthropic",
    color: "border-orange-500",
    badgeClass: "bg-orange-900/60 text-orange-300",
    rowClass: "hover:bg-orange-950/30",
    plans: [
      { name: "Pro (Claude.ai)", priceMonthly: 20, priceLabel: "$20/月", highlights: ["Claude.ai経由", "使用量上限あり"] },
      { name: "Max $100", priceMonthly: 100, priceLabel: "$100/月", highlights: ["5× 使用量", "API優先"] },
      { name: "Max $200", priceMonthly: 200, priceLabel: "$200/月", highlights: ["最大使用量", "API優先"] },
      { name: "API従量課金", priceMonthly: null, priceLabel: "従量課金", highlights: ["Opus/Sonnet/Haiku", "上限なし"] },
    ],
    lowestMonthly: 20,
    platforms: ["ターミナル (Mac/Linux/Win WSL)"],
    models: ["Claude Opus 4", "Claude Sonnet 4", "Claude Haiku 3.5"],
    features: ["chat", "agent", "multiFile", "gitIntegration"],
    tags: ["個人向け", "エージェント重視"],
    url: "https://docs.anthropic.com/ja/docs/claude-code",
  },
  {
    id: "aider",
    name: "Aider",
    vendor: "Paul Gauthier (OSS)",
    color: "border-yellow-500",
    badgeClass: "bg-yellow-900/60 text-yellow-300",
    rowClass: "hover:bg-yellow-950/30",
    plans: [
      { name: "OSS", priceMonthly: 0, priceLabel: "無料 + API従量", highlights: ["完全OSS", "全LLM対応", "Git統合"] },
    ],
    lowestMonthly: 0,
    platforms: ["ターミナル (Mac/Linux/Win)"],
    models: ["OpenAI全モデル", "Anthropic全モデル", "Gemini", "ローカルLLM"],
    features: ["chat", "agent", "multiFile", "gitIntegration", "localModel", "freeTier"],
    tags: ["OSS/無料", "エージェント重視"],
    url: "https://aider.chat",
  },
  {
    id: "cline",
    name: "Cline",
    vendor: "Cline (OSS)",
    color: "border-pink-500",
    badgeClass: "bg-pink-900/60 text-pink-300",
    rowClass: "hover:bg-pink-950/30",
    plans: [
      { name: "OSS", priceMonthly: 0, priceLabel: "無料 + API従量", highlights: ["完全OSS", "自律エージェント", "ブラウザ操作"] },
    ],
    lowestMonthly: 0,
    platforms: ["VS Code拡張 (Mac/Win/Linux)"],
    models: ["OpenAI全モデル", "Anthropic全モデル", "Gemini", "ローカルLLM"],
    features: ["chat", "agent", "multiFile", "gitIntegration", "browserOp", "localModel", "freeTier"],
    tags: ["OSS/無料", "エージェント重視"],
    url: "https://github.com/cline/cline",
  },
];

const USE_CASES: {
  label: TagKey;
  icon: string;
  color: string;
  tools: string[];
  desc: string;
}[] = [
  {
    label: "個人向け",
    icon: "👤",
    color: "border-violet-700 bg-violet-950/40",
    tools: ["Cursor", "Windsurf", "Claude Code"],
    desc: "コスパ重視・個人開発に最適",
  },
  {
    label: "チーム向け",
    icon: "👥",
    color: "border-emerald-700 bg-emerald-950/40",
    tools: ["GitHub Copilot", "Cursor", "Windsurf"],
    desc: "管理機能・セキュリティポリシー対応",
  },
  {
    label: "エージェント重視",
    icon: "🤖",
    color: "border-cyan-700 bg-cyan-950/40",
    tools: ["Claude Code", "Cline", "Cursor"],
    desc: "自律的なコード生成・複数ファイル編集",
  },
  {
    label: "OSS/無料",
    icon: "🆓",
    color: "border-yellow-700 bg-yellow-950/40",
    tools: ["Aider", "Cline"],
    desc: "APIキーのみで使える完全無料",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-400 font-bold">✓</span>
  ) : (
    <span className="text-gray-700">—</span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

type SortKey = "name" | "lowestMonthly" | "featureCount";
type SortDir = "asc" | "desc";

export default function AiCodingToolComparison() {
  const [sortKey, setSortKey] = useState<SortKey>("lowestMonthly");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterFree, setFilterFree] = useState(false);
  const [filterAgent, setFilterAgent] = useState(false);
  const [filterIDE, setFilterIDE] = useState(false);
  const [teamSize, setTeamSize] = useState("5");
  const [activeTab, setActiveTab] = useState<"table" | "features" | "cost">("table");

  const filtered = useMemo(() => {
    return TOOLS.filter((t) => {
      if (filterFree && !t.features.includes("freeTier")) return false;
      if (filterAgent && !t.features.includes("agent")) return false;
      if (filterIDE && t.platforms.every((p) => p.includes("ターミナル"))) return false;
      return true;
    });
  }, [filterFree, filterAgent, filterIDE]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "name") {
        return sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortKey === "lowestMonthly") {
        va = a.lowestMonthly;
        vb = b.lowestMonthly;
      } else {
        va = a.features.length;
        vb = b.features.length;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-gray-300 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const members = parseInt(teamSize) || 1;

  // ── Render ──────────────────────────────────────────────────────────────

  const thClass =
    "px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap";
  const tdClass = "px-3 py-3 text-sm text-gray-200 whitespace-nowrap";

  return (
    <div className="space-y-8 text-gray-200">

      {/* ── 用途別おすすめ ── */}
      <section>
        <h2 className="text-lg font-bold text-white mb-3">用途別おすすめ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {USE_CASES.map((uc) => (
            <div key={uc.label} className={`rounded-xl border p-4 ${uc.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{uc.icon}</span>
                <span className="font-semibold text-white text-sm">{uc.label}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{uc.desc}</p>
              <div className="flex flex-wrap gap-1">
                {uc.tools.map((t) => (
                  <span
                    key={t}
                    className="inline-block text-xs bg-black/30 border border-white/10 rounded px-2 py-0.5 font-mono font-medium text-gray-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── タブ切り替え ── */}
      <div className="flex gap-1 border-b border-gray-800">
        {(["table", "features", "cost"] as const).map((tab) => {
          const labels = { table: "料金比較表", features: "機能チェックリスト", cost: "チームコスト試算" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg -mb-px border-b-2 ${
                activeTab === tab
                  ? "text-white border-violet-500 bg-gray-900"
                  : "text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ── フィルタ ── */}
      {(activeTab === "table" || activeTab === "features") && (
        <section className="flex flex-wrap gap-3 items-center">
          <span className="text-xs text-gray-500 font-medium">フィルタ</span>
          {[
            { label: "無料プランあり", state: filterFree, set: setFilterFree },
            { label: "エージェント機能あり", state: filterAgent, set: setFilterAgent },
            { label: "IDE統合", state: filterIDE, set: setFilterIDE },
          ].map(({ label, state, set }) => (
            <button
              key={label}
              onClick={() => set(!state)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                state
                  ? "bg-violet-600 text-white border-violet-500"
                  : "bg-gray-900 text-gray-400 border-gray-700 hover:border-gray-500"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-xs text-gray-600">{sorted.length} / {TOOLS.length} ツール表示中</span>
        </section>
      )}

      {/* ══ Tab: 料金比較表 ══════════════════════════════════════════════ */}
      {activeTab === "table" && (
        <section>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800 shadow-lg">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className={thClass} onClick={() => toggleSort("name")}>
                    ツール <SortIcon col="name" />
                  </th>
                  <th className={`${thClass} cursor-default`}>プラン / 価格</th>
                  <th className={thClass} onClick={() => toggleSort("lowestMonthly")}>
                    最安月額 <SortIcon col="lowestMonthly" />
                  </th>
                  <th className={`${thClass} cursor-default`}>対応モデル</th>
                  <th className={`${thClass} cursor-default`}>プラットフォーム</th>
                  <th className={thClass} onClick={() => toggleSort("featureCount")}>
                    機能数 <SortIcon col="featureCount" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-950 divide-y divide-gray-800">
                {sorted.map((tool) => (
                  <tr key={tool.id} className={`transition-colors ${tool.rowClass}`}>
                    <td className={`${tdClass} font-bold text-white`}>
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline hover:text-violet-300 transition-colors"
                        >
                          {tool.name}
                        </a>
                        <span className="text-xs text-gray-500 font-normal">{tool.vendor}</span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {tool.plans.map((p) => (
                          <span
                            key={p.name}
                            className={`inline-block px-2 py-0.5 rounded text-xs font-medium border border-white/10 bg-gray-800`}
                            title={p.highlights.join(" / ")}
                          >
                            {p.name}: {p.priceLabel}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}
                      >
                        {tool.lowestMonthly === 0 ? "無料〜" : `$${tool.lowestMonthly}/月〜`}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {tool.models.map((m) => (
                          <span
                            key={m}
                            className="inline-block bg-gray-800 text-gray-300 text-xs px-2 py-0.5 rounded font-mono"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`${tdClass} text-xs text-gray-400 max-w-[200px]`}>
                      {tool.platforms.join(", ")}
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                        {tool.features.length} / {ALL_FEATURES.length}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {sorted.map((tool) => (
              <div
                key={tool.id}
                className={`rounded-xl border border-gray-800 bg-gray-900 p-4 border-l-4 ${tool.color}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white text-base hover:underline"
                    >
                      {tool.name}
                    </a>
                    <p className="text-xs text-gray-500">{tool.vendor}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                    {tool.lowestMonthly === 0 ? "無料〜" : `$${tool.lowestMonthly}/月〜`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tool.plans.map((p) => (
                    <span key={p.name} className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-gray-300">
                      {p.name}: {p.priceLabel}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400">{tool.platforms.join(", ")}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tool.features.map((f) => (
                    <span key={f} className="text-xs bg-gray-800 text-emerald-400 rounded px-2 py-0.5">
                      {FEATURE_LABELS[f]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-3">
            ※ 料金は2026年4月時点の公式情報。為替・プラン変更により異なる場合があります。
          </p>
        </section>
      )}

      {/* ══ Tab: 機能チェックリスト ════════════════════════════════════ */}
      {activeTab === "features" && (
        <section>
          {/* Desktop matrix */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-800 shadow-lg">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase whitespace-nowrap">
                    機能
                  </th>
                  {sorted.map((tool) => (
                    <th
                      key={tool.id}
                      className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase whitespace-nowrap"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${tool.badgeClass}`}>
                        {tool.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-950 divide-y divide-gray-800">
                {ALL_FEATURES.map((feat) => (
                  <tr key={feat} className="hover:bg-gray-900/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300 font-medium whitespace-nowrap">
                      {FEATURE_LABELS[feat]}
                    </td>
                    {sorted.map((tool) => (
                      <td key={tool.id} className="px-4 py-3 text-center">
                        <Check ok={tool.features.includes(feat)} />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Feature count row */}
                <tr className="bg-gray-900 font-bold">
                  <td className="px-4 py-3 text-sm text-gray-400">対応機能数</td>
                  {sorted.map((tool) => (
                    <td key={tool.id} className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                        {tool.features.length}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile: feature cards per tool */}
          <div className="md:hidden space-y-4">
            {sorted.map((tool) => (
              <div key={tool.id} className={`rounded-xl border border-gray-800 bg-gray-900 p-4 border-l-4 ${tool.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{tool.name}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                    {tool.features.length} / {ALL_FEATURES.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_FEATURES.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-gray-300">
                      <Check ok={tool.features.includes(feat)} />
                      <span>{FEATURE_LABELS[feat]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══ Tab: チームコスト試算 ═════════════════════════════════════ */}
      {activeTab === "cost" && (
        <section className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              チーム人数
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="flex-1 accent-violet-500"
              />
              <input
                type="number"
                min={1}
                max={9999}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-gray-400 text-sm">人</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-lg">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ツール</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">プラン</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">単価/人</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">月額合計</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">年額合計</th>
                </tr>
              </thead>
              <tbody className="bg-gray-950 divide-y divide-gray-800">
                {TOOLS.flatMap((tool) =>
                  tool.plans
                    .filter((p) => p.priceMonthly !== null)
                    .map((plan) => {
                      const monthly = (plan.priceMonthly as number) * members;
                      const yearly = monthly * 12;
                      return (
                        <tr key={`${tool.id}-${plan.name}`} className={`transition-colors ${tool.rowClass}`}>
                          <td className="px-4 py-3 text-sm font-bold text-white whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${tool.badgeClass}`}>
                              {tool.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                            {plan.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-gray-300">
                            {plan.priceMonthly === 0 ? "無料" : `$${plan.priceMonthly}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono font-bold text-white">
                            {plan.priceMonthly === 0 ? "無料" : `$${monthly.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-gray-400">
                            {plan.priceMonthly === 0 ? "無料" : `$${yearly.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600">
            ※ OSS/API従量課金ツール（Aider/Cline/Claude Code API）のAPIコストは含みません。実際の費用はLLM API使用量により変動します。
          </p>
        </section>
      )}

      {/* ── 凡例 ── */}
      <section className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2 border-t border-gray-800">
        {TOOLS.map((t) => (
          <div key={t.id} className="flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${t.badgeClass.replace("text-", "bg-").split(" ")[0]}`} />
            {t.name}
          </div>
        ))}
        <span className="ml-auto">料金は税抜き・2026年4月時点。変更の可能性あり。</span>
      </section>
    </div>
  );
}
