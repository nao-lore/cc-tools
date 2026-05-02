"use client";
import NetlifyPricing from "./components/NetlifyPricing";

export default function NetlifyPricingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Netlify logomark */}
            <svg viewBox="0 0 40 40" className="h-7 w-7" aria-label="Netlify" fill="none">
              <path d="M28.589 14.135l.007.006a1.07 1.07 0 0 1 .028 1.49L16.082 28.557a1.07 1.07 0 0 1-1.517.021l-6.73-6.73a1.07 1.07 0 0 1 0-1.513l1.513-1.514a1.07 1.07 0 0 1 1.514 0l4.464 4.461 10.669-11.15a1.07 1.07 0 0 1 1.514-.028z" fill="#00C7B7"/>
              <rect x="3" y="3" width="34" height="34" rx="4" stroke="#00C7B7" strokeWidth="2" fill="none"/>
            </svg>
            <h1 className="text-2xl font-bold text-white">Netlify 料金試算</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Starter（無料）/ Pro プランの月額料金をビルド時間・帯域幅・Functions実行数から試算
          </p>
        </div>
        <NetlifyPricing />
      </div>
    </div>
  );
}
