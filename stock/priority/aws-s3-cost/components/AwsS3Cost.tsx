"use client";

import { useState, useMemo } from "react";

// --- 料金データ ---

type StorageClass =
  | "standard"
  | "ia"
  | "glacier-instant"
  | "glacier-flexible"
  | "glacier-deep"
  | "express";

type Region = "us-east-1" | "ap-northeast-1" | "eu-west-1";

// リージョン別料金乗数
const REGION_MULTIPLIERS: Record<Region, number> = {
  "us-east-1": 1.0,
  "ap-northeast-1": 1.1,
  "eu-west-1": 1.05,
};

const REGION_LABELS: Record<Region, string> = {
  "us-east-1": "US East (バージニア北部)",
  "ap-northeast-1": "アジアパシフィック (東京) +10%",
  "eu-west-1": "EU (アイルランド) +5%",
};

// ストレージクラス定義
type StorageClassDef = {
  label: string;
  shortLabel: string;
  storagePerGB: number;   // USD/GB/月
  putPer1K: number;       // USD/1000リクエスト
  getPer1K: number;       // USD/1000リクエスト
  minStorageDays: number; // 最小保存期間（日）
  retrievalPerGB: number; // 取り出し料金 USD/GB（標準取り出し）
  color: string;
  desc: string;
};

const STORAGE_CLASSES: Record<StorageClass, StorageClassDef> = {
  standard: {
    label: "S3 Standard",
    shortLabel: "Standard",
    storagePerGB: 0.023,
    putPer1K: 0.005,
    getPer1K: 0.0004,
    minStorageDays: 0,
    retrievalPerGB: 0,
    color: "#FF9900",
    desc: "汎用ストレージ。高頻度アクセス向け",
  },
  ia: {
    label: "S3 Standard-IA",
    shortLabel: "Standard-IA",
    storagePerGB: 0.0125,
    putPer1K: 0.01,
    getPer1K: 0.001,
    minStorageDays: 30,
    retrievalPerGB: 0.01,
    color: "#F59E0B",
    desc: "低頻度アクセス。Standard より安価だが取り出し料金あり",
  },
  "glacier-instant": {
    label: "S3 Glacier Instant Retrieval",
    shortLabel: "Glacier Instant",
    storagePerGB: 0.004,
    putPer1K: 0.02,
    getPer1K: 0.01,
    minStorageDays: 90,
    retrievalPerGB: 0.03,
    color: "#3B82F6",
    desc: "アーカイブ。ミリ秒単位で取り出し可能",
  },
  "glacier-flexible": {
    label: "S3 Glacier Flexible Retrieval",
    shortLabel: "Glacier Flexible",
    storagePerGB: 0.0036,
    putPer1K: 0.033,
    getPer1K: 0.0004,
    minStorageDays: 90,
    retrievalPerGB: 0.01,
    color: "#8B5CF6",
    desc: "長期アーカイブ。取り出しに数分〜数時間かかる",
  },
  "glacier-deep": {
    label: "S3 Glacier Deep Archive",
    shortLabel: "Glacier Deep",
    storagePerGB: 0.00099,
    putPer1K: 0.05,
    getPer1K: 0.0004,
    minStorageDays: 180,
    retrievalPerGB: 0.02,
    color: "#6366F1",
    desc: "最安値アーカイブ。取り出しに最大48時間",
  },
  express: {
    label: "S3 Express One Zone",
    shortLabel: "Express One Zone",
    storagePerGB: 0.16,
    putPer1K: 0.0025,
    getPer1K: 0.0002,
    minStorageDays: 0,
    retrievalPerGB: 0,
    color: "#EF4444",
    desc: "超低レイテンシ。単一AZ・高スループット向け",
  },
};

// データ転送料金（us-east-1基準）
// 最初の100GBは無料、次の9.9TBは $0.09/GB
const TRANSFER_FREE_GB = 100;
const TRANSFER_RATE = 0.09; // USD/GB

// フォーマット
function fmtUSD(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtJPY(n: number): string {
  if (n < 1) return `${n.toFixed(2)}円`;
  return `${Math.round(n).toLocaleString("ja-JP")}円`;
}

function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

// 数値入力コンポーネント
function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm text-gray-700 flex-1">
          {label}
          {hint && <span className="text-xs text-gray-400 ml-1">({hint})</span>}
        </label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={min ?? 0}
            max={max}
            step={step ?? 1}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v >= (min ?? 0)) onChange(v);
            }}
            className="w-32 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
          <span className="text-xs text-gray-500 whitespace-nowrap">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

// コスト計算関数
function calcClassCost(
  cls: StorageClass,
  storageGB: number,
  putRequests: number,
  getRequests: number,
  retrievalGB: number,
  regionMul: number
): { storage: number; put: number; get: number; retrieval: number; total: number } {
  const def = STORAGE_CLASSES[cls];
  const storage = storageGB * def.storagePerGB * regionMul;
  const put = (putRequests / 1000) * def.putPer1K * regionMul;
  const get = (getRequests / 1000) * def.getPer1K * regionMul;
  const retrieval = retrievalGB * def.retrievalPerGB * regionMul;
  return { storage, put, get, retrieval, total: storage + put + get + retrieval };
}

// --- メインコンポーネント ---
export default function AwsS3Cost() {
  const [storageClass, setStorageClass] = useState<StorageClass>("standard");
  const [region, setRegion] = useState<Region>("us-east-1");
  const [storageGB, setStorageGB] = useState<number>(100);
  const [putRequests, setPutRequests] = useState<number>(100000);
  const [getRequests, setGetRequests] = useState<number>(1000000);
  const [retrievalGB, setRetrievalGB] = useState<number>(10);
  const [transferGB, setTransferGB] = useState<number>(50);
  const [exchangeRate, setExchangeRate] = useState<number>(150);

  const regionMul = REGION_MULTIPLIERS[region];

  const calc = useMemo(() => {
    const costs = calcClassCost(
      storageClass,
      storageGB,
      putRequests,
      getRequests,
      retrievalGB,
      regionMul
    );
    const billableTransfer = Math.max(0, transferGB - TRANSFER_FREE_GB);
    const transferCost = billableTransfer * TRANSFER_RATE * regionMul;
    const totalUSD = costs.total + transferCost;
    return { ...costs, transferCost, billableTransfer, totalUSD };
  }, [storageClass, storageGB, putRequests, getRequests, retrievalGB, transferGB, regionMul]);

  // クラス別コスト比較（同じ入力値で全クラス計算）
  const classCosts = useMemo(() => {
    return (Object.keys(STORAGE_CLASSES) as StorageClass[]).map((cls) => {
      const c = calcClassCost(cls, storageGB, putRequests, getRequests, retrievalGB, regionMul);
      const billableTransfer = Math.max(0, transferGB - TRANSFER_FREE_GB);
      const transferCost = billableTransfer * TRANSFER_RATE * regionMul;
      return { cls, total: c.total + transferCost };
    });
  }, [storageGB, putRequests, getRequests, retrievalGB, transferGB, regionMul]);

  const maxClassCost = Math.max(...classCosts.map((c) => c.total), 0.0001);

  const def = STORAGE_CLASSES[storageClass];

  // ライフサイクルポリシー提案
  const lifecycleSuggestion = useMemo(() => {
    if (storageClass !== "standard") return null;
    const stdCost = classCosts.find((c) => c.cls === "standard")?.total ?? 0;
    const iaCost = classCosts.find((c) => c.cls === "ia")?.total ?? 0;
    const glacierInstantCost = classCosts.find((c) => c.cls === "glacier-instant")?.total ?? 0;
    const saving = stdCost - iaCost;
    const bigSaving = stdCost - glacierInstantCost;
    if (saving > 1) {
      return {
        target: "Standard-IA",
        saving,
        bigTarget: "Glacier Instant",
        bigSaving,
      };
    }
    return null;
  }, [storageClass, classCosts]);

  return (
    <div className="space-y-6">

      {/* ===== ストレージクラス選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ストレージクラス</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.entries(STORAGE_CLASSES) as [StorageClass, StorageClassDef][]).map(
            ([id, d]) => (
              <button
                key={id}
                onClick={() => setStorageClass(id)}
                className={`flex flex-col px-4 py-3 rounded-xl border text-left transition-all ${
                  storageClass === id
                    ? "bg-orange-50 border-[#FF9900] ring-2 ring-orange-200 shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50/30 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      storageClass === id ? "text-[#FF9900]" : "text-gray-800"
                    }`}
                  >
                    {d.shortLabel}
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    ${d.storagePerGB}/GB
                  </span>
                </div>
                <span className="text-xs text-gray-500 leading-snug">{d.desc}</span>
                {d.minStorageDays > 0 && (
                  <span className="mt-1.5 text-xs text-amber-600 font-medium">
                    最小保存期間: {d.minStorageDays}日
                  </span>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* ===== リージョン選択 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">リージョン</h2>
        <div className="flex flex-col gap-2">
          {(Object.keys(REGION_LABELS) as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-left transition-all ${
                region === r
                  ? "bg-orange-50 border-[#FF9900] ring-1 ring-orange-200"
                  : "bg-gray-50 border-gray-200 hover:bg-orange-50/30 hover:border-orange-200"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  region === r ? "text-[#FF9900]" : "text-gray-700"
                }`}
              >
                {REGION_LABELS[r]}
              </span>
              <span className="text-xs text-gray-400 font-mono">{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== 使用量入力 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">使用量</h2>
        <p className="text-xs text-gray-500 mb-5">月間の容量・リクエスト数・転送量を入力してください。</p>
        <div className="space-y-5">
          <NumericInput
            label="ストレージ容量"
            value={storageGB}
            onChange={setStorageGB}
            step={10}
            suffix="GB"
          />
          <NumericInput
            label="PUT / COPY / POST / LIST リクエスト"
            value={putRequests}
            onChange={setPutRequests}
            step={10000}
            suffix="リクエスト/月"
            hint={`$${def.putPer1K}/1,000件`}
          />
          <NumericInput
            label="GET / SELECT / その他リクエスト"
            value={getRequests}
            onChange={setGetRequests}
            step={100000}
            suffix="リクエスト/月"
            hint={`$${def.getPer1K}/1,000件`}
          />
          {def.retrievalPerGB > 0 && (
            <NumericInput
              label="データ取り出し量"
              value={retrievalGB}
              onChange={setRetrievalGB}
              step={1}
              suffix="GB/月"
              hint={`$${def.retrievalPerGB}/GB`}
            />
          )}
          <NumericInput
            label="インターネットへの転送量"
            value={transferGB}
            onChange={setTransferGB}
            step={10}
            suffix="GB/月"
            hint={`最初${TRANSFER_FREE_GB}GBまで無料`}
          />
        </div>

        {/* 転送料金の可視化 */}
        <div className="mt-5 p-4 bg-orange-50 rounded-xl border border-orange-100">
          <div className="text-xs font-semibold text-orange-800 mb-2">データ転送料金</div>
          <div className="text-xs text-orange-700 space-y-1">
            <div className="flex justify-between">
              <span>転送量合計: {fmtNum(transferGB)} GB</span>
              <span>無料枠: {TRANSFER_FREE_GB} GB</span>
            </div>
            <div className="flex justify-between font-medium border-t border-orange-200 pt-1 mt-1">
              <span>課金対象</span>
              <span>{fmtNum(calc.billableTransfer)} GB × $0.09/GB</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>転送コスト</span>
              <span>{fmtUSD(calc.transferCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 為替レート ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">為替レート</h2>
        <div className="flex items-center gap-2 w-fit">
          <span className="text-sm text-gray-500">1 USD =</span>
          <input
            type="number"
            min={50}
            max={500}
            step={1}
            value={exchangeRate}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v) && v > 0) setExchangeRate(v);
            }}
            className="w-24 px-2 py-1.5 text-right border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
          />
          <span className="text-sm text-gray-500">円</span>
        </div>
      </div>

      {/* ===== 計算結果 ===== */}
      <div className="rounded-2xl shadow-sm border border-[#FF9900] p-6 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900">月額コスト</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-[#CC7A00] border border-orange-200"
            >
              {def.shortLabel}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {region}
            </span>
          </div>
        </div>

        {/* 合計 */}
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-1">月額合計</div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-bold text-gray-900">{fmtUSD(calc.totalUSD)}</span>
            <span className="text-2xl text-gray-600">{fmtJPY(calc.totalUSD * exchangeRate)}</span>
          </div>
        </div>

        {/* 内訳カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">ストレージ</div>
            <div className="text-lg font-bold text-gray-900">{fmtUSD(calc.storage)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.storage * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {fmtNum(storageGB)} GB × ${def.storagePerGB}/GB
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">PUTリクエスト</div>
            <div className="text-lg font-bold text-gray-900">{fmtUSD(calc.put)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.put * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {fmtNum(putRequests)}件 × ${def.putPer1K}/1K
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">GETリクエスト</div>
            <div className="text-lg font-bold text-gray-900">{fmtUSD(calc.get)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.get * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {fmtNum(getRequests)}件 × ${def.getPer1K}/1K
            </div>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">転送料金</div>
            <div className="text-lg font-bold text-gray-900">{fmtUSD(calc.transferCost)}</div>
            <div className="text-xs text-gray-400 mt-0.5">{fmtJPY(calc.transferCost * exchangeRate)}</div>
            <div className="text-xs text-gray-400 mt-1">
              課金分 {fmtNum(calc.billableTransfer)} GB
            </div>
          </div>
        </div>

        {/* 詳細内訳 */}
        <div className="p-4 bg-white bg-opacity-60 rounded-xl text-xs text-gray-600 space-y-2">
          <div className="font-medium text-gray-700 mb-2">コスト内訳</div>
          <div className="flex justify-between">
            <span>ストレージ ({fmtNum(storageGB)} GB × ${def.storagePerGB}/GB)</span>
            <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.storage)}</span>
          </div>
          <div className="flex justify-between">
            <span>PUT/COPY/POST/LIST ({fmtNum(putRequests)}件 × ${def.putPer1K}/1,000件)</span>
            <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.put)}</span>
          </div>
          <div className="flex justify-between">
            <span>GET/SELECT/その他 ({fmtNum(getRequests)}件 × ${def.getPer1K}/1,000件)</span>
            <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.get)}</span>
          </div>
          {calc.retrieval > 0 && (
            <div className="flex justify-between">
              <span>データ取り出し ({fmtNum(retrievalGB)} GB × ${def.retrievalPerGB}/GB)</span>
              <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.retrieval)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>
              データ転送 ({fmtNum(transferGB)} GB、うち課金分 {fmtNum(calc.billableTransfer)} GB × $0.09/GB)
            </span>
            <span className="font-medium ml-4 shrink-0">{fmtUSD(calc.transferCost)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 mt-1 font-semibold text-gray-800">
            <span>合計</span>
            <span>{fmtUSD(calc.totalUSD)}</span>
          </div>
        </div>
      </div>

      {/* ===== クラス別コスト比較 ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">ストレージクラス別コスト比較</h2>
        <p className="text-xs text-gray-500 mb-4">
          同じ使用量で各クラスを選んだ場合の月額コスト
        </p>
        <div className="space-y-3">
          {classCosts.map(({ cls, total }) => {
            const d = STORAGE_CLASSES[cls];
            const barPct = maxClassCost > 0 ? (total / maxClassCost) * 100 : 0;
            const isSelected = cls === storageClass;
            return (
              <div key={cls}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium w-40 ${
                      isSelected ? "text-[#FF9900]" : "text-gray-700"
                    }`}
                  >
                    {d.shortLabel}
                    {isSelected && <span className="ml-1 text-xs">(選択中)</span>}
                  </span>
                  <div className="text-sm font-semibold text-gray-900">
                    {fmtUSD(total)}
                    <span className="text-xs text-gray-500 ml-1">
                      {fmtJPY(total * exchangeRate)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このAWS S3 料金計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">AWS S3の月額料金をストレージクラス・容量・リクエスト数・転送量から計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このAWS S3 料金計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "AWS S3の月額料金をストレージクラス・容量・リクエスト数・転送量から計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
      </div>

      {/* ===== ライフサイクルポリシー提案 ===== */}
      {lifecycleSuggestion && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">ライフサイクルポリシーの提案</h2>
          <p className="text-xs text-gray-500 mb-4">
            アクセス頻度に応じてクラスを自動移行することでコストを削減できます。
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-xs text-green-700">
              <strong>Standard → Standard-IA に移行</strong>すると月額{" "}
              <strong>{fmtUSD(lifecycleSuggestion.saving)}</strong> 節約できます。
              30日以上アクセスのないオブジェクトを対象にすると効果的です。
            </div>
            {lifecycleSuggestion.bigSaving > 1 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                <strong>Standard → Glacier Instant Retrieval に移行</strong>すると月額{" "}
                <strong>{fmtUSD(lifecycleSuggestion.bigSaving)}</strong> 節約できます。
                90日以上アクセスのないアーカイブデータに最適です。
              </div>
            )}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
              <div className="font-medium mb-1">移行ルールの例</div>
              <div className="font-mono bg-white rounded p-2 border border-gray-200 mt-1 leading-relaxed">
                {`作成後 30日 → Standard-IA\n作成後 90日 → Glacier Instant\n作成後 180日 → Glacier Deep Archive`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 注記 ===== */}
      <p className="text-xs text-gray-400 text-center pb-4">
        料金は変更される場合があります。リージョン別料金の差異は概算です。最新の料金は{" "}
        <a
          href="https://aws.amazon.com/s3/pricing/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#FF9900] transition-colors"
        >
          AWS S3 料金ページ
        </a>
        {" "}をご確認ください。
      </p>
    </div>
  );
}
