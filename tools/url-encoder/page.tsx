import UrlEncoder from "./components/UrlEncoder";

export default function Home() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-panel-border bg-panel-bg/50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent font-mono font-bold text-lg">
              %
            </span>
            <span className="font-semibold text-foreground">
              url-encoder
            </span>
          </div>
          <a
            href="https://github.com/nao-lore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          URL Encoder &amp; Decoder
        </h1>
        <p className="text-muted mb-8">
          Encode and decode URLs and URL components instantly in your
          browser. Supports encodeURI, encodeURIComponent, and full
          percent-encoding.
        </p>

        <UrlEncoder />

        {/* SEO Content */}
        <article className="mt-16 space-y-8 text-sm leading-relaxed text-muted max-w-3xl">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              What Is URL Encoding?
            </h2>
            <p className="mb-3">
              URL encoding, also known as percent-encoding, is a mechanism
              for encoding information in a Uniform Resource Identifier
              (URI). It replaces unsafe or reserved characters with a
              percent sign (%) followed by two hexadecimal digits
              representing the character&apos;s ASCII code. For example, a
              space character becomes <code className="font-mono text-accent">%20</code>,
              and an ampersand becomes <code className="font-mono text-accent">%26</code>.
            </p>
            <p className="mb-3">
              This encoding is essential because URLs can only be sent over
              the Internet using the ASCII character set. Characters outside
              this set, or characters that have special meaning in URLs
              (such as <code className="font-mono text-accent">/</code>,{" "}
              <code className="font-mono text-accent">?</code>,{" "}
              <code className="font-mono text-accent">&amp;</code>, and{" "}
              <code className="font-mono text-accent">=</code>), must be
              encoded to be safely transmitted. Without proper encoding,
              URLs can break, parameters can be misinterpreted, and security
              vulnerabilities like injection attacks can occur.
            </p>
            <p>
              The standard for percent-encoding is defined in{" "}
              <a
                href="https://datatracker.ietf.org/doc/html/rfc3986"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                RFC 3986
              </a>
              . According to this specification, unreserved characters
              (A-Z, a-z, 0-9, hyphen, underscore, period, and tilde) do not
              need encoding. All other characters should be percent-encoded
              when used in URL components where they are not serving their
              reserved purpose.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              encodeURI vs encodeURIComponent: When to Use Which
            </h2>
            <p className="mb-3">
              JavaScript provides two built-in functions for URL encoding,
              and choosing the right one matters. <code className="font-mono text-accent">encodeURI()</code>{" "}
              is designed to encode a complete URI. It does not encode
              characters that have special meaning in a URL, such as{" "}
              <code className="font-mono text-accent">:</code>,{" "}
              <code className="font-mono text-accent">/</code>,{" "}
              <code className="font-mono text-accent">?</code>,{" "}
              <code className="font-mono text-accent">#</code>,{" "}
              <code className="font-mono text-accent">&amp;</code>, and{" "}
              <code className="font-mono text-accent">=</code>. Use this
              when you have a full URL and want to encode only the unsafe
              characters while preserving its structure.
            </p>
            <p className="mb-3">
              <code className="font-mono text-accent">encodeURIComponent()</code>{" "}
              encodes everything except unreserved characters (letters,
              digits, <code className="font-mono text-accent">-</code>,{" "}
              <code className="font-mono text-accent">_</code>,{" "}
              <code className="font-mono text-accent">.</code>,{" "}
              <code className="font-mono text-accent">~</code>). This is
              the right choice when encoding individual URL components like
              query parameter keys and values. If you used{" "}
              <code className="font-mono text-accent">encodeURI()</code>{" "}
              on a query value containing <code className="font-mono text-accent">&amp;</code>{" "}
              or <code className="font-mono text-accent">=</code>, those
              characters would not be encoded, potentially breaking the
              query string structure.
            </p>
            <p>
              As a rule of thumb: use{" "}
              <code className="font-mono text-accent">encodeURIComponent()</code>{" "}
              for encoding values that will become part of a URL (like
              search parameters, path segments, or fragment identifiers),
              and use{" "}
              <code className="font-mono text-accent">encodeURI()</code>{" "}
              only when you need to encode an entire URL string without
              breaking its structural characters.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Full Percent-Encoding
            </h2>
            <p className="mb-3">
              The full percent-encoding mode in this tool goes beyond what
              JavaScript&apos;s built-in functions provide. While{" "}
              <code className="font-mono text-accent">encodeURIComponent()</code>{" "}
              leaves characters like <code className="font-mono text-accent">!</code>,{" "}
              <code className="font-mono text-accent">&apos;</code>,{" "}
              <code className="font-mono text-accent">(</code>,{" "}
              <code className="font-mono text-accent">)</code>, and{" "}
              <code className="font-mono text-accent">*</code> unencoded,
              full percent-encoding converts every character except the
              unreserved set (A-Z, a-z, 0-9, and{" "}
              <code className="font-mono text-accent">- _ . ~</code>). This
              stricter encoding is useful for APIs that require maximum
              encoding, OAuth signature base strings, or when you need to
              ensure absolute compatibility across all systems and parsers.
            </p>
            <p>
              For most web development tasks,{" "}
              <code className="font-mono text-accent">encodeURIComponent()</code>{" "}
              is sufficient. Full percent-encoding is a specialized option
              for edge cases where you need the strictest possible encoding
              of every non-alphanumeric character in your URL components.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              URL Parsing and Query Strings
            </h2>
            <p className="mb-3">
              Understanding URL structure is fundamental to web development.
              A URL consists of several components: the protocol (http,
              https), the host (domain name and optional port), the path,
              query parameters (key-value pairs after the{" "}
              <code className="font-mono text-accent">?</code>), and an
              optional fragment (after the{" "}
              <code className="font-mono text-accent">#</code>). The URL
              parser in this tool lets you paste any URL and instantly see
              each component broken down, which is invaluable for debugging
              API calls, analyzing redirects, or understanding complex URLs
              with many parameters.
            </p>
            <p>
              The query string builder helps you construct properly encoded
              query strings from scratch. Each key and value you add is
              automatically encoded using{" "}
              <code className="font-mono text-accent">encodeURIComponent()</code>,
              ensuring that special characters in your parameters
              don&apos;t break the URL structure. This is especially useful
              when constructing API requests, tracking URLs, or building
              dynamic links where multiple parameters need to be combined
              correctly.
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">URL Encoder — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/html-entity" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">HTML Entity</a>
              <a href="/jwt-decoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JWT Decoder</a>
              <a href="/hash-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Hash Generator</a>
              <a href="/json-formatter" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JSON Formatter</a>
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
