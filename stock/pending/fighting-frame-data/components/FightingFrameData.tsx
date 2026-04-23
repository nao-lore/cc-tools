"use client";
import { useState, useMemo } from "react";

interface Move {
  id: string;
  name: string;
  startup: number;
  active: number;
  recovery: number;
  guardStun: number;
  hitStun: number;
}

const DEFAULT_MOVES: Move[] = [
  { id: "1", name: "立ち弱P", startup: 4, active: 3, recovery: 9, guardStun: 12, hitStun: 14 },
  { id: "2", name: "立ち中P", startup: 6, active: 4, recovery: 14, guardStun: 15, hitStun: 19 },
  { id: "3", name: "立ち強P", startup: 8, active: 5, recovery: 20, guardStun: 18, hitStun: 24 },
];

interface MoveResult extends Move {
  totalFrames: number;
  guardAdvantage: number;
  hitAdvantage: number;
  isGuardSafe: boolean;
  isPunishable: boolean;
  fastestPunish: number;
}

function calcMove(m: Move): MoveResult {
  const totalFrames = m.startup + m.active + m.recovery;
  const guardAdvantage = m.guardStun - m.recovery;
  const hitAdvantage = m.hitStun - m.recovery;
  const isGuardSafe = guardAdvantage >= -3;
  const isPunishable = guardAdvantage < -3;
  const fastestPunish = Math.abs(guardAdvantage) + 1;
  return { ...m, totalFrames, guardAdvantage, hitAdvantage, isGuardSafe, isPunishable, fastestPunish };
}

function AdvBadge({ value }: { value: number }) {
  const color = value > 0 ? "bg-blue-100 text-blue-800" : value === 0 ? "bg-gray-100 text-gray-700" : value >= -3 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
  const sign = value > 0 ? "+" : "";
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{sign}{value}F</span>;
}

export default function FightingFrameData() {
  const [moves, setMoves] = useState<Move[]>(DEFAULT_MOVES);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [editMove, setEditMove] = useState<Move | null>(null);
  const [opponentStartup, setOpponentStartup] = useState(4);

  const results = useMemo(() => moves.map(calcMove), [moves]);
  const selectedResult = useMemo(() => results.find((r) => r.id === selectedId) ?? null, [results, selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setEditMove(null);
  };

  const startEdit = (m: Move) => setEditMove({ ...m });

  const saveEdit = () => {
    if (!editMove) return;
    setMoves((prev) => prev.map((m) => m.id === editMove.id ? editMove : m));
    setEditMove(null);
  };

  const addMove = () => {
    const id = String(Date.now());
    const newMove: Move = { id, name: "新技", startup: 5, active: 3, recovery: 12, guardStun: 14, hitStun: 16 };
    setMoves((prev) => [...prev, newMove]);
    setSelectedId(id);
    setEditMove({ ...newMove });
  };

  const removeMove = (id: string) => {
    setMoves((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id && moves.length > 1) setSelectedId(moves[0].id !== id ? moves[0].id : moves[1]?.id ?? "");
  };

  const FrameBar = ({ startup, active, recovery }: { startup: number; active: number; recovery: number }) => {
    const total = startup + active + recovery;
    return (
      <div className="w-full flex rounded overflow-hidden h-6 text-xs font-bold">
        <div style={{ width: `${(startup / total) * 100}%` }} className="bg-yellow-400 flex items-center justify-center text-yellow-900 min-w-[2px]">{startup > 3 ? `発${startup}` : ""}</div>
        <div style={{ width: `${(active / total) * 100}%` }} className="bg-red-500 flex items-center justify-center text-white min-w-[2px]">{active > 2 ? `持${active}` : ""}</div>
        <div style={{ width: `${(recovery / total) * 100}%` }} className="bg-blue-400 flex items-center justify-center text-white min-w-[2px]">{recovery > 3 ? `硬${recovery}` : ""}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Move list */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">技リスト</h2>
            <button onClick={addMove} className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">+ 追加</button>
          </div>
          <div className="space-y-1">
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => handleSelect(r.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedId === r.id ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-50 border border-transparent"}`}
              >
                <span className="font-medium text-sm text-gray-800">{r.name}</span>
                <div className="flex items-center gap-1">
                  <AdvBadge value={r.guardAdvantage} />
                  <button onClick={(e) => { e.stopPropagation(); removeMove(r.id); }} className="text-gray-300 hover:text-red-500 text-xs ml-1">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail / Edit */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-5">
          {editMove ? (
            <div>
              <h2 className="font-semibold text-gray-800 mb-4">技を編集</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">技名</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={editMove.name} onChange={(e) => setEditMove({ ...editMove, name: e.target.value })} />
                </div>
                {[
                  { key: "startup", label: "発生 (F)" },
                  { key: "active", label: "持続 (F)" },
                  { key: "recovery", label: "硬直 (F)" },
                  { key: "guardStun", label: "ガード硬直 (F)" },
                  { key: "hitStun", label: "ヒット硬直 (F)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={(editMove as Record<string, unknown>)[key] as number}
                      onChange={(e) => setEditMove({ ...editMove, [key]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">保存</button>
                <button onClick={() => setEditMove(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">キャンセル</button>
              </div>
            </div>
          ) : selectedResult ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 text-lg">{selectedResult.name}</h2>
                <button onClick={() => startEdit(selectedResult)} className="text-sm text-blue-600 hover:underline">編集</button>
              </div>
              <FrameBar startup={selectedResult.startup} active={selectedResult.active} recovery={selectedResult.recovery} />
              <div className="flex gap-3 mt-1 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-yellow-400" />発生</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" />持続</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-blue-400" />硬直</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                {[
                  { label: "発生", value: `${selectedResult.startup}F` },
                  { label: "持続", value: `${selectedResult.active}F` },
                  { label: "硬直", value: `${selectedResult.recovery}F` },
                  { label: "合計", value: `${selectedResult.totalFrames}F` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">ガード時有利フレーム</p>
                  <AdvBadge value={selectedResult.guardAdvantage} />
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedResult.isGuardSafe ? "ガード後安全 (-3F以内)" : `反撃確定: ${selectedResult.fastestPunish}F以下の技で反撃可能`}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">ヒット時有利フレーム</p>
                  <AdvBadge value={selectedResult.hitAdvantage} />
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedResult.hitAdvantage > 0 ? `+${selectedResult.hitAdvantage}F 有利で追撃可能` : "不利 (コンボ不可)"}
                  </p>
                </div>
              </div>

              {selectedResult.isPunishable && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-700">反撃確定技の条件</p>
                  <p className="text-sm text-red-600 mt-1">発生 {selectedResult.fastestPunish}F 以下の技で反撃可能</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Punish calculator */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold text-gray-800 mb-4">反撃チェック</h2>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">相手の技 (ガード有利F)</label>
            <input type="number" value={selectedResult?.guardAdvantage ?? 0} readOnly className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm w-24" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">自分の反撃技 発生F</label>
            <input type="number" min={1} max={99} value={opponentStartup} onChange={(e) => setOpponentStartup(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24" />
          </div>
        </div>
        {selectedResult && (
          <div className={`p-4 rounded-lg ${selectedResult.isPunishable && opponentStartup <= selectedResult.fastestPunish ? "bg-green-50 border border-green-300" : "bg-yellow-50 border border-yellow-200"}`}>
            {selectedResult.isPunishable && opponentStartup <= selectedResult.fastestPunish ? (
              <p className="text-green-800 font-semibold">反撃確定！発生 {opponentStartup}F の技でパニッシュ可能</p>
            ) : selectedResult.isPunishable ? (
              <p className="text-yellow-800">反撃不可。必要発生: {selectedResult.fastestPunish}F 以下 (現在: {opponentStartup}F)</p>
            ) : (
              <p className="text-yellow-800">この技はガード後安全 ({selectedResult.guardAdvantage}F 有利/不利)</p>
            )}
          </div>
        )}
      </div>

      {/* Summary table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">技名</th>
              <th className="px-4 py-3 text-center text-gray-600">発生</th>
              <th className="px-4 py-3 text-center text-gray-600">持続</th>
              <th className="px-4 py-3 text-center text-gray-600">硬直</th>
              <th className="px-4 py-3 text-center text-gray-600">合計</th>
              <th className="px-4 py-3 text-center text-gray-600">ガード</th>
              <th className="px-4 py-3 text-center text-gray-600">ヒット</th>
              <th className="px-4 py-3 text-center text-gray-600">安全</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} onClick={() => handleSelect(r.id)} className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedId === r.id ? "bg-blue-50" : ""}`}>
                <td className="px-4 py-2 font-medium text-gray-800">{r.name}</td>
                <td className="px-4 py-2 text-center text-gray-700">{r.startup}F</td>
                <td className="px-4 py-2 text-center text-gray-700">{r.active}F</td>
                <td className="px-4 py-2 text-center text-gray-700">{r.recovery}F</td>
                <td className="px-4 py-2 text-center text-gray-700">{r.totalFrames}F</td>
                <td className="px-4 py-2 text-center"><AdvBadge value={r.guardAdvantage} /></td>
                <td className="px-4 py-2 text-center"><AdvBadge value={r.hitAdvantage} /></td>
                <td className="px-4 py-2 text-center">{r.isGuardSafe ? <span className="text-green-600 font-bold">○</span> : <span className="text-red-600 font-bold">✕</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
