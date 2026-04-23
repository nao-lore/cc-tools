"use client";
import DamageCalculatorGeneric from "./components/DamageCalculatorGeneric";
export default function DamageCalculatorGenericPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ダメージ計算（汎用RPG）</h1>
        <p className="text-gray-600 mb-8">攻撃力・防御力・バフ倍率からダメージと期待値を計算します</p>
        <DamageCalculatorGeneric />
      </div>
    </div>
  );
}
