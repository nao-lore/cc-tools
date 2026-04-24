"use client";

import { useState, useCallback } from "react";

interface CostResult {
  commuteCostAnnual: number;
  remoteCostAnnual: number;
  commuteTimeCostAnnual: number;
  remoteTimeSavingValue: number;
  commuteTotalAnnual: number;
  remoteTotalAnnual: number;
  savingAnnual: number;
  savingMonthly: number;
  commuteBreakdown: { label: string; amount: number }[];
  remoteBreakdown: { label: string; amount: number }[];
  timePerYear: number;
}

export default function CommuteVsRemote() {
  // Commute
  const [workDays, setWorkDays] = useState("20");
  const [commuteMin, setCommuteMin] = useState("60");
  const [monthlyFare, setMonthlyFare] = useState("15000");
  const [companySubsidy, setCompanySubsidy] = useState("15000");
  const [lunchOut, setLunchOut] = useState("800");
  const [coffeeOut, setCoffeeOut] = useState("200");
  const [workClothes, setWorkClothes] = useState("5000");

  // Remote
  const [electricExtra, setElectricExtra] = useState("3000");
  const [internetExtra, setInternetExtra] = useState("2000");
  const [lunchHome, setLunchHome] = useState("400");
  const [homeOfficeMonthly, setHomeOfficeMonthly] = useState("0");

  // Time value
  const [hourlyWage, setHourlyWage] = useState("2000");

  const [result, setResult] = useState<CostResult | null>(null);
  const [error, setError] = useState("");

  const calculate = useCallback(() => {
    setError("");
    const wd = parseInt(workDays);
    const cm = parseInt(commuteMin);
    const fare = parseFloat(monthlyFare);
    const subsidy = parseFloat(companySubsidy);
    const lunch = parseFloat(lunchOut);
    const coffee = parseFloat(coffeeOut);
    const clothes = parseFloat(workClothes);
    const electric = parseFloat(electricExtra);
    const internet = parseFloat(internetExtra);
    const lunchH = parseFloat(lunchHome);
    const homeOffice = parseFloat(homeOfficeMonthly);
    const wage = parseFloat(hourlyWage);

    if (isNaN(wd) || wd <= 0 || wd > 31) { setError("月の出勤日数を1〜31で入力してください。"); return; }
    if ([cm, fare, subsidy, lunch, coffee, clothes, electric, internet, lunchH, homeOffice, wage].some((v) => isNaN(v) || v < 0)) {
      setError("すべての項目に0以上の値を入力してください。"); return;
    }

    const months = 12;
    const annualWorkDays = wd * months;

    // Commute costs (monthly)
    const netFare = Math.max(0, fare - subsidy);
    const lunchCostCommute = lunch * wd;
    const coffeeCost = coffee * wd;
    const clothesCostMonthly = clothes / 12;

    const commuteCostMonthly = netFare + lunchCostCommute + coffeeCost + clothesCostMonthly;
    const commuteCostAnnual = commuteCostMonthly * months;

    // Time cost
    const commuteHoursPerYear = (cm * 2 * annualWorkDays) / 60; // round trip
    const commuteTimeCostAnnual = commuteHoursPerYear * wage;

    // Remote costs (monthly)
    const lunchCostRemote = lunchH * wd;
    const remoteCostMonthly = electric + internet + lunchCostRemote + homeOffice;
    const remoteCostAnnual = remoteCostMonthly * months;

    const commuteTotalAnnual = commuteCostAnnual + commuteTimeCostAnnual;
    const remoteTotalAnnual = remoteCostAnnual;
    const savingAnnual = commuteTotalAnnual - remoteTotalAnnual;

    setResult({
      commuteCostAnnual,
      remoteCostAnnual,
      commuteTimeCostAnnual,
      remoteTimeSavingValue: commuteTimeCostAnnual,
      commuteTotalAnnual,
      remoteTotalAnnual,
      savingAnnual,
      savingMonthly: savingAnnual / 12,
      commuteBreakdown: [
        { label: "交通費（自己負担）", amount: netFare * months },
        { label: "外食ランチ代", amount: lunchCostCommute * months },
        { label: "コーヒー・飲み物", amount: coffeeCost * months },
        { label: "仕事用衣類", amount: clothes },
        { label: "通勤時間コスト", amount: commuteTimeCostAnnual },
      ],
      remoteBreakdown: [
        { label: "電気代増加分", amount: electric * months },
        { label: "通信費増加分", amount: internet * months },
        { label: "在宅ランチ代", amount: lunchCostRemote * months },
        { label: "ホームオフィス備品", amount: homeOffice * months },
      ],
      timePerYear: commuteHoursPerYear,
    });
  }, [workDays, commuteMin, monthlyFare, companySubsidy, lunchOut, coffeeOut, workClothes, electricExtra, internetExtra, lunchHome, homeOfficeMonthly, hourlyWage]);

  const fmt = (n: number) => Math.round(n).toLocaleString("ja-JP");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Commute inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">出</span>
            通勤パラメータ
          </h2>
          <div className="space-y-3">
            {[
              { label: "月の出勤日数", val: workDays, set: setWorkDays, unit: "日", placeholder: "20" },
              { label: "片道通勤時間", val: commuteMin, set: setCommuteMin, unit: "分", placeholder: "60" },
              { label: "定期代（月額）", val: monthlyFare, set: setMonthlyFare, unit: "円", placeholder: "15000" },
              { label: "会社の交通費補助（月額）", val: companySubsidy, set: setCompanySubsidy, unit: "円", placeholder: "15000" },
              { label: "外食ランチ代（1日）", val: lunchOut, set: setLunchOut, unit: "円", placeholder: "800" },
              { label: "コーヒー・飲み物（1日）", val: coffeeOut, set: setCoffeeOut, unit: "円", placeholder: "200" },
              { label: "仕事用衣類（年間）", val: workClothes, set: setWorkClothes, unit: "円", placeholder: "30000" },
            ].map(({ label, val, set, unit, placeholder }) => (
              <div key={label} className="flex items-center gap-2">
                <label className="flex-1 text-sm text-gray-700">{label}</label>
                <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <span className="text-sm text-gray-500 w-5">{unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Remote inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">宅</span>
            在宅勤務パラメータ
          </h2>
          <div className="space-y-3">
            {[
              { label: "電気代増加分（月額）", val: electricExtra, set: setElectricExtra, unit: "円", placeholder: "3000" },
              { label: "通信費増加分（月額）", val: internetExtra, set: setInternetExtra, unit: "円", placeholder: "2000" },
              { label: "在宅ランチ代（1日）", val: lunchHome, set: setLunchHome, unit: "円", placeholder: "400" },
              { label: "ホームオフィス備品等（月額）", val: homeOfficeMonthly, set: setHomeOfficeMonthly, unit: "円", placeholder: "0" },
            ].map(({ label, val, set, unit, placeholder }) => (
              <div key={label} className="flex items-center gap-2">
                <label className="flex-1 text-sm text-gray-700">{label}</label>
                <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-400" />
                <span className="text-sm text-gray-500 w-5">{unit}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">時間の価値設定</h3>
            <div className="flex items-center gap-2">
              <label className="flex-1 text-sm text-gray-700">自分の時給（目安）</label>
              <input type="number" value={hourlyWage} onChange={(e) => setHourlyWage(e.target.value)} placeholder="2000"
                className="w-28 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-400" />
              <span className="text-sm text-gray-500 w-5">円</span>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

      <button onClick={calculate} className="w-full py-3 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-900 transition-colors text-lg">
        コストを比較する
      </button>

      {result && (
        <>
          {/* Summary */}
          <div className={`rounded-2xl border-2 p-6 ${result.savingAnnual > 0 ? "bg-green-50 border-green-300" : "bg-orange-50 border-orange-300"}`}>
            <div className="text-center mb-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                {result.savingAnnual > 0 ? "在宅勤務の方が年間" : "通勤の方が年間"}
              </div>
              <div className={`text-5xl font-bold ${result.savingAnnual > 0 ? "text-green-600" : "text-orange-600"}`}>
                ¥{fmt(Math.abs(result.savingAnnual))}
              </div>
              <div className="text-sm text-gray-500 mt-1">お得（月額: ¥{fmt(Math.abs(result.savingMonthly))}）</div>
            </div>
            <div className="text-center text-sm text-gray-600">
              通勤時間の年間消費: <span className="font-semibold">{result.timePerYear.toFixed(0)}時間</span>（往復 × 出勤日数）
            </div>
          </div>

          {/* Cost comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "通勤コスト（年間）", total: result.commuteTotalAnnual, breakdown: result.commuteBreakdown, color: "orange" },
              { title: "在宅勤務コスト（年間）", total: result.remoteTotalAnnual, breakdown: result.remoteBreakdown, color: "green" },
            ].map(({ title, total, breakdown, color }) => (
              <div key={title} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
                <div className={`text-3xl font-bold text-${color}-600 mb-4`}>¥{fmt(total)}</div>
                <div className="space-y-2">
                  {breakdown.map(({ label, amount }) => (
                    <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-gray-800">¥{fmt(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-700 mb-2">算出の前提</h3>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• 通勤時間コストは「往復時間 × 出勤日数 × 時給」で計算しています。</li>
              <li>• 交通費補助が定期代を上回る場合、自己負担は0円として計算します。</li>
              <li>• 在宅勤務には通勤時間コストは発生しないものとして計算しています。</li>
            </ul>
          </div>
        </>
      )}
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この通勤 vs 在宅 コスト比較ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">通勤時間・交通費・光熱費から通勤と在宅の総コストを比較。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この通勤 vs 在宅 コスト比較ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "通勤時間・交通費・光熱費から通勤と在宅の総コストを比較。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
