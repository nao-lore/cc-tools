import WaterIntake from "./components/WaterIntake";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              💧
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Daily Water Intake Calculator</h1>
              <p className="text-xs text-gray-500">Weight · Activity · Climate · Exercise</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <WaterIntake />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              How Much Water Should You Drink Per Day?
            </h2>
            <p>
              The commonly cited "8 glasses a day" rule is a rough guideline — actual needs vary
              significantly by body weight, activity level, climate, and individual physiology. A
              more accurate approach is to calculate intake based on body weight: most adults need
              between 30–40 ml of water per kilogram of body weight daily, adjusting upward for
              heat and exercise.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Water Intake Formula Explained</h2>
            <p>
              This calculator uses a weight-based formula: <strong>Base intake (ml) = body weight
              (kg) × activity multiplier</strong>. The multiplier ranges from 30 ml/kg for sedentary
              individuals to 40 ml/kg for very active people. Climate adjustments add up to 500 ml
              for hot or humid conditions (where sweating increases), while cold or dry environments
              reduce the baseline slightly. Exercise adds approximately 12 ml per minute of activity
              to replace sweat losses.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Activity Level and Hydration</h2>
            <p>
              Physical activity is the biggest variable in daily water needs. A sedentary 70 kg
              person needs around 2.1 L/day, while the same person exercising intensely for 60
              minutes needs roughly 2.8 L. Athletes and those doing heavy manual work may need
              3–5 L or more. Always drink before feeling thirsty — thirst is already a mild sign
              of dehydration.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Signs of Dehydration</h2>
            <p>
              Even mild dehydration (1–2% of body weight) can impair concentration, mood, and
              physical performance. Common signs include dark urine, headaches, fatigue, dry mouth,
              and reduced urination. Chronic mild dehydration is linked to kidney stones, urinary
              tract infections, and constipation. Staying consistently hydrated throughout the day
              is more effective than drinking large amounts at once.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Daily Water Intake Calculator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://unit-converter-cc.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Unit Converter
              </a>
              <a
                href="https://percentage-calculator-cc.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Percentage Calculator
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
