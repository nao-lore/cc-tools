import SemverBumper from "./components/SemverBumper";

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
            Semantic Version Bumper
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bump semver versions (major/minor/patch/prerelease), compare two
            versions, and parse the individual components of any semver string.
          </p>
        </div>

        {/* Tool */}
        <SemverBumper />

        {/* SEO Content */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is Semantic Versioning?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Semantic Versioning (semver) is a widely adopted versioning scheme
            that gives meaning to version numbers. A semver string takes the
            form <code>MAJOR.MINOR.PATCH</code>, optionally followed by a
            pre-release identifier (e.g. <code>-alpha.1</code>) and build
            metadata (e.g. <code>+20240101</code>). The three numeric segments
            communicate the nature of the change at a glance, letting package
            managers, CI pipelines, and developers reason about compatibility
            without reading changelogs.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            When to Bump Each Segment
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>MAJOR</strong> increments — and resets MINOR and PATCH to
            zero — when you introduce breaking changes that are not backward
            compatible. Users of your library will need to update their code.
            <strong> MINOR</strong> increments when you add new functionality in
            a backward-compatible way; existing code continues to work without
            modification.
            <strong> PATCH</strong> increments for backward-compatible bug fixes
            only. No new public API surface is introduced.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pre-release Versions
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A pre-release version indicates that a release is unstable and may
            not satisfy the compatibility requirements associated with its
            normal version. Common tags are <code>alpha</code>,{" "}
            <code>beta</code>, and <code>rc</code> (release candidate). Multiple
            pre-release identifiers are dot-separated — for example{" "}
            <code>1.0.0-rc.2</code> follows <code>1.0.0-rc.1</code>. Numeric
            identifiers are compared as integers, so{" "}
            <code>1.0.0-alpha.9</code> &lt; <code>1.0.0-alpha.10</code>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Version Precedence Rules
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Precedence is determined left-to-right: MAJOR first, then MINOR,
            then PATCH. When all three are equal, a normal release always has
            higher precedence than a pre-release with the same core version (
            <code>1.0.0</code> &gt; <code>1.0.0-beta</code>). Build metadata
            (the <code>+build</code> suffix) is completely ignored for
            precedence — two versions that differ only in build metadata are
            considered equal in sort order.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Use Cases
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>npm / yarn packages</strong> — <code>package.json</code>{" "}
              relies on semver ranges (<code>^</code>, <code>~</code>) to
              install compatible updates automatically.
            </li>
            <li>
              <strong>GitHub Releases &amp; tags</strong> — tagging commits with
              semver versions (<code>v1.2.3</code>) integrates with release
              automation and changelogs.
            </li>
            <li>
              <strong>CI/CD pipelines</strong> — automated version bumping based
              on Conventional Commits or PR labels triggers the right increment
              without human intervention.
            </li>
            <li>
              <strong>Docker image tags</strong> — semver tags alongside{" "}
              <code>latest</code> let consumers pin to a specific version or
              track a major release stream.
            </li>
            <li>
              <strong>API versioning</strong> — communicating breaking changes
              through version numbers gives API consumers a predictable
              migration path.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            Semantic Version Bumper — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://crontab-validator.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Crontab Validator</a>
              <a href="https://regex-tester-tool.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
              <a href="https://json-formatter-tool.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://hash-generator-coral.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="https://base64-tools-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="https://cc-tools.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">53+ Free Tools →</a>
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
