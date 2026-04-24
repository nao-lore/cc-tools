"use client";

import { useState, useMemo } from "react";

type Sunshine = "屋外直射" | "屋外日陰" | "屋内";
type Activity = "安静" | "軽作業" | "運動" | "激しい運動";

// WBGT近似: 湿球温度Tw = Ta × atan(0.151977 × (RH+8.313659)^0.5) + atan(Ta+RH)
// - atan(RH-1.676331) + 0.00391838 × RH^1.5 × atan(0.023101 × RH) - 4.686035
// 簡易版: Tw ≈ Ta × 0.55 + (Ta × RH / 100) × 0.45 * 0.65
// 公式: WBGT = 0.735×Tw + 0.0374×Tg + 0.0292×Ta
// 黒球温度Tg補正: 屋外直射 +8, 屋外日陰 +2, 屋内 0
const SUNSHINE_TG_OFFSET: Record<Sunshine, number> = {
  屋外直射: 8,
  屋外日陰: 2,
  屋内: 0,
};

// 活動レベル補正（WBGT加算）
const ACTIVITY_WBGT_OFFSET: Record<Activity, number> = {
  安静: 0,
  軽作業: 1,
  運動: 2,
  激しい運動: 3,
};

type RiskLevel = "危険" | "厳重警戒" | "警戒" | "注意" | "ほぼ安全";

interface RiskInfo {
  level: RiskLevel;
  color: string;
  bgColor: string;
  borderColor: string;
  gaugeColor: string;
  textColor: string;
  suggestions: string[];
}

const RISK_MAP: RiskInfo[] = [
  {
    level: "危険",
    color: "bg-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    gaugeColor: "#dc2626",
    textColor: "text-red-700",
    suggestions: [
      "運動・屋外活動を中止してください",
      "涼しい室内に直ちに移動してください",
      "体調不良があれば迷わず救急へ",
      "水分・塩分をこまめに補給してください",
      "一人での外出は避けてください",
    ],
  },
  {
    level: "厳重警戒",
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    gaugeColor: "#f97316",
    textColor: "text-orange-700",
    suggestions: [
      "激しい運動・長時間の屋外活動は中止を推奨",
      "30分に1回以上、水分を補給してください",
      "日陰・冷房環境を積極的に活用してください",
      "体調の変化に常に注意してください",
      "高齢者・子どもは特に注意が必要です",
    ],
  },
  {
    level: "警戒",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    gaugeColor: "#eab308",
    textColor: "text-yellow-700",
    suggestions: [
      "運動・作業の強度を落としてください",
      "定期的に水分を補給してください（1時間に500ml目安）",
      "帽子・日傘を活用してください",
      "適度に休憩を挟んでください",
      "体調が悪いと感じたら無理しないでください",
    ],
  },
  {
    level: "注意",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    gaugeColor: "#3b82f6",
    textColor: "text-blue-700",
    suggestions: [
      "一般的な熱中症対策を心がけてください",
      "水分補給を忘れずに",
      "直射日光を長時間浴びないよう注意してください",
      "体調に変化があれば休憩してください",
    ],
  },
  {
    level: "ほぼ安全",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    gaugeColor: "#22c55e",
    textColor: "text-green-700",
    suggestions: [
      "通常の活動が可能な環境です",
      "水分補給を習慣にしてください",
      "体調の変化には引き続き注意してください",
    ],
  },
];

function calcWbgt(temp: number, humidity: number, sunshine: Sunshine): number {
  // 湿球温度の近似 (Stull 2011 簡易式)
  const tw =
    temp * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) +
    Math.atan(temp + humidity) -
    Math.atan(humidity - 1.676331) +
    0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) -
    4.686035;

  // 黒球温度近似
  const tg = temp + SUNSHINE_TG_OFFSET[sunshine];

  // WBGT = 0.735×Tw + 0.0374×Tg + 0.0292×Ta
  return 0.735 * tw + 0.0374 * tg + 0.0292 * temp;
}

function getRiskInfo(wbgt: number): RiskInfo {
  if (wbgt >= 31) return RISK_MAP[0];
  if (wbgt >= 28) return RISK_MAP[1];
  if (wbgt >= 25) return RISK_MAP[2];
  if (wbgt >= 21) return RISK_MAP[3];
  return RISK_MAP[4];
}

// ゲージの0-100%変換: WBGT 15〜36の範囲をマップ
function wbgtToGaugePct(wbgt: number): number {
  const min = 15;
  const max = 36;
  return Math.min(100, Math.max(0, ((wbgt - min) / (max - min)) * 100));
}

type OptionGroupProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

function OptionGroup({ label, options, value, onChange }: OptionGroupProps) {
  return (
    <div>
      <label className="block text-xs text-muted mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              value === opt
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-foreground hover:border-primary/50"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function NechuushouShisuu() {
  const [temp, setTemp] = useState(32);
  const [humidity, setHumidity] = useState(70);
  const [sunshine, setSunshine] = useState<Sunshine>("屋外日陰");
  const [activity, setActivity] = useState<Activity>("軽作業");

  const result = useMemo(() => {
    const baseWbgt = calcWbgt(temp, humidity, sunshine);
    const adjustedWbgt = baseWbgt + ACTIVITY_WBGT_OFFSET[activity];
    const risk = getRiskInfo(adjustedWbgt);
    const gaugePct = wbgtToGaugePct(adjustedWbgt);
    return { wbgt: adjustedWbgt, risk, gaugePct };
  }, [temp, humidity, sunshine, activity]);

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-base mb-4">環境条件を入力</h2>

        <div className="space-y-5">
          {/* 気温スライダー */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted">気温</label>
              <span className="text-sm font-bold text-primary">{temp}℃</span>
            </div>
            <input
              type="range"
              min={0}
              max={45}
              step={1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0℃</span>
              <span>45℃</span>
            </div>
          </div>

          {/* 湿度スライダー */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-muted">湿度</label>
              <span className="text-sm font-bold text-primary">{humidity}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <OptionGroup
            label="日差し・環境"
            options={["屋外直射", "屋外日陰", "屋内"]}
            value={sunshine}
            onChange={(v) => setSunshine(v as Sunshine)}
          />

          <OptionGroup
            label="活動レベル"
            options={["安静", "軽作業", "運動", "激しい運動"]}
            value={activity}
            onChange={(v) => setActivity(v as Activity)}
          />
        </div>
      </div>

      {/* Result card */}
      <div
        className={`rounded-xl border-2 p-5 shadow-sm ${result.risk.bgColor} ${result.risk.borderColor}`}
      >
        {/* リスクレベル */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted">熱中症危険度</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-bold ${result.risk.color} text-white`}
          >
            {result.risk.level}
          </span>
        </div>

        {/* WBGT 数値 */}
        <p className={`text-5xl font-bold mb-1 ${result.risk.textColor}`}>
          {result.wbgt.toFixed(1)}
          <span className="text-xl font-semibold ml-1">℃ WBGT</span>
        </p>

        {/* カラーゲージ */}
        <div className="mt-4 mb-1">
          <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-600">
            {/* 針 */}
            <div
              className="absolute top-0 h-full w-1 bg-white shadow-md rounded-full transition-all duration-500"
              style={{ left: `calc(${result.gaugePct}% - 2px)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>ほぼ安全</span>
            <span>注意</span>
            <span>警戒</span>
            <span>厳重</span>
            <span>危険</span>
          </div>
        </div>

        {/* WBGTの閾値説明 */}
        <div className="mt-4 rounded-lg bg-white/60 border border-white/40 px-4 py-2 text-xs text-muted font-mono">
          WBGT 31+ : 危険 / 28-31 : 厳重警戒 / 25-28 : 警戒 / 21-25 : 注意 / ～21 : ほぼ安全
        </div>
      </div>

      {/* 対策カード */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">推奨対策</h3>
        <ul className="space-y-2">
          {result.risk.suggestions.map((s) => (
            <li key={s} className="flex items-start gap-2 text-sm">
              <span className={`mt-0.5 shrink-0 font-bold ${result.risk.textColor}`}>•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 補正内訳 */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-3">計算内訳</h3>
        <div className="space-y-1 text-sm">
          {[
            { label: "基本WBGT（気温・湿度）", value: `${(result.wbgt - ACTIVITY_WBGT_OFFSET[activity]).toFixed(1)}℃` },
            { label: `活動補正（${activity}）`, value: `+${ACTIVITY_WBGT_OFFSET[activity]}℃` },
            { label: `日差し補正（${sunshine}）`, value: `黒球+${SUNSHINE_TG_OFFSET[sunshine]}℃` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between px-3 py-2 rounded-lg bg-accent">
              <span className="text-muted">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">
          ※ WBGT = 0.735×湿球温度 + 0.0374×黒球温度 + 0.0292×気温（Stull 2011近似式）
        </p>
      </div>

      {/* Ad placeholder */}
      <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-border text-xs text-muted bg-muted/20">
        広告
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この熱中症リスク指数 計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">気温・湿度・活動内容から熱中症危険度を判定。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この熱中症リスク指数 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "気温・湿度・活動内容から熱中症危険度を判定。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
