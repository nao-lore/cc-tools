"use client";

import { useState, useCallback, useMemo } from "react";

interface KeyframeStop {
  percent: number;
  translateX: string;
  translateY: string;
  rotate: string;
  scale: string;
  opacity: string;
  backgroundColor: string;
}

interface AnimationConfig {
  name: string;
  duration: string;
  delay: string;
  iterationCount: string;
  direction: string;
  timingFunction: string;
  customBezier: string;
  fillMode: string;
}

const DEFAULT_KEYFRAME: () => KeyframeStop = () => ({
  percent: 0,
  translateX: "0",
  translateY: "0",
  rotate: "0",
  scale: "1",
  opacity: "1",
  backgroundColor: "",
});

const PRESETS: Record<string, { config: Partial<AnimationConfig>; keyframes: KeyframeStop[] }> = {
  "fade-in": {
    config: { duration: "0.5s", timingFunction: "ease" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, opacity: "0" },
      { ...DEFAULT_KEYFRAME(), percent: 100, opacity: "1" },
    ],
  },
  "slide-in": {
    config: { duration: "0.5s", timingFunction: "ease-out" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, translateX: "-100px", opacity: "0" },
      { ...DEFAULT_KEYFRAME(), percent: 100, translateX: "0", opacity: "1" },
    ],
  },
  bounce: {
    config: { duration: "0.6s", timingFunction: "ease" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, translateY: "0" },
      { ...DEFAULT_KEYFRAME(), percent: 25, translateY: "-30px" },
      { ...DEFAULT_KEYFRAME(), percent: 50, translateY: "0" },
      { ...DEFAULT_KEYFRAME(), percent: 75, translateY: "-15px" },
      { ...DEFAULT_KEYFRAME(), percent: 100, translateY: "0" },
    ],
  },
  spin: {
    config: { duration: "1s", timingFunction: "linear", iterationCount: "infinite" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, rotate: "0" },
      { ...DEFAULT_KEYFRAME(), percent: 100, rotate: "360" },
    ],
  },
  pulse: {
    config: { duration: "1s", timingFunction: "ease-in-out", iterationCount: "infinite", direction: "alternate" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, scale: "1", opacity: "1" },
      { ...DEFAULT_KEYFRAME(), percent: 100, scale: "1.1", opacity: "0.7" },
    ],
  },
  shake: {
    config: { duration: "0.5s", timingFunction: "ease" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, translateX: "0" },
      { ...DEFAULT_KEYFRAME(), percent: 20, translateX: "-10px" },
      { ...DEFAULT_KEYFRAME(), percent: 40, translateX: "10px" },
      { ...DEFAULT_KEYFRAME(), percent: 60, translateX: "-10px" },
      { ...DEFAULT_KEYFRAME(), percent: 80, translateX: "10px" },
      { ...DEFAULT_KEYFRAME(), percent: 100, translateX: "0" },
    ],
  },
  flip: {
    config: { duration: "0.8s", timingFunction: "ease-in-out" },
    keyframes: [
      { ...DEFAULT_KEYFRAME(), percent: 0, rotate: "0", scale: "1" },
      { ...DEFAULT_KEYFRAME(), percent: 50, rotate: "180", scale: "0.8" },
      { ...DEFAULT_KEYFRAME(), percent: 100, rotate: "360", scale: "1" },
    ],
  },
};

export default function AnimationGenerator() {
  const [config, setConfig] = useState<AnimationConfig>({
    name: "my-animation",
    duration: "1s",
    delay: "0s",
    iterationCount: "1",
    direction: "normal",
    timingFunction: "ease",
    customBezier: "0.25, 0.1, 0.25, 1",
    fillMode: "none",
  });

  const [keyframes, setKeyframes] = useState<KeyframeStop[]>([
    { ...DEFAULT_KEYFRAME(), percent: 0 },
    { ...DEFAULT_KEYFRAME(), percent: 100, opacity: "1" },
  ]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [editingKeyframe, setEditingKeyframe] = useState<number>(0);

  const updateConfig = useCallback((key: keyof AnimationConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setAnimationKey((k) => k + 1);
  }, []);

  const updateKeyframe = useCallback((index: number, key: keyof KeyframeStop, value: string | number) => {
    setKeyframes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
    setAnimationKey((k) => k + 1);
  }, []);

  const addKeyframe = useCallback(() => {
    setKeyframes((prev) => {
      const sorted = [...prev].sort((a, b) => a.percent - b.percent);
      const last = sorted[sorted.length - 1]?.percent ?? 0;
      const newPercent = Math.min(last + 25, 100);
      if (prev.some((k) => k.percent === newPercent)) return prev;
      const next = [...prev, { ...DEFAULT_KEYFRAME(), percent: newPercent }];
      return next.sort((a, b) => a.percent - b.percent);
    });
  }, []);

  const removeKeyframe = useCallback((index: number) => {
    setKeyframes((prev) => {
      if (prev.length <= 2) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next;
    });
    setEditingKeyframe(0);
    setAnimationKey((k) => k + 1);
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const preset = PRESETS[presetName];
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
      name: presetName,
    }));
    setKeyframes(preset.keyframes.map((k) => ({ ...k })));
    setEditingKeyframe(0);
    setAnimationKey((k) => k + 1);
    setIsPlaying(true);
  }, []);

  const timingValue = config.timingFunction === "custom"
    ? `cubic-bezier(${config.customBezier})`
    : config.timingFunction;

  const generatedCSS = useMemo(() => {
    const sortedKf = [...keyframes].sort((a, b) => a.percent - b.percent);
    let css = `@keyframes ${config.name} {\n`;
    for (const kf of sortedKf) {
      const transforms: string[] = [];
      if (kf.translateX !== "0" || kf.translateY !== "0") {
        transforms.push(`translate(${kf.translateX}${/^-?\d+(\.\d+)?$/.test(kf.translateX) ? "px" : ""}, ${kf.translateY}${/^-?\d+(\.\d+)?$/.test(kf.translateY) ? "px" : ""})`);
      }
      if (kf.rotate !== "0") {
        transforms.push(`rotate(${kf.rotate}deg)`);
      }
      if (kf.scale !== "1") {
        transforms.push(`scale(${kf.scale})`);
      }

      const props: string[] = [];
      if (transforms.length > 0) {
        props.push(`    transform: ${transforms.join(" ")};`);
      }
      if (kf.opacity !== "1") {
        props.push(`    opacity: ${kf.opacity};`);
      }
      if (kf.backgroundColor) {
        props.push(`    background-color: ${kf.backgroundColor};`);
      }

      if (props.length === 0) {
        props.push(`    /* no changes */`);
      }

      css += `  ${kf.percent}% {\n${props.join("\n")}\n  }\n`;
    }
    css += `}\n\n`;
    css += `.animated-element {\n`;
    css += `  animation: ${config.name} ${config.duration} ${timingValue} ${config.delay} ${config.iterationCount} ${config.direction} ${config.fillMode};\n`;
    css += `}`;
    return css;
  }, [keyframes, config, timingValue]);

  const inlineKeyframes = useMemo(() => {
    const sortedKf = [...keyframes].sort((a, b) => a.percent - b.percent);
    const frames: Record<string, Record<string, string>> = {};
    for (const kf of sortedKf) {
      const props: Record<string, string> = {};
      const transforms: string[] = [];
      if (kf.translateX !== "0" || kf.translateY !== "0") {
        transforms.push(`translate(${kf.translateX}${/^-?\d+(\.\d+)?$/.test(kf.translateX) ? "px" : ""}, ${kf.translateY}${/^-?\d+(\.\d+)?$/.test(kf.translateY) ? "px" : ""})`);
      }
      if (kf.rotate !== "0") transforms.push(`rotate(${kf.rotate}deg)`);
      if (kf.scale !== "1") transforms.push(`scale(${kf.scale})`);
      if (transforms.length) props.transform = transforms.join(" ");
      if (kf.opacity !== "1") props.opacity = kf.opacity;
      if (kf.backgroundColor) props["background-color"] = kf.backgroundColor;
      frames[`${kf.percent}%`] = props;
    }
    return frames;
  }, [keyframes]);

  const styleTag = useMemo(() => {
    const sortedKf = [...keyframes].sort((a, b) => a.percent - b.percent);
    let css = `@keyframes preview-anim {\n`;
    for (const kf of sortedKf) {
      const transforms: string[] = [];
      if (kf.translateX !== "0" || kf.translateY !== "0") {
        transforms.push(`translate(${kf.translateX}${/^-?\d+(\.\d+)?$/.test(kf.translateX) ? "px" : ""}, ${kf.translateY}${/^-?\d+(\.\d+)?$/.test(kf.translateY) ? "px" : ""})`);
      }
      if (kf.rotate !== "0") transforms.push(`rotate(${kf.rotate}deg)`);
      if (kf.scale !== "1") transforms.push(`scale(${kf.scale})`);
      const props: string[] = [];
      if (transforms.length) props.push(`transform:${transforms.join(" ")}`);
      if (kf.opacity !== "1") props.push(`opacity:${kf.opacity}`);
      if (kf.backgroundColor) props.push(`background-color:${kf.backgroundColor}`);
      css += `${kf.percent}%{${props.join(";")}}\n`;
    }
    css += `}`;
    return css;
  }, [keyframes]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCSS]);

  const handlePlay = () => {
    setIsPlaying(true);
    setAnimationKey((k) => k + 1);
  };
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setTimeout(() => {
      setAnimationKey((k) => k + 1);
      setIsPlaying(true);
    }, 50);
  };

  const sortedKeyframes = [...keyframes].sort((a, b) => a.percent - b.percent);
  const currentKf = keyframes[editingKeyframe] || keyframes[0];

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-200 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Preview + Playback */}
        <div className="space-y-4">
          {/* Preview */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 min-h-[280px] flex items-center justify-center overflow-hidden relative">
            <style>{styleTag}</style>
            <div
              key={animationKey}
              className="w-20 h-20 bg-gray-800 rounded-lg"
              style={
                isPlaying
                  ? {
                      animation: `preview-anim ${config.duration} ${timingValue} ${config.delay} ${config.iterationCount} ${config.direction} ${config.fillMode}`,
                    }
                  : { animationPlayState: "paused" }
              }
            />
          </div>

          {/* Playback controls */}
          <div className="flex gap-2">
            <button
              onClick={handlePlay}
              className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Play
            </button>
            <button
              onClick={handlePause}
              className="flex-1 px-3 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Pause
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-2 text-sm bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Animation Properties */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-800">Animation Properties</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig("name", e.target.value.replace(/[^a-zA-Z0-9-_]/g, ""))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                <input
                  type="text"
                  value={config.duration}
                  onChange={(e) => updateConfig("duration", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                  placeholder="1s"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Delay</label>
                <input
                  type="text"
                  value={config.delay}
                  onChange={(e) => updateConfig("delay", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                  placeholder="0s"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Iteration Count</label>
                <select
                  value={config.iterationCount}
                  onChange={(e) => updateConfig("iterationCount", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="infinite">infinite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Direction</label>
                <select
                  value={config.direction}
                  onChange={(e) => updateConfig("direction", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                >
                  <option value="normal">normal</option>
                  <option value="reverse">reverse</option>
                  <option value="alternate">alternate</option>
                  <option value="alternate-reverse">alternate-reverse</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Timing Function</label>
                <select
                  value={config.timingFunction}
                  onChange={(e) => updateConfig("timingFunction", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                >
                  <option value="ease">ease</option>
                  <option value="linear">linear</option>
                  <option value="ease-in">ease-in</option>
                  <option value="ease-out">ease-out</option>
                  <option value="ease-in-out">ease-in-out</option>
                  <option value="custom">custom cubic-bezier</option>
                </select>
              </div>
              {config.timingFunction === "custom" && (
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">cubic-bezier()</label>
                  <input
                    type="text"
                    value={config.customBezier}
                    onChange={(e) => updateConfig("customBezier", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                    placeholder="0.25, 0.1, 0.25, 1"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fill Mode</label>
                <select
                  value={config.fillMode}
                  onChange={(e) => updateConfig("fillMode", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                >
                  <option value="none">none</option>
                  <option value="forwards">forwards</option>
                  <option value="backwards">backwards</option>
                  <option value="both">both</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Keyframe Editor + CSS Output */}
        <div className="space-y-4">
          {/* Keyframe Timeline */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Keyframes</h3>
              <button
                onClick={addKeyframe}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-200 transition-colors"
              >
                + Add
              </button>
            </div>

            {/* Keyframe stops */}
            <div className="flex flex-wrap gap-1.5">
              {keyframes.map((kf, i) => (
                <button
                  key={i}
                  onClick={() => setEditingKeyframe(i)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                    editingKeyframe === i
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {kf.percent}%
                </button>
              ))}
            </div>

            {/* Per-keyframe editor */}
            {currentKf && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Editing: {currentKf.percent}%</span>
                  {keyframes.length > 2 && (
                    <button
                      onClick={() => removeKeyframe(editingKeyframe)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Percent (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentKf.percent}
                      onChange={(e) => updateKeyframe(editingKeyframe, "percent", Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Opacity</label>
                    <input
                      type="text"
                      value={currentKf.opacity}
                      onChange={(e) => updateKeyframe(editingKeyframe, "opacity", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Translate X</label>
                    <input
                      type="text"
                      value={currentKf.translateX}
                      onChange={(e) => updateKeyframe(editingKeyframe, "translateX", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Translate Y</label>
                    <input
                      type="text"
                      value={currentKf.translateY}
                      onChange={(e) => updateKeyframe(editingKeyframe, "translateY", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Rotate (deg)</label>
                    <input
                      type="text"
                      value={currentKf.rotate}
                      onChange={(e) => updateKeyframe(editingKeyframe, "rotate", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Scale</label>
                    <input
                      type="text"
                      value={currentKf.scale}
                      onChange={(e) => updateKeyframe(editingKeyframe, "scale", e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                      placeholder="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentKf.backgroundColor}
                        onChange={(e) => updateKeyframe(editingKeyframe, "backgroundColor", e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:border-gray-400"
                        placeholder="#000000 or empty"
                      />
                      <input
                        type="color"
                        value={currentKf.backgroundColor || "#000000"}
                        onChange={(e) => updateKeyframe(editingKeyframe, "backgroundColor", e.target.value)}
                        className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated CSS */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Generated CSS</h3>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
              >
                {copied ? "Copied!" : "Copy CSS"}
              </button>
            </div>
            <pre className="p-4 text-sm font-mono text-gray-800 overflow-x-auto bg-white leading-relaxed whitespace-pre-wrap">
              {generatedCSS}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
