"use client";
import RandomNamePicker from "./components/RandomNamePicker";
export default function RandomNamePickerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">名前くじ引き</h1>
        <p className="text-gray-600 mb-8">名前リストからルーレット風アニメーションでランダム選出します</p>
        <RandomNamePicker />
      </div>
    </div>
  );
}
