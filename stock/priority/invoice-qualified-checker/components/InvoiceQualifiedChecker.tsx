"use client";

import { useState, useMemo } from "react";

// --- 型定義 ---
type RoundingMode = "floor" | "round" | "ceil";

type FormState = {
  // 項目1: 発行事業者名 + 登録番号
  issuerName: string;
  registrationNumber: string;
  // 項目2: 取引年月日
  transactionDate: string;
  // 項目3: 取引内容
  transactionDescription: string;
  hasReducedRate: boolean;
  // 項目4: 税率ごとの対価の額
  amount10: string;
  amount8: string;
  // 項目5: 消費税額（手動or自動）
  taxManual10: string;
  taxManual8: string;
  useTaxAuto: boolean;
  roundingMode: RoundingMode;
  // 項目6: 交付先名
  recipientName: string;
};

// --- バリデーション ---
function validateRegistrationNumber(v: string): boolean {
  // T + 13桁の数字
  return /^T\d{13}$/.test(v.trim());
}

function calcTax(amountStr: string, rate: 0.1 | 0.08, rounding: RoundingMode, isTaxIncluded: boolean): number {
  const amount = parseFloat(amountStr.replace(/,/g, ""));
  if (isNaN(amount) || amount < 0) return 0;
  const taxAmount = isTaxIncluded
    ? (amount * rate) / (1 + rate)
    : amount * rate;
  if (rounding === "floor") return Math.floor(taxAmount);
  if (rounding === "ceil") return Math.ceil(taxAmount);
  return Math.round(taxAmount);
}

function fmtNum(n: number): string {
  return n.toLocaleString("ja-JP");
}

// --- 項目チェック結果 ---
type ItemStatus = "ok" | "error" | "empty";

function getItemStatus(passed: boolean, hasInput: boolean): ItemStatus {
  if (!hasInput) return "empty";
  return passed ? "ok" : "error";
}

// --- UI部品 ---
function StatusIcon({ status }: { status: ItemStatus }) {
  if (status === "ok") {
    return (
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="w-2 h-2 rounded-full bg-gray-400" />
    </span>
  );
}

function ItemCard({
  index,
  title,
  status,
  children,
}: {
  index: number;
  title: string;
  status: ItemStatus;
  children: React.ReactNode;
}) {
  const borderColor =
    status === "ok"
      ? "border-emerald-300 bg-emerald-50/30"
      : status === "error"
      ? "border-red-300 bg-red-50/20"
      : "border-gray-200 bg-white";

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <StatusIcon status={status} />
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">項目 {index}</span>
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-300 focus:ring-red-300 bg-red-50"
            : "border-gray-300 focus:ring-indigo-400"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function AmountInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-right"
        />
        <span className="text-sm text-gray-500 whitespace-nowrap">円</span>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function InvoiceQualifiedChecker() {
  const [form, setForm] = useState<FormState>({
    issuerName: "",
    registrationNumber: "",
    transactionDate: "",
    transactionDescription: "",
    hasReducedRate: false,
    amount10: "",
    amount8: "",
    taxManual10: "",
    taxManual8: "",
    useTaxAuto: true,
    roundingMode: "floor",
    recipientName: "",
  });

  const [isTaxIncluded, setIsTaxIncluded] = useState(false);
  const [showSimpleInvoice, setShowSimpleInvoice] = useState(false);
  const [showTransitionMeasure, setShowTransitionMeasure] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // --- バリデーション ---
  const regNumValid = validateRegistrationNumber(form.registrationNumber);
  const regNumError =
    form.registrationNumber.trim() && !regNumValid
      ? "T + 13桁の数字で入力してください（例: T1234567890123）"
      : undefined;

  // --- 自動計算税額 ---
  const autoTax10 = useMemo(
    () => calcTax(form.amount10, 0.1, form.roundingMode, isTaxIncluded),
    [form.amount10, form.roundingMode, isTaxIncluded]
  );
  const autoTax8 = useMemo(
    () => calcTax(form.amount8, 0.08, form.roundingMode, isTaxIncluded),
    [form.amount8, form.roundingMode, isTaxIncluded]
  );

  // --- 項目ごとのステータス ---
  const item1HasInput = form.issuerName.trim() !== "" || form.registrationNumber.trim() !== "";
  const item1Pass =
    form.issuerName.trim() !== "" &&
    form.registrationNumber.trim() !== "" &&
    regNumValid;

  const item2HasInput = form.transactionDate !== "";
  const item2Pass = item2HasInput;

  const item3HasInput = form.transactionDescription.trim() !== "";
  const item3Pass = item3HasInput;

  const item4HasInput = form.amount10 !== "" || form.amount8 !== "";
  const item4Pass =
    item4HasInput &&
    (form.amount10 !== "" || form.amount8 !== "");

  const tax10Val = form.useTaxAuto ? autoTax10 : parseFloat(form.taxManual10);
  const tax8Val = form.useTaxAuto ? autoTax8 : parseFloat(form.taxManual8);
  const item5HasInput =
    form.amount10 !== "" || form.amount8 !== "" || form.taxManual10 !== "" || form.taxManual8 !== "";
  const item5Pass =
    item5HasInput &&
    (form.amount10 !== "" ? !isNaN(tax10Val) && tax10Val >= 0 : true) &&
    (form.amount8 !== "" ? !isNaN(tax8Val) && tax8Val >= 0 : true);

  const item6HasInput = form.recipientName.trim() !== "";
  const item6Pass = item6HasInput;

  const statuses: ItemStatus[] = [
    getItemStatus(item1Pass, item1HasInput),
    getItemStatus(item2Pass, item2HasInput),
    getItemStatus(item3Pass, item3HasInput),
    getItemStatus(item4Pass, item4HasInput),
    getItemStatus(item5Pass, item5HasInput),
    getItemStatus(item6Pass, item6HasInput),
  ];

  const okCount = statuses.filter((s) => s === "ok").length;
  const errorItems = statuses
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s === "error")
    .map(({ i }) => i + 1);

  const allOk = okCount === 6;
  const hasAnyInput = statuses.some((s) => s !== "empty");

  // 税額表示用
  const amount10Num = parseFloat(form.amount10);
  const amount8Num = parseFloat(form.amount8);

  return (
    <div className="space-y-5">
      {/* ===== 進捗バー ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">記載項目の確認状況</span>
          <span className="text-sm font-bold text-indigo-700">{okCount} / 6 項目</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(okCount / 6) * 100}%`,
              background: allOk
                ? "linear-gradient(90deg, #10b981, #059669)"
                : "linear-gradient(90deg, #6366f1, #4f46e5)",
            }}
          />
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {statuses.map((s, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                s === "ok"
                  ? "bg-emerald-100 text-emerald-700"
                  : s === "error"
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              項目{i + 1}
            </span>
          ))}
        </div>
      </div>

      {/* ===== 項目1: 発行事業者名 + 登録番号 ===== */}
      <ItemCard index={1} title="適格請求書発行事業者の氏名・名称 + 登録番号" status={statuses[0]}>
        <div className="space-y-3">
          <TextInput
            label="発行事業者の氏名または名称"
            value={form.issuerName}
            onChange={(v) => update("issuerName", v)}
            placeholder="例: 株式会社〇〇"
          />
          <TextInput
            label="登録番号（T + 13桁）"
            value={form.registrationNumber}
            onChange={(v) => update("registrationNumber", v)}
            placeholder="例: T1234567890123"
            error={regNumError}
          />
          {form.registrationNumber.trim() && regNumValid && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              登録番号の形式が正しいです
            </p>
          )}
          <p className="text-xs text-gray-400">
            登録番号は国税庁の適格請求書発行事業者公表サイトで確認できます
          </p>
        </div>
      </ItemCard>

      {/* ===== 項目2: 取引年月日 ===== */}
      <ItemCard index={2} title="取引年月日" status={statuses[1]}>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">取引が行われた年月日</label>
          <input
            type="date"
            value={form.transactionDate}
            onChange={(e) => update("transactionDate", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {form.transactionDate && (
            <p className="mt-1 text-xs text-gray-500">
              {new Date(form.transactionDate).toLocaleDateString("ja-JP", {
                era: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </ItemCard>

      {/* ===== 項目3: 取引内容 ===== */}
      <ItemCard index={3} title="取引内容（軽減税率対象の場合はその旨）" status={statuses[2]}>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">取引内容</label>
            <textarea
              value={form.transactionDescription}
              onChange={(e) => update("transactionDescription", e.target.value)}
              placeholder="例: Webサイト制作費、食料品（軽減税率対象）"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.hasReducedRate}
              onChange={(e) => update("hasReducedRate", e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="text-sm text-gray-700">
              軽減税率（8%）対象品目を含む
              <span className="ml-1 text-xs text-gray-400">※「※」マーク等で明示が必要</span>
            </span>
          </label>
          {form.hasReducedRate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              軽減税率対象品目には「※」などのマークを付け、ページ下部等に「※印は軽減税率（8%）対象」などと記載してください
            </div>
          )}
        </div>
      </ItemCard>

      {/* ===== 項目4: 税率ごとの対価の額 + 適用税率 ===== */}
      <ItemCard index={4} title="税率ごとの対価の額（合計）と適用税率" status={statuses[3]}>
        <div className="space-y-4">
          {/* 税込/税抜切り替え */}
          <div className="flex gap-2">
            {[false, true].map((inc) => (
              <button
                key={String(inc)}
                onClick={() => setIsTaxIncluded(inc)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  isTaxIncluded === inc
                    ? "bg-indigo-700 text-white border-indigo-700"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {inc ? "税込金額を入力" : "税抜金額を入力"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AmountInput
              label={`標準税率（10%）対象 ${isTaxIncluded ? "税込" : "税抜"}合計額`}
              value={form.amount10}
              onChange={(v) => update("amount10", v)}
              placeholder="0"
            />
            <AmountInput
              label={`軽減税率（8%）対象 ${isTaxIncluded ? "税込" : "税抜"}合計額`}
              value={form.amount8}
              onChange={(v) => update("amount8", v)}
              placeholder="0"
            />
          </div>

          {(form.amount10 || form.amount8) && (
            <div className="bg-indigo-50 rounded-xl p-3 text-xs space-y-1">
              {form.amount10 && !isNaN(amount10Num) && (
                <div className="flex justify-between">
                  <span className="text-indigo-700">10% 対象</span>
                  <span className="font-semibold text-indigo-900">{fmtNum(amount10Num)} 円（税率 10%）</span>
                </div>
              )}
              {form.amount8 && !isNaN(amount8Num) && (
                <div className="flex justify-between">
                  <span className="text-indigo-700">8% 対象</span>
                  <span className="font-semibold text-indigo-900">{fmtNum(amount8Num)} 円（税率 8%）</span>
                </div>
              )}
              {form.amount10 && form.amount8 && !isNaN(amount10Num) && !isNaN(amount8Num) && (
                <div className="flex justify-between border-t border-indigo-200 pt-1 mt-1">
                  <span className="text-indigo-700 font-medium">合計</span>
                  <span className="font-bold text-indigo-900">{fmtNum(amount10Num + amount8Num)} 円</span>
                </div>
              )}
            </div>
          )}
        </div>
      </ItemCard>

      {/* ===== 項目5: 消費税額 ===== */}
      <ItemCard index={5} title="税率ごとの消費税額等" status={statuses[4]}>
        <div className="space-y-4">
          {/* 自動/手動切り替え */}
          <div className="flex gap-2">
            {[true, false].map((auto) => (
              <button
                key={String(auto)}
                onClick={() => update("useTaxAuto", auto)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                  form.useTaxAuto === auto
                    ? "bg-indigo-700 text-white border-indigo-700"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {auto ? "自動計算" : "手動入力"}
              </button>
            ))}
          </div>

          {/* 端数処理（自動計算時のみ） */}
          {form.useTaxAuto && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">端数処理方法</label>
              <div className="flex gap-2 flex-wrap">
                {([["floor", "切捨て（推奨）"], ["round", "四捨五入"], ["ceil", "切上げ"]] as [RoundingMode, string][]).map(
                  ([mode, label]) => (
                    <button
                      key={mode}
                      onClick={() => update("roundingMode", mode)}
                      className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all ${
                        form.roundingMode === mode
                          ? "bg-gray-800 text-white border-gray-800"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                インボイス制度では、1請求書当たり税率ごとに1回の端数処理が認められています
              </p>
            </div>
          )}

          {/* 税額表示 */}
          {form.useTaxAuto ? (
            <div className="space-y-2">
              {(form.amount10 || form.amount8) ? (
                <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-2">
                  {form.amount10 && !isNaN(amount10Num) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">10% 対象 消費税額</span>
                      <span className="font-bold text-gray-900">{fmtNum(autoTax10)} 円</span>
                    </div>
                  )}
                  {form.amount8 && !isNaN(amount8Num) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-xs">8% 対象 消費税額</span>
                      <span className="font-bold text-gray-900">{fmtNum(autoTax8)} 円</span>
                    </div>
                  )}
                  {form.amount10 && form.amount8 && !isNaN(amount10Num) && !isNaN(amount8Num) && (
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                      <span className="text-gray-700 text-xs font-medium">消費税合計</span>
                      <span className="font-bold text-gray-900">{fmtNum(autoTax10 + autoTax8)} 円</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">項目4で対価の額を入力すると自動計算されます</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AmountInput
                label="10% 対象 消費税額"
                value={form.taxManual10}
                onChange={(v) => update("taxManual10", v)}
              />
              <AmountInput
                label="8% 対象 消費税額"
                value={form.taxManual8}
                onChange={(v) => update("taxManual8", v)}
              />
            </div>
          )}
        </div>
      </ItemCard>

      {/* ===== 項目6: 交付先名 ===== */}
      <ItemCard index={6} title="書類の交付を受ける事業者の氏名または名称" status={statuses[5]}>
        <TextInput
          label="交付先（買い手）の氏名または名称"
          value={form.recipientName}
          onChange={(v) => update("recipientName", v)}
          placeholder="例: 〇〇商事株式会社"
        />
        <p className="mt-2 text-xs text-gray-400">
          簡易インボイス（小売・飲食・タクシー等）は宛名の記載が不要です
        </p>
      </ItemCard>

      {/* ===== 判定結果 ===== */}
      {hasAnyInput && (
        <div
          className={`rounded-2xl border p-6 transition-all ${
            allOk
              ? "bg-emerald-50 border-emerald-300"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {allOk ? (
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            <div>
              <p className={`font-bold text-lg ${allOk ? "text-emerald-800" : "text-red-700"}`}>
                {allOk
                  ? "適格請求書の要件を満たしています"
                  : "不足している記載項目があります"}
              </p>
              {!allOk && errorItems.length > 0 && (
                <p className="mt-1 text-sm text-red-600">
                  項目 {errorItems.join("・")} の内容を確認してください
                </p>
              )}
              {!allOk && statuses.some((s) => s === "empty") && (
                <p className="mt-1 text-xs text-gray-500">
                  未入力の項目（グレー）も含めて全6項目の記載が必要です
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== 追加情報 ===== */}
      <div className="space-y-3">
        {/* 簡易インボイスとの違い */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowSimpleInvoice((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-gray-800 text-sm">簡易インボイスとの違い</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showSimpleInvoice ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showSimpleInvoice && (
            <div className="px-5 pb-5 text-sm text-gray-700 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 mb-3">
                小売業・飲食店・タクシー・バス・駐車場・旅行業など不特定多数を相手にする事業者は「簡易インボイス（適格簡易請求書）」が発行できます。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="text-left px-3 py-2 font-medium text-indigo-800 border border-indigo-100">記載事項</th>
                      <th className="text-center px-3 py-2 font-medium text-indigo-800 border border-indigo-100">適格請求書</th>
                      <th className="text-center px-3 py-2 font-medium text-indigo-800 border border-indigo-100">簡易インボイス</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["発行事業者名 + 登録番号", "必要", "必要"],
                      ["取引年月日", "必要", "必要"],
                      ["取引内容（軽減税率の旨）", "必要", "必要"],
                      ["税率ごとの対価の額 + 適用税率", "必要", "必要"],
                      ["税率ごとの消費税額等", "必要", "税率 or 消費税額のどちらか"],
                      ["交付を受ける事業者の氏名・名称", "必要", "不要"],
                    ].map(([item, full, simple]) => (
                      <tr key={item} className="border border-gray-100">
                        <td className="px-3 py-2 text-gray-700 border border-gray-100">{item}</td>
                        <td className="px-3 py-2 text-center text-emerald-600 font-medium border border-gray-100">{full}</td>
                        <td className="px-3 py-2 text-center border border-gray-100">
                          <span className={simple === "不要" ? "text-gray-400" : simple.startsWith("税率") ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                            {simple}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 2割特例（経過措置） */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowTransitionMeasure((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-gray-800 text-sm">2割特例（経過措置）について</span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showTransitionMeasure ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showTransitionMeasure && (
            <div className="px-5 pb-5 text-sm text-gray-700 border-t border-gray-100 pt-4 space-y-2">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <p className="font-bold mb-1">2割特例（2023年10月〜2026年9月末まで）</p>
                <p>
                  免税事業者からインボイス発行事業者に登録した事業者は、売上に係る消費税額の2割を納付税額とすることができます。
                  この特例を使う場合、確定申告書への記載が必要です。
                </p>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>適用期間: 2023年10月1日〜2026年9月30日を含む各課税期間</li>
                <li>適用対象: インボイス制度への登録を機に課税事業者になった事業者</li>
                <li>手続き: 事前届出不要。確定申告書に記載するだけで適用可</li>
                <li>注意: 2026年10月以降は通常の計算方法（原則課税 or 簡易課税）に戻ります</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ===== 免責注記 + リンク ===== */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs text-gray-500">
          本ツールは参考用です。記載内容の正確性・適法性の保証はできません。正確な判断は税理士・税務署等の専門家にご相談ください。
        </p>
        <a
          href="https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
          </svg>
          国税庁 インボイス制度特設ページ
        </a>
      </div>

      {/* ===== 使い方ガイド ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">適格請求書チェッカーの使い方</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "発行事業者名と登録番号を入力", desc: "「T」から始まる14桁の登録番号を入力するとリアルタイムで形式チェックします。国税庁の公表サイトで実在確認も行いましょう。" },
            { step: "2", title: "取引年月日・内容を入力", desc: "軽減税率（8%）対象品目が含まれる場合はチェックボックスをオンにしてください。「※」マーク等による明示が必要になります。" },
            { step: "3", title: "税率ごとの対価の額を入力", desc: "税込・税抜を切り替えて金額を入力すると消費税額が自動計算されます。端数処理方法（切捨て推奨）も選択できます。" },
            { step: "4", title: "6項目がすべて「OK」になれば適格請求書の要件を満たしています", desc: "不足項目がある場合は赤く表示されます。交付先名が不要な簡易インボイスとの違いも確認できます。" },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex gap-4">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* ===== FAQ ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-800">よくある質問（FAQ）</h2>
        {[
          {
            q: "適格請求書（インボイス）と従来の請求書の違いは何ですか？",
            a: "最大の違いは「登録番号」の記載です。適格請求書発行事業者として国税庁に登録した事業者のみが発行でき、買い手は仕入税額控除を受けるためにインボイスの保存が必要になりました。",
          },
          {
            q: "消費税の端数処理はどの方法が正しいですか？",
            a: "インボイス制度では切捨て・切上げ・四捨五入のいずれも認められています。ただし「1請求書につき税率ごとに1回」のみ端数処理ができます。実務では切捨てが一般的です。",
          },
          {
            q: "登録番号の「T」はどういう意味ですか？",
            a: "「T」はTaxpayer（納税者）の頭文字で、その後に13桁の法人番号または個人事業主用の番号が続きます。国税庁の「適格請求書発行事業者公表サイト」で有効性を検索できます。",
          },
          {
            q: "消費税の登録をしていない免税事業者はインボイスを発行できますか？",
            a: "発行できません。インボイス（適格請求書）は適格請求書発行事業者として登録した課税事業者のみが発行できます。免税事業者が発行できるのは「区分記載請求書」までです。",
          },
          {
            q: "宛名（交付先名）が省略できるケースはありますか？",
            a: "小売業・飲食店・タクシー・駐車場・旅行業など不特定多数を対象とする事業では「適格簡易請求書」が利用でき、宛名の記載が不要です。",
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <p className="text-sm font-semibold text-indigo-700 mb-1">Q. {q}</p>
            <p className="text-xs text-gray-600">A. {a}</p>
          </div>
        ))}
      </div>

      {/* ===== 関連ツール ===== */}
      <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
        <h2 className="text-sm font-semibold text-indigo-800 mb-3">関連ツール</h2>
        <div className="space-y-2">
          {[
            { href: "/tools/consumption-tax-choice", label: "簡易課税・本則課税 どっちが得？シミュレーター", desc: "インボイス登録後の課税方式を比較" },
            { href: "/tools/withholding-tax-calculator", label: "源泉徴収税額 計算ツール", desc: "報酬から源泉徴収額と手取りを計算" },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 transition-colors group">
              <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-indigo-700 group-hover:text-indigo-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ===== JSON-LD FAQPage ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "適格請求書（インボイス）と従来の請求書の違いは何ですか？",
                acceptedAnswer: { "@type": "Answer", text: "最大の違いは「登録番号」の記載です。適格請求書発行事業者として国税庁に登録した事業者のみが発行でき、買い手は仕入税額控除を受けるためにインボイスの保存が必要になりました。" },
              },
              {
                "@type": "Question",
                name: "消費税の端数処理はどの方法が正しいですか？",
                acceptedAnswer: { "@type": "Answer", text: "インボイス制度では切捨て・切上げ・四捨五入のいずれも認められています。ただし「1請求書につき税率ごとに1回」のみ端数処理ができます。" },
              },
              {
                "@type": "Question",
                name: "登録番号の「T」はどういう意味ですか？",
                acceptedAnswer: { "@type": "Answer", text: "「T」はTaxpayerの頭文字で、その後に13桁の法人番号または個人事業主用の番号が続きます。国税庁の公表サイトで有効性を検索できます。" },
              },
              {
                "@type": "Question",
                name: "消費税の登録をしていない免税事業者はインボイスを発行できますか？",
                acceptedAnswer: { "@type": "Answer", text: "発行できません。インボイスは適格請求書発行事業者として登録した課税事業者のみが発行できます。" },
              },
              {
                "@type": "Question",
                name: "宛名（交付先名）が省略できるケースはありますか？",
                acceptedAnswer: { "@type": "Answer", text: "小売業・飲食店・タクシー等では「適格簡易請求書」が利用でき、宛名の記載が不要です。" },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
