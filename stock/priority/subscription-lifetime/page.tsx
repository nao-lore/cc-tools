"use client";
import SubscriptionLifetime from "./components/SubscriptionLifetime";

export default function SubscriptionLifetimePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">サブスク生涯コスト計算</h1>
        <p className="text-gray-600 mb-8">月額の積み重ねを1年・5年・10年で可視化。解約すべきサービスを見つけよう</p>
        <SubscriptionLifetime />
      </div>
    </div>
  );
}
