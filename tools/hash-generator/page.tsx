import HashGenerator from './components/HashGenerator';

export default function Home() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Hash Generator
        </h1>
        <p className="mt-2 text-muted text-sm">
          Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or
          files. 100% client-side &mdash; nothing leaves your browser.
        </p>

        <div className="mt-8">
          <HashGenerator />
        </div>

        {/* AdSense placeholder */}
        <div className="my-10 flex items-center justify-center rounded-lg border border-dashed border-card-border py-8 text-xs text-muted">
          Advertisement
        </div>

        {/* SEO Content */}
        <article className="max-w-none mt-10 space-y-6 text-sm leading-relaxed text-muted">
          <h2 className="text-lg font-semibold text-foreground">
            What Is a Hash Function?
          </h2>
          <p>
            A cryptographic hash function takes an arbitrary amount of data and
            produces a fixed-size output called a <strong className="text-foreground">digest</strong> or{' '}
            <strong className="text-foreground">hash</strong>. The same input always produces the same
            output, but even a single-bit change in the input produces a
            completely different hash. This one-way property makes hashes ideal
            for verifying data integrity, storing passwords securely, and
            generating digital signatures.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            Supported Algorithms
          </h2>
          <p>
            This tool supports five widely-used hash algorithms. <strong className="text-foreground">MD5</strong>{' '}
            (Message Digest 5) produces a 128-bit hash. While fast, MD5 is no
            longer considered cryptographically secure due to known collision
            attacks; it remains useful for checksums and non-security file
            verification. <strong className="text-foreground">SHA-1</strong> (Secure Hash Algorithm 1)
            outputs a 160-bit digest. Like MD5, it has been deprecated for
            security use by NIST since 2011 but is still common in legacy
            systems.
          </p>
          <p>
            The <strong className="text-foreground">SHA-2 family</strong> &mdash; SHA-256, SHA-384, and SHA-512 &mdash;
            is the current standard recommended by NIST for security
            applications. SHA-256 produces a 256-bit hash and is used in TLS
            certificates, Bitcoin mining, and software distribution
            verification. SHA-384 and SHA-512 offer larger digest sizes for
            applications that need extra collision resistance, such as
            government and financial systems.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            Common Use Cases
          </h2>
          <p>
            <strong className="text-foreground">File integrity verification</strong> &mdash; after downloading a
            file, compare its hash against the one published by the author to
            ensure the file has not been tampered with or corrupted during
            transfer. <strong className="text-foreground">Password storage</strong> &mdash; applications store
            hashes of passwords rather than plaintext; during login the entered
            password is hashed and compared. <strong className="text-foreground">Digital signatures</strong>
            {' '}&mdash; signing algorithms hash the document first, then encrypt the hash
            with a private key.{' '}
            <strong className="text-foreground">Deduplication and caching</strong> &mdash; content-addressable
            storage systems use hashes to identify unique blocks of data.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            How This Tool Works
          </h2>
          <p>
            Every computation happens entirely inside your browser using the{' '}
            <strong className="text-foreground">Web Crypto API</strong> (for SHA variants) and a pure
            JavaScript implementation (for MD5). No data is ever sent to a
            server. You can paste text or drag-and-drop any file to compute all
            five hashes at once, copy individual results, toggle between
            uppercase and lowercase output, and compare two hashes to verify
            they match &mdash; case-insensitively.
          </p>

          <h2 className="text-lg font-semibold text-foreground">
            Security Considerations
          </h2>
          <p>
            For any security-sensitive purpose &mdash; password hashing, certificate
            pinning, code signing &mdash; always use SHA-256 or higher. MD5 and SHA-1
            are provided here for compatibility and non-security checksums only.
            When hashing passwords in production, use a dedicated key derivation
            function such as bcrypt, scrypt, or Argon2, which add salting and
            deliberate slowness to resist brute-force attacks.
          </p>
        </article>
      </main>

      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">Hash Generator — Free online tool. No signup required.</p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href="/password-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Password Generator</a>
              <a href="/base64-tools" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">Base64 Tools</a>
              <a href="/uuid-generator" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">UUID Generator</a>
              <a href="/jwt-decoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">JWT Decoder</a>
              <a href="/url-encoder" className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded">URL Encoder</a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a href="/" className="hover:text-gray-600">53+ Free Tools →</a>
          </div>
        </div>
      </footer>
    
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Hash Generator",
  "description": "Hash Generator — Free online tool. No signup required.",
  "url": "https://tools.loresync.dev/hash-generator",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </>
  );
}
