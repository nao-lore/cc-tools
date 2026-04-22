import BmiCalculator from "./components/BmiCalculator";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            BMI & Healthy Weight Calculator
          </h1>
          <p className="text-sm text-muted mt-1">
            Calculate your BMI in metric or imperial units — see your WHO category and healthy weight range instantly
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Calculator */}
          <BmiCalculator />

          {/* AdSense Placeholder */}
          <div className="mt-8 border border-dashed border-border rounded-xl p-8 text-center text-muted text-sm bg-card">
            <p>Advertisement</p>
          </div>

          {/* SEO Content */}
          <section className="mt-10 space-y-6 text-sm leading-relaxed text-muted">
            <h2 className="text-lg font-bold text-foreground">What is BMI?</h2>
            <p>
              Body Mass Index (BMI) is a widely used screening tool that estimates body fatness based on height and weight. It is calculated by dividing your weight in kilograms by the square of your height in metres (kg/m²). While BMI does not directly measure body fat, it correlates with more direct measures and is used by health professionals worldwide as an initial assessment.
            </p>

            <h2 className="text-lg font-bold text-foreground">WHO BMI Categories</h2>
            <p>
              The World Health Organization defines four BMI ranges: Underweight (below 18.5), Normal weight (18.5–24.9), Overweight (25–29.9), and Obese (30 and above). These thresholds apply to adults aged 18 and over and are the same for both men and women. Children and adolescents use age- and sex-specific percentile charts.
            </p>

            <h2 className="text-lg font-bold text-foreground">Healthy Weight Range</h2>
            <p>
              The healthy weight range shown in this calculator corresponds to a BMI of 18.5 to 24.9 for your specific height. Maintaining a weight within this range is associated with a lower risk of cardiovascular disease, type 2 diabetes, and certain cancers. The ideal weight marker is set at BMI 22, the midpoint of the normal range.
            </p>

            <h2 className="text-lg font-bold text-foreground">Limitations of BMI</h2>
            <p>
              BMI is a useful population-level indicator but has known limitations at the individual level. It does not distinguish between muscle mass and fat mass, so athletes or highly muscular individuals may be classified as overweight despite low body fat. Similarly, older adults may have normal BMI but high fat mass. For a complete picture of your health, consult a healthcare professional.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">BMI Calculator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Calorie Calculator</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Unit Converter</a>
              <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Age Calculator</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">More Free Tools →</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
