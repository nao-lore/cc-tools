"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const BPM_PRESETS = [
  { label: "Largo", bpm: 50 },
  { label: "Adagio", bpm: 70 },
  { label: "Andante", bpm: 90 },
  { label: "Moderato", bpm: 108 },
  { label: "Allegro", bpm: 132 },
  { label: "Presto", bpm: 176 },
];

const TIME_SIGNATURES = [
  { beats: 2, label: "2/4" },
  { beats: 3, label: "3/4" },
  { beats: 4, label: "4/4" },
  { beats: 6, label: "6/8" },
];

export default function MetronomeTool() {
  const [bpm, setBpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [timeSignature, setTimeSignature] = useState(4);
  const [accentFirst, setAccentFirst] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatCountRef = useRef(0);
  const schedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback((time: number, isAccent: boolean) => {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = isAccent ? 1200 : 800;
    gain.gain.setValueAtTime(volume * (isAccent ? 1.0 : 0.6), time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);
  }, [volume, getAudioContext]);

  const scheduleBeats = useCallback(() => {
    const ctx = getAudioContext();
    const scheduleAheadTime = 0.1;
    const interval = 60 / bpm;

    while (nextBeatTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const beat = beatCountRef.current % timeSignature;
      const isAccent = accentFirst && beat === 0;
      playClick(nextBeatTimeRef.current, isAccent);

      setCurrentBeat(beat);
      beatCountRef.current++;
      nextBeatTimeRef.current += interval;
    }

    schedulerRef.current = setTimeout(scheduleBeats, 25);
  }, [bpm, timeSignature, accentFirst, playClick, getAudioContext]);

  const start = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();
    beatCountRef.current = 0;
    nextBeatTimeRef.current = ctx.currentTime + 0.05;
    setCurrentBeat(0);
    scheduleBeats();
    setIsPlaying(true);
  }, [getAudioContext, scheduleBeats]);

  const stop = useCallback(() => {
    if (schedulerRef.current) clearTimeout(schedulerRef.current);
    if (intervalRef.current) clearTimeout(intervalRef.current);
    setIsPlaying(false);
    setCurrentBeat(0);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      stop();
      setTimeout(() => start(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm, timeSignature, accentFirst]);

  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, [stop]);

  const handleTap = () => {
    const now = Date.now();
    setTapTimes((prev) => {
      const recent = [...prev, now].filter((t) => now - t < 5000).slice(-8);
      if (recent.length >= 2) {
        const intervals = recent.slice(1).map((t, i) => t - recent[i]);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avgInterval);
        if (newBpm >= 20 && newBpm <= 300) setBpm(newBpm);
      }
      return recent;
    });
  };

  const pendulum = isPlaying ? (currentBeat % 2 === 0 ? -1 : 1) : 0;

  return (
    <div className="space-y-6">
      {/* メインUI */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {/* 振り子 */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-32">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-24 bg-gray-200 rounded-full" />
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-20 bg-gray-700 rounded-full origin-bottom transition-transform"
              style={{
                transform: `translateX(-50%) rotate(${pendulum * 25}deg)`,
                transitionDuration: isPlaying ? `${60 / bpm / 2 * 1000}ms` : "300ms",
              }}
            />
            <div
              className={`absolute top-0 left-1/2 w-6 h-6 rounded-full border-2 transition-colors ${
                isPlaying && currentBeat === 0 && accentFirst ? "bg-red-500 border-red-600" :
                isPlaying ? "bg-blue-500 border-blue-600" : "bg-gray-300 border-gray-400"
              }`}
              style={{ transform: `translateX(-50%) translateX(${pendulum * 28}px)` }}
            />
          </div>
        </div>

        {/* BPM表示 */}
        <div className="text-center mb-6">
          <div className="text-7xl font-bold text-gray-900 tabular-nums">{bpm}</div>
          <div className="text-gray-500 text-sm mt-1">BPM</div>
          <div className="text-xs text-gray-400 mt-1">
            {BPM_PRESETS.find((p) => Math.abs(p.bpm - bpm) < 10)?.label ?? ""}
          </div>
        </div>

        {/* スライダー */}
        <div className="mb-6">
          <input
            type="range"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full h-3 rounded-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>20</span>
            <span>160</span>
            <span>300</span>
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 justify-center flex-wrap mb-4">
          <button
            onClick={() => setBpm((b) => Math.max(20, b - 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 text-lg"
          >
            −
          </button>
          <button
            onClick={isPlaying ? stop : start}
            className={`w-20 h-20 rounded-full text-white font-bold text-xl shadow-lg transition-colors ${
              isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPlaying ? "■" : "▶"}
          </button>
          <button
            onClick={() => setBpm((b) => Math.min(300, b + 1))}
            className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 text-lg"
          >
            ＋
          </button>
        </div>

        {/* タップテンポ */}
        <div className="flex justify-center">
          <button
            onClick={handleTap}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            タップでBPM計測
          </button>
        </div>
      </div>

      {/* 設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">設定</h2>
        <div className="space-y-5">
          {/* 拍子 */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">拍子</label>
            <div className="flex gap-2 flex-wrap">
              {TIME_SIGNATURES.map((ts) => (
                <button
                  key={ts.beats}
                  onClick={() => setTimeSignature(ts.beats)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                    timeSignature === ts.beats
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>

          {/* ビジュアルビート */}
          {isPlaying && (
            <div>
              <label className="text-sm text-gray-600 mb-2 block">現在の拍</label>
              <div className="flex gap-2">
                {Array.from({ length: timeSignature }, (_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-lg transition-colors ${
                      currentBeat === i
                        ? i === 0 && accentFirst ? "bg-red-500" : "bg-blue-500"
                        : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 強拍アクセント */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="accent"
              checked={accentFirst}
              onChange={(e) => setAccentFirst(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="accent" className="text-sm text-gray-700">1拍目を強調（高音）</label>
          </div>

          {/* 音量 */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">音量: {Math.round(volume * 100)}%</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* BPMプリセット */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">テンポ記号プリセット</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BPM_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setBpm(p.bpm)}
              className={`py-2 px-3 rounded-lg border-2 text-sm transition-colors ${
                bpm === p.bpm
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="font-medium">{p.label}</span>
              <span className="text-gray-400 ml-2">{p.bpm}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        ※ Web Audio APIを使用しています。初回クリック時にブラウザの音声制限が解除されます。
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">このメトロノームツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">ブラウザだけで動くメトロノーム。BPM 20〜300、拍子設定、強拍アクセント対応。Web Audio APIでリズムのズレを最小化。。入力するだけで即座に結果を表示します。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">利用料金はかかりますか？</summary>
      <p className="mt-2 text-sm text-gray-600">完全無料でご利用いただけます。会員登録も不要です。</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">計算結果は正確ですか？</summary>
      <p className="mt-2 text-sm text-gray-600">一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "このメトロノームツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "ブラウザだけで動くメトロノーム。BPM 20〜300、拍子設定、強拍アクセント対応。Web Audio APIでリズムのズレを最小化。。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
