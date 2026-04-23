"use client";

import { useState, useMemo } from "react";

// --- ジャンル別RPMプリセット ---
interface GenrePreset {
  label: string;
  rpmMin: number;
  rpmMax: number;
}

const GENRE_PRESETS: GenrePreset[] = [
  { label: "ゲーム",   rpmMin: 2,  rpmMax: 4  },
  { label: "教育",     rpmMin: 5,  rpmMax: 10 },
  { label: "金融",     rpmMin: 10, rpmMax: 20 },
  { label: "エンタメ", rpmMin: 3,  rpmMax: 6  },
  { label: "テック",   rpmMin: 5,  rpmMax: 8  },
];

// 収益化条件
const MONETIZE_SUBS = 1000;
const MONETIZE_HOURS = 4000;

// --- ユーティリティ ---
function parseNum(s: string): number {
  const cleaned = s.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  const v = parseFloat(cleaned);
  return isFinite(v) ? v : 0;
}

function fmtJPY(n: number): string {
  if (!isFinite(n) || n < 0) return "—";
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

function fmtUSD(n: number): string {
  if (!isFinite(n) || n < 0) return "—";
  return `$${n.toFixed(2)}`;
}

// RPM (Revenue Per Mille) → 1000再生あたりの収益
// 広告収益 = 再生数 / 1000 × RPM
function calcAdRevenue(views: number, rpm: number): number {
  return (views / 1000) * rpm;
}

// 登録者数から月間再生数を推定（登録者の10〜30%が視聴）
function estimateViewsFromSubs(subs: number, rate: number): number {
  return subs * (rate / 100);
}

// USD → JPY 換算（参考レート）
const USD_TO_JPY = 150;

// --- 入力コンポーネント ---
interface InputRowProps {
  label: string;
  sub?: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  placeholder?: string;
  inputMode?: "numeric" | "decimal";
}

function InputRow({ label, sub, value, onChange, unit, placeholder = "0", inputMode = "numeric" }: InputRowProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {sub && <span className="text-xs text-gray-400 ml-1.5">{sub}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 text-right text-base font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
        />
        <span className="text-gray-600 font-medium text-sm w-16 shrink-0">{unit}</span>
      </div>
    </div>
  );
}

// --- 結果カード ---
interface ResultCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

function ResultCard({ label, value, sub, accent }: ResultCardProps) {
  return (
    <div className={`rounded-xl border p-4 text-center ${accent ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
      <div className={`text-xs font-medium mb-1 ${accent ? "text-red-700" : "text-gray-600"}`}>{label}</div>
      <div className={`text-2xl font-bold ${accent ? "text-red-900" : "text-gray-800"}`}>{value}</div>
      {sub && <div className={`text-xs mt-1 ${accent ? "text-red-600" : "text-gray-500"}`}>{sub}</div>}
    </div>
  );
}

// --- メインコンポーネント ---
export default function YoutubeRevenue() {
  // 入力モード
  const [inputMode, setInputMode] = useState<"views" | "subs">("views");

  // 月間再生回数（直接入力）
  const [viewsInput, setViewsInput] = useState("");

  // 登録者数からの推定
  const [subsInput, setSubsInput] = useState("");
  const [viewRateInput, setViewRateInput] = useState("15");

  // RPM
  const [rpmInput, setRpmInput] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  // 追加収入
  const [superChatInput, setSuperChatInput] = useState("");
  const [membershipInput, setMembershipInput] = useState("");
  const [sponsorInput, setSponsorInput] = useState("");

  // 収益化チェック用
  const [subsForCheck, setSubsForCheck] = useState("");
  const [watchHoursInput, setWatchHoursInput] = useState("");

  // ジャンル選択でRPMを中央値にセット
  function handleGenreSelect(idx: number) {
    setSelectedGenre(idx);
    const preset = GENRE_PRESETS[idx];
    const mid = ((preset.rpmMin + preset.rpmMax) / 2).toFixed(1);
    setRpmInput(mid);
  }

  // 月間再生数の解決
  const monthlyViews = useMemo(() => {
    if (inputMode === "views") return parseNum(viewsInput);
    const subs = parseNum(subsInput);
    const rate = parseNum(viewRateInput) || 15;
    return estimateViewsFromSubs(subs, rate);
  }, [inputMode, viewsInput, subsInput, viewRateInput]);

  const rpm = useMemo(() => parseNum(rpmInput), [rpmInput]);

  // 広告収益（USD）
  const adRevenueUSD = useMemo(() => {
    if (monthlyViews <= 0 || rpm <= 0) return 0;
    return calcAdRevenue(monthlyViews, rpm);
  }, [monthlyViews, rpm]);

  const adRevenueJPY = adRevenueUSD * USD_TO_JPY;

  // 追加収入（JPY）
  const superChat = useMemo(() => parseNum(superChatInput), [superChatInput]);
  const membership = useMemo(() => parseNum(membershipInput), [membershipInput]);
  const sponsor = useMemo(() => parseNum(sponsorInput), [sponsorInput]);

  const totalMonthlyJPY = adRevenueJPY + superChat + membership + sponsor;
  const totalAnnualJPY = totalMonthlyJPY * 12;

  // 収益化条件チェック
  const checkSubs = useMemo(() => parseNum(subsForCheck), [subsForCheck]);
  const checkHours = useMemo(() => parseNum(watchHoursInput), [watchHoursInput]);
  const subsOk = checkSubs >= MONETIZE_SUBS;
  const hoursOk = checkHours >= MONETIZE_HOURS;
  const monetizeOk = subsOk && hoursOk;

  const hasResult = totalMonthlyJPY > 0;

  return (
    <div className="space-y-6">

      {/* 入力モード切替 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {[
          { key: "views" as const, label: "再生回数で入力" },
          { key: "subs"  as const, label: "登録者数から推定" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setInputMode(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              inputMode === key
                ? "bg-red-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 再生数 / 登録者数 入力 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {inputMode === "views" ? "月間再生回数" : "チャンネル登録者数"}
        </h2>

        {inputMode === "views" ? (
          <InputRow
            label="月間総再生回数"
            value={viewsInput}
            onChange={setViewsInput}
            unit="回/月"
            placeholder="100,000"
          />
        ) : (
          <>
            <InputRow
              label="チャンネル登録者数"
              value={subsInput}
              onChange={setSubsInput}
              unit="人"
              placeholder="10,000"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                視聴率（登録者の何%が視聴するか）
                <span className="text-xs text-gray-400 ml-1.5">一般的: 10〜30%</span>
              </label>
              <div className="flex gap-2 mb-2">
                {[10, 15, 20, 30].map((r) => (
                  <button
                    key={r}
                    onClick={() => setViewRateInput(String(r))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      viewRateInput === String(r)
                        ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {r}%
                  </button>
                ))}
              </div>
              <InputRow
                label=""
                value={viewRateInput}
                onChange={setViewRateInput}
                unit="%"
                placeholder="15"
                inputMode="decimal"
              />
            </div>
            {parseNum(subsInput) > 0 && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-sm text-red-800">
                推定月間再生数: <strong>{Math.round(monthlyViews).toLocaleString("ja-JP")} 回</strong>
              </div>
            )}
          </>
        )}
      </div>

      {/* RPM設定 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">RPM（1,000再生あたりの収益）</h2>

        {/* ジャンル別プリセット */}
        <div>
          <p className="text-sm text-gray-600 mb-2">ジャンル別目安から選択</p>
          <div className="grid grid-cols-5 gap-2">
            {GENRE_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                onClick={() => handleGenreSelect(idx)}
                className={`py-2 px-1 rounded-xl text-xs font-medium transition-all border text-center ${
                  selectedGenre === idx
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div>{preset.label}</div>
                <div className="text-gray-400 mt-0.5">${preset.rpmMin}–${preset.rpmMax}</div>
              </button>
            ))}
          </div>
        </div>

        <InputRow
          label="RPM（直接入力可）"
          sub="$USD"
          value={rpmInput}
          onChange={(v) => { setRpmInput(v); setSelectedGenre(null); }}
          unit="$/1000回"
          placeholder="3.00"
          inputMode="decimal"
        />

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>参考レート</span>
            <span className="font-medium">$1 = ¥{USD_TO_JPY}</span>
          </div>
          {rpm > 0 && monthlyViews > 0 && (
            <div className="flex justify-between text-red-700 font-medium">
              <span>広告収益（月）</span>
              <span>{fmtUSD(adRevenueUSD)} = {fmtJPY(adRevenueJPY)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 追加収入 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">追加収入（任意）</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InputRow
            label="Super Chat"
            sub="月間合計"
            value={superChatInput}
            onChange={setSuperChatInput}
            unit="円/月"
            placeholder="0"
          />
          <InputRow
            label="メンバーシップ"
            sub="月間合計"
            value={membershipInput}
            onChange={setMembershipInput}
            unit="円/月"
            placeholder="0"
          />
          <InputRow
            label="案件・スポンサー"
            sub="月間合計"
            value={sponsorInput}
            onChange={setSponsorInput}
            unit="円/月"
            placeholder="0"
          />
        </div>
      </div>

      {/* 収益結果 */}
      {hasResult && (
        <div className="space-y-4">
          {/* メイン結果バナー */}
          <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="text-sm font-semibold opacity-80 mb-4">
              月間{Math.round(monthlyViews).toLocaleString("ja-JP")}回再生 / RPM ${rpm.toFixed(2)} の場合
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs opacity-70 mb-1">月収（合計）</div>
                <div className="text-3xl font-bold">{fmtJPY(totalMonthlyJPY)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">年収（合計）</div>
                <div className="text-3xl font-bold">{fmtJPY(totalAnnualJPY)}</div>
              </div>
            </div>
          </div>

          {/* 収益内訳 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">収益内訳</h2>
            <div className="space-y-2">
              <RevenueRow label="広告収益" jpy={adRevenueJPY} total={totalMonthlyJPY} sub={fmtUSD(adRevenueUSD)} />
              {superChat > 0 && <RevenueRow label="Super Chat" jpy={superChat} total={totalMonthlyJPY} />}
              {membership > 0 && <RevenueRow label="メンバーシップ" jpy={membership} total={totalMonthlyJPY} />}
              {sponsor > 0 && <RevenueRow label="案件・スポンサー" jpy={sponsor} total={totalMonthlyJPY} />}
            </div>
          </div>

          {/* 月収・年収カード */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="月収" value={fmtJPY(totalMonthlyJPY)} accent />
            <ResultCard label="年収" value={fmtJPY(totalAnnualJPY)} accent />
            <ResultCard
              label="広告収益（月）"
              value={fmtJPY(adRevenueJPY)}
              sub={`${fmtUSD(adRevenueUSD)}`}
            />
            <ResultCard
              label="非広告収益（月）"
              value={fmtJPY(superChat + membership + sponsor)}
              sub={totalMonthlyJPY > 0 ? `合計の${Math.round(((superChat + membership + sponsor) / totalMonthlyJPY) * 100)}%` : undefined}
            />
          </div>
        </div>
      )}

      {/* RPM別シミュレーション表 */}
      {monthlyViews > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">RPM別 月収シミュレーション</h2>
          <p className="text-xs text-gray-500 mb-4">月間{Math.round(monthlyViews).toLocaleString("ja-JP")}回再生の場合</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 font-semibold text-gray-600 text-xs">RPM</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 text-xs">月収（広告）</th>
                  <th className="text-right py-2 pl-3 font-semibold text-gray-600 text-xs">年収（広告）</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 5, 7, 10, 15, 20].map((r) => {
                  const monthly = calcAdRevenue(monthlyViews, r) * USD_TO_JPY;
                  const annual = monthly * 12;
                  const isHighlighted = rpm > 0 && Math.abs(r - rpm) < 1.5;
                  return (
                    <tr
                      key={r}
                      className={`border-b border-gray-50 ${isHighlighted ? "bg-red-50" : "hover:bg-gray-50"}`}
                    >
                      <td className={`py-2.5 pr-3 font-bold ${isHighlighted ? "text-red-700" : "text-gray-800"}`}>
                        ${r}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-medium ${isHighlighted ? "text-red-800" : "text-gray-700"}`}>
                        {fmtJPY(monthly)}
                      </td>
                      <td className={`py-2.5 pl-3 text-right font-medium ${isHighlighted ? "text-red-800" : "text-gray-700"}`}>
                        {fmtJPY(annual)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 収益化条件チェック */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">収益化条件チェック</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <InputRow
              label="チャンネル登録者数"
              value={subsForCheck}
              onChange={setSubsForCheck}
              unit="人"
              placeholder="1,000"
            />
            {checkSubs > 0 && (
              <ConditionBadge ok={subsOk} label={`登録者 ${MONETIZE_SUBS.toLocaleString()}人以上`} current={checkSubs} target={MONETIZE_SUBS} unit="人" />
            )}
          </div>
          <div>
            <InputRow
              label="過去12ヶ月の総視聴時間"
              value={watchHoursInput}
              onChange={setWatchHoursInput}
              unit="時間"
              placeholder="4,000"
            />
            {checkHours > 0 && (
              <ConditionBadge ok={hoursOk} label={`視聴時間 ${MONETIZE_HOURS.toLocaleString()}時間以上`} current={checkHours} target={MONETIZE_HOURS} unit="時間" />
            )}
          </div>
        </div>
        {(checkSubs > 0 || checkHours > 0) && (
          <div className={`mt-4 p-4 rounded-xl border text-center font-semibold text-sm ${
            monetizeOk
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}>
            {monetizeOk
              ? "収益化の条件を満たしています"
              : `まだ条件を満たしていません（${!subsOk ? `登録者${(MONETIZE_SUBS - checkSubs).toLocaleString()}人不足` : ""}${!subsOk && !hoursOk ? " / " : ""}${!hoursOk ? `視聴時間${(MONETIZE_HOURS - checkHours).toLocaleString()}時間不足` : ""}）`
            }
          </div>
        )}
      </div>

      {/* 注意書き */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500">
          広告収益はRPM（Revenue Per Mille）方式で計算。RPMはジャンル・視聴者層・時期により大きく変動します。
          参考レート $1 = ¥{USD_TO_JPY}。実際の収益はYouTube Studioのアナリティクスでご確認ください。
          収益化にはYouTubeパートナープログラム（YPP）への参加が必要です。
        </p>
      </div>
    </div>
  );
}

// --- 収益行 ---
interface RevenueRowProps {
  label: string;
  jpy: number;
  total: number;
  sub?: string;
}

function RevenueRow({ label, jpy, total, sub }: RevenueRowProps) {
  const pct = total > 0 ? Math.round((jpy / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-32 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-red-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-24 text-right shrink-0">{fmtJPY(jpy)}</span>
      <span className="text-xs text-gray-400 w-10 text-right shrink-0">{pct}%</span>
      {sub && <span className="text-xs text-gray-400 w-16 text-right shrink-0">{sub}</span>}
    </div>
  );
}

// --- 条件バッジ ---
interface ConditionBadgeProps {
  ok: boolean;
  label: string;
  current: number;
  target: number;
  unit: string;
}

function ConditionBadge({ ok, label, current, target, unit }: ConditionBadgeProps) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div className={`mt-2 p-3 rounded-xl border text-xs ${ok ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={ok ? "text-green-700 font-medium" : "text-gray-600"}>{label}</span>
        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${ok ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
          {ok ? "達成" : `${pct}%`}
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${ok ? "bg-green-500" : "bg-red-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-gray-500">
        {current.toLocaleString("ja-JP")}{unit} / {target.toLocaleString("ja-JP")}{unit}
      </div>
    </div>
  );
}
