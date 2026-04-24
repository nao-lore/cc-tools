"use client";

import { useState, useEffect, useCallback } from "react";

// ---- Types ----

type PeriodUnit = "months" | "years";
type NotifyUnit = "days" | "months";

type ContractInput = {
  name: string;
  startDate: string;
  periodValue: number;
  periodUnit: PeriodUnit;
  autoRenew: boolean;
  notifyValue: number;
  notifyUnit: NotifyUnit;
};

type Contract = ContractInput & {
  id: string;
  createdAt: number;
};

type ContractResult = {
  expiryDate: Date;
  nextRenewalDate: Date;
  daysRemaining: number;
  notifyDate: Date;
  status: "active" | "soon" | "expired";
};

// ---- Date utilities ----

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function subtractMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function calcResult(contract: ContractInput): ContractResult | null {
  if (!contract.startDate) return null;

  const start = new Date(contract.startDate);
  if (isNaN(start.getTime())) return null;

  const expiry =
    contract.periodUnit === "months"
      ? addMonths(start, contract.periodValue)
      : addYears(start, contract.periodValue);

  // next renewal = same as expiry for first period; if auto-renew, show next cycle
  const nextRenewal = contract.autoRenew
    ? contract.periodUnit === "months"
      ? addMonths(expiry, contract.periodValue)
      : addYears(expiry, contract.periodValue)
    : expiry;

  const notifyDate =
    contract.notifyUnit === "days"
      ? subtractDays(expiry, contract.notifyValue)
      : subtractMonths(expiry, contract.notifyValue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryNorm = new Date(expiry);
  expiryNorm.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (expiryNorm.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let status: "active" | "soon" | "expired";
  if (daysRemaining < 0) {
    status = "expired";
  } else if (daysRemaining <= 30) {
    status = "soon";
  } else {
    status = "active";
  }

  return { expiryDate: expiry, nextRenewalDate: nextRenewal, daysRemaining, notifyDate, status };
}

// ---- Status badge ----

function StatusBadge({ status, daysRemaining }: { status: "active" | "soon" | "expired"; daysRemaining: number }) {
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        期限切れ
      </span>
    );
  }
  if (status === "soon") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
        まもなく満了（残{daysRemaining}日）
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      期間中（残{daysRemaining}日）
    </span>
  );
}

// ---- Result card (inline preview) ----

function ResultPreview({ input }: { input: ContractInput }) {
  const result = calcResult(input);
  if (!result) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-500">満了日</span>
        <span className="font-semibold text-gray-900">{formatDate(result.expiryDate)}</span>
      </div>
      {input.autoRenew && (
        <div className="flex items-center justify-between">
          <span className="text-gray-500">次回更新日</span>
          <span className="font-medium text-gray-700">{formatDate(result.nextRenewalDate)}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-gray-500">通知期限日</span>
        <span className="font-medium text-blue-700">{formatDate(result.notifyDate)}</span>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-200">
        <span className="text-gray-500">ステータス</span>
        <StatusBadge status={result.status} daysRemaining={result.daysRemaining} />
      </div>
    </div>
  );
}

// ---- Contract list card ----

function ContractCard({
  contract,
  onDelete,
}: {
  contract: Contract;
  onDelete: (id: string) => void;
}) {
  const result = calcResult(contract);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-5 ${
        result?.status === "expired"
          ? "border-red-200"
          : result?.status === "soon"
          ? "border-yellow-200"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{contract.name || "（名称未設定）"}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDateShort(new Date(contract.startDate))} 開始 /{" "}
            {contract.periodValue}
            {contract.periodUnit === "months" ? "ヶ月" : "年"}
            {contract.autoRenew ? " / 自動更新あり" : ""}
          </p>
        </div>
        <button
          onClick={() => onDelete(contract.id)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
          aria-label="削除"
        >
          ×
        </button>
      </div>

      {result ? (
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">満了日</span>
            <span className="font-semibold text-gray-900">{formatDate(result.expiryDate)}</span>
          </div>
          {contract.autoRenew && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">次回更新日</span>
              <span className="font-medium text-gray-700">{formatDate(result.nextRenewalDate)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-gray-500">通知期限日</span>
            <span className="font-medium text-blue-700">{formatDate(result.notifyDate)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <StatusBadge status={result.status} daysRemaining={result.daysRemaining} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">日付が無効です</p>
      )}
    </div>
  );
}

// ---- Default input ----

const defaultInput: ContractInput = {
  name: "",
  startDate: "",
  periodValue: 12,
  periodUnit: "months",
  autoRenew: false,
  notifyValue: 30,
  notifyUnit: "days",
};

// ---- Main component ----

export default function ContractDateCalc() {
  const [input, setInput] = useState<ContractInput>(defaultInput);
  const [contracts, setContracts] = useState<Contract[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("contract-date-calc-contracts");
      if (saved) {
        setContracts(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("contract-date-calc-contracts", JSON.stringify(contracts));
    } catch {
      // ignore
    }
  }, [contracts]);

  const handleAdd = useCallback(() => {
    if (!input.startDate) return;
    const newContract: Contract = {
      ...input,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
    };
    setContracts((prev) => [newContract, ...prev]);
    setInput(defaultInput);
  }, [input]);

  const handleDelete = useCallback((id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const canAdd = input.startDate.length > 0;

  return (
    <div className="space-y-6">
      {/* ===== 入力フォーム ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5">契約情報を入力</h2>

        <div className="space-y-4">
          {/* 契約名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約名
            </label>
            <input
              type="text"
              value={input.name}
              onChange={(e) => setInput((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例：オフィス賃貸契約、ソフトウェアライセンス"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* 開始日 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約開始日 <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={input.startDate}
              onChange={(e) => setInput((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-full sm:w-auto px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* 期間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              契約期間
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={120}
                value={input.periodValue}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(120, Number(e.target.value)));
                  setInput((prev) => ({ ...prev, periodValue: v }));
                }}
                className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <select
                value={input.periodUnit}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, periodUnit: e.target.value as PeriodUnit }))
                }
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="months">ヶ月</option>
                <option value="years">年</option>
              </select>
            </div>
          </div>

          {/* 自動更新 */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={input.autoRenew}
                onClick={() => setInput((prev) => ({ ...prev, autoRenew: !prev.autoRenew }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 ${
                  input.autoRenew ? "bg-gray-900" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    input.autoRenew ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">自動更新あり</span>
            </label>
          </div>

          {/* 通知期限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通知期限（満了日の何日/ヶ月前に通知するか）
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={365}
                value={input.notifyValue}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(365, Number(e.target.value)));
                  setInput((prev) => ({ ...prev, notifyValue: v }));
                }}
                className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm text-right focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
              <select
                value={input.notifyUnit}
                onChange={(e) =>
                  setInput((prev) => ({ ...prev, notifyUnit: e.target.value as NotifyUnit }))
                }
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="days">日前</option>
                <option value="months">ヶ月前</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        {input.startDate && <ResultPreview input={input} />}

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="mt-5 w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          リストに追加
        </button>
      </div>

      {/* ===== 契約一覧 ===== */}
      {contracts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-lg font-semibold text-gray-800">
              管理中の契約
              <span className="ml-2 text-sm font-normal text-gray-500">{contracts.length}件</span>
            </h2>
            {contracts.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm("すべての契約を削除しますか？")) {
                    setContracts([]);
                  }
                }}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                すべて削除
              </button>
            )}
          </div>
          <div className="space-y-4">
            {contracts.map((c) => (
              <ContractCard key={c.id} contract={c} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      )}

      {contracts.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          <p className="text-3xl mb-3">📋</p>
          <p>契約をリストに追加すると、ここに表示されます</p>
          <p className="text-xs mt-1">データはブラウザに保存されます（ログイン不要）</p>
        </div>
      )}

      {/* ===== Ad placeholder ===== */}
      <div className="w-full h-24 bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-xs text-gray-400">
        広告スペース
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この契約期間計算ツールツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">契約開始日と期間から満了日・更新日を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この契約期間計算ツールツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "契約開始日と期間から満了日・更新日を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "契約期間計算ツール",
  "description": "契約開始日と期間から満了日・更新日を計算",
  "url": "https://tools.loresync.dev/contract-date-calc",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "ja"
}`
        }}
      />
      </div>
  );
}
