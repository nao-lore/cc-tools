"use client";
import ColorBlindnessSimText from "./components/ColorBlindnessSimText";

export default function ColorBlindnessSimTextPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Blindness Simulator (Text)</h1>
        <p className="text-gray-600 mb-8">Preview how your text and background colors appear to people with different types of color vision deficiency.</p>
        <ColorBlindnessSimText />
      </div>
    </div>
  );
}
