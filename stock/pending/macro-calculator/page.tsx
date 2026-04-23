import MacroCalculator from "./components/MacroCalculator";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Macro Calculator</h1>
              <p className="text-xs text-gray-500">Mifflin-St Jeor TDEE · Cut / Maintain / Bulk · Protein, Carbs & Fat</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <MacroCalculator />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How This Macro Calculator Works</h2>
            <p>
              This calculator uses the <strong>Mifflin-St Jeor equation</strong> — the most accurate BMR
              formula available — to estimate your basal metabolic rate, then multiplies by an activity
              factor to get your Total Daily Energy Expenditure (TDEE). Your goal (cut, maintain, or bulk)
              adds or removes 500 kcal, and macros are split by evidence-based ratios optimized for each goal.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">What Are Macronutrients?</h2>
            <p>
              Macronutrients — protein, carbohydrates, and fat — are the three main energy-providing
              nutrients. <strong>Protein</strong> (4 kcal/g) builds and repairs muscle. <strong>Carbs</strong>{" "}
              (4 kcal/g) are your primary fuel source for training. <strong>Fat</strong> (9 kcal/g) supports
              hormones and nutrient absorption. Tracking all three gives you far more control over body
              composition than counting calories alone.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Macro Splits by Goal</h2>
            <p>
              <strong>Cutting</strong> uses a 40/30/30 (P/C/F) split. High protein preserves muscle while
              you&apos;re in a calorie deficit. <strong>Maintaining</strong> uses 30/40/30 — a balanced
              distribution that supports performance and recovery. <strong>Bulking</strong> uses 30/45/25,
              prioritizing carbs to fuel hard training sessions and glycogen replenishment during a calorie
              surplus.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How Accurate Is This Calculator?</h2>
            <p>
              The Mifflin-St Jeor equation has a margin of error of roughly ±10% — typical for any indirect
              BMR formula since it cannot account for individual metabolic variation, body fat percentage, or
              genetics. Treat the output as a calibrated starting point. Track your weight for 2–3 weeks; if
              it moves faster or slower than expected, adjust calories by 100–200 kcal and reassess.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Macro Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://calorie-burn-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">Calorie Burn Calculator</a>
              <a href="https://bmi-english-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-800 px-2 py-1 bg-green-50 rounded">BMI Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
