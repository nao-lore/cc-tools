import DecisionMatrix from "./components/DecisionMatrix";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
              ⊞
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Decision Matrix</h1>
              <p className="text-xs text-gray-500">Weighted scoring · Auto-rank · Bar chart · CSV export</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <DecisionMatrix />

        {/* SEO Content */}
        <section className="mt-12 space-y-8 text-gray-600 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Free Weighted Decision Matrix Tool</h2>
            <p>
              A decision matrix helps you compare multiple options against a set of weighted criteria
              so you can make data-driven choices instead of gut-feel decisions. Add any number of
              options and criteria, assign importance weights, score each combination, and the tool
              automatically calculates weighted totals and ranks your choices.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">How to Use</h2>
            <p>
              Start by listing your decision criteria (e.g. Cost, Quality, Speed) and assigning a
              weight from 1 to 10 to reflect each criterion&apos;s importance. Then list the options you
              are evaluating and score each option against every criterion on a 1–10 scale. The tool
              multiplies each score by its criterion weight, sums the results for each option, and
              ranks them from best to worst. The winner is highlighted automatically.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">When to Use a Decision Matrix</h2>
            <p>
              Decision matrices are useful whenever you face a multi-criteria choice: selecting a
              vendor, choosing between job offers, picking a tech stack, comparing product features,
              or evaluating business strategies. By making your criteria and weights explicit, you
              reduce bias and can defend your choice with data. Export the completed matrix as CSV
              to share with your team or attach to a report.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Weighted Score Formula</h2>
            <p>
              Each option&apos;s total is calculated as the sum of (score × weight) across all criteria:
              <strong> Total = Σ (score<sub>i</sub> × weight<sub>i</sub>)</strong>. A higher weight
              amplifies the impact of that criterion on the final ranking. Options are then sorted
              descending by total score, with the top-scoring option declared the winner.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Decision Matrix — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://roi-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">ROI Calculator</a>
              <a href="https://statistics-calculator-cc.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded">Statistics Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
