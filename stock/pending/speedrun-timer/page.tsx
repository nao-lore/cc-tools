"use client";
import SpeedrunTimer from "./components/SpeedrunTimer";
export default function SpeedrunTimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">スピードランタイマー</h1>
        <p className="text-gray-600 mb-8">区間タイムを記録してベストとの差分をリアルタイム表示</p>
        <SpeedrunTimer />
      </div>
    </div>
  );
}
