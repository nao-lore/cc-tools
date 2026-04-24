"use client";

import { useState, useMemo } from "react";

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function addMonths(month: number, add: number): { month: number; note?: string } {
  // month is 1-indexed
  const m = ((month - 1 + add) % 12) + 1;
  return { month: m };
}

function monthLabel(m: number) {
  return MONTHS[m - 1];
}

interface DeadlineItem {
  label: string;
  deadline: string;
  category: "tax" | "filing" | "payment" | "interim";
  description: string;
}

function calcDeadlines(fiscalEndMonth: number, extensionGranted: boolean): DeadlineItem[] {
  const ext = extensionGranted ? 1 : 0;
  // 決算月 = fiscalEndMonth
  // 翌月 = +1, +2等
  const m = (add: number) => monthLabel(((fiscalEndMonth - 1 + add) % 12) + 1);
  const items: DeadlineItem[] = [];

  // 決算期末
  items.push({
    label: "事業年度末",
    deadline: `${monthLabel(fiscalEndMonth)}末日`,
    category: "filing",
    description: "決算日。この日をもって事業年度が終了します",
  });

  // 決算整理・棚卸
  items.push({
    label: "決算整理・棚卸",
    deadline: `${m(1)}中`,
    category: "filing",
    description: "棚卸資産の計上、減価償却費の計算、引当金の設定等",
  });

  // 法人税申告期限
  const corpTaxMonth = fiscalEndMonth + 2 + ext;
  items.push({
    label: "法人税・法人住民税・法人事業税 申告・納付",
    deadline: `${m(2 + ext)}末日`,
    category: "tax",
    description: extensionGranted
      ? "申告期限延長あり（原則2ヶ月→1ヶ月延長、利子税が発生）"
      : "決算月末から2ヶ月以内（原則）",
  });

  // 消費税申告
  items.push({
    label: "消費税・地方消費税 申告・納付",
    deadline: `${m(2 + ext)}末日`,
    category: "tax",
    description: "法人の消費税申告期限は法人税に準じます（延長は1ヶ月）",
  });

  // 源泉所得税
  items.push({
    label: "源泉所得税 納付（毎月）",
    deadline: "翌月10日",
    category: "payment",
    description: "給与・報酬等の源泉徴収税は翌月10日まで（納期特例は半年毎）",
  });

  // 法定調書
  const legalDocMonth = m(4); // 翌々年1月（簡略化: +4ヶ月 ではなく固定）
  items.push({
    label: "法定調書合計表 提出",
    deadline: "翌年1月31日",
    category: "filing",
    description: "支払調書・源泉徴収票・法定調書合計表。翌年1月31日まで",
  });

  // 償却資産税
  items.push({
    label: "償却資産税 申告",
    deadline: "翌年1月31日",
    category: "filing",
    description: "固定資産税のうち償却資産分。市区町村へ申告",
  });

  // 中間申告（法人税）
  const interimMonth = ((fiscalEndMonth - 1 + 8) % 12) + 1; // 事業年度開始から8ヶ月後
  items.push({
    label: "法人税 中間申告（予定申告）",
    deadline: `${monthLabel(interimMonth)}末日`,
    category: "interim",
    description: "事業年度開始から6ヶ月を経過した日から2ヶ月以内。前期税額の半分を納付",
  });

  // 消費税中間申告
  items.push({
    label: "消費税 中間申告",
    deadline: `${monthLabel(interimMonth)}末日`,
    category: "interim",
    description: "前年の消費税額が48万円超の場合に中間申告が必要",
  });

  // 賞与支払届
  items.push({
    label: "賞与支払届（賞与支払月翌月）",
    deadline: "賞与支払月の翌月5日",
    category: "filing",
    description: "健康保険・厚生年金の賞与支払届。支払日から5日以内",
  });

  return items;
}

const CATEGORY_COLORS = {
  tax: "bg-red-100 text-red-700 border-red-200",
  filing: "bg-blue-100 text-blue-700 border-blue-200",
  payment: "bg-orange-100 text-orange-700 border-orange-200",
  interim: "bg-purple-100 text-purple-700 border-purple-200",
};

const CATEGORY_LABELS = {
  tax: "申告・納税",
  filing: "届出・書類",
  payment: "納付",
  interim: "中間申告",
};

export default function KettouseiKeisan() {
  const [fiscalEndMonth, setFiscalEndMonth] = useState(3);
  const [extensionGranted, setExtensionGranted] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const deadlines = useMemo(() => calcDeadlines(fiscalEndMonth, extensionGranted), [fiscalEndMonth, extensionGranted]);

  const fiscalStartMonth = ((fiscalEndMonth - 2 + 12) % 12) + 1;

  const filtered = filterCategory === "all" ? deadlines : deadlines.filter((d) => d.category === filterCategory);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">事業年度を設定</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">決算月（事業年度末）</label>
            <select value={fiscalEndMonth} onChange={(e) => setFiscalEndMonth(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="ext" checked={extensionGranted} onChange={(e) => setExtensionGranted(e.target.checked)} className="rounded" />
            <label htmlFor="ext" className="text-sm font-medium text-gray-700">
              申告期限の延長申請あり（法人税1ヶ月延長）
            </label>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm">
          <p className="font-semibold text-gray-700">
            事業年度: {monthLabel(fiscalStartMonth)}〜{monthLabel(fiscalEndMonth)}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            法人税申告期限: {monthLabel(((fiscalEndMonth - 1 + 2 + (extensionGranted ? 1 : 0)) % 12) + 1)}末日
          </p>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "すべて" },
          { value: "tax", label: "申告・納税" },
          { value: "filing", label: "届出・書類" },
          { value: "payment", label: "納付" },
          { value: "interim", label: "中間申告" },
        ].map((f) => (
          <button key={f.value} onClick={() => setFilterCategory(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${filterCategory === f.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* タイムライン */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">届出・申告スケジュール</h2>
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="mt-0.5">
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full border ${CATEGORY_COLORS[item.category]}`}>
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{item.deadline}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 年間カレンダー */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">主要イベント 年間カレンダー</h2>
        <div className="grid grid-cols-12 gap-1 text-xs">
          {MONTHS.map((m, i) => {
            const monthNum = i + 1;
            const isFiscalEnd = monthNum === fiscalEndMonth;
            const isFiscalStart = monthNum === fiscalStartMonth;
            const corpTaxDue = monthNum === ((fiscalEndMonth - 1 + 2 + (extensionGranted ? 1 : 0)) % 12) + 1;
            const interimMonth = ((fiscalEndMonth - 1 + 8) % 12) + 1;
            const isInterim = monthNum === interimMonth;

            return (
              <div key={i} className={`p-2 rounded text-center ${isFiscalEnd ? "bg-red-100" : isFiscalStart ? "bg-green-100" : corpTaxDue ? "bg-orange-100" : isInterim ? "bg-purple-100" : "bg-gray-50"}`}>
                <p className="font-semibold">{m.replace("月", "")}</p>
                {isFiscalStart && <p className="text-green-700 mt-1">期首</p>}
                {isFiscalEnd && <p className="text-red-700 mt-1">決算</p>}
                {corpTaxDue && <p className="text-orange-700 mt-1">申告</p>}
                {isInterim && !corpTaxDue && <p className="text-purple-700 mt-1">中間</p>}
              
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この決算期 届出期限計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">決算月を入力すると法人税・消費税・確定申告などの各届出期限を自動逆算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この決算期 届出期限計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "決算月を入力すると法人税・消費税・確定申告などの各届出期限を自動逆算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 inline-block"></span>期首</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block"></span>決算</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 inline-block"></span>申告期限</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-100 inline-block"></span>中間申告</span>
        </div>
      </div>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "決算期 届出期限計算",
  "description": "決算月を入力すると法人税・消費税・確定申告などの各届出期限を自動逆算",
  "url": "https://tools.loresync.dev/kettousei-keisan",
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
