import HtaccessGenerator from "./components/HtaccessGenerator";

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
            .htaccess Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Build Apache .htaccess configuration files visually. Toggle modules,
            configure redirects, CORS, gzip, cache control, and more — then
            copy or download instantly.
          </p>
        </div>

        {/* Generator Tool */}
        <HtaccessGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is .htaccess?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.htaccess</code> file
            is a directory-level configuration file for Apache web servers. It
            lets you override server settings on a per-directory basis without
            touching the main <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">httpd.conf</code>.
            Common uses include URL redirects and rewrites, enforcing HTTPS,
            enabling compression, setting cache headers, restricting access by
            IP, and adding CORS headers.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Force HTTPS with .htaccess
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Redirecting all HTTP traffic to HTTPS is one of the most important
            server configurations for security and SEO. The standard snippet
            uses <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">mod_rewrite</code>:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Enable Gzip Compression
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Gzip compression reduces the size of HTML, CSS, JavaScript, and
            other text-based responses, significantly improving page load times.
            Add it with <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">mod_deflate</code>:
          </p>
          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono text-gray-800 overflow-x-auto mb-4">
{`<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript
</IfModule>`}
          </pre>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cache Control Headers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Setting appropriate cache expiry for static assets reduces server
            load and speeds up repeat visits. Images and fonts can typically be
            cached for a year, while CSS and JavaScript files cached for a month
            or less to allow updates to propagate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            CORS Headers
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cross-Origin Resource Sharing (CORS) headers tell browsers which
            origins are permitted to make requests to your server. The
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded"> Access-Control-Allow-Origin</code> header
            can be set to a specific domain or <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*</code> to
            allow all origins. Use <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">*</code> with caution
            on authenticated endpoints.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Custom Redirects (301 vs 302)
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            A <strong>301 redirect</strong> is permanent — search engines
            transfer link equity to the new URL and update their index. Use 301
            when a page has moved forever. A <strong>302 redirect</strong> is
            temporary — search engines keep the original URL indexed. Use 302
            for maintenance pages or A/B testing. Getting this wrong can damage
            your SEO rankings.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blocking IPs
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can deny access to specific IP addresses or ranges using the
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded"> Require not ip</code> directive
            (Apache 2.4+) or the older <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">deny from</code> syntax.
            This is useful for blocking scrapers, bots, or known malicious
            addresses.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Use This Generator
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Toggle modules on or off</strong> using the switches in
              the left panel. Each module adds the appropriate Apache directives.
            </li>
            <li>
              <strong>Configure each module</strong> — enter custom error pages,
              CORS origins, IP lists, redirect pairs, and cache durations.
            </li>
            <li>
              <strong>Review the live preview</strong> on the right to see the
              exact output that will be written to your file.
            </li>
            <li>
              <strong>Copy or download</strong> the generated file and place it
              in the directory you want to configure on your Apache server.
            </li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">htaccess-generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="https://robots-txt-generator-nu.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Robots.txt Generator</a>
              <a href="https://meta-tag-generator-indol.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Meta Tag Generator</a>
              <a href="https://http-status-eight.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTTP Status</a>
              <a href="https://regex-tester-three.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Regex Tester</a>
              <a href="https://json-formatter-topaz-pi.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
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
