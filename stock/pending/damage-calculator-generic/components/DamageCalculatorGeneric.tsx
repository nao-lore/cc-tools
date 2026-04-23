"use client";
import { useState, useMemo } from "react";

const ELEMENT_MULTIPLIERS: Record<string, number> = {
  "なし（等倍）": 1.0,
  "弱点属性": 1.5,
  "超弱点属性": 2.0,
  "半減属性": 0.5,
  "耐性属性": 0.25,
  "無効": 0,
  "吸収": -1,
};

const FORMULA_TYPES = [
  { id: "standard", label: "標準式", desc: "(攻撃力 × バフ) − 防御力 × 0.5" },
  { id: "pct", label: "防御率式", desc: "攻撃力 × バフ × (1 − 防御力 / (防御力 + 1000))" },
  { id: "ratio", label: "倍率式", desc: "基礎ダメージ × (攻撃力 / 防御力)" },
  { id: "fixed", label: "固定ダメージ", desc: "攻撃力 × バフ（防御無視）" },
];

function calcDamage(
  formula: string,
  atk: number,
  def: number,
  atkBuff: number,
  defBuff: number,
  elemMult: number,
  critRate: number,
  critDmg: number,
  flatBonus: number
): { base: number; min: number; max: number; crit: number; expected: number } {
  const atkFinal = atk * (1 + atkBuff / 100);
  const defFinal = def * (1 + defBuff / 100);

  let base = 0;
  switch (formula) {
    case "standard":
      base = Math.max(1, atkFinal - defFinal * 0.5);
      break;
    case "pct":
      base = atkFinal * (1 - defFinal / (defFinal + 1000));
      break;
    case "ratio":
      base = defFinal > 0 ? (atkFinal / defFinal) * 100 : atkFinal;
      break;
    case "fixed":
      base = atkFinal;
      break;
  }
  base = (base + flatBonus) * elemMult;
  const minDmg = Math.max(0, base * 0.9);
  const maxDmg = base * 1.1;
  const crit = base * (1 + critDmg / 100);
  const expected = base * (1 + (critRate / 100) * (critDmg / 100));
  return { base, min: minDmg, max: maxDmg, crit, expected };
}

interface Skill {
  id: number;
  name: string;
  multiplier: number;
  hits: number;
}

export default function DamageCalculatorGeneric() {
  const [formula, setFormula] = useState("standard");
  const [atk, setAtk] = useState(1200);
  const [def, setDef] = useState(800);
  const [atkBuff, setAtkBuff] = useState(30);
  const [defBuff, setDefBuff] = useState(0);
  const [element, setElement] = useState("なし（等倍）");
  const [critRate, setCritRate] = useState(25);
  const [critDmg, setCritDmg] = useState(150);
  const [flatBonus, setFlatBonus] = useState(0);
  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: "通常攻撃", multiplier: 100, hits: 1 },
    { id: 2, name: "スキル攻撃", multiplier: 250, hits: 3 },
    { id: 3, name: "必殺技", multiplier: 600, hits: 1 },
  ]);

  const elemMult = ELEMENT_MULTIPLIERS[element] ?? 1;

  const baseResult = useMemo(
    () => calcDamage(formula, atk, def, atkBuff, defBuff, elemMult, critRate, critDmg, flatBonus),
    [formula, atk, def, atkBuff, defBuff, elemMult, critRate, critDmg, flatBonus]
  );

  const skillResults = useMemo(
    () =>
      skills.map((sk) => {
        const r = calcDamage(
          formula,
          (atk * sk.multiplier) / 100,
          def,
          atkBuff,
          defBuff,
          elemMult,
          critRate,
          critDmg,
          flatBonus
        );
        return {
          ...sk,
          totalBase: r.base * sk.hits,
          totalCrit: r.crit * sk.hits,
          totalExpected: r.expected * sk.hits,
          perHit: r.base,
        };
      }),
    [skills, formula, atk, def, atkBuff, defBuff, elemMult, critRate, critDmg, flatBonus]
  );

  const maxExpected = Math.max(...skillResults.map((s) => s.totalExpected), 1);

  const addSkill = () =>
    setSkills([...skills, { id: Date.now(), name: `スキル${skills.length + 1}`, multiplier: 150, hits: 1 }]);

  const removeSkill = (id: number) => setSkills(skills.filter((s) => s.id !== id));

  const updateSkill = (id: number, field: keyof Skill, value: string | number) =>
    setSkills(skills.map((s) => (s.id === id ? { ...s, [field]: field === "name" ? value : Number(value) } : s)));

  const fmt = (n: number) => Math.max(0, Math.round(n)).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Formula */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">計算式の選択</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FORMULA_TYPES.map((f) => (
            <label
              key={f.id}
              className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-colors ${
                formula === f.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="formula"
                  value={f.id}
                  checked={formula === f.id}
                  onChange={() => setFormula(f.id)}
                  className="accent-indigo-600"
                />
                <span className="font-medium text-gray-800 text-sm">{f.label}</span>
              </div>
              <span className="text-xs text-gray-500 ml-5">{f.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ステータス入力</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "攻撃力", value: atk, set: setAtk, min: 1 },
            { label: "防御力（敵）", value: def, set: setDef, min: 0 },
            { label: "攻撃バフ (%)", value: atkBuff, set: setAtkBuff, min: 0 },
            { label: "防御デバフ (%)", value: defBuff, set: setDefBuff, min: 0 },
          ].map(({ label, value, set, min }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                min={min}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">属性補正</label>
            <select
              value={element}
              onChange={(e) => setElement(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.keys(ELEMENT_MULTIPLIERS).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">会心率 (%)</label>
            <input
              type="number"
              value={critRate}
              onChange={(e) => setCritRate(Math.min(100, Number(e.target.value)))}
              min={0}
              max={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">会心ダメージ倍率 (%)</label>
            <input
              type="number"
              value={critDmg}
              onChange={(e) => setCritDmg(Number(e.target.value))}
              min={100}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">固定加算ダメージ</label>
            <input
              type="number"
              value={flatBonus}
              onChange={(e) => setFlatBonus(Number(e.target.value))}
              min={0}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Base result */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">基礎ダメージ（倍率100%・1ヒット）</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "最小", value: baseResult.min, color: "text-gray-700" },
            { label: "基礎", value: baseResult.base, color: "text-indigo-700" },
            { label: "最大", value: baseResult.max, color: "text-gray-700" },
            { label: "会心時", value: baseResult.crit, color: "text-orange-600" },
            { label: "期待値", value: baseResult.expected, color: "text-green-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
              <p className={`text-xl font-bold ${color}`}>{fmt(value)}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
        {elemMult === 0 && (
          <div className="mt-3 bg-gray-100 rounded-lg p-3 text-sm text-gray-600 text-center">
            属性が「無効」のためダメージは0です
          </div>
        )}
        {elemMult < 0 && (
          <div className="mt-3 bg-green-50 rounded-lg p-3 text-sm text-green-700 text-center">
            属性が「吸収」のため、敵はダメージを回復します
          </div>
        )}
      </div>

      {/* Skill comparison */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">スキルダメージ比較</h2>
          <button onClick={addSkill} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            + スキル追加
          </button>
        </div>
        <div className="space-y-4">
          {skillResults.map((r) => (
            <div key={r.id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <input
                  type="text"
                  value={r.name}
                  onChange={(e) => updateSkill(r.id, "name", e.target.value)}
                  className="flex-1 min-w-32 border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">倍率:</label>
                  <input
                    type="number"
                    value={r.multiplier}
                    onChange={(e) => updateSkill(r.id, "multiplier", e.target.value)}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs text-gray-500">ヒット数:</label>
                  <input
                    type="number"
                    value={r.hits}
                    onChange={(e) => updateSkill(r.id, "hits", e.target.value)}
                    min={1}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {skills.length > 1 && (
                  <button onClick={() => removeSkill(r.id)} className="text-red-400 hover:text-red-600 text-xs">
                    削除
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${(r.totalExpected / maxExpected) * 100}%` }}
                  />
                </div>
                <span className="text-indigo-700 font-bold text-sm w-28 text-right">
                  {fmt(r.totalExpected)}（期待）
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                <span>1ヒット: {fmt(r.perHit)}</span>
                <span>合計（通常）: {fmt(r.totalBase)}</span>
                <span>会心時合計: {fmt(r.totalCrit)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
