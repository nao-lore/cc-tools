"use client";
import { useState, useMemo } from "react";

// 木材カット割付計算
// 板材（合板）から必要なパーツを取る際の材料取り計算

const BOARD_PRESETS = [
  { name: "3×6（サブロク）合板", w: 910, h: 1820 },
  { name: "4×8（シハチ）合板", w: 1220, h: 2440 },
  { name: "3×8（サンパチ）合板", w: 910, h: 2440 },
  { name: "2×4材（8ft）", w: 38, h: 2438 },
  { name: "1×4材（6ft）", w: 19, h: 1820 },
  { name: "カスタム", w: 0, h: 0 },
];

const SAW_WIDTHS = [2, 3, 4, 5];   // mm

interface CutPiece {
  id: number;
  name: string;
  w: number;   // mm
  h: number;   // mm
  qty: number;
}

interface PlacedPiece {
  id: number;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
  boardIdx: number;
}

let nextPieceId = 2;

// Simple greedy bin packing (First Fit Decreasing)
function packPieces(
  boardW: number,
  boardH: number,
  pieces: CutPiece[],
  sawWidth: number
): { placed: PlacedPiece[]; boardsUsed: number; usedArea: number; wasteArea: number } {
  const placed: PlacedPiece[] = [];

  // Expand by qty
  const expanded: { piece: CutPiece; rotated: boolean }[] = [];
  for (const piece of pieces) {
    for (let i = 0; i < piece.qty; i++) {
      // Try to orient so longer side is horizontal
      const rotated = piece.h > boardH && piece.w <= boardH;
      expanded.push({ piece, rotated });
    }
  }

  // Sort by area descending
  expanded.sort((a, b) => {
    const aA = a.piece.w * a.piece.h;
    const bA = b.piece.w * b.piece.h;
    return bA - aA;
  });

  let boardsUsed = 1;
  // skyline / shelf packing per board
  // Use shelf algorithm: track shelves as {y, nextX, height}[]
  type Shelf = { y: number; nextX: number; height: number };
  let shelves: Shelf[][] = [[{ y: 0, nextX: 0, height: 0 }]];

  for (const { piece, rotated } of expanded) {
    const pw = rotated ? piece.h : piece.w;
    const ph = rotated ? piece.w : piece.h;
    if (pw > boardW || ph > boardH) continue; // too large

    let placedThisPiece = false;
    for (let bi = 0; bi < boardsUsed; bi++) {
      const boardShelves = shelves[bi];
      for (const shelf of boardShelves) {
        const availableW = boardW - shelf.nextX;
        const availableH = boardH - shelf.y;
        if (pw + sawWidth <= availableW + sawWidth && ph <= availableH) {
          placed.push({
            id: piece.id,
            name: piece.name,
            x: shelf.nextX,
            y: shelf.y,
            w: pw,
            h: ph,
            rotated,
            boardIdx: bi,
          });
          // If this piece is taller than current shelf, open new shelf
          if (ph > shelf.height) {
            // update shelf height
            const newShelfY = shelf.y + ph + sawWidth;
            if (!boardShelves.find((s) => s.y === newShelfY)) {
              boardShelves.push({ y: newShelfY, nextX: 0, height: 0 });
            }
            shelf.height = ph;
          }
          shelf.nextX += pw + sawWidth;
          placedThisPiece = true;
          break;
        }
      }
      if (placedThisPiece) break;
    }
    if (!placedThisPiece) {
      // New board
      const newBoardIdx = boardsUsed;
      boardsUsed++;
      shelves.push([{ y: 0, nextX: 0, height: 0 }]);
      const newShelf = shelves[newBoardIdx][0];
      placed.push({
        id: piece.id, name: piece.name,
        x: 0, y: 0, w: pw, h: ph,
        rotated, boardIdx: newBoardIdx,
      });
      newShelf.nextX = pw + sawWidth;
      newShelf.height = ph;
    }
  }

  const totalBoardArea = boardsUsed * boardW * boardH;
  const usedArea = placed.reduce((s, p) => s + p.w * p.h, 0);
  const wasteArea = totalBoardArea - usedArea;
  return { placed, boardsUsed, usedArea, wasteArea };
}

const COLORS = [
  "#60a5fa","#34d399","#f59e0b","#f87171","#a78bfa",
  "#fb923c","#38bdf8","#4ade80","#e879f9","#facc15",
];

export default function WoodCuttingPlan() {
  const [boardPresetIdx, setBoardPresetIdx] = useState(0);
  const [customBoardW, setCustomBoardW] = useState(910);
  const [customBoardH, setCustomBoardH] = useState(1820);
  const [sawWidth, setSawWidth] = useState(3);
  const [pieces, setPieces] = useState<CutPiece[]>([
    { id: 1, name: "棚板", w: 400, h: 250, qty: 3 },
  ]);

  const preset = BOARD_PRESETS[boardPresetIdx];
  const boardW = preset.name === "カスタム" ? customBoardW : preset.w;
  const boardH = preset.name === "カスタム" ? customBoardH : preset.h;

  const result = useMemo(() => packPieces(boardW, boardH, pieces, sawWidth), [boardW, boardH, pieces, sawWidth]);

  const addPiece = () => {
    setPieces((prev) => [...prev, { id: nextPieceId++, name: `パーツ${prev.length + 1}`, w: 300, h: 200, qty: 1 }]);
  };
  const removePiece = (id: number) => setPieces((prev) => prev.filter((p) => p.id !== id));
  const updatePiece = (id: number, field: keyof CutPiece, value: number | string) =>
    setPieces((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));

  // Preview scale
  const previewW = 300;
  const previewH = Math.round(previewW * (boardH / boardW));
  const scale = previewW / boardW;

  const totalPieces = pieces.reduce((s, p) => s + p.qty, 0);
  const utilizationRate = (result.usedArea / (result.boardsUsed * boardW * boardH) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Board settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">板材のサイズ</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {BOARD_PRESETS.map((p, i) => (
            <button key={i} onClick={() => setBoardPresetIdx(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                boardPresetIdx === i ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-300"
              }`}>
              {p.name}
            </button>
          ))}
        </div>
        {preset.name === "カスタム" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">幅（mm）</label>
              <input type="number" min={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={customBoardW} onChange={(e) => setCustomBoardW(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">高さ（mm）</label>
              <input type="number" min={100} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={customBoardH} onChange={(e) => setCustomBoardH(Number(e.target.value))} />
            </div>
          </div>
        )}
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">ノコギリの刃幅（カーフ）: {sawWidth}mm</label>
          <div className="flex gap-2">
            {SAW_WIDTHS.map((w) => (
              <button key={w} onClick={() => setSawWidth(w)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  sawWidth === w ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300"
                }`}>
                {w}mm
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pieces */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">カットパーツ</h2>
          <button onClick={addPiece} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            + パーツ追加
          </button>
        </div>
        <div className="space-y-3">
          {pieces.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-3 h-10 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input className="text-sm bg-white border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                  value={p.name} onChange={(e) => updatePiece(p.id, "name", e.target.value)} />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 whitespace-nowrap">幅:</span>
                  <input type="number" min={10} className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                    value={p.w} onChange={(e) => updatePiece(p.id, "w", Number(e.target.value))} />
                  <span className="text-xs text-gray-400">mm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 whitespace-nowrap">高さ:</span>
                  <input type="number" min={10} className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                    value={p.h} onChange={(e) => updatePiece(p.id, "h", Number(e.target.value))} />
                  <span className="text-xs text-gray-400">mm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">×</span>
                  <input type="number" min={1} max={50} className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
                    value={p.qty} onChange={(e) => updatePiece(p.id, "qty", Number(e.target.value))} />
                  <span className="text-xs text-gray-400">枚</span>
                </div>
              </div>
              {pieces.length > 1 && (
                <button onClick={() => removePiece(p.id)} className="text-red-400 hover:text-red-600 text-xs flex-shrink-0">削除</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard label="使用枚数" value={`${result.boardsUsed}枚`} highlight />
        <SummaryCard label="パーツ合計" value={`${totalPieces}個`} />
        <SummaryCard label="材料利用率" value={`${utilizationRate}%`} />
        <SummaryCard label="無駄（面積）" value={`${(result.wasteArea / 1e6).toFixed(3)}m²`} />
      </div>

      {/* Layout preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">割付レイアウト（板{" "}1枚目）</h2>
        <div className="overflow-x-auto">
          <div className="relative bg-amber-50 border-2 border-amber-400 rounded"
            style={{ width: previewW, height: previewH }}>
            {result.placed.filter(p => p.boardIdx === 0).map((p, i) => {
              const colorIdx = pieces.findIndex(pc => pc.id === p.id);
              return (
                <div key={`${p.id}-${i}`}
                  className="absolute border border-white rounded-sm flex items-center justify-center overflow-hidden"
                  style={{
                    left: p.x * scale,
                    top: p.y * scale,
                    width: p.w * scale,
                    height: p.h * scale,
                    backgroundColor: COLORS[colorIdx % COLORS.length] + "cc",
                  }}
                >
                  <span className="text-[9px] font-semibold text-white text-center leading-tight px-0.5 drop-shadow">
                    {p.name}
                    {p.rotated ? "↻" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          板材: {boardW}×{boardH}mm（プレビューは縮小表示）
          {result.boardsUsed > 1 && <span className="ml-2 text-orange-600">※ {result.boardsUsed}枚目以降は省略</span>}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-2">
          {pieces.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              {p.name}（{p.w}×{p.h}mm × {p.qty}枚）
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${highlight ? "text-blue-700" : "text-gray-900"}`}>{value}</div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">よくある質問</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">この木材カット割付計算ツールは何ができますか？</summary>
      <p className="mt-2 text-sm text-gray-600">板材から効率的なカット配置を計算。入力するだけで即座に結果を表示します。</p>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "この木材カット割付計算ツールは何ができますか？", "acceptedAnswer": {"@type": "Answer", "text": "板材から効率的なカット配置を計算。入力するだけで即座に結果を表示します。"}}, {"@type": "Question", "name": "利用料金はかかりますか？", "acceptedAnswer": {"@type": "Answer", "text": "完全無料でご利用いただけます。会員登録も不要です。"}}, {"@type": "Question", "name": "計算結果は正確ですか？", "acceptedAnswer": {"@type": "Answer", "text": "一般的な計算式に基づいた概算値です。正確な数値が必要な場合は、専門家へのご相談をお勧めします。"}}]})}} />
      </div>
  );
}
