"use client";
import ElevenLabsPricing from "./components/ElevenLabsPricing";

export default function ElevenLabsPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-violet-950 to-purple-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">ElevenLabs 料金試算</h1>
        <p className="text-violet-300 mb-8">音声合成の文字数別コストシミュレーター</p>
        <ElevenLabsPricing />
      </div>
    </div>
  );
}
