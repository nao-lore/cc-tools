"use client";
import { useState } from "react";

type Dimension = "2d" | "3d";

interface Vec2 { x: number; y: number }
interface Vec3 { x: number; y: number; z: number }
type Vec = Vec2 | Vec3;

function is3d(v: Vec): v is Vec3 { return "z" in v; }

function norm(v: Vec): number {
  if (is3d(v)) return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  return Math.sqrt(v.x ** 2 + v.y ** 2);
}

function add(a: Vec, b: Vec): Vec {
  if (is3d(a) && is3d(b)) return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  return { x: (a as Vec2).x + (b as Vec2).x, y: (a as Vec2).y + (b as Vec2).y };
}

function sub(a: Vec, b: Vec): Vec {
  if (is3d(a) && is3d(b)) return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  return { x: (a as Vec2).x - (b as Vec2).x, y: (a as Vec2).y - (b as Vec2).y };
}

function scale(v: Vec, s: number): Vec {
  if (is3d(v)) return { x: v.x * s, y: v.y * s, z: v.z * s };
  return { x: v.x * s, y: v.y * s };
}

function dot(a: Vec, b: Vec): number {
  if (is3d(a) && is3d(b)) return a.x * b.x + a.y * b.y + a.z * b.z;
  return (a as Vec2).x * (b as Vec2).x + (a as Vec2).y * (b as Vec2).y;
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function angleBetween(a: Vec, b: Vec): number {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return NaN;
  const cos = Math.max(-1, Math.min(1, dot(a, b) / (na * nb)));
  return Math.acos(cos) * (180 / Math.PI);
}

function normalize(v: Vec): Vec {
  const n = norm(v);
  if (n === 0) return v;
  return scale(v, 1 / n);
}

function fmtVec(v: Vec, dec = 4): string {
  if (is3d(v)) return `(${fmt(v.x, dec)}, ${fmt(v.y, dec)}, ${fmt(v.z, dec)})`;
  return `(${fmt(v.x, dec)}, ${fmt(v.y, dec)})`;
}

function fmt(n: number, dec = 4): string {
  if (isNaN(n)) return "NaN";
  if (!isFinite(n)) return n > 0 ? "∞" : "-∞";
  return parseFloat(n.toFixed(dec)).toString();
}

function parseVec2(x: string, y: string): Vec2 {
  return { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
}

function parseVec3(x: string, y: string, z: string): Vec3 {
  return { x: parseFloat(x) || 0, y: parseFloat(y) || 0, z: parseFloat(z) || 0 };
}

interface VecInputProps {
  label: string;
  color: string;
  dim: Dimension;
  x: string; y: string; z: string;
  onX: (v: string) => void;
  onY: (v: string) => void;
  onZ: (v: string) => void;
}

function VecInput({ label, color, dim, x, y, z, onX, onY, onZ }: VecInputProps) {
  const inputClass = `w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${color}-500 font-mono text-sm`;
  return (
    <div className={`rounded-xl p-4 border-2 border-${color}-200 bg-${color}-50`}>
      <p className={`text-sm font-bold text-${color}-700 mb-3`}>{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-600 mb-1">x</label>
          <input type="number" value={x} onChange={(e) => onX(e.target.value)} className={inputClass} placeholder="0" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">y</label>
          <input type="number" value={y} onChange={(e) => onY(e.target.value)} className={inputClass} placeholder="0" />
        </div>
        {dim === "3d" && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">z</label>
            <input type="number" value={z} onChange={(e) => onZ(e.target.value)} className={inputClass} placeholder="0" />
          </div>
        )}
      </div>
    </div>
  );
}

interface ResultRowProps { label: string; value: string; sub?: string }
function ResultRow({ label, value, sub }: ResultRowProps) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600 shrink-0 mr-4">{label}</span>
      <div className="text-right">
        <span className="font-mono text-sm font-semibold text-gray-800">{value}</span>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const PRESETS_2D = [
  { name: "単位ベクトル X,Y", a: ["1", "0", "0"], b: ["0", "1", "0"] },
  { name: "45° (1,1) と (1,0)", a: ["1", "1", "0"], b: ["1", "0", "0"] },
  { name: "直交ベクトル", a: ["3", "4", "0"], b: ["-4", "3", "0"] },
];

const PRESETS_3D = [
  { name: "単位ベクトル X,Y", a: ["1", "0", "0"], b: ["0", "1", "0"] },
  { name: "単位ベクトル X,Z", a: ["1", "0", "0"], b: ["0", "0", "1"] },
  { name: "3D 斜めベクトル", a: ["1", "2", "3"], b: ["4", "5", "6"] },
];

export default function VectorCalc() {
  const [dim, setDim] = useState<Dimension>("3d");
  const [ax, setAx] = useState("1");
  const [ay, setAy] = useState("2");
  const [az, setAz] = useState("3");
  const [bx, setBx] = useState("4");
  const [by, setBy] = useState("5");
  const [bz, setBz] = useState("6");
  const [scalar, setScalar] = useState("2");
  const [dec, setDec] = useState(4);

  const loadPreset = (p: typeof PRESETS_3D[0]) => {
    setAx(p.a[0]); setAy(p.a[1]); setAz(p.a[2]);
    setBx(p.b[0]); setBy(p.b[1]); setBz(p.b[2]);
  };

  const a: Vec = dim === "3d" ? parseVec3(ax, ay, az) : parseVec2(ax, ay);
  const b: Vec = dim === "3d" ? parseVec3(bx, by, bz) : parseVec2(bx, by);
  const s = parseFloat(scalar) || 1;

  const normA = norm(a);
  const normB = norm(b);
  const dotAB = dot(a, b);
  const angle = angleBetween(a, b);
  const addAB = add(a, b);
  const subAB = sub(a, b);
  const scaleA = scale(a, s);
  const scaleB = scale(b, s);
  const normVecA = normalize(a);
  const normVecB = normalize(b);

  const presets = dim === "2d" ? PRESETS_2D : PRESETS_3D;

  return (
    <div className="space-y-6">
      {/* 設定 */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">次元:</label>
            <div className="flex gap-1">
              {(["2d", "3d"] as Dimension[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDim(d)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    dim === d ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {d.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">スカラー k =</label>
            <input
              type="number"
              value={scalar}
              onChange={(e) => setScalar(e.target.value)}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">小数桁:</label>
            <select value={dec} onChange={(e) => setDec(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {[2, 3, 4, 6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-500">プリセット:</span>
          {presets.map((p) => (
            <button key={p.name} onClick={() => loadPreset(p)}
              className="px-2 py-0.5 text-xs border border-gray-200 rounded-full text-gray-600 hover:border-gray-400 transition-colors">
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ベクトル入力 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VecInput label="ベクトル A" color="blue" dim={dim} x={ax} y={ay} z={az} onX={setAx} onY={setAy} onZ={setAz} />
        <VecInput label="ベクトル B" color="green" dim={dim} x={bx} y={by} z={bz} onX={setBx} onY={setBy} onZ={setBz} />
      </div>

      {/* 結果 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 個別プロパティ */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">個別ベクトルのプロパティ</h2>
          <div className="space-y-1">
            <ResultRow label="|A| ノルム（大きさ）" value={`${fmt(normA, dec)}`} />
            <ResultRow label="|B| ノルム（大きさ）" value={`${fmt(normB, dec)}`} />
            <ResultRow label="Â 単位ベクトル A" value={fmtVec(normVecA, dec)} sub={`|Â| = 1`} />
            <ResultRow label="B̂ 単位ベクトル B" value={fmtVec(normVecB, dec)} sub={`|B̂| = 1`} />
            <ResultRow label={`kA（k=${s}）`} value={fmtVec(scaleA, dec)} sub={`|kA| = ${fmt(norm(scaleA), dec)}`} />
            <ResultRow label={`kB（k=${s}）`} value={fmtVec(scaleB, dec)} sub={`|kB| = ${fmt(norm(scaleB), dec)}`} />
          </div>
        </div>

        {/* A×B演算 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">A と B の演算</h2>
          <div className="space-y-1">
            <ResultRow label="A + B（和）" value={fmtVec(addAB, dec)} sub={`|A+B| = ${fmt(norm(addAB), dec)}`} />
            <ResultRow label="A − B（差）" value={fmtVec(subAB, dec)} sub={`|A-B| = ${fmt(norm(subAB), dec)}`} />
            <ResultRow
              label="A · B（内積）"
              value={fmt(dotAB, dec)}
              sub={normA > 0 && normB > 0 ? `= |A||B|cos θ = ${fmt(normA * normB, dec)} × cos(${fmt(angle, 2)}°)` : ""}
            />
            <ResultRow
              label="θ（なす角）"
              value={isNaN(angle) ? "未定義（零ベクトル）" : `${fmt(angle, dec)}°`}
              sub={`ラジアン: ${isNaN(angle) ? "—" : fmt(angle * Math.PI / 180, dec)}`}
            />
            {dim === "3d" && (
              <>
                {(() => {
                  const cv = cross(a as Vec3, b as Vec3);
                  return (
                    <ResultRow
                      label="A × B（外積）"
                      value={fmtVec(cv, dec)}
                      sub={`|A×B| = ${fmt(norm(cv), dec)}（平行四辺形の面積）`}
                    />
                  );
                })()}
                {(() => {
                  const cv = cross(a as Vec3, b as Vec3);
                  const triArea = norm(cv) / 2;
                  return (
                    <ResultRow
                      label="三角形の面積"
                      value={`${fmt(triArea, dec)}`}
                      sub="= |A × B| / 2"
                    />
                  );
                })()}
              </>
            )}
            <ResultRow
              label="A · B / |B|²（BへのA射影スカラー）"
              value={normB > 0 ? fmt(dotAB / (normB * normB), dec) : "未定義"}
            />
          </div>
        </div>
      </div>

      {/* 視覚表示（2Dのみ） */}
      {dim === "2d" && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">2Dプレビュー</h2>
          <div className="flex justify-center">
            <svg width="300" height="300" viewBox="-6 -6 12 12" className="border border-gray-200 rounded-lg bg-gray-50">
              {/* Grid */}
              {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(i => (
                <g key={i}>
                  <line x1={i} y1={-6} x2={i} y2={6} stroke="#e5e7eb" strokeWidth={0.05} />
                  <line x1={-6} y1={i} x2={6} y2={i} stroke="#e5e7eb" strokeWidth={0.05} />
                </g>
              ))}
              {/* Axes */}
              <line x1={-6} y1={0} x2={6} y2={0} stroke="#9ca3af" strokeWidth={0.08} />
              <line x1={0} y1={-6} x2={0} y2={6} stroke="#9ca3af" strokeWidth={0.08} />
              {/* Vector A */}
              <defs>
                <marker id="arrowA" markerWidth={3} markerHeight={3} refX={2} refY={1.5} orient="auto">
                  <polygon points="0 0, 3 1.5, 0 3" fill="#3b82f6" />
                </marker>
                <marker id="arrowB" markerWidth={3} markerHeight={3} refX={2} refY={1.5} orient="auto">
                  <polygon points="0 0, 3 1.5, 0 3" fill="#22c55e" />
                </marker>
                <marker id="arrowS" markerWidth={3} markerHeight={3} refX={2} refY={1.5} orient="auto">
                  <polygon points="0 0, 3 1.5, 0 3" fill="#f97316" />
                </marker>
              </defs>
              <line
                x1={0} y1={0}
                x2={(a as Vec2).x * 0.9} y2={-(a as Vec2).y * 0.9}
                stroke="#3b82f6" strokeWidth={0.15}
                markerEnd="url(#arrowA)"
              />
              <text x={(a as Vec2).x + 0.2} y={-(a as Vec2).y} fontSize={0.5} fill="#3b82f6">A</text>
              <line
                x1={0} y1={0}
                x2={(b as Vec2).x * 0.9} y2={-(b as Vec2).y * 0.9}
                stroke="#22c55e" strokeWidth={0.15}
                markerEnd="url(#arrowB)"
              />
              <text x={(b as Vec2).x + 0.2} y={-(b as Vec2).y} fontSize={0.5} fill="#22c55e">B</text>
              {/* Sum vector */}
              <line
                x1={0} y1={0}
                x2={(addAB as Vec2).x * 0.9} y2={-(addAB as Vec2).y * 0.9}
                stroke="#f97316" strokeWidth={0.1} strokeDasharray="0.3,0.2"
                markerEnd="url(#arrowS)"
              />
              <text x={(addAB as Vec2).x + 0.2} y={-(addAB as Vec2).y} fontSize={0.4} fill="#f97316">A+B</text>
            </svg>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">青: A / 緑: B / オレンジ点線: A+B</p>
        </div>
      )}
    </div>
  );
}
