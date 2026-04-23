"use client";
import CircleCalculator from "./components/CircleCalculator";
export default function CircleCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">円 計算機</h1>
        <p className="text-gray-600 mb-8">半径・直径・面積・円周のいずれか1つを入力して全要素を算出</p>
        <CircleCalculator />
      </div>
    </div>
  );
}
