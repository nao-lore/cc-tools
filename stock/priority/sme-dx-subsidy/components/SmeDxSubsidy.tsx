"use client";

import { useState, useMemo } from "react";

// ────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────

type FitLevel = "◎" | "○" | "△" | "×";

interface SubsidyResult {
  name: string;
  shortName: string;
  fitLevel: FitLevel;
  reasons: string[];
  minAmount: number;
  maxAmount: number;
  rate: string;
  deadline: string;
  color: string;
}

// ────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────

const INDUSTRY_OPTIONS = [
  { value: "manufacturing", label: "製造業" },
  { value: "retail", label: "小売業・卸売業" },
  { value: "food", label: "飲食業" },
  { value: "it", label: "IT・情報サービス" },
  { value: "construction", label: "建設業" },
  { value: "medical", label: "医療・介護・福祉" },
  { value: "logistics", label: "物流・運輸" },
  { value: "education", label: "教育・学習支援" },
  { value: "real_estate", label: "不動産業" },
  { value: "other_service", label: "その他サービス業" },
  { value: "other", label: "その他" },
];

const TOOL_CATEGORIES = [
  { value: "accounting", label: "会計・経理ソフト" },
  { value: "attendance", label: "勤怠管理システム" },
  { value: "crm", label: "CRM・顧客管理" },
  { value: "ec", label: "ECサイト・ネットショップ" },
  { value: "security", label: "セキュリティ対策" },
  { value: "inventory", label: "在庫・受発注管理" },
  { value: "hr", label: "人事・給与システム" },
  { value: "pos", label: "POSレジ・販売管理" },
  { value: "rpa", label: "RPA・業務自動化" },
  { value: "ai_ml", label: "AI・機械学習ツール" },
  { value: "iot", label: "IoT・センサー" },
  { value: "communication", label: "社内コミュニケーション" },
  { value: "other", label: "その他ITツール" },
];

const REQUIRED_DOCS = [
  { id: "gbiz", label: "GビズIDプライム（法人・個人事業主共通）", required: true },
  { id: "tax", label: "直近2期分の確定申告書・決算書", required: true },
  { id: "plan", label: "IT導入計画書（支援事業者が作成補助）", required: false },
  { id: "quote", label: "ITツールの見積書", required: true },
  { id: "company_reg", label: "登記事項証明書（法人の場合）", required: false },
  { id: "bank", label: "法人口座の通帳コピー", required: false },
  { id: "business_plan", label: "事業計画書（ものづくり・事業再構築向け）", required: false },
];

// ────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 10_000_0000) return `${(n / 10_000_0000).toFixed(0)}億円`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}万円`;
  return `${n.toLocaleString()}円`;
}

function fitBadgeStyle(level: FitLevel): string {
  switch (level) {
    case "◎": return "bg-emerald-500 text-white";
    case "○": return "bg-blue-500 text-white";
    case "△": return "bg-amber-400 text-gray-900";
    case "×": return "bg-gray-400 text-white";
  }
}

function fitLabel(level: FitLevel): string {
  switch (level) {
    case "◎": return "高適合";
    case "○": return "適合";
    case "△": return "要確認";
    case "×": return "対象外の可能性";
  }
}

// ────────────────────────────────────────────
// 判定ロジック
// ────────────────────────────────────────────

interface FormData {
  employees: string;
  industry: string;
  capital: string;
  revenue: string;
  tools: string[];
  investAmount: string;
}

function calcResults(form: FormData): SubsidyResult[] {
  const emp = parseInt(form.employees) || 0;
  const cap = parseInt(form.capital) || 0; // 万円
  const rev = parseInt(form.revenue) || 0; // 万円
  const invest = parseInt(form.investAmount) || 0; // 万円
  const hasTools = form.tools.length > 0;
  const hasSecurity = form.tools.includes("security");
  const hasIoT = form.tools.includes("iot") || form.tools.includes("ai_ml") || form.tools.includes("rpa");
  const isManufacturing = form.industry === "manufacturing";
  const isSmallBiz =
    (form.industry === "retail" && emp <= 50) ||
    (form.industry === "manufacturing" && emp <= 300) ||
    (["food", "it", "other_service", "other"].includes(form.industry) && emp <= 100) ||
    emp <= 300;

  // ─────────────────────
  // IT導入補助金
  // ─────────────────────
  const itFitReasons: string[] = [];
  let itFit: FitLevel = "×";

  if (!isSmallBiz && emp > 500) {
    itFitReasons.push("従業員数が中小企業の規模を超過している可能性あり");
    itFit = "×";
  } else if (!hasTools) {
    itFitReasons.push("導入予定ツールを選択してください");
    itFit = "△";
  } else {
    if (hasSecurity) {
      itFitReasons.push("セキュリティ対策ツールはセキュリティ対策推進枠で対象");
    }
    if (
      form.tools.some((t) =>
        ["accounting", "attendance", "crm", "ec", "inventory", "hr", "pos", "rpa", "communication"].includes(t)
      )
    ) {
      itFitReasons.push("業務効率化・売上向上に直結するITツールが対象");
      if (invest >= 5 && invest <= 450) {
        itFitReasons.push(`投資額${fmt(invest * 10000)}はIT導入補助金の対象範囲内`);
      } else if (invest > 450) {
        itFitReasons.push("投資額が上限を超えるため、一部のみ補助対象となる可能性あり");
      }
    }
    itFit = emp <= 5 ? "◎" : "○";
    if (form.industry === "manufacturing" || form.industry === "retail") {
      itFit = "◎";
      itFitReasons.push(`${INDUSTRY_OPTIONS.find((o) => o.value === form.industry)?.label}は実績豊富な業種`);
    }
  }

  // 補助額計算
  const itMaxInvest = Math.min(invest, 450); // 万円
  let itMin = 0, itMax = 0;
  if (hasSecurity) {
    itMin = Math.floor(Math.min(itMaxInvest, 100) * 0.5);
    itMax = Math.floor(Math.min(itMaxInvest, 100) * 0.5);
  } else if (hasIoT) {
    itMin = Math.floor(itMaxInvest * (2 / 3));
    itMax = Math.floor(Math.min(itMaxInvest, 350) * 0.75);
  } else {
    itMin = Math.floor(itMaxInvest * 0.5);
    itMax = Math.floor(itMaxInvest * 0.5);
  }

  // ─────────────────────
  // ものづくり補助金
  // ─────────────────────
  const monodukuriFitReasons: string[] = [];
  let monodukuriFit: FitLevel = "×";

  if (!isSmallBiz && emp > 500) {
    monodukuriFitReasons.push("従業員数が対象規模を超えている可能性あり");
    monodukuriFit = "×";
  } else if (!isManufacturing && !hasIoT) {
    monodukuriFit = "△";
    monodukuriFitReasons.push("革新的な製品・サービス開発またはプロセス改善が要件");
    monodukuriFitReasons.push("AI・IoT・RPAなどの先端技術導入があると適合度が上がる");
  } else {
    if (isManufacturing) {
      monodukuriFit = "◎";
      monodukuriFitReasons.push("製造業はものづくり補助金の最重点対象業種");
    } else {
      monodukuriFit = "○";
    }
    if (hasIoT) {
      monodukuriFit = "◎";
      monodukuriFitReasons.push("AI・IoT・RPA導入はデジタル枠で補助率2/3に優遇");
    }
    if (invest >= 100 && invest <= 1250) {
      monodukuriFitReasons.push(`投資額${fmt(invest * 10000)}はものづくり補助金の対象範囲内`);
    } else if (invest < 100) {
      monodukuriFitReasons.push("投資額が小さいためIT導入補助金との比較検討を推奨");
    }
  }

  const monoMaxInvest = Math.min(invest, 1250);
  const monoRate = emp <= 20 ? 2 / 3 : 0.5;
  const monoMin = Math.floor(monoMaxInvest * monoRate);
  const monoMax = Math.floor(Math.min(monoMaxInvest, 1250) * (2 / 3));

  // ─────────────────────
  // 事業再構築補助金
  // ─────────────────────
  const jigyoFitReasons: string[] = [];
  let jigyoFit: FitLevel = "×";

  const isSmallRevenue = rev > 0 && rev <= 10000; // 1億円以下
  const hasRevenueDrop = false; // フォームに売上減少の項目なし→保守的に判定

  if (rev === 0) {
    jigyoFit = "△";
    jigyoFitReasons.push("年商を入力すると適合度が上がります");
  } else if (rev < 1000) {
    // 年商1000万未満は事業再構築補助金の対象になりにくい
    jigyoFit = "△";
    jigyoFitReasons.push("年商が小さい場合、事業再構築の要件（新分野展開等）の証明が難しい場合あり");
  } else {
    jigyoFit = "○";
    jigyoFitReasons.push("ポストコロナに対応した新事業展開・業種転換が対象");
    if (isSmallRevenue) {
      jigyoFitReasons.push("中小企業枠で補助率2/3が適用される可能性あり");
    }
    if (invest >= 500) {
      jigyoFit = "◎";
      jigyoFitReasons.push(`投資額${fmt(invest * 10000)}は成長枠の対象範囲内`);
    } else {
      jigyoFitReasons.push("事業再構築補助金は比較的大規模な投資が対象（最低100万円〜）");
    }
    jigyoFitReasons.push("認定支援機関との事業計画書作成が必須");
  }

  const jigyoMaxInvest = Math.min(invest, 7000);
  const jigyoMin = Math.floor(jigyoMaxInvest * 0.5);
  const jigyoMax = Math.floor(Math.min(jigyoMaxInvest, 7000) * (2 / 3));

  return [
    {
      name: "IT導入補助金",
      shortName: "IT導入",
      fitLevel: itFit,
      reasons: itFitReasons.length > 0 ? itFitReasons : ["情報を入力して診断してください"],
      minAmount: itMin * 10000,
      maxAmount: itMax * 10000,
      rate: "1/2〜3/4",
      deadline: "2026年9月頃（予定）",
      color: "blue",
    },
    {
      name: "ものづくり補助金",
      shortName: "ものづくり",
      fitLevel: monodukuriFit,
      reasons: monodukuriFitReasons.length > 0 ? monodukuriFitReasons : ["情報を入力して診断してください"],
      minAmount: monoMin * 10000,
      maxAmount: monoMax * 10000,
      rate: "1/2〜2/3",
      deadline: "2026年8月頃（予定）",
      color: "indigo",
    },
    {
      name: "事業再構築補助金",
      shortName: "事業再構築",
      fitLevel: jigyoFit,
      reasons: jigyoFitReasons.length > 0 ? jigyoFitReasons : ["情報を入力して診断してください"],
      minAmount: jigyoMin * 10000,
      maxAmount: jigyoMax * 10000,
      rate: "1/2〜2/3",
      deadline: "2026年11月頃（予定）",
      color: "violet",
    },
  ];
}

// ────────────────────────────────────────────
// サブコンポーネント
// ────────────────────────────────────────────

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-md mb-4 ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-gray-700 mb-1">{children}</label>;
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={0}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {suffix && <span className="text-gray-500 text-sm whitespace-nowrap">{suffix}</span>}
    </div>
  );
}

function ResultCard({ result }: { result: SubsidyResult }) {
  const fitColors: Record<string, string> = {
    "◎": "border-emerald-400 bg-emerald-50",
    "○": "border-blue-400 bg-blue-50",
    "△": "border-amber-400 bg-amber-50",
    "×": "border-gray-300 bg-gray-50",
  };

  return (
    <div className={`rounded-2xl border-2 p-5 ${fitColors[result.fitLevel]}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">{result.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-2xl font-black px-3 py-1 rounded-xl ${fitBadgeStyle(result.fitLevel)}`}>
            {result.fitLevel}
          </span>
          <span className="text-sm font-semibold text-gray-600">{fitLabel(result.fitLevel)}</span>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        {result.reasons.map((r, i) => (
          <p key={i} className="text-sm text-gray-700 flex gap-1">
            <span className="text-blue-400 mt-0.5 flex-shrink-0">▸</span>
            <span>{r}</span>
          </p>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-1">補助率</p>
          <p className="text-base font-bold text-gray-800">{result.rate}</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-1">想定補助額</p>
          <p className="text-sm font-bold text-gray-800">
            {result.maxAmount > 0
              ? result.minAmount === result.maxAmount
                ? fmt(result.maxAmount)
                : `〜${fmt(result.maxAmount)}`
              : "—"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-xs text-gray-500 mb-1">次回締切</p>
          <p className="text-xs font-bold text-gray-800">{result.deadline}</p>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────

export default function SmeDxSubsidy() {
  const [form, setForm] = useState<FormData>({
    employees: "",
    industry: "",
    capital: "",
    revenue: "",
    tools: [],
    investAmount: "",
  });
  const [showResult, setShowResult] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);

  const results = useMemo(() => calcResults(form), [form]);

  function toggleTool(value: string) {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.includes(value)
        ? prev.tools.filter((t) => t !== value)
        : [...prev.tools, value],
    }));
  }

  function toggleDoc(id: string) {
    setCheckedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  const canDiagnose =
    form.employees !== "" &&
    form.industry !== "" &&
    form.tools.length > 0 &&
    form.investAmount !== "";

  const bestFit = results.reduce((best, r) => {
    const order: FitLevel[] = ["◎", "○", "△", "×"];
    return order.indexOf(r.fitLevel) < order.indexOf(best.fitLevel) ? r : best;
  }, results[0]);

  return (
    <div className="space-y-4">
      {/* Step 1: 企業情報 */}
      <SectionCard>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">1</span>
          企業情報
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>従業員数</Label>
            <NumberInput
              value={form.employees}
              onChange={(v) => setForm((p) => ({ ...p, employees: v }))}
              placeholder="例: 20"
              suffix="人"
            />
          </div>
          <div>
            <Label>資本金</Label>
            <NumberInput
              value={form.capital}
              onChange={(v) => setForm((p) => ({ ...p, capital: v }))}
              placeholder="例: 300"
              suffix="万円"
            />
          </div>
          <div>
            <Label>業種</Label>
            <Select
              value={form.industry}
              onChange={(v) => setForm((p) => ({ ...p, industry: v }))}
            >
              <option value="">選択してください</option>
              {INDUSTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>年商（概算）</Label>
            <NumberInput
              value={form.revenue}
              onChange={(v) => setForm((p) => ({ ...p, revenue: v }))}
              placeholder="例: 5000"
              suffix="万円"
            />
          </div>
        </div>
      </SectionCard>

      {/* Step 2: 導入予定ツール */}
      <SectionCard>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">2</span>
          導入予定のITツール・サービス
          <span className="text-xs text-gray-400 font-normal">（複数選択可）</span>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {TOOL_CATEGORIES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleTool(t.value)}
              className={`text-left px-3 py-2 rounded-xl border-2 text-sm transition-all ${
                form.tools.includes(t.value)
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-300"
              }`}
            >
              {form.tools.includes(t.value) && <span className="mr-1">✓</span>}
              {t.label}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Step 3: 投資金額 */}
      <SectionCard>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="bg-blue-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">3</span>
          導入予定金額（概算）
        </h2>
        <NumberInput
          value={form.investAmount}
          onChange={(v) => setForm((p) => ({ ...p, investAmount: v }))}
          placeholder="例: 100"
          suffix="万円"
        />
        <p className="text-xs text-gray-400 mt-2">
          導入・設置・初期設定費用を含む概算額を入力してください
        </p>
      </SectionCard>

      {/* 診断ボタン */}
      <button
        onClick={() => setShowResult(true)}
        disabled={!canDiagnose}
        className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${
          canDiagnose
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {canDiagnose ? "適合度を診断する" : "必須項目を入力してください"}
      </button>

      {/* 診断結果 */}
      {showResult && (
        <div className="space-y-4 mt-2">
          <div className="bg-blue-700 rounded-2xl p-5 text-white text-center">
            <p className="text-sm text-blue-200 mb-1">最も適合度が高い補助金</p>
            <p className="text-2xl font-black">{bestFit.name}</p>
            <span className={`inline-block mt-2 text-3xl font-black px-4 py-1 rounded-xl ${fitBadgeStyle(bestFit.fitLevel)}`}>
              {bestFit.fitLevel}
            </span>
          </div>

          <h2 className="text-lg font-bold text-gray-100 pt-2">補助金別 適合度・シミュレーション</h2>
          {results.map((r) => (
            <ResultCard key={r.name} result={r} />
          ))}

          {/* 申請スケジュール */}
          <SectionCard>
            <h2 className="text-lg font-bold text-gray-800 mb-4">申請スケジュール目安（2026年）</h2>
            <div className="space-y-3">
              {[
                { name: "IT導入補助金", schedule: "通年で複数回公募。次回締切: 2026年9月頃", color: "bg-blue-500" },
                { name: "ものづくり補助金", schedule: "年3〜4回公募。次回締切: 2026年8月頃", color: "bg-indigo-500" },
                { name: "事業再構築補助金", schedule: "年1〜2回公募。次回締切: 2026年11月頃", color: "bg-violet-500" },
              ].map((s) => (
                <div key={s.name} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${s.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.schedule}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mt-4">
              ※ 締切日は概算です。実際の公募情報は各補助金の公式サイトをご確認ください。
            </p>
          </SectionCard>

          {/* 必要書類チェックリスト */}
          <SectionCard>
            <h2 className="text-lg font-bold text-gray-800 mb-4">必要書類チェックリスト</h2>
            <div className="space-y-2">
              {REQUIRED_DOCS.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checkedDocs.includes(doc.id)}
                    onChange={() => toggleDoc(doc.id)}
                    className="mt-0.5 w-4 h-4 accent-blue-600 flex-shrink-0"
                  />
                  <span className={`text-sm ${checkedDocs.includes(doc.id) ? "line-through text-gray-400" : "text-gray-700"}`}>
                    {doc.label}
                    {doc.required && (
                      <span className="ml-1 text-xs text-red-500 font-semibold">必須</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {checkedDocs.length}/{REQUIRED_DOCS.length} 完了
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(checkedDocs.length / REQUIRED_DOCS.length) * 100}%` }}
                />
              </div>
            </div>
          </SectionCard>

          {/* 認定支援機関とは */}
          <SectionCard className="bg-blue-50 border border-blue-200">
            <h2 className="text-lg font-bold text-gray-800 mb-2">認定支援機関とは</h2>
            <p className="text-sm text-gray-700 mb-3">
              中小企業・小規模事業者の支援に関する専門的知識や実務経験を有する支援機関として、国が認定した機関です。税理士・公認会計士・商工会議所・金融機関などが認定を受けており、事業計画書の作成サポートや補助金申請の伴走支援を行います。
            </p>
            <p className="text-sm text-gray-700 mb-4">
              ものづくり補助金・事業再構築補助金などは、認定支援機関の確認書が申請の必須要件です。
            </p>
            <a
              href="https://www.chusho.meti.go.jp/keiei/kakushin/nintei/index.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              お住まいの地域の認定支援機関を検索（中小企業庁）
              <span className="text-xs">↗</span>
            </a>
          </SectionCard>

          {/* 免責 */}
          <div className="bg-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              【免責事項】本診断ツールは、入力情報をもとに補助金の適合度を概算で判定するものです。実際の採択可否・補助額を保証するものではありません。補助金の申請要件・補助率・上限額は毎年変更されます。実際の申請にあたっては、各補助金の公式サイトおよび認定支援機関にご相談ください。
            </p>
          </div>
        </div>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このDX補助金 適合度診断ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">企業規模・業種・導入予定ツールからIT導入補助金/ものづくり補助金/DX推進補助金の適合度を判定。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このDX補助金 適合度診断ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "企業規模・業種・導入予定ツールからIT導入補助金/ものづくり補助金/DX推進補助金の適合度を判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
