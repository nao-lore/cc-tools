"use client";

import { useState, useMemo } from "react";

interface Exercise {
  name: string;
  met: number;
}

interface Category {
  label: string;
  exercises: Exercise[];
}

const CATEGORIES: Category[] = [
  {
    label: "Running",
    exercises: [
      { name: "Walking (slow, 2 mph)", met: 2.5 },
      { name: "Walking (brisk, 3.5 mph)", met: 4.3 },
      { name: "Jogging (5 mph)", met: 8.3 },
      { name: "Running (6 mph)", met: 9.8 },
      { name: "Running (7.5 mph)", met: 11.5 },
      { name: "Running (9 mph)", met: 13.5 },
      { name: "Trail running", met: 9.0 },
    ],
  },
  {
    label: "Cycling",
    exercises: [
      { name: "Cycling (leisurely, <10 mph)", met: 4.0 },
      { name: "Cycling (moderate, 12–14 mph)", met: 8.0 },
      { name: "Cycling (vigorous, 16–19 mph)", met: 10.0 },
      { name: "Mountain biking", met: 8.5 },
      { name: "Stationary bike (moderate)", met: 5.5 },
      { name: "Spinning class", met: 8.5 },
    ],
  },
  {
    label: "Swimming",
    exercises: [
      { name: "Swimming (leisurely)", met: 6.0 },
      { name: "Swimming laps (freestyle, moderate)", met: 8.3 },
      { name: "Swimming laps (freestyle, vigorous)", met: 10.0 },
      { name: "Backstroke", met: 7.0 },
      { name: "Breaststroke", met: 10.3 },
      { name: "Water aerobics", met: 4.0 },
    ],
  },
  {
    label: "Gym",
    exercises: [
      { name: "Weight training (general)", met: 3.5 },
      { name: "Weight training (vigorous)", met: 6.0 },
      { name: "Circuit training", met: 8.0 },
      { name: "Rowing machine (moderate)", met: 7.0 },
      { name: "Elliptical (moderate)", met: 5.0 },
      { name: "Jump rope", met: 11.8 },
      { name: "Yoga", met: 2.5 },
      { name: "Pilates", met: 3.0 },
      { name: "HIIT", met: 10.0 },
    ],
  },
  {
    label: "Sports",
    exercises: [
      { name: "Basketball (game)", met: 8.0 },
      { name: "Soccer (general)", met: 7.0 },
      { name: "Tennis (singles)", met: 8.0 },
      { name: "Badminton", met: 5.5 },
      { name: "Volleyball", met: 4.0 },
      { name: "Golf (walking, carrying clubs)", met: 4.3 },
      { name: "Martial arts", met: 10.3 },
      { name: "Skiing (downhill)", met: 6.8 },
    ],
  },
  {
    label: "Daily Activities",
    exercises: [
      { name: "Housecleaning (general)", met: 3.5 },
      { name: "Gardening", met: 3.5 },
      { name: "Cooking", met: 2.0 },
      { name: "Grocery shopping", met: 2.3 },
      { name: "Stair climbing", met: 8.8 },
      { name: "Dancing (general)", met: 5.0 },
      { name: "Playing with kids (moderate)", met: 4.0 },
    ],
  },
];

const ALL_EXERCISES: Exercise[] = CATEGORIES.flatMap((c) => c.exercises);

// Food equivalents: { name, calories }
const FOOD_ITEMS = [
  { name: "apple", cal: 95 },
  { name: "banana", cal: 105 },
  { name: "slice of pizza", cal: 285 },
  { name: "can of soda", cal: 150 },
  { name: "chocolate bar", cal: 235 },
  { name: "glazed donut", cal: 260 },
  { name: "Big Mac", cal: 550 },
  { name: "cup of rice", cal: 206 },
  { name: "egg", cal: 78 },
  { name: "beer (12 oz)", cal: 154 },
];

function getFoodEquivalents(cal: number): string[] {
  if (cal <= 0) return [];
  const items: string[] = [];
  for (const food of FOOD_ITEMS) {
    const count = cal / food.cal;
    if (count >= 0.5 && count <= 10) {
      const rounded = Math.round(count * 10) / 10;
      const label = rounded === 1 ? `1 ${food.name}` : `${rounded} ${food.name}${food.name.endsWith("s") ? "" : "s"}`;
      items.push(label);
      if (items.length >= 3) break;
    }
  }
  return items;
}

function calcCalories(met: number, weightKg: number, durationMin: number): number {
  return met * weightKg * (durationMin / 60);
}

function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}

interface CompareItem {
  id: number;
  exerciseName: string;
  met: number;
  calories: number;
}

let idCounter = 0;

export default function CalorieBurn() {
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [weightRaw, setWeightRaw] = useState("70");
  const [duration, setDuration] = useState(30);
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(ALL_EXERCISES[2]); // Jogging default
  const [compareList, setCompareList] = useState<CompareItem[]>([]);

  const weightKg = useMemo(() => {
    const val = parseFloat(weightRaw);
    if (isNaN(val) || val <= 0) return 0;
    return weightUnit === "kg" ? val : lbsToKg(val);
  }, [weightRaw, weightUnit]);

  const calories = useMemo(() => {
    if (weightKg <= 0) return 0;
    return calcCalories(selectedExercise.met, weightKg, duration);
  }, [selectedExercise, weightKg, duration]);

  const foodEquivalents = useMemo(() => getFoodEquivalents(calories), [calories]);

  const handleWeightUnitToggle = () => {
    const val = parseFloat(weightRaw);
    if (!isNaN(val) && val > 0) {
      if (weightUnit === "kg") {
        setWeightRaw((val / 0.453592).toFixed(1));
        setWeightUnit("lbs");
      } else {
        setWeightRaw((val * 0.453592).toFixed(1));
        setWeightUnit("kg");
      }
    } else {
      setWeightUnit(weightUnit === "kg" ? "lbs" : "kg");
    }
  };

  const addToCompare = () => {
    if (weightKg <= 0) return;
    idCounter += 1;
    setCompareList((prev) => [
      ...prev,
      {
        id: idCounter,
        exerciseName: selectedExercise.name,
        met: selectedExercise.met,
        calories: Math.round(calories),
      },
    ]);
  };

  const removeFromCompare = (id: number) => {
    setCompareList((prev) => prev.filter((item) => item.id !== id));
  };

  const maxCompareCalories = compareList.length > 0 ? Math.max(...compareList.map((i) => i.calories)) : 1;

  const valid = weightKg > 0 && duration > 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Parameters</h2>

        {/* Weight */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Body Weight</label>
            <button
              onClick={handleWeightUnitToggle}
              className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              Switch to {weightUnit === "kg" ? "lbs" : "kg"}
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.1"
              value={weightRaw}
              onChange={(e) => setWeightRaw(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-14 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
              {weightUnit}
            </span>
          </div>
          {weightUnit === "lbs" && weightKg > 0 && (
            <p className="text-xs text-gray-400 mt-1">{weightKg.toFixed(1)} kg</p>
          )}
        </div>

        {/* Duration slider */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Duration</label>
            <span className="text-sm font-bold text-orange-600">{duration} min</span>
          </div>
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5 min</span>
            <span>3 hrs</span>
          </div>
        </div>

        {/* Activity select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity</label>
          <select
            value={selectedExercise.name}
            onChange={(e) => {
              const found = ALL_EXERCISES.find((ex) => ex.name === e.target.value);
              if (found) setSelectedExercise(found);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
          >
            {CATEGORIES.map((cat) => (
              <optgroup key={cat.label} label={cat.label}>
                {cat.exercises.map((ex) => (
                  <option key={ex.name} value={ex.name}>
                    {ex.name} (MET {ex.met})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      {valid ? (
        <>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-6 py-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">Calories Burned</p>
                <p className="text-5xl font-extrabold text-orange-600">{Math.round(calories)}</p>
                <p className="text-sm text-gray-500 mt-1">kcal in {duration} min of {selectedExercise.name}</p>
              </div>
              <div className="text-right text-sm text-gray-500 shrink-0">
                <p className="font-medium text-gray-700 mb-1">Per hour</p>
                <p className="text-2xl font-bold text-gray-800">{Math.round(calcCalories(selectedExercise.met, weightKg, 60))} kcal</p>
                <p className="text-xs mt-1">MET value: {selectedExercise.met}</p>
              </div>
            </div>

            {/* Formula */}
            <div className="rounded-lg bg-white/60 border border-orange-100 px-4 py-2.5 text-xs text-gray-500 font-mono">
              {selectedExercise.met} × {weightKg.toFixed(1)} kg × {(duration / 60).toFixed(2)} h = {Math.round(calories)} kcal
            </div>

            {/* Food equivalents */}
            {foodEquivalents.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">That&apos;s roughly equal to:</p>
                <div className="flex flex-wrap gap-2">
                  {foodEquivalents.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 bg-white border border-orange-200 rounded-full text-sm text-orange-700 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add to compare */}
            <button
              onClick={addToCompare}
              className="mt-2 px-4 py-2 rounded-lg border border-orange-400 text-orange-700 bg-white hover:bg-orange-50 text-sm font-medium transition-colors"
            >
              + Add to Comparison
            </button>
          </div>

          {/* Compare panel */}
          {compareList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Activity Comparison
                </h2>
                <button
                  onClick={() => setCompareList([])}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-3">
                {compareList.map((item) => {
                  const pct = (item.calories / maxCompareCalories) * 100;
                  return (
                    <div key={item.id} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700 truncate flex-1 mr-2">{item.exerciseName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-orange-600">{item.calories} kcal</span>
                          <button
                            onClick={() => removeFromCompare(item.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-orange-400 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                All values for {weightKg.toFixed(1)} kg body weight, {duration} min duration
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-5 py-8 text-center text-sm text-gray-400">
          Enter your body weight above to see results
        </div>
      )}
    </div>
  );
}
