import HeartRateZones from "./components/HeartRateZones";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              ♥
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Heart Rate Zone Calculator</h1>
              <p className="text-xs text-gray-500">5 training zones · Simple & Karvonen methods · Color-coded</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <HeartRateZones />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">What Are Heart Rate Training Zones?</h2>
            <p>
              Heart rate training zones divide your exercise intensity into ranges — each with a
              specific physiological effect. Training in the right zone helps you hit your fitness
              goals faster, whether that's burning fat, building endurance, or boosting top-end speed.
              Most systems use 5 zones based on a percentage of your maximum heart rate (MHR).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Simple vs. Karvonen Method</h2>
            <p>
              The <strong>Simple method</strong> calculates zones as a percentage of your maximum
              heart rate (220 − age). It's quick and widely used, though it doesn't account for
              individual fitness level. The <strong>Karvonen method</strong> uses your Heart Rate
              Reserve (HRR = Max HR − Resting HR), which gives more personalized zones. Athletes
              with low resting heart rates (a sign of good fitness) benefit most from Karvonen
              because their zones shift upward relative to the simple method.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Zone-by-Zone Guide</h2>
            <p>
              <strong>Zone 1 (Recovery, 50–60%):</strong> Easy active recovery — walking, light
              cycling. Use it on rest days to flush lactate and aid muscle repair.{" "}
              <strong>Zone 2 (Endurance, 60–70%):</strong> The aerobic base-building sweet spot.
              Long, sustainable efforts burn primarily fat and build mitochondrial density.{" "}
              <strong>Zone 3 (Aerobic, 70–80%):</strong> Moderate effort that improves cardiovascular
              efficiency — good for tempo runs and steady-state cardio.{" "}
              <strong>Zone 4 (Threshold, 80–90%):</strong> Pushes your lactate threshold so you
              can sustain higher intensities longer — interval training territory.{" "}
              <strong>Zone 5 (Anaerobic, 90–100%):</strong> All-out sprints and max efforts. Short
              bursts that build raw speed and power.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Use Your Zones</h2>
            <p>
              Most training plans follow an 80/20 rule: roughly 80% of training time in Zones 1–2
              (low intensity) and 20% in Zones 4–5 (high intensity). Zone 3 is often called the
              "grey zone" — harder than easy but not hard enough to drive the biggest adaptations.
              Use a heart rate monitor during workouts to stay on target. For best results,
              re-measure your resting heart rate after a few weeks of consistent training.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Heart Rate Zone Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://unit-converter-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded">Unit Converter</a>
              <a href="https://percentage-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:text-red-800 px-2 py-1 bg-red-50 rounded">Percentage Calculator</a>
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
