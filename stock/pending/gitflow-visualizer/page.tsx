import GitFlowVisualizer from "./components/GitFlowVisualizer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Git Flow Visualizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Paste the output of{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              git log --oneline --graph
            </code>{" "}
            and instantly see a colorized branch diagram with lanes, commits,
            and merge points.
          </p>
        </div>

        {/* Visualizer Tool */}
        <GitFlowVisualizer />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is a Git Branch Diagram?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A Git branch diagram shows your commit history as a visual graph
            with colored lanes representing branches. Each dot is a commit,
            lines connect parent commits, and merge points show where branches
            joined together. This makes it easy to understand the structure of
            your repository at a glance.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Get Git Log Graph Output
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Run one of the following commands in your terminal and paste the
            output into the tool above:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`# Basic graph with short hashes and messages
git log --oneline --graph

# Include all branches (not just current)
git log --oneline --graph --all

# Limit to recent commits
git log --oneline --graph --all -n 50`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Reading the Diagram
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>Colored lanes</strong> each represent one branch. The
              leftmost lane is typically your main or current branch.
            </li>
            <li>
              <strong>Dots</strong> mark individual commits. Hover to see the
              full hash and message.
            </li>
            <li>
              <strong>Diagonal lines</strong> show branch splits and merges —
              where a branch diverged from or rejoined another.
            </li>
            <li>
              <strong>Branch labels</strong> in parentheses (e.g.,{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
                HEAD -&gt; main
              </code>
              ) indicate the current branch tip.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Git Workflows
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Different teams use different branching strategies. Feature Branch
            Workflow keeps each feature isolated on its own branch until it is
            ready to merge. Git Flow adds dedicated release and hotfix branches.
            Trunk-Based Development keeps all work close to main with short-lived
            branches. Visualizing your log helps you confirm your team is
            following the intended workflow.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            gitflow-visualizer — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://gitignore-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                .gitignore Generator
              </a>
              <a
                href="https://diff-viewer.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Diff Viewer
              </a>
              <a
                href="https://changelog-formatter.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Changelog Formatter
              </a>
              <a
                href="https://semantic-version-bumper.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Semver Bumper
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
