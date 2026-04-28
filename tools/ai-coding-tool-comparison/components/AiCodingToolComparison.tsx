"use client";
import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Plan {
  name: string;
  priceMonthly: number | null;
  priceLabel: string;
  highlights: string[];
}

interface Tool {
  id: string;
  name: string;
  vendor: string;
  color: string;
  badgeClass: string;
  rowClass: string;
  plans: Plan[];
  lowestMonthly: number;
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

type Lang = "ja" | "en";

// ── Translations ────────────────────────────────────────────────────────────

const T = {
  ja: {
    // Section headings
    useCaseTitle: "用途別おすすめ",
    // Tab labels
    tabTable: "料金比較表",
    tabFeatures: "機能チェックリスト",
    tabCost: "チームコスト試算",
    // Filter
    filterLabel: "フィルタ",
    filterFree: "無料プランあり",
    filterAgent: "エージェント機能あり",
    filterIDE: "IDE統合",
    toolsShowing: (n: number, total: number) => `${n} / ${total} ツール表示中`,
    // Table headers
    thTool: "ツール",
    thPlan: "プラン / 価格",
    thLowest: "最安月額",
    thModels: "対応モデル",
    thPlatforms: "プラットフォーム",
    thFeatureCount: "機能数",
    // Cost tab
    teamSize: "チーム人数",
    people: "人",
    thCostTool: "ツール",
    thCostPlan: "プラン",
    thUnitPrice: "単価/人",
    thMonthlyTotal: "月額合計",
    thYearlyTotal: "年額合計",
    free: "無料",
    // Feature labels
    features: {
      autoComplete: "自動補完",
      chat: "チャット",
      agent: "エージェント",
      multiFile: "マルチファイル編集",
      gitIntegration: "Git統合",
      prSummary: "PR要約",
      browserOp: "ブラウザ操作",
      localModel: "ローカルモデル",
      freeTier: "無料プランあり",
    } as Record<FeatureKey, string>,
    featureCount: "対応機能数",
    // Use case descriptions
    useCases: [
      { label: "個人向け" as TagKey, icon: "👤", color: "border-violet-700 bg-violet-950/40", tools: ["Cursor", "Windsurf", "Claude Code"], desc: "コスパ重視・個人開発に最適" },
      { label: "チーム向け" as TagKey, icon: "👥", color: "border-emerald-700 bg-emerald-950/40", tools: ["GitHub Copilot", "Cursor", "Windsurf"], desc: "管理機能・セキュリティポリシー対応" },
      { label: "エージェント重視" as TagKey, icon: "🤖", color: "border-cyan-700 bg-cyan-950/40", tools: ["Claude Code", "Cline", "Cursor"], desc: "自律的なコード生成・複数ファイル編集" },
      { label: "OSS/無料" as TagKey, icon: "🆓", color: "border-yellow-700 bg-yellow-950/40", tools: ["Aider", "Cline"], desc: "APIキーのみで使える完全無料" },
    ],
    // Footnotes
    priceNote: "※ 料金は2026年4月時点の公式情報。為替・プラン変更により異なる場合があります。",
    apiCostNote: "※ OSS/API従量課金ツール（Aider/Cline/Claude Code API）のAPIコストは含みません。実際の費用はLLM API使用量により変動します。",
    legendNote: "料金は税抜き・2026年4月時点。変更の可能性あり。",
    freeLow: "無料〜",
    monthlyFrom: (n: number) => `$${n}/月〜`,
    // Guide
    guideTitle: "使い方ガイド",
    guide: [
      { step: "1", title: "用途別おすすめから選ぶ", desc: "個人向け・チーム向け・エージェント重視・OSS無料の4カテゴリから、自分のユースケースに合ったツールを確認できます。" },
      { step: "2", title: "フィルタで絞り込む", desc: "「無料プランあり」「エージェント機能あり」「IDE統合」のフィルタを組み合わせて候補を絞り込めます。" },
      { step: "3", title: "機能チェックリストで比較", desc: "タブを「機能チェックリスト」に切り替えると、全ツールの機能対応状況をマトリクス形式で確認できます。" },
      { step: "4", title: "チームコスト試算で予算計算", desc: "「チームコスト試算」タブでチーム人数を入力すると、全プランの月額・年額合計を一括で試算できます。" },
    ],
    // FAQ
    faqTitle: "よくある質問",
    faq: [
      { q: "CursorとWindsurfの違いは何ですか？", a: "どちらもVSCode系のAIコーディングエディタです。CursorはComposerによるマルチファイル編集が強み、WindsurfはCascadeエージェントによる自律的なコード生成が特徴です。料金はWindsurfの方が若干安いです。" },
      { q: "GitHub Copilotと他ツールの違いは？", a: "GitHub Copilotは既存IDEのプラグインとして動作し、VS Code・JetBrains・Neovim等に対応しています。エディタを変えたくない人向けです。エージェント機能はCursorやClineと比べると限定的です。" },
      { q: "無料で本格的に使えるツールはありますか？", a: "Aider・Clineは完全OSSで本体無料です。ただし別途LLM APIキー（OpenAI・Anthropic等）が必要で、その費用はAPIの従量課金になります。" },
      { q: "Claude Codeの料金プランはどれを選べばいいですか？", a: "個人の軽量利用はPro（$20/月）から始め、重い自動化タスクや大規模エージェント用途はMax $100/$200、または直接API従量課金が適しています。" },
    ],
    // Related tools
    relatedTitle: "関連ツール",
    related: [
      { href: "/github-actions-cost", label: "GitHub Actions料金計算", desc: "CI/CDの分単位コストを試算" },
      { href: "/ai-cost-calculator", label: "AIコスト計算機", desc: "LLM APIの料金を用途別に計算" },
    ],
  },
  en: {
    useCaseTitle: "Recommended by Use Case",
    tabTable: "Pricing Table",
    tabFeatures: "Feature Checklist",
    tabCost: "Team Cost Estimate",
    filterLabel: "Filter",
    filterFree: "Free tier available",
    filterAgent: "Agent feature",
    filterIDE: "IDE integration",
    toolsShowing: (n: number, total: number) => `${n} / ${total} tools shown`,
    thTool: "Tool",
    thPlan: "Plans / Pricing",
    thLowest: "Lowest Price",
    thModels: "Supported Models",
    thPlatforms: "Platforms",
    thFeatureCount: "Features",
    teamSize: "Team Size",
    people: "members",
    thCostTool: "Tool",
    thCostPlan: "Plan",
    thUnitPrice: "Unit Price",
    thMonthlyTotal: "Monthly Total",
    thYearlyTotal: "Yearly Total",
    free: "Free",
    features: {
      autoComplete: "Auto-complete",
      chat: "Chat",
      agent: "Agent",
      multiFile: "Multi-file edit",
      gitIntegration: "Git integration",
      prSummary: "PR summary",
      browserOp: "Browser ops",
      localModel: "Local model",
      freeTier: "Free tier",
    } as Record<FeatureKey, string>,
    featureCount: "Feature count",
    useCases: [
      { label: "個人向け" as TagKey, icon: "👤", color: "border-violet-700 bg-violet-950/40", tools: ["Cursor", "Windsurf", "Claude Code"], desc: "Best value for individual developers" },
      { label: "チーム向け" as TagKey, icon: "👥", color: "border-emerald-700 bg-emerald-950/40", tools: ["GitHub Copilot", "Cursor", "Windsurf"], desc: "Admin controls & security policy support" },
      { label: "エージェント重視" as TagKey, icon: "🤖", color: "border-cyan-700 bg-cyan-950/40", tools: ["Claude Code", "Cline", "Cursor"], desc: "Autonomous code gen & multi-file editing" },
      { label: "OSS/無料" as TagKey, icon: "🆓", color: "border-yellow-700 bg-yellow-950/40", tools: ["Aider", "Cline"], desc: "Fully free with your own API key" },
    ],
    priceNote: "* Prices as of April 2026. Subject to change.",
    apiCostNote: "* API costs for OSS tools (Aider/Cline/Claude Code API) are not included. Actual costs depend on LLM API usage.",
    legendNote: "Prices excl. tax, as of April 2026. Subject to change.",
    freeLow: "Free+",
    monthlyFrom: (n: number) => `$${n}/mo+`,
    guideTitle: "How to Use",
    guide: [
      { step: "1", title: "Pick by use case", desc: "Browse the 4 categories (Individual, Team, Agent-focused, OSS/Free) to find the best fit for your workflow." },
      { step: "2", title: "Apply filters", desc: "Combine filters — free tier, agent feature, IDE integration — to narrow down candidates." },
      { step: "3", title: "Compare features", desc: "Switch to the Feature Checklist tab to see a full capability matrix across all tools." },
      { step: "4", title: "Estimate team costs", desc: "Enter your team size in the Team Cost tab to instantly calculate monthly and annual totals for every plan." },
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "What is the difference between Cursor and Windsurf?", a: "Both are VSCode-based AI coding editors. Cursor excels at multi-file editing via Composer; Windsurf's Cascade agent is designed for autonomous code generation. Windsurf is slightly cheaper." },
      { q: "How does GitHub Copilot differ from other tools?", a: "Copilot runs as a plugin in your existing IDE (VS Code, JetBrains, Neovim, etc.) — ideal if you don't want to switch editors. Agent features are more limited compared to Cursor or Cline." },
      { q: "Are there tools that are genuinely free?", a: "Aider and Cline are fully open-source and free. You only pay for the LLM API (OpenAI, Anthropic, etc.) on a usage basis." },
      { q: "Which Claude Code plan should I choose?", a: "Start with Pro ($20/mo) for light individual use. For heavy automation or large agent tasks, Max $100/$200 or direct API pay-as-you-go is more suitable." },
    ],
    relatedTitle: "Related Tools",
    related: [
      { href: "/github-actions-cost", label: "GitHub Actions Cost Calculator", desc: "Estimate CI/CD costs per minute" },
      { href: "/ai-cost-calculator", label: "AI Cost Calculator", desc: "Calculate LLM API costs by use case" },
    ],
  },
} as const;

// ── Data ──────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-400 font-bold">✓</span>
  ) : (
    <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────

type SortKey = "name" | "lowestMonthly" | "featureCount";
type SortDir = "asc" | "desc";

export default function AiCodingToolComparison() {
  const [lang, setLang] = useState<Lang>("ja");
  const [sortKey, setSortKey] = useState<SortKey>("lowestMonthly");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterFree, setFilterFree] = useState(false);
  const [filterAgent, setFilterAgent] = useState(false);
  const [filterIDE, setFilterIDE] = useState(false);
  const [teamSize, setTeamSize] = useState("5");
  const [activeTab, setActiveTab] = useState<"table" | "features" | "cost">("table");

  const t = T[lang];

  const filtered = useMemo(() => {
    return TOOLS.filter((tool) => {
      if (filterFree && !tool.features.includes("freeTier")) return false;
      if (filterAgent && !tool.features.includes("agent")) return false;
      if (filterIDE && tool.platforms.every((p) => p.includes("ターミナル"))) return false;
      return true;
    });
  }, [filterFree, filterAgent, filterIDE]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortKey === "name") {
        return sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortKey === "lowestMonthly") {
        const va = a.lowestMonthly;
        const vb = b.lowestMonthly;
        return sortDir === "asc" ? va - vb : vb - va;
      } else {
        const va = a.features.length;
        const vb = b.features.length;
        return sortDir === "asc" ? va - vb : vb - va;
      }
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
    if (sortKey !== col) return <span className="text-violet-200/30 ml-1">↕</span>;
    return <span className="text-violet-200 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  const members = parseInt(teamSize) || 1;

  const thClass =
    "px-3 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wide cursor-pointer select-none whitespace-nowrap";
  const tdClass = "px-3 py-3 text-sm text-white whitespace-nowrap";

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1); }
          50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .glass-card-bright {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .neon-focus:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(167,139,250,0.6), 0 0 20px rgba(167,139,250,0.2);
        }
        .tab-active-glow {
          box-shadow: 0 0 16px rgba(139,92,246,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .tab-panel {
          animation: float-in 0.25s ease-out;
        }
        .gradient-border-box {
          position: relative;
        }
        .gradient-border-box::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(139,92,246,0.6), rgba(6,182,212,0.4), rgba(139,92,246,0.2));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .filter-pill-active {
          background: rgba(139,92,246,0.3);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(139,92,246,0.3);
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a78bfa, #818cf8);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139,92,246,0.5), 0 2px 6px rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.2);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 16px rgba(139,92,246,0.7), 0 2px 8px rgba(0,0,0,0.5);
        }
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
      `}</style>

      {/* Language toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setLang(lang === "ja" ? "en" : "ja")}
          className="glass-card px-3 py-1.5 rounded-full text-xs font-medium text-violet-200 hover:text-white transition-colors"
        >
          {lang === "ja" ? "EN" : "JP"}
        </button>
      </div>

      {/* ── 用途別おすすめ ── */}
      <section className="tab-panel">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.useCaseTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {t.useCases.map((uc) => (
            <div key={uc.label} className={`glass-card rounded-2xl p-4 border-l-4 ${uc.color.split(" ")[0]}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{uc.icon}</span>
                <span className="font-semibold text-white text-sm">{uc.label}</span>
              </div>
              <p className="text-xs text-violet-200 mb-3">{uc.desc}</p>
              <div className="flex flex-wrap gap-1">
                {uc.tools.map((toolName) => (
                  <span
                    key={toolName}
                    className="inline-block text-xs bg-black/30 border border-white/10 rounded px-2 py-0.5 font-mono font-medium text-violet-100"
                  >
                    {toolName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── タブ切り替え ── */}
      <div className="glass-card rounded-2xl p-1.5 flex gap-1 flex-wrap">
        {(["table", "features", "cost"] as const).map((tab) => {
          const labels = { table: t.tabTable, features: t.tabFeatures, cost: t.tabCost };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? "bg-violet-600 text-white tab-active-glow"
                  : "text-violet-200 hover:text-violet-100 hover:bg-white/5"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ── フィルタ ── */}
      {(activeTab === "table" || activeTab === "features") && (
        <section className="flex flex-wrap gap-3 items-center tab-panel">
          <span className="text-xs text-violet-200/60 font-medium uppercase tracking-wider">{t.filterLabel}</span>
          {[
            { label: t.filterFree, state: filterFree, set: setFilterFree },
            { label: t.filterAgent, state: filterAgent, set: setFilterAgent },
            { label: t.filterIDE, state: filterIDE, set: setFilterIDE },
          ].map(({ label, state, set }) => (
            <button
              key={label}
              onClick={() => set(!state)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                state
                  ? "filter-pill-active"
                  : "glass-card text-violet-200 hover:text-violet-100 hover:border-violet-500/40"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-xs text-violet-200/40">{t.toolsShowing(sorted.length, TOOLS.length)}</span>
        </section>
      )}

      {/* ══ Tab: 料金比較表 ══════════════════════════════════════════════ */}
      {activeTab === "table" && (
        <section className="tab-panel space-y-4">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto glass-card rounded-2xl">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className={thClass} onClick={() => toggleSort("name")}>
                    {t.thTool} <SortIcon col="name" />
                  </th>
                  <th className={`${thClass} cursor-default`}>{t.thPlan}</th>
                  <th className={thClass} onClick={() => toggleSort("lowestMonthly")}>
                    {t.thLowest} <SortIcon col="lowestMonthly" />
                  </th>
                  <th className={`${thClass} cursor-default`}>{t.thModels}</th>
                  <th className={`${thClass} cursor-default`}>{t.thPlatforms}</th>
                  <th className={thClass} onClick={() => toggleSort("featureCount")}>
                    {t.thFeatureCount} <SortIcon col="featureCount" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tool, i) => (
                  <tr
                    key={tool.id}
                    className={`table-row-stripe ${tool.rowClass}`}
                    style={{ borderBottom: i < sorted.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
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
                        <span className="text-xs text-violet-200/50 font-normal">{tool.vendor}</span>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {tool.plans.map((p) => (
                          <span
                            key={p.name}
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#c4b5fd" }}
                            title={p.highlights.join(" / ")}
                          >
                            {p.name}: {p.priceLabel}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                        {tool.lowestMonthly === 0 ? t.freeLow : t.monthlyFrom(tool.lowestMonthly)}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {tool.models.map((m) => (
                          <span
                            key={m}
                            className="inline-block text-xs px-2 py-0.5 rounded font-mono text-cyan-300"
                            style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className={`${tdClass} text-xs text-violet-200 max-w-[200px]`}>
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
          <div className="md:hidden space-y-3">
            {sorted.map((tool) => (
              <div
                key={tool.id}
                className={`glass-card rounded-2xl p-4 border-l-4 ${tool.color}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-white text-base hover:underline hover:text-violet-300 transition-colors"
                    >
                      {tool.name}
                    </a>
                    <p className="text-xs text-violet-200/50">{tool.vendor}</p>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                    {tool.lowestMonthly === 0 ? t.freeLow : t.monthlyFrom(tool.lowestMonthly)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tool.plans.map((p) => (
                    <span
                      key={p.name}
                      className="text-xs rounded px-2 py-0.5 text-violet-100"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {p.name}: {p.priceLabel}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-violet-200/60">{tool.platforms.join(", ")}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tool.features.map((f) => (
                    <span
                      key={f}
                      className="text-xs rounded px-2 py-0.5 text-emerald-400"
                      style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)" }}
                    >
                      {t.features[f]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-violet-200/40 text-center">{t.priceNote}</p>
        </section>
      )}

      {/* ══ Tab: 機能チェックリスト ════════════════════════════════════ */}
      {activeTab === "features" && (
        <section className="tab-panel space-y-4">
          {/* Desktop matrix */}
          <div className="hidden md:block overflow-x-auto glass-card rounded-2xl">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-violet-200 uppercase whitespace-nowrap tracking-wide">
                    {lang === "ja" ? "機能" : "Feature"}
                  </th>
                  {sorted.map((tool) => (
                    <th
                      key={tool.id}
                      className="px-4 py-3 text-center text-xs font-semibold text-violet-200 uppercase whitespace-nowrap"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs ${tool.badgeClass}`}>
                        {tool.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feat, i) => (
                  <tr
                    key={feat}
                    className="table-row-stripe"
                    style={{ borderBottom: i < ALL_FEATURES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <td className="px-4 py-3 text-sm text-violet-100 font-medium whitespace-nowrap">
                      {t.features[feat]}
                    </td>
                    {sorted.map((tool) => (
                      <td key={tool.id} className="px-4 py-3 text-center">
                        <Check ok={tool.features.includes(feat)} />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Feature count row */}
                <tr style={{ background: "rgba(139,92,246,0.08)", borderTop: "1px solid rgba(139,92,246,0.15)" }}>
                  <td className="px-4 py-3 text-sm text-violet-200 font-semibold">{t.featureCount}</td>
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
          <div className="md:hidden space-y-3">
            {sorted.map((tool) => (
              <div key={tool.id} className={`glass-card rounded-2xl p-4 border-l-4 ${tool.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-white">{tool.name}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${tool.badgeClass}`}>
                    {tool.features.length} / {ALL_FEATURES.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {ALL_FEATURES.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-violet-100">
                      <Check ok={tool.features.includes(feat)} />
                      <span>{t.features[feat]}</span>
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
        <section className="space-y-5 tab-panel">
          <div className="glass-card rounded-2xl p-5">
            <label className="block text-xs font-semibold text-violet-100 uppercase tracking-wider mb-3">
              {t.teamSize}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="flex-1 cursor-pointer"
              />
              <input
                type="number"
                min={1}
                max={9999}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="number-input w-20 rounded-xl px-3 py-2 text-sm text-center neon-focus"
              />
              <span className="text-violet-200 text-sm">{t.people}</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wide">{t.thCostTool}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-violet-200 uppercase tracking-wide">{t.thCostPlan}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-violet-200 uppercase tracking-wide">{t.thUnitPrice}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-violet-200 uppercase tracking-wide">{t.thMonthlyTotal}</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-violet-200 uppercase tracking-wide">{t.thYearlyTotal}</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.flatMap((tool) =>
                  tool.plans
                    .filter((p) => p.priceMonthly !== null)
                    .map((plan, pi) => {
                      const monthly = (plan.priceMonthly as number) * members;
                      const yearly = monthly * 12;
                      return (
                        <tr
                          key={`${tool.id}-${plan.name}`}
                          className={`table-row-stripe ${tool.rowClass}`}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <td className="px-4 py-3 text-sm font-bold text-white whitespace-nowrap">
                            {pi === 0 && (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs mr-2 ${tool.badgeClass}`}>
                                {tool.name}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-violet-100 whitespace-nowrap">
                            {plan.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-white/90">
                            {plan.priceMonthly === 0 ? t.free : `$${plan.priceMonthly}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono font-bold text-white">
                            {plan.priceMonthly === 0 ? t.free : `$${monthly.toLocaleString()}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-mono text-violet-200">
                            {plan.priceMonthly === 0 ? t.free : `$${yearly.toLocaleString()}`}
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-violet-200/40 text-center">{t.apiCostNote}</p>
        </section>
      )}

      {/* ── 凡例 ── */}
      <section className="flex flex-wrap gap-4 text-xs text-violet-200/40 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {TOOLS.map((tool) => (
          <div key={tool.id} className="flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${tool.badgeClass.split(" ")[0]}`} />
            <span className="text-violet-200/60">{tool.name}</span>
          </div>
        ))}
        <span className="ml-auto">{t.legendNote}</span>
      </section>

      {/* ── 使い方ガイド ── */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.guideTitle}</h2>
        <ol className="space-y-3.5">
          {t.guide.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-violet-500/20 text-violet-200 text-sm font-bold flex items-center justify-center border border-violet-500/30">{item.step}</span>
              <div>
                <div className="font-medium text-white/90 text-sm">{item.title}</div>
                <div className="text-xs text-violet-200 mt-0.5">{item.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ── FAQ ── */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.faqTitle}</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} style={{ borderBottom: i < t.faq.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }} className="pb-4 last:pb-0">
              <div className="font-bold text-white/90 text-sm mb-1.5">{item.q}</div>
              <div className="text-sm text-violet-100 leading-relaxed">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── JSON-LD FAQPage (Japanese, stays fixed) ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "CursorとWindsurfの違いは何ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "どちらもVSCode系のAIコーディングエディタです。CursorはComposerによるマルチファイル編集が強み、WindsurfはCascadeエージェントによる自律的なコード生成が特徴です。料金はWindsurfの方が若干安いです。" },
              },
              {
                "@type": "Question",
                "name": "無料で本格的に使えるツールはありますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "Aider・Clineは完全OSSで本体無料です。ただし別途LLM APIキー（OpenAI・Anthropic等）が必要で、その費用はAPIの従量課金になります。" },
              },
              {
                "@type": "Question",
                "name": "Claude Codeの料金プランはどれを選べばいいですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "個人の軽量利用はPro（$20/月）から始め、重い自動化タスクや大規模エージェント用途はMax $100/$200、または直接API従量課金が適しています。" },
              },
            ],
          }),
        }}
      />

      {/* ── 関連ツール ── */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">{t.relatedTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {t.related.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block p-4 rounded-xl border border-white/8 hover:border-violet-500/40 transition-all duration-200 group"
              style={{ background: "rgba(139,92,246,0)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0)"; }}
            >
              <div className="font-medium text-white/90 text-sm group-hover:text-violet-100 transition-colors">{link.label}</div>
              <div className="text-xs text-violet-100 mt-1">{link.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
