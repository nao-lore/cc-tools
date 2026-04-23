"use client";

import { useState, useMemo } from "react";

const USD_TO_JPY = 150;

interface Plan {
  name: string;
  pricePerMemberUSD: number;
  pricePerMemberAnnualUSD: number;
  freeGuests: number;
  guestPriceUSD: number;
  fileUploadMB: number;
  apiCalls: string;
  features: string[];
  color: string;
  description: string;
}

const PLANS: Plan[] = [
  {
    name: "Free",
    pricePerMemberUSD: 0,
    pricePerMemberAnnualUSD: 0,
    freeGuests: 10,
    guestPriceUSD: 0,
    fileUploadMB: 5,
    apiCalls: "制限あり",
    features: ["無制限ページ", "基本ブロック", "APIアクセス", "10ゲストまで無料"],
    color: "gray",
    description: "個人・小チームに",
  },
  {
    name: "Plus",
    pricePerMemberUSD: 10,
    pricePerMemberAnnualUSD: 8,
    freeGuests: 100,
    guestPriceUSD: 0,
    fileUploadMB: 5,
    apiCalls: "無制限",
    features: ["無制限ファイルアップロード", "バージョン履歴（30日）", "カスタムドメイン", "ゲスト100人まで"],
    color: "blue",
    description: "小〜中規模チームに",
  },
  {
    name: "Business",
    pricePerMemberUSD: 18,
    pricePerMemberAnnualUSD: 15,
    freeGuests: 250,
    guestPriceUSD: 0,
    fileUploadMB: 5,
    apiCalls: "無制限",
    features: ["SAML SSO", "バージョン履歴（90日）", "高度なページ分析", "ゲスト250人まで", "プライベートチームスペース"],
    color: "indigo",
    description: "中〜大規模ビジネスに",
  },
  {
    name: "Enterprise",
    pricePerMemberUSD: 0,
    pricePerMemberAnnualUSD: 0,
    freeGuests: 999,
    guestPriceUSD: 0,
    fileUploadMB: 999,
    apiCalls: "無制限",
    features: ["カスタム契約", "高度なセキュリティ", "専任CSM", "監査ログ", "無制限バージョン履歴"],
    color: "purple",
    description: "大企業向け（要問い合わせ）",
  },
];

function getPlanBg(color: string, selected: boolean) {
  if (!selected) return "bg-white border-gray-200";
  const map: Record<string, string> = {
    gray: "bg-gray-50 border-gray-400",
    blue: "bg-blue-50 border-blue-400",
    indigo: "bg-indigo-50 border-indigo-400",
    purple: "bg-purple-50 border-purple-400",
  };
  return map[color] ?? "bg-white border-gray-200";
}

export default function NotionApiCost() {
  const [members, setMembers] = useState(5);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [usdRate, setUsdRate] = useState(USD_TO_JPY);

  const results = useMemo(() => {
    return PLANS.map((plan) => {
      const priceUSD =
        billing === "annual" ? plan.pricePerMemberAnnualUSD : plan.pricePerMemberUSD;
      const monthlyUSD = priceUSD * members;
      const monthlyJPY = monthlyUSD * usdRate;
      const annualUSD = monthlyUSD * 12;
      const annualJPY = annualUSD * usdRate;
      return { ...plan, priceUSD, monthlyUSD, monthlyJPY, annualUSD, annualJPY };
    });
  }, [members, billing, usdRate]);

  const recommended = results.find((r) => r.monthlyUSD > 0) ?? results[0];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">利用条件を設定</h2>

        <div className="mb-5">
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">メンバー数（有料シート）</label>
            <span className="text-sm font-bold text-indigo-600">{members} 人</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={members}
            onChange={(e) => setMembers(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>1人</span><span>100人</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">支払いサイクル</label>
          <div className="flex gap-2">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  billing === b
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {b === "monthly" ? "月払い" : "年払い（約20%オフ）"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">為替レート（1 USD =）</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={usdRate}
              min={100}
              max={200}
              step={1}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="text-sm text-gray-600">円</span>
          </div>
        </div>
      </div>

      {/* Plan comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border-2 p-5 transition-all ${getPlanBg(plan.color, plan.name === recommended.name)}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-xs text-gray-500">{plan.description}</p>
              </div>
              {plan.name === recommended.name && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  おすすめ
                </span>
              )}
            </div>

            {plan.name === "Enterprise" ? (
              <div className="text-lg font-bold text-gray-700 mb-4">要問い合わせ</div>
            ) : plan.monthlyUSD === 0 ? (
              <div className="text-2xl font-bold text-gray-900 mb-1">
                無料
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  ¥{Math.round(plan.monthlyJPY).toLocaleString("ja-JP")}
                  <span className="text-sm font-normal text-gray-500">/月</span>
                </div>
                <div className="text-xs text-gray-500 mb-3">
                  ${plan.priceUSD}/人/月 × {members}人 = ${plan.monthlyUSD.toFixed(0)}/月
                </div>
                {billing === "annual" && (
                  <div className="text-xs text-green-600 mb-3">
                    年間: ¥{Math.round(plan.annualJPY).toLocaleString("ja-JP")}（${plan.annualUSD.toFixed(0)}）
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5 text-sm mb-3">
              <div className="flex justify-between">
                <span className="text-gray-600">無料ゲスト</span>
                <span className="font-medium">{plan.freeGuests === 999 ? "無制限" : `${plan.freeGuests}人まで`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ファイルアップロード</span>
                <span className="font-medium">{plan.fileUploadMB === 999 ? "無制限" : `${plan.fileUploadMB}MBまで`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">API呼び出し</span>
                <span className="font-medium">{plan.apiCalls}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex flex-wrap gap-1">
                {plan.features.map((f) => (
                  <span key={f} className="bg-white bg-opacity-60 border border-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cost comparison table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">メンバー数別 月額コスト（Plusプラン）</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">メンバー数</th>
                <th className="text-right px-4 py-2 text-gray-600">月払い</th>
                <th className="text-right px-4 py-2 text-gray-600">年払い（月換算）</th>
                <th className="text-right px-4 py-2 text-gray-600">年払い節約額</th>
              </tr>
            </thead>
            <tbody>
              {[1, 3, 5, 10, 20, 50].map((n) => {
                const monthly = 10 * n * usdRate;
                const annual = 8 * n * usdRate;
                const saving = (monthly - annual) * 12;
                return (
                  <tr
                    key={n}
                    className={`border-t border-gray-100 ${n === members ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {n}人{n === members && <span className="ml-2 text-xs text-indigo-600">← 現在</span>}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      ¥{Math.round(monthly).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-700">
                      ¥{Math.round(annual).toLocaleString("ja-JP")}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600 font-medium">
                      ¥{Math.round(saving).toLocaleString("ja-JP")}/年
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
        <p>※ 料金は2024年時点のNotion公式料金をもとにした概算です。</p>
        <p>※ Notion AIは別途 $10/メンバー/月が必要です。</p>
        <p>※ 教育機関・非営利団体向けの割引プランが別途あります。</p>
      </div>
    </div>
  );
}
