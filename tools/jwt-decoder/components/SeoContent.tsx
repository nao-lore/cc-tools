export default function SeoContent() {
  return (
    <article className="prose prose-sm max-w-none text-foreground/80 space-y-6">
      <h2 className="text-xl font-bold text-foreground">What is a JSON Web Token (JWT)?</h2>
      <p>
        A JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact, self-contained
        method for securely transmitting information between parties as a JSON object. JWTs are widely
        used for authentication, authorization, and information exchange in modern web applications.
        When a user logs in, the server generates a JWT containing encoded claims about the user, which
        the client stores and sends with subsequent requests.
      </p>

      <h2 className="text-xl font-bold text-foreground">JWT Structure Explained</h2>
      <p>
        Every JWT consists of three parts separated by dots (<code className="bg-panel-bg/30 px-1 rounded text-sm">xxxxx.yyyyy.zzzzz</code>):
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Header</strong> &mdash; Contains the token type (typically &quot;JWT&quot;) and the signing
          algorithm (such as HS256, RS256, or ES256). The header is Base64Url-encoded to form the
          first part of the token.
        </li>
        <li>
          <strong>Payload</strong> &mdash; Contains the claims, which are statements about the user and
          additional metadata. Claims are categorized as registered (standardized), public, and private
          claims. The payload is Base64Url-encoded to form the second part.
        </li>
        <li>
          <strong>Signature</strong> &mdash; Created by taking the encoded header, encoded payload, a
          secret key, and the algorithm specified in the header. The signature verifies the token
          has not been tampered with and, in the case of asymmetric algorithms, authenticates the sender.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-foreground">Common JWT Claims</h2>
      <p>
        The JWT specification defines several registered claims that provide useful, interoperable metadata:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>iss</strong> (Issuer) &mdash; Identifies who issued the token</li>
        <li><strong>sub</strong> (Subject) &mdash; Identifies the principal that is the subject of the JWT</li>
        <li><strong>aud</strong> (Audience) &mdash; Identifies the recipients the token is intended for</li>
        <li><strong>exp</strong> (Expiration Time) &mdash; The time after which the token must not be accepted</li>
        <li><strong>iat</strong> (Issued At) &mdash; The time at which the token was issued</li>
        <li><strong>nbf</strong> (Not Before) &mdash; The time before which the token must not be accepted</li>
        <li><strong>jti</strong> (JWT ID) &mdash; A unique identifier for the token, useful for preventing replay attacks</li>
      </ul>

      <h2 className="text-xl font-bold text-foreground">JWT Security Best Practices</h2>
      <p>
        While JWTs are powerful, they require careful handling to maintain security. Always validate
        the signature before trusting a token&apos;s contents. Use strong, unique secrets for HMAC-based
        algorithms, or properly managed key pairs for RSA/ECDSA. Set appropriate expiration times to
        limit the window of vulnerability if a token is compromised. Never store sensitive information
        in the payload, as JWTs are only encoded, not encrypted &mdash; anyone can decode the header
        and payload. Use HTTPS to prevent token interception during transmission. Consider implementing
        token refresh mechanisms and revocation strategies for enhanced security in production systems.
      </p>

      <h2 className="text-xl font-bold text-foreground">How This JWT Decoder Works</h2>
      <p>
        This tool decodes JWT tokens entirely in your browser. No data is sent to any server &mdash;
        your tokens remain private and secure. Simply paste a JWT token above to instantly view its
        decoded header, payload, and signature. The tool also checks token expiration, displays all
        claims with human-readable labels, and lets you compare two tokens side by side to spot
        differences in their payloads.
      </p>
    </article>
  );
}
