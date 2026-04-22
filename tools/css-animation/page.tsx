import AnimationGenerator from "./components/AnimationGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            CSS Animation Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create custom CSS keyframe animations visually. Adjust timing,
            transforms, and easing, then copy production-ready CSS.
          </p>
        </div>

        {/* Animation Generator Tool */}
        <AnimationGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Are CSS Animations?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            CSS animations allow you to animate HTML elements without JavaScript.
            Using <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">@keyframes</code> rules
            and the <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">animation</code> property,
            you can define multi-step transitions that control how an element changes
            over time. Animations are widely supported across all modern browsers
            and are essential for creating engaging user interfaces.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            CSS Animation Syntax
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            A CSS animation has two parts: the keyframes definition and the
            animation property. Here is an example:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.element {
  animation: fade-in 0.5s ease forwards;
}`}
          </pre>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">animation</code> shorthand
            accepts the animation name, duration, timing function, delay, iteration
            count, direction, and fill mode.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Choose a preset</strong> to start with a common animation
              pattern, or build from scratch.
            </li>
            <li>
              <strong>Edit keyframe stops</strong> by clicking each percentage
              button and adjusting transform, opacity, and color values.
            </li>
            <li>
              <strong>Adjust animation properties</strong> like duration, delay,
              timing function, direction, and iteration count.
            </li>
            <li>
              <strong>Preview in real-time</strong> with the live preview box.
              Use Play, Pause, and Reset controls.
            </li>
            <li>
              <strong>Copy the CSS</strong> with one click and paste it into your
              stylesheet.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Animation Properties Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Duration</strong> controls how long the animation takes to
              complete one cycle (e.g., 1s, 500ms).
            </li>
            <li>
              <strong>Delay</strong> adds a wait before the animation starts.
            </li>
            <li>
              <strong>Timing function</strong> defines the acceleration curve.
              Common values include ease, linear, ease-in, ease-out, and
              ease-in-out. Custom cubic-bezier curves give you full control.
            </li>
            <li>
              <strong>Iteration count</strong> sets how many times the animation
              repeats. Use infinite for continuous animations.
            </li>
            <li>
              <strong>Direction</strong> controls whether the animation plays
              forward, backward, or alternates between both.
            </li>
            <li>
              <strong>Fill mode</strong> determines the element&apos;s style before
              and after the animation. Use forwards to keep the final state.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Better CSS Animations
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Animate transform and opacity for best performance. These
              properties are GPU-accelerated and avoid layout recalculations.
            </li>
            <li>
              Keep animations subtle and purposeful. Overly complex animations
              can distract users and hurt accessibility.
            </li>
            <li>
              Use the prefers-reduced-motion media query to respect user
              preferences for reduced motion.
            </li>
            <li>
              Test animations at different durations. What feels smooth at 0.3s
              may feel sluggish at 2s.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">CSS Animation Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://css-flexbox-rho.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Flexbox Generator</a>
              <a href="https://css-grid-two-mocha.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Grid Generator</a>
              <a href="https://border-radius-nine.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Border Radius Generator</a>
              <a href="https://css-gradient-beta.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Gradient Generator</a>
              <a href="https://css-box-shadow-gamma.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">CSS Box Shadow Generator</a>
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
