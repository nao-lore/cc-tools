"use client";
import CarNumberDecoder from "./components/CarNumberDecoder";
export default function CarNumberDecoderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">自動車ナンバープレート 地域・分類 判定</h1>
        <p className="text-gray-600 mb-8">ナンバープレートの地名から管轄運輸支局・都道府県・用途分類を判定します。</p>
        <CarNumberDecoder />
      </div>
    </div>
  );
}
