export default function SeoContent() {
  return (
    <article className="max-w-3xl mx-auto mt-12 mb-8 space-y-6 text-sm text-muted leading-relaxed">
      <h2 className="text-lg font-semibold text-foreground">What is Base64 Encoding?</h2>
      <p>
        Base64 is a binary-to-text encoding scheme that converts binary data into a sequence of
        printable ASCII characters. It uses a set of 64 characters — uppercase letters (A-Z),
        lowercase letters (a-z), digits (0-9), and two additional symbols (+ and /). The name
        &quot;Base64&quot; comes directly from this 64-character alphabet. Every three bytes of
        binary input produce four characters of Base64 output, making encoded data roughly 33%
        larger than the original.
      </p>

      <h2 className="text-lg font-semibold text-foreground">Why Use Base64?</h2>
      <p>
        Many protocols and systems were originally designed to handle text, not raw binary data.
        Email (SMTP/MIME), JSON, XML, and HTML all work best with printable characters. Base64
        encoding lets you embed binary content — images, documents, cryptographic keys — safely
        within these text-based formats without corruption. It is the standard method for
        encoding attachments in email, embedding images in CSS and HTML via data URIs, and
        transmitting binary payloads in REST APIs.
      </p>

      <h2 className="text-lg font-semibold text-foreground">Common Use Cases</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>
          <strong>Data URIs:</strong> Embed small images directly in HTML or CSS using{" "}
          <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">
            data:image/png;base64,...
          </code>{" "}
          to reduce HTTP requests and improve page load performance.
        </li>
        <li>
          <strong>API payloads:</strong> Transmit files, tokens, and binary data inside JSON
          request and response bodies without worrying about encoding issues.
        </li>
        <li>
          <strong>Email attachments:</strong> MIME encoding uses Base64 to safely embed files
          within email messages across different mail servers and clients.
        </li>
        <li>
          <strong>Authentication:</strong> HTTP Basic Authentication encodes the
          username:password pair in Base64 before sending it in request headers.
        </li>
        <li>
          <strong>Cryptography:</strong> Public keys, certificates (PEM format), JWTs, and
          digital signatures are commonly represented as Base64-encoded strings.
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground">Data URIs Explained</h2>
      <p>
        A data URI (Uniform Resource Identifier) allows you to include data inline in web pages
        as if they were external resources. The format is{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">
          data:[mediatype][;base64],data
        </code>
        . For example, a small PNG image can be embedded directly in an{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">&lt;img&gt;</code>{" "}
        tag&apos;s src attribute. This eliminates a network round-trip, which is especially
        beneficial for icons, logos, and other small assets. However, Base64 encoding increases
        file size by about a third, so data URIs are best suited for files under a few
        kilobytes.
      </p>

      <h2 className="text-lg font-semibold text-foreground">URL-Safe Base64</h2>
      <p>
        Standard Base64 uses <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">+</code> and{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">/</code> characters
        which have special meaning in URLs. URL-safe Base64 (also called Base64url, defined in
        RFC 4648) replaces these with{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">-</code> and{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">_</code>{" "}
        respectively, and typically omits padding. This variant is used in JWTs (JSON Web
        Tokens), URL parameters, and filenames where standard Base64 characters would cause
        parsing issues.
      </p>

      <h2 className="text-lg font-semibold text-foreground">How This Tool Works</h2>
      <p>
        This Base64 encoder and decoder runs entirely in your browser. No data is sent to any
        server — all encoding and decoding happens client-side using the browser&apos;s native{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">btoa()</code> and{" "}
        <code className="bg-panel-bg px-1 py-0.5 rounded text-xs font-mono">atob()</code>{" "}
        functions with full UTF-8 support. You can encode text to Base64, decode Base64 back to
        text, convert files and images to Base64 strings via drag-and-drop, toggle URL-safe
        mode, and copy results to your clipboard instantly. The live conversion updates as you
        type with no page reloads needed.
      </p>
    </article>
  );
}
