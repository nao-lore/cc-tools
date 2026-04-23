"use client";
import FurusatoNozeiLimit from "./components/FurusatoNozeiLimit";
export default function FurusatoNozeiLimitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ふるさと納税 控除上限額 計算（フリーランス版）</h1>
        <p className="text-gray-600 mb-8">事業所得ベースでふるさと納税の控除上限額を試算します</p>
        <FurusatoNozeiLimit />
      </div>
    </div>
  );
}
