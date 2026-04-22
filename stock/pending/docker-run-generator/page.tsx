import DockerRunGenerator from "./components/DockerRunGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Docker Run Command Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build docker run commands visually. Configure ports, volumes, environment variables,
            networks, and more — then copy the command or get an equivalent docker-compose.yml instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <DockerRunGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is docker run?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">docker run</code> is the core
            command for starting containers. It pulls the specified image if not present locally,
            creates a new container from it, and starts it. Options let you map ports, mount volumes,
            inject environment variables, configure networking, and control the container lifecycle.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common docker run Options
          </h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 border border-gray-200">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-200">Flag</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-200">Description</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-200">Example</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">-d</td>
                  <td className="px-3 py-2 border border-gray-200">Run container in background (detached)</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">docker run -d nginx</td>
                </tr>
                <tr className="bg-gray-50 border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">-p</td>
                  <td className="px-3 py-2 border border-gray-200">Map host port to container port</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">-p 8080:80</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">-v</td>
                  <td className="px-3 py-2 border border-gray-200">Mount a volume or host directory</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">-v /data:/app/data</td>
                </tr>
                <tr className="bg-gray-50 border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">-e</td>
                  <td className="px-3 py-2 border border-gray-200">Set an environment variable</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">-e NODE_ENV=production</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">--name</td>
                  <td className="px-3 py-2 border border-gray-200">Assign a name to the container</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">--name my-app</td>
                </tr>
                <tr className="bg-gray-50 border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">--restart</td>
                  <td className="px-3 py-2 border border-gray-200">Restart policy for the container</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">--restart unless-stopped</td>
                </tr>
                <tr className="border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">--rm</td>
                  <td className="px-3 py-2 border border-gray-200">Remove container automatically when it exits</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">docker run --rm alpine</td>
                </tr>
                <tr className="bg-gray-50 border border-gray-200">
                  <td className="px-3 py-2 border border-gray-200 font-mono">--network</td>
                  <td className="px-3 py-2 border border-gray-200">Connect container to a network</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">--network my-net</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Restart Policies Explained
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>no</strong> — Default. Container is never restarted automatically.
            </li>
            <li>
              <strong>always</strong> — Always restart the container, including on Docker daemon startup.
            </li>
            <li>
              <strong>unless-stopped</strong> — Restart unless explicitly stopped by the user. Best for long-running services.
            </li>
            <li>
              <strong>on-failure</strong> — Only restart if the container exits with a non-zero status code.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            docker run vs docker-compose
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">docker run</code> is great
            for quick, one-off containers and scripting. For multi-container applications or
            reproducible setups, <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">docker-compose.yml</code> is
            preferred — it is version-controlled, easier to read, and supports dependencies between
            services. This generator outputs both formats so you can choose what fits your workflow.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tips for Production Use
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>Always pin a specific image tag (e.g. <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">nginx:1.25</code>) instead of <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">latest</code> for reproducible deployments.</li>
            <li>Use <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--restart unless-stopped</code> for services that should survive reboots.</li>
            <li>Avoid storing secrets in <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">-e</code> flags in shell history — use <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--env-file</code> instead for sensitive values.</li>
            <li>Use named volumes instead of host paths for portability across environments.</li>
            <li>The <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--rm</code> flag is useful for one-off tasks and CI jobs but should not be combined with <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--restart</code>.</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">docker-run-generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://robots-txt-generator-rouge.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Robots.txt Generator</a>
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
              <a href="https://regex-tester-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
              <a href="https://http-status-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Status</a>
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
