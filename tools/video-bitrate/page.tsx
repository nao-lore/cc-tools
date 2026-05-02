"use client";
import VideoBitrate from "./components/VideoBitrate";

export default function VideoBitratePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-900 mb-2">動画ビットレート / ファイルサイズ計算</h1>
        <p className="text-cyan-700 mb-8">解像度・fps・コーデック別の推奨ビットレートとファイルサイズを即計算。YouTube・Twitter・Instagram対応プリセット付き</p>
        <VideoBitrate />
      </div>
    </div>
  );
}
