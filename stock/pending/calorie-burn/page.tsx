import CalorieBurn from "./components/CalorieBurn";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              🔥
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Calorie Burn Calculator</h1>
              <p className="text-xs text-gray-500">40+ exercises · MET-based · Food equivalents · Side-by-side comparison</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <CalorieBurn />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How This Calorie Burn Calculator Works</h2>
            <p>
              This calculator uses the MET (Metabolic Equivalent of Task) method — the gold standard used
              by exercise scientists and the American College of Sports Medicine. MET values represent how
              many times more energy an activity burns compared to sitting still. The formula is simple:
              <strong> Calories = MET × body weight (kg) × duration (hours)</strong>. A 70 kg person jogging
              at 5 mph (MET 8.3) for 30 minutes burns roughly 290 kcal.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">What Is a MET Value?</h2>
            <p>
              MET stands for Metabolic Equivalent of Task. A MET of 1 equals the energy you burn at rest
              (roughly 1 kcal per kg per hour). Light activities like walking slowly have a MET around 2–3,
              moderate activities like cycling or swimming fall in the 5–8 range, and vigorous exercises
              like running fast or jump rope can exceed MET 10. MET values in this tool come from the
              Compendium of Physical Activities (Ainsworth et al.).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Why Body Weight Matters</h2>
            <p>
              Heavier individuals burn more calories performing the same activity because more mass must be
              moved. A 90 kg person running for 30 minutes burns about 29% more than a 70 kg person at the
              same pace. This is why personalizing by body weight gives a much more accurate estimate than
              generic calorie tables.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Compare Activities Side by Side</h2>
            <p>
              Use the comparison feature to stack up multiple exercises. Select an activity, then click
              &quot;Add to Comparison&quot; to build a ranked list. All comparisons use the same body weight
              and duration so results are directly comparable. This makes it easy to see that a 30-minute
              spin class burns nearly twice as many calories as 30 minutes of yoga at the same body weight.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Calorie Burn Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://unit-converter-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:text-orange-800 px-2 py-1 bg-orange-50 rounded">Unit Converter</a>
              <a href="https://percentage-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:text-orange-800 px-2 py-1 bg-orange-50 rounded">Percentage Calculator</a>
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
