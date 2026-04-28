"use client";

import { useState, useMemo } from "react";

type Lang = "ja" | "en";

type ZonePreset = {
  label: string;
  labelEn: string;
  group: string;
  groupEn: string;
  kenpei: number;
  yoseki: number;
};

const ZONE_PRESETS: ZonePreset[] = [
  { label: "第一種低層住居専用 (30/50)", labelEn: "Class-1 Low-rise (30/50)", group: "住宅系", groupEn: "Residential", kenpei: 30, yoseki: 50 },
  { label: "第一種低層住居専用 (40/60)", labelEn: "Class-1 Low-rise (40/60)", group: "住宅系", groupEn: "Residential", kenpei: 40, yoseki: 60 },
  { label: "第一種低層住居専用 (50/80)", labelEn: "Class-1 Low-rise (50/80)", group: "住宅系", groupEn: "Residential", kenpei: 50, yoseki: 80 },
  { label: "第一種中高層住居専用 (60/200)", labelEn: "Class-1 Mid-rise (60/200)", group: "住宅系", groupEn: "Residential", kenpei: 60, yoseki: 200 },
  { label: "第一種住居地域 (60/200)", labelEn: "Class-1 Residential (60/200)", group: "住宅系", groupEn: "Residential", kenpei: 60, yoseki: 200 },
  { label: "第二種住居地域 (60/300)", labelEn: "Class-2 Residential (60/300)", group: "住宅系", groupEn: "Residential", kenpei: 60, yoseki: 300 },
  { label: "準住居地域 (60/300)", labelEn: "Quasi-residential (60/300)", group: "住宅系", groupEn: "Residential", kenpei: 60, yoseki: 300 },
  { label: "近隣商業地域 (80/300)", labelEn: "Neighborhood Commercial (80/300)", group: "商業系", groupEn: "Commercial", kenpei: 80, yoseki: 300 },
  { label: "商業地域 (80/400)", labelEn: "Commercial (80/400)", group: "商業系", groupEn: "Commercial", kenpei: 80, yoseki: 400 },
  { label: "商業地域 (80/600)", labelEn: "Commercial (80/600)", group: "商業系", groupEn: "Commercial", kenpei: 80, yoseki: 600 },
  { label: "商業地域 (80/800)", labelEn: "Commercial (80/800)", group: "商業系", groupEn: "Commercial", kenpei: 80, yoseki: 800 },
  { label: "準工業地域 (60/300)", labelEn: "Quasi-industrial (60/300)", group: "工業系", groupEn: "Industrial", kenpei: 60, yoseki: 300 },
  { label: "工業地域 (60/400)", labelEn: "Industrial (60/400)", group: "工業系", groupEn: "Industrial", kenpei: 60, yoseki: 400 },
];

const GROUPS = [
  { ja: "住宅系", en: "Residential" },
  { ja: "商業系", en: "Commercial" },
  { ja: "工業系", en: "Industrial" },
];

const T = {
  ja: {
    inputTitle: "基本情報を入力",
    siteArea: "敷地面積",
    siteUnit: "㎡",
    kenpeiLabel: "建蔽率",
    yosekiLabel: "容積率",
    percentUnit: "%",
    zonePreset: "用途地域プリセット",
    resultTitle: "計算結果",
    buildingArea: "建築面積上限",
    floorArea: "延床面積上限",
    siteAreaLabel: "敷地面積",
    maxFloors: "最大階数の目安",
    floorsSuffix: "階",
    kenpeiSuffix: "建蔽率",
    yosekiSuffix: "容積率",
    visualTitle: "敷地に対する建築可能範囲",
    siteLabel: "敷地",
    visualDesc: "建蔽率",
    visualDesc2: "— 敷地の",
    visualDesc3: "%まで建築可能",
    zoneTableTitle: "用途地域別・建蔽率・容積率の上限",
    disclaimer: "注意：本ツールの計算結果は目安です。実際の建築可能面積は、前面道路幅員による容積率制限、日影規制、高さ制限、防火規制などにより異なります。正確な情報は各市区町村の建築指導課またはお近くの一級建築士にご確認ください。",
    approx: "約",
    siteAreaPlaceholder: "100",
    kenpeiPlaceholder: "60",
    yosekiPlaceholder: "200",
  },
  en: {
    inputTitle: "Enter Basic Information",
    siteArea: "Site Area",
    siteUnit: "㎡",
    kenpeiLabel: "Building Coverage",
    yosekiLabel: "Floor Area Ratio",
    percentUnit: "%",
    zonePreset: "Zoning Presets",
    resultTitle: "Calculation Results",
    buildingArea: "Max Building Footprint",
    floorArea: "Max Total Floor Area",
    siteAreaLabel: "Site Area",
    maxFloors: "Est. max floors",
    floorsSuffix: " floors",
    kenpeiSuffix: "Coverage",
    yosekiSuffix: "FAR",
    visualTitle: "Buildable Area vs Site",
    siteLabel: "Site",
    visualDesc: "Coverage",
    visualDesc2: " — up to ",
    visualDesc3: "% of site can be built on",
    zoneTableTitle: "Zoning Limits by District",
    disclaimer: "Note: Results are estimates. Actual buildable area may differ due to road width restrictions, shadow regulations, height limits, fire codes, etc. Consult your local building authority or a licensed architect for accurate information.",
    approx: "~",
    siteAreaPlaceholder: "100",
    kenpeiPlaceholder: "60",
    yosekiPlaceholder: "200",
  },
} as const;

export default function KenpeiYoseki() {
  const [lang, setLang] = useState<Lang>("ja");
  const [shikichiArea, setShikichiArea] = useState("");
  const [kenpeiRate, setKenpeiRate] = useState("");
  const [yosekiRate, setYosekiRate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("住宅系");

  const t = T[lang];

  const result = useMemo(() => {
    const area = parseFloat(shikichiArea);
    const kenpei = parseFloat(kenpeiRate);
    const yoseki = parseFloat(yosekiRate);
    if (!area || !kenpei || !yoseki || area <= 0 || kenpei <= 0 || yoseki <= 0) return null;
    if (kenpei > 100 || yoseki > 1500) return null;
    return {
      kenchikuArea: Math.floor(area * (kenpei / 100) * 100) / 100,
      nobeyukaArea: Math.floor(area * (yoseki / 100) * 100) / 100,
      kenpeiRate: kenpei,
      yosekiRate: yoseki,
      shikichiArea: area,
    };
  }, [shikichiArea, kenpeiRate, yosekiRate]);

  const visualRatio = useMemo(() => {
    const kenpei = parseFloat(kenpeiRate);
    if (!kenpei || kenpei <= 0 || kenpei > 100) return null;
    return Math.min(kenpei / 100, 1);
  }, [kenpeiRate]);

  function applyPreset(preset: ZonePreset) {
    setKenpeiRate(String(preset.kenpei));
    setYosekiRate(String(preset.yoseki));
    setSelectedPreset(preset.label);
  }

  const filteredPresets = ZONE_PRESETS.filter((p) => p.group === activeGroup);

  const inputClass =
    "number-input w-full px-3 py-2.5 rounded-xl text-right text-lg font-mono neon-focus transition-all pr-12";

  return (
    <div className="space-y-5">
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
        .glow-text {
          text-shadow: 0 0 30px rgba(196,181,253,0.6);
        }
        .result-card-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .float-in {
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
        .number-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2d9f3;
        }
        .number-input::placeholder { color: rgba(196,181,253,0.4); }
        .preset-active {
          background: rgba(139,92,246,0.25);
          border-color: rgba(167,139,250,0.6);
          color: #c4b5fd;
          box-shadow: 0 0 10px rgba(139,92,246,0.3);
        }
        .table-row-stripe:hover {
          background: rgba(139,92,246,0.08);
          transition: background 0.2s ease;
        }
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

      {/* Inputs */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.inputTitle}</h2>

        {/* 敷地面積 */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.siteArea}</label>
          <div className="relative max-w-[240px]">
            <input
              type="text"
              inputMode="decimal"
              placeholder={t.siteAreaPlaceholder}
              value={shikichiArea}
              onChange={(e) => setShikichiArea(e.target.value.replace(/[^0-9.]/g, ""))}
              className={inputClass}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-200">{t.siteUnit}</span>
          </div>
        </div>

        {/* 建蔽率・容積率 */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.kenpeiLabel}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder={t.kenpeiPlaceholder}
                value={kenpeiRate}
                onChange={(e) => {
                  setKenpeiRate(e.target.value.replace(/[^0-9.]/g, ""));
                  setSelectedPreset(null);
                }}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-200">{t.percentUnit}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-violet-100 mb-2 uppercase tracking-wider">{t.yosekiLabel}</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder={t.yosekiPlaceholder}
                value={yosekiRate}
                onChange={(e) => {
                  setYosekiRate(e.target.value.replace(/[^0-9.]/g, ""));
                  setSelectedPreset(null);
                }}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-violet-200">{t.percentUnit}</span>
            </div>
          </div>
        </div>

        {/* 用途地域プリセット */}
        <div>
          <p className="text-xs font-medium text-violet-100 mb-3 uppercase tracking-wider">{t.zonePreset}</p>
          <div className="flex gap-1 mb-3">
            {GROUPS.map((g) => (
              <button
                key={g.ja}
                onClick={() => setActiveGroup(g.ja)}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all font-medium ${
                  activeGroup === g.ja
                    ? "bg-violet-600 text-white border-violet-500"
                    : "border-white/10 text-violet-100 hover:border-violet-500/40"
                }`}
              >
                {lang === "ja" ? g.ja : g.en}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all font-mono ${
                  selectedPreset === preset.label
                    ? "preset-active"
                    : "border-white/10 text-violet-100 hover:border-violet-500/40"
                }`}
              >
                {preset.kenpei}/{preset.yoseki}
              </button>
            ))}
          </div>
          {selectedPreset && (
            <p className="text-xs text-violet-200 mt-2">
              {lang === "ja"
                ? selectedPreset
                : ZONE_PRESETS.find((p) => p.label === selectedPreset)?.labelEn ?? selectedPreset}
            </p>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="gradient-border-box glass-card-bright rounded-2xl p-6 result-card-glow float-in">
          <h2 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-5">{t.resultTitle}</h2>
          <div className="divide-y divide-white/8">
            <div className="flex justify-between items-center py-3.5">
              <div>
                <span className="text-sm font-medium text-white">{t.buildingArea}</span>
                <p className="text-xs text-violet-200 mt-0.5">{t.kenpeiSuffix} {result.kenpeiRate}%</p>
              </div>
              <span className="text-2xl font-bold font-mono text-cyan-300 glow-text">
                {result.kenchikuArea.toLocaleString()}<span className="text-base ml-1 font-normal text-violet-200">{t.siteUnit}</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-3.5">
              <div>
                <span className="text-sm font-medium text-white">{t.floorArea}</span>
                <p className="text-xs text-violet-200 mt-0.5">{t.yosekiSuffix} {result.yosekiRate}%</p>
              </div>
              <span className="text-2xl font-bold font-mono text-cyan-300 glow-text">
                {result.nobeyukaArea.toLocaleString()}<span className="text-base ml-1 font-normal text-violet-200">{t.siteUnit}</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-3.5">
              <span className="text-sm text-violet-100">{t.siteAreaLabel}</span>
              <span className="text-sm font-mono text-white/90">{result.shikichiArea.toLocaleString()} {t.siteUnit}</span>
            </div>
            {result.nobeyukaArea > 0 && result.kenchikuArea > 0 && (
              <div className="flex justify-between items-center py-3.5">
                <span className="text-sm text-violet-100">{t.maxFloors}</span>
                <span className="text-sm font-mono text-white/90">
                  {t.approx} {Math.floor(result.nobeyukaArea / result.kenchikuArea)} {t.floorsSuffix}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual */}
      {visualRatio !== null && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-4">{t.visualTitle}</h3>
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden flex items-end justify-center"
              style={{ background: "rgba(6,182,212,0.08)", border: "2px solid rgba(6,182,212,0.3)" }}>
              <span className="absolute top-2 left-2 text-xs text-cyan-300 font-medium">{t.siteLabel}</span>
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-center transition-all duration-300"
                style={{
                  height: `${visualRatio * 100}%`,
                  background: "rgba(139,92,246,0.15)",
                  borderTop: "2px solid rgba(139,92,246,0.4)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-lg"
                  style={{
                    width: `${visualRatio * 100}%`,
                    height: `${visualRatio * 100}%`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    background: "rgba(139,92,246,0.25)",
                    border: "1px solid rgba(167,139,250,0.5)",
                  }}
                >
                  <span className="text-xs font-bold text-violet-200 select-none">
                    {parseFloat(kenpeiRate)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-violet-200 mt-3">
            {t.visualDesc} {kenpeiRate}%{t.visualDesc2}{kenpeiRate}{t.visualDesc3}
          </p>
        </div>
      )}

      {/* Zone table */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-violet-100 uppercase tracking-widest mb-4">{t.zoneTableTitle}</h3>
        <div className="space-y-4">
          {GROUPS.map((group) => (
            <div key={group.ja}>
              <p className="text-xs font-semibold text-violet-200 uppercase tracking-widest mb-2">
                {lang === "ja" ? group.ja : group.en}
              </p>
              <div className="space-y-1">
                {ZONE_PRESETS.filter((p) => p.group === group.ja).map((preset) => (
                  <div
                    key={preset.label}
                    className="flex justify-between items-center px-3 py-2 rounded-xl text-sm table-row-stripe cursor-pointer transition-all"
                    onClick={() => applyPreset(preset)}
                  >
                    <span className="text-xs text-violet-200 truncate pr-2">
                      {lang === "ja" ? preset.label : preset.labelEn}
                    </span>
                    <span className="font-mono text-xs font-medium shrink-0 text-cyan-300">
                      {preset.kenpei}% / {preset.yoseki}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <span className="font-semibold text-amber-300">{lang === "ja" ? "注意：" : "Note: "}</span>
          {lang === "ja"
            ? "本ツールの計算結果は目安です。実際の建築可能面積は、前面道路幅員による容積率制限、日影規制、高さ制限、防火規制などにより異なります。正確な情報は各市区町村の建築指導課またはお近くの一級建築士にご確認ください。"
            : "Results are estimates. Actual buildable area may differ due to road width restrictions, shadow regulations, height limits, fire codes, etc. Consult your local building authority or a licensed architect for accurate information."}
        </p>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この建蔽率・容積率 計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "敷地面積と率から建築可能面積、商業地/住宅地別計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "建蔽率・容積率 計算",
  "description": "敷地面積と率から建築可能面積、商業地/住宅地別計算",
  "url": "https://tools.loresync.dev/kenpei-yoseki",
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
