"use client";
import MyNumberValidator from "./components/MyNumberValidator";
export default function MyNumberValidatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">マイナンバー 桁・形式 検証</h1>
        <p className="text-gray-600 mb-8">12桁のマイナンバーのチェックディジットを検証。アルゴリズムの計算過程も表示します。</p>
        <MyNumberValidator />
      </div>
    </div>
  );
}
