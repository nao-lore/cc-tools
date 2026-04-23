"use client";
import KafunFlight from "./components/KafunFlight";
export default function KafunFlightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">花粉飛散 リスク予測</h1>
        <p className="text-gray-600 mb-8">気温・風速・湿度・前日の天気を入力して花粉飛散リスク指数を予測します。</p>
        <KafunFlight />
      </div>
    </div>
  );
}
