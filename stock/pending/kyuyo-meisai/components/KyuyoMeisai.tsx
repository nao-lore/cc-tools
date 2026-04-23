"use client";

import { useState, useMemo, useEffect } from "react";

// --- 型定義 ---
type SupportRow = { id: number; label: string; amount: number };
type DeductRow = { id: number; label: string; amount: number };

type MonthRecord = {
  yearMonth: string; // "2025-04"
  totalSupport: number;
  totalDeduct: number;
  takeHome: number;
};

// --- ユーティリティ ---
let nextId = 1;
function uid() { return nextId++; }

function fmtJPY(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function getCurrentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// 所得税・住民税・社会保険の概算（基本給ベース）
// 健康保険: ~5% / 厚生年金: ~9% / 雇用保険: ~0.6% / 所得税: 課税所得の段階税率（簡易）/ 住民税: 10%
function estimateDeductions(basicSalary: number): {
  kenkoHoken: [number, number];
  kosei: [number, number];
  koyo: [number, number];
  shotokuZei: [number, number];
  juuminZei: [number, number];
} {
  // 健康保険: 4.5-5.5%
  const kh = basicSalary * 0.05;
  // 厚生年金: 8.5-9.5%
  const ks = basicSalary * 0.09;
  // 雇用保険: 0.5-0.7%
  const ky = basicSalary * 0.006;
  // 課税所得 = 基本給 - 社会保険 - 給与所得控除(約30% 簡易)
  const taxableBase = Math.max(0, basicSalary - kh - ks - ky - basicSalary * 0.3);
  // 所得税（月額・簡易）: 課税所得年換算の段階税率 ÷ 12
  const annualTaxable = taxableBase * 12;
  let annualTax = 0;
  if (annualTaxable <= 1950000) annualTax = annualTaxable * 0.05;
  else if (annualTaxable <= 3300000) annualTax = annualTaxable * 0.1 - 97500;
  else if (annualTaxable <= 6950000) annualTax = annualTaxable * 0.2 - 427500;
  else annualTax = annualTaxable * 0.23 - 636000;
  const st = annualTax / 12;
  // 住民税: 課税所得の10% ÷ 12
  const jt = taxableBase * 0.1;

  const margin = 0.1;
  return {
    kenkoHoken: [kh * (1 - margin), kh * (1 + margin)],
    kosei:      [ks * (1 - margin), ks * (1 + margin)],
    koyo:       [ky * (1 - margin), ky * (1 + margin)],
    shotokuZei: [Math.max(0, st * (1 - margin)), st * (1 + margin)],
    juuminZei:  [jt * (1 - margin), jt * (1 + margin)],
  };
}

const STORAGE_KEY = "kyuyo-meisai-records";

function loadRecords(): MonthRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: MonthRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

// --- デフォルト行 ---
function defaultSupport(): SupportRow[] {
  return [
    { id: uid(), label: "基本給", amount: 250000 },
    { id: uid(), label: "残業代", amount: 20000 },
    { id: uid(), label: "通勤手当", amount: 10000 },
    { id: uid(), label: "その他手当", amount: 0 },
  ];
}

function defaultDeduct(): DeductRow[] {
  return [
    { id: uid(), label: "健康保険", amount: 12500 },
    { id: uid(), label: "厚生年金", amount: 22500 },
    { id: uid(), label: "雇用保険", amount: 1500 },
    { id: uid(), label: "所得税", amount: 8000 },
    { id: uid(), label: "住民税", amount: 15000 },
    { id: uid(), label: "その他控除", amount: 0 },
  ];
}

export default function KyuyoMeisai() {
  const [supportRows, setSupportRows] = useState<SupportRow[]>(defaultSupport);
  const [deductRows, setDeductRows] = useState<DeductRow[]>(defaultDeduct);
  const [records, setRecords] = useState<MonthRecord[]>([]);
  const [currentYM, setCurrentYM] = useState<string>(getCurrentYearMonth());
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  // --- 集計 ---
  const totalSupport = useMemo(
    () => supportRows.reduce((s, r) => s + (r.amount || 0), 0),
    [supportRows]
  );
  const totalDeduct = useMemo(
    () => deductRows.reduce((s, r) => s + (r.amount || 0), 0),
    [deductRows]
  );
  const takeHome = totalSupport - totalDeduct;

  // 基本給取得（ラベルが「基本給」の最初の行）
  const basicSalary = useMemo(() => {
    const row = supportRows.find((r) => r.label === "基本給");
    return row ? row.amount : 0;
  }, [supportRows]);

  const estimates = useMemo(() => estimateDeductions(basicSalary), [basicSalary]);

  // 概算比較マッピング
  const estimateMap: Record<string, [number, number] | null> = {
    "健康保険": estimates.kenkoHoken,
    "厚生年金": estimates.kosei,
    "雇用保険": estimates.koyo,
    "所得税":   estimates.shotokuZei,
    "住民税":   estimates.juuminZei,
  };

  // チャート用データ（直近12ヶ月）
  const chartRecords = useMemo(() => {
    const sorted = [...records].sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
    return sorted.slice(-12);
  }, [records]);

  const maxTakeHome = useMemo(
    () => Math.max(...chartRecords.map((r) => r.takeHome), 1),
    [chartRecords]
  );

  // --- 行操作 ---
  function updateSupport(id: number, field: "label" | "amount", value: string | number) {
    setSupportRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }
  function addSupport() {
    setSupportRows((rows) => [...rows, { id: uid(), label: "手当", amount: 0 }]);
  }
  function removeSupport(id: number) {
    setSupportRows((rows) => rows.filter((r) => r.id !== id));
  }

  function updateDeduct(id: number, field: "label" | "amount", value: string | number) {
    setDeductRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }
  function addDeduct() {
    setDeductRows((rows) => [...rows, { id: uid(), label: "控除", amount: 0 }]);
  }
  function removeDeduct(id: number) {
    setDeductRows((rows) => rows.filter((r) => r.id !== id));
  }

  // --- 月次保存 ---
  function saveRecord() {
    const newRecord: MonthRecord = {
      yearMonth: currentYM,
      totalSupport,
      totalDeduct,
      takeHome,
    };
    const updated = [
      ...records.filter((r) => r.yearMonth !== currentYM),
      newRecord,
    ];
    updated.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
    setRecords(updated);
    saveRecords(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  function deleteRecord(ym: string) {
    const updated = records.filter((r) => r.yearMonth !== ym);
    setRecords(updated);
    saveRecords(updated);
  }

  return (
    <div className="space-y-6">

      {/* ===== 支給 ===== */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-base">支給項目</h2>
          <button
            onClick={addSupport}
            className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            + 行追加
          </button>
        </div>
        <div className="space-y-2">
          {supportRows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                type="text"
                value={row.label}
                onChange={(e) => updateSupport(row.id, "label", e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="項目名"
              />
              <div className="flex items-center gap-1">
                <span className="text-muted text-sm">¥</span>
                <input
                  type="number"
                  min={0}
                  value={row.amount || ""}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    updateSupport(row.id, "amount", isNaN(v) ? 0 : v);
                  }}
                  className="w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="0"
                />
              </div>
              <button
                onClick={() => removeSupport(row.id)}
                className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none px-1"
                title="削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
          <span className="text-muted text-sm font-medium">総支給額</span>
          <span className="font-bold text-lg text-gray-900">{fmtJPY(totalSupport)}</span>
        </div>
      </div>

      {/* ===== 控除 ===== */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 text-base">控除項目</h2>
          <button
            onClick={addDeduct}
            className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            + 行追加
          </button>
        </div>
        <div className="space-y-2">
          {deductRows.map((row) => {
            const range = estimateMap[row.label] ?? null;
            const amt = row.amount || 0;
            const flagged =
              range !== null && amt > 0 &&
              (amt < range[0] * 0.9 || amt > range[1] * 1.1);
            return (
              <div key={row.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateDeduct(row.id, "label", e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="項目名"
                />
                <div className="flex items-center gap-1">
                  <span className="text-muted text-sm">¥</span>
                  <input
                    type="number"
                    min={0}
                    value={row.amount || ""}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      updateDeduct(row.id, "amount", isNaN(v) ? 0 : v);
                    }}
                    className={`w-36 px-3 py-2 border rounded-lg text-sm text-right focus:outline-none focus:ring-2 ${
                      flagged
                        ? "border-orange-300 focus:ring-orange-300 bg-orange-50"
                        : "border-gray-200 focus:ring-blue-300"
                    }`}
                    placeholder="0"
                  />
                </div>
                <button
                  onClick={() => removeDeduct(row.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none px-1"
                  title="削除"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
          <span className="text-muted text-sm font-medium">控除合計</span>
          <span className="font-bold text-lg text-red-600">{fmtJPY(totalDeduct)}</span>
        </div>
      </div>

      {/* ===== 差引支給額 ===== */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="text-blue-100 text-xs mb-1">差引支給額（手取り）</div>
        <div className="text-5xl font-bold mb-4">{fmtJPY(takeHome)}</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white bg-opacity-15 rounded-xl p-3">
            <div className="text-blue-200 text-xs mb-1">総支給額</div>
            <div className="font-bold text-lg">{fmtJPY(totalSupport)}</div>
          </div>
          <div className="bg-white bg-opacity-15 rounded-xl p-3">
            <div className="text-blue-200 text-xs mb-1">控除合計</div>
            <div className="font-bold text-lg text-red-300">{fmtJPY(totalDeduct)}</div>
          </div>
        </div>
        {totalSupport > 0 && (
          <div className="mt-3 text-blue-200 text-xs">
            控除率: {((totalDeduct / totalSupport) * 100).toFixed(1)}%
          </div>
        )}
      </div>

      {/* ===== 概算比較 ===== */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-gray-800 text-base mb-1">概算比較</h2>
        <p className="text-muted text-xs mb-4">
          基本給 {fmtJPY(basicSalary)} をもとに計算した目安範囲と比較します。±10%を超えると警告。
        </p>
        <div className="space-y-3">
          {deductRows
            .filter((r) => estimateMap[r.label] !== undefined)
            .map((row) => {
              const range = estimateMap[row.label]!;
              const amt = row.amount || 0;
              const flagged = amt > 0 && (amt < range[0] * 0.9 || amt > range[1] * 1.1);
              const inRange = amt > 0 && !flagged;
              const noInput = amt === 0;
              return (
                <div key={row.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    noInput ? "bg-gray-200" : flagged ? "bg-orange-400" : "bg-green-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm font-medium text-gray-800">{row.label}</span>
                      <span className={`text-sm font-bold ${flagged ? "text-orange-600" : "text-gray-900"}`}>
                        {fmtJPY(amt)}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      目安: {fmtJPY(range[0])} 〜 {fmtJPY(range[1])}
                      {flagged && (
                        <span className="ml-2 text-orange-500 font-medium">⚠ 範囲外</span>
                      )}
                      {inRange && (
                        <span className="ml-2 text-green-600">✓ 正常</span>
                      )}
                    </div>
                    {/* バー */}
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      {range[1] > 0 && amt > 0 && (
                        <div
                          className={`h-full rounded-full transition-all ${flagged ? "bg-orange-400" : "bg-green-400"}`}
                          style={{ width: `${Math.min(100, (amt / (range[1] * 1.5)) * 100)}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        {basicSalary === 0 && (
          <p className="text-muted text-xs mt-3">
            「基本給」の金額を入力すると概算が表示されます。
          </p>
        )}
        <p className="text-muted text-xs mt-4 pt-3 border-t border-border">
          ※ 概算は標準的な会社員（協会けんぽ・厚生年金）を前提とした目安です。実際の額は会社・報酬月額・扶養状況により異なります。
        </p>
      </div>

      {/* ===== 月次保存 ===== */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <h2 className="font-semibold text-gray-800 text-base mb-3">月次記録に保存</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="month"
            value={currentYM}
            onChange={(e) => setCurrentYM(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={saveRecord}
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            この月のデータを保存
          </button>
          {savedMsg && (
            <span className="text-green-600 text-sm font-medium">保存しました</span>
          )}
        </div>
      </div>

      {/* ===== 手取り推移チャート ===== */}
      {chartRecords.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4">
          <h2 className="font-semibold text-gray-800 text-base mb-1">手取り推移（直近{chartRecords.length}ヶ月）</h2>
          <p className="text-muted text-xs mb-4">保存済みの月次データを表示します。</p>

          {/* バーチャート */}
          <div className="flex items-end gap-2 h-36">
            {chartRecords.map((rec) => {
              const pct = maxTakeHome > 0 ? (rec.takeHome / maxTakeHome) * 100 : 0;
              const label = rec.yearMonth.replace(/^(\d{4})-(\d{2})$/, "$1/$2");
              return (
                <div key={rec.yearMonth} className="flex flex-col items-center flex-1 min-w-0 h-full justify-end">
                  <div className="text-center text-xs text-muted mb-1 w-full truncate" title={fmtJPY(rec.takeHome)}>
                    {fmtJPY(rec.takeHome).replace("¥", "").replace(/,/g, "")}
                  </div>
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${Math.max(4, pct)}%` }}
                  />
                  <div className="text-center text-xs text-muted mt-1 w-full truncate">{label}</div>
                </div>
              );
            })}
          </div>

          {/* 記録一覧 */}
          <div className="mt-4 space-y-2">
            {[...chartRecords].reverse().map((rec) => (
              <div key={rec.yearMonth} className="flex items-center justify-between text-sm">
                <span className="text-muted">{rec.yearMonth}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600 text-xs">
                    支給 {fmtJPY(rec.totalSupport)} / 控除 {fmtJPY(rec.totalDeduct)}
                  </span>
                  <span className="font-semibold text-gray-900">{fmtJPY(rec.takeHome)}</span>
                  <button
                    onClick={() => deleteRecord(rec.yearMonth)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-xs"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 広告プレースホルダー ===== */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-muted text-sm">
        広告
      </div>
    </div>
  );
}
