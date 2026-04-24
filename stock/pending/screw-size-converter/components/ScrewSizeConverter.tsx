"use client";
import { useState, useMemo } from "react";

// ネジサイズ規格変換
// M規格（ISO メートルねじ）・インチ規格（UNC/UNF）・番手（#）

interface ScrewSpec {
  m_name: string;
  m_od: number;       // 外径 mm
  m_pitch_coarse: number;  // コースピッチ mm
  m_pitch_fine?: number;   // ファインピッチ mm
  m_drill: number;    // 下穴径 mm
  inch_equiv?: string;  // 近い相当インチ
  number?: number;    // 番手（#）
  inch_od?: number;   // インチ外径 inch
  unc_tpi?: number;   // UNC threads per inch
  unf_tpi?: number;   // UNF threads per inch
}

const SCREW_TABLE: ScrewSpec[] = [
  { m_name: "M1",    m_od: 1.0,  m_pitch_coarse: 0.25, m_drill: 0.75 },
  { m_name: "M1.2",  m_od: 1.2,  m_pitch_coarse: 0.25, m_drill: 0.95 },
  { m_name: "M1.4",  m_od: 1.4,  m_pitch_coarse: 0.3,  m_drill: 1.10 },
  { m_name: "M1.6",  m_od: 1.6,  m_pitch_coarse: 0.35, m_drill: 1.25, number: 0 },
  { m_name: "M2",    m_od: 2.0,  m_pitch_coarse: 0.4,  m_drill: 1.60, number: 2, inch_od: 0.086, unc_tpi: 56, unf_tpi: 64 },
  { m_name: "M2.5",  m_od: 2.5,  m_pitch_coarse: 0.45, m_drill: 2.05, number: 3, inch_od: 0.099, unc_tpi: 48, unf_tpi: 56 },
  { m_name: "M3",    m_od: 3.0,  m_pitch_coarse: 0.5,  m_pitch_fine: 0.35, m_drill: 2.50, number: 4, inch_od: 0.112, unc_tpi: 40, unf_tpi: 48 },
  { m_name: "M3.5",  m_od: 3.5,  m_pitch_coarse: 0.6,  m_drill: 2.90, number: 6, inch_od: 0.138, unc_tpi: 32, unf_tpi: 40 },
  { m_name: "M4",    m_od: 4.0,  m_pitch_coarse: 0.7,  m_pitch_fine: 0.5, m_drill: 3.30, number: 8, inch_od: 0.164, unc_tpi: 32, unf_tpi: 36 },
  { m_name: "M5",    m_od: 5.0,  m_pitch_coarse: 0.8,  m_pitch_fine: 0.5, m_drill: 4.20, number: 10, inch_od: 0.190, unc_tpi: 24, unf_tpi: 32 },
  { m_name: "M6",    m_od: 6.0,  m_pitch_coarse: 1.0,  m_pitch_fine: 0.75, m_drill: 5.00, inch_equiv: '1/4"', inch_od: 0.250, unc_tpi: 20, unf_tpi: 28 },
  { m_name: "M8",    m_od: 8.0,  m_pitch_coarse: 1.25, m_pitch_fine: 1.0,  m_drill: 6.80, inch_equiv: '5/16"', inch_od: 0.3125, unc_tpi: 18, unf_tpi: 24 },
  { m_name: "M10",   m_od: 10.0, m_pitch_coarse: 1.5,  m_pitch_fine: 1.25, m_drill: 8.50, inch_equiv: '3/8"', inch_od: 0.375, unc_tpi: 16, unf_tpi: 24 },
  { m_name: "M12",   m_od: 12.0, m_pitch_coarse: 1.75, m_pitch_fine: 1.25, m_drill: 10.20, inch_equiv: '1/2"', inch_od: 0.500, unc_tpi: 13, unf_tpi: 20 },
  { m_name: "M14",   m_od: 14.0, m_pitch_coarse: 2.0,  m_pitch_fine: 1.5, m_drill: 12.00, inch_equiv: '9/16"', inch_od: 0.5625, unc_tpi: 12, unf_tpi: 18 },
  { m_name: "M16",   m_od: 16.0, m_pitch_coarse: 2.0,  m_pitch_fine: 1.5, m_drill: 14.00, inch_equiv: '5/8"', inch_od: 0.625, unc_tpi: 11, unf_tpi: 18 },
  { m_name: "M18",   m_od: 18.0, m_pitch_coarse: 2.5,  m_pitch_fine: 1.5, m_drill: 15.50, inch_equiv: '3/4"', inch_od: 0.750, unc_tpi: 10, unf_tpi: 16 },
  { m_name: "M20",   m_od: 20.0, m_pitch_coarse: 2.5,  m_pitch_fine: 1.5, m_drill: 17.50, inch_equiv: '3/4"', inch_od: 0.750, unc_tpi: 10, unf_tpi: 16 },
  { m_name: "M22",   m_od: 22.0, m_pitch_coarse: 2.5,  m_pitch_fine: 1.5, m_drill: 19.50, inch_equiv: '7/8"', inch_od: 0.875, unc_tpi: 9, unf_tpi: 14 },
  { m_name: "M24",   m_od: 24.0, m_pitch_coarse: 3.0,  m_pitch_fine: 2.0, m_drill: 21.00, inch_equiv: '1"', inch_od: 1.000, unc_tpi: 8, unf_tpi: 12 },
];

type SearchMode = "m" | "inch" | "number" | "drill";

export default function ScrewSizeConverter() {
  const [searchMode, setSearchMode] = useState<SearchMode>("m");
  const [mInput, setMInput] = useState("M6");
  const [inchInput, setInchInput] = useState("1/4");
  const [numberInput, setNumberInput] = useState(8);
  const [drillInput, setDrillInput] = useState(5.0);
  const [showFine, setShowFine] = useState(false);

  const found = useMemo((): ScrewSpec | null => {
    if (searchMode === "m") {
      const q = mInput.trim().toUpperCase();
      return SCREW_TABLE.find((s) => s.m_name.toUpperCase() === q) ?? null;
    }
    if (searchMode === "inch") {
      const q = inchInput.trim().replace(/"/g, "").replace(/\s/g, "");
      return SCREW_TABLE.find((s) => s.inch_equiv?.replace(/"/g, "").replace(/\s/g, "") === q) ?? null;
    }
    if (searchMode === "number") {
      return SCREW_TABLE.find((s) => s.number === numberInput) ?? null;
    }
    if (searchMode === "drill") {
      // Find closest
      return SCREW_TABLE.reduce((best, s) => {
        return Math.abs(s.m_drill - drillInput) < Math.abs(best.m_drill - drillInput) ? s : best;
      });
    }
    return null;
  }, [searchMode, mInput, inchInput, numberInput, drillInput]);

  return (
    <div className="space-y-6">
      {/* Search mode */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">検索方法を選択</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {(["m", "inch", "number", "drill"] as SearchMode[]).map((mode) => (
            <button key={mode} onClick={() => setSearchMode(mode)}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                searchMode === mode ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}>
              {mode === "m" ? "M規格（例: M6）" : mode === "inch" ? "インチ規格" : mode === "number" ? "番手（#）" : "下穴径から"}
            </button>
          ))}
        </div>

        {searchMode === "m" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">M規格を入力</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {["M3", "M4", "M5", "M6", "M8", "M10", "M12"].map((m) => (
                <button key={m} onClick={() => setMInput(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    mInput === m ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}>
                  {m}
                </button>
              ))}
            </div>
            <input className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              value={mInput} onChange={(e) => setMInput(e.target.value)} placeholder="M6" />
          </div>
        )}

        {searchMode === "inch" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">インチ規格（分数）</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {['1/4"', '5/16"', '3/8"', '1/2"', '5/8"', '3/4"', '1"'].map((v) => (
                <button key={v} onClick={() => setInchInput(v.replace(/"/g, ""))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    inchInput === v.replace(/"/g, "") ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
                  }`}>
                  {v}
                </button>
              ))}
            </div>
            <input className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={inchInput} onChange={(e) => setInchInput(e.target.value)} placeholder='1/4"' />
          </div>
        )}

        {searchMode === "number" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">番手（#）</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[2, 3, 4, 6, 8, 10].map((n) => (
                <button key={n} onClick={() => setNumberInput(n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    numberInput === n ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200"
                  }`}>
                  #{n}
                </button>
              ))}
            </div>
            <input type="number" min={0} max={12}
              className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={numberInput} onChange={(e) => setNumberInput(Number(e.target.value))} />
          </div>
        )}

        {searchMode === "drill" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">下穴径（mm）</label>
            <input type="number" step={0.05} min={0.5} max={25}
              className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={drillInput} onChange={(e) => setDrillInput(Number(e.target.value))} />
            <p className="text-xs text-gray-400 mt-1">最も近いネジサイズを表示します</p>
          </div>
        )}
      </div>

      {/* Result card */}
      {found ? (
        <div className="bg-white rounded-2xl shadow-sm border-2 border-blue-400 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-700">{found.m_name}</h2>
            {found.number !== undefined && (
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">#{found.number}</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <SpecCard label="外径" value={`${found.m_od} mm`} sub={found.inch_od ? `≈ ${(found.inch_od).toFixed(3)}"` : undefined} />
            <SpecCard label="ピッチ（コース）" value={`${found.m_pitch_coarse} mm`} sub={found.unc_tpi ? `UNC: ${found.unc_tpi} TPI` : undefined} />
            {found.m_pitch_fine && (
              <SpecCard label="ピッチ（ファイン）" value={`${found.m_pitch_fine} mm`} sub={found.unf_tpi ? `UNF: ${found.unf_tpi} TPI` : undefined} />
            )}
            <SpecCard label="下穴径（目安）" value={`${found.m_drill} mm`} highlight />
            {found.inch_equiv && <SpecCard label="相当インチ規格" value={found.inch_equiv} />}
            <SpecCard label="インチ外径換算" value={found.inch_od ? `${found.inch_od}"` : "—"} sub={found.inch_od ? `${(found.inch_od * 25.4).toFixed(2)} mm` : undefined} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-gray-500">
          該当するネジサイズが見つかりません。別の規格で検索してください。
        </div>
      )}

      {/* Full table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">規格対応表</h2>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={showFine} onChange={(e) => setShowFine(e.target.checked)} className="accent-blue-600" />
            ファインピッチ表示
          </label>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-600 font-medium">
              <th className="text-left py-2 pr-3">M規格</th>
              <th className="text-right py-2 pr-3">外径(mm)</th>
              <th className="text-right py-2 pr-3">ピッチ(mm)</th>
              {showFine && <th className="text-right py-2 pr-3">ファイン</th>}
              <th className="text-right py-2 pr-3">下穴(mm)</th>
              <th className="text-right py-2 pr-3">番手</th>
              <th className="text-right py-2 pr-3">インチ</th>
              <th className="text-right py-2">UNC TPI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {SCREW_TABLE.map((s) => (
              <tr key={s.m_name}
                className={`hover:bg-blue-50 cursor-pointer transition-colors ${found?.m_name === s.m_name ? "bg-blue-50 font-semibold" : ""}`}
                onClick={() => { setSearchMode("m"); setMInput(s.m_name); }}
              >
                <td className="py-1.5 pr-3 text-blue-700 font-medium">{s.m_name}</td>
                <td className="py-1.5 pr-3 text-right">{s.m_od}</td>
                <td className="py-1.5 pr-3 text-right">{s.m_pitch_coarse}</td>
                {showFine && <td className="py-1.5 pr-3 text-right">{s.m_pitch_fine ?? "—"}</td>}
                <td className="py-1.5 pr-3 text-right">{s.m_drill}</td>
                <td className="py-1.5 pr-3 text-right">{s.number !== undefined ? `#${s.number}` : "—"}</td>
                <td className="py-1.5 pr-3 text-right">{s.inch_equiv ?? (s.inch_od ? `${s.inch_od}"` : "—")}</td>
                <td className="py-1.5 text-right">{s.unc_tpi ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-400 mt-3">※ 表の行をクリックするとその規格の詳細を表示します</p>
      </div>
    </div>
  );
}

function SpecCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-yellow-50 border-yellow-400 border-2" : "bg-gray-50 border-gray-200"}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このネジサイズ規格変換ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">M規格・インチ・番手の相互変換と仕様一覧。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このネジサイズ規格変換ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "M規格・インチ・番手の相互変換と仕様一覧。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ネジサイズ規格変換",
  "description": "M規格・インチ・番手の相互変換と仕様一覧",
  "url": "https://tools.loresync.dev/screw-size-converter",
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
