"use client";

import { useState, useMemo, useCallback } from "react";

interface StatusCode {
  code: number;
  name: string;
  description: string;
  whenSeen: string;
  example: string;
}

interface Category {
  range: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  codes: StatusCode[];
}

const categories: Category[] = [
  {
    range: "1xx",
    label: "Informational",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800",
    codes: [
      {
        code: 100,
        name: "Continue",
        description: "The server has received the request headers and the client should proceed to send the request body.",
        whenSeen: "When sending a large request body with an Expect: 100-continue header. The server confirms it is ready to accept the data.",
        example: "A client uploading a large file sends headers first. The server replies 100 to say \"go ahead and send the file body.\"",
      },
      {
        code: 101,
        name: "Switching Protocols",
        description: "The server is switching to a different protocol as requested by the client via the Upgrade header.",
        whenSeen: "When upgrading an HTTP connection to WebSocket. The server acknowledges the protocol switch.",
        example: "A browser initiates a WebSocket connection. The server responds 101 and switches from HTTP to the WebSocket protocol.",
      },
      {
        code: 102,
        name: "Processing",
        description: "The server has received the request and is processing it, but no response is available yet.",
        whenSeen: "During long-running WebDAV operations. Prevents the client from timing out while waiting.",
        example: "A WebDAV COPY request on a large collection of files. The server sends 102 to indicate it is still working.",
      },
      {
        code: 103,
        name: "Early Hints",
        description: "Used to return some response headers before the final response, allowing the browser to preload resources.",
        whenSeen: "When the server wants the browser to start loading CSS or JS files before the full response is ready.",
        example: "The server sends a 103 with Link headers for stylesheets, so the browser can fetch them while the server builds the HTML.",
      },
    ],
  },
  {
    range: "2xx",
    label: "Success",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    badgeColor: "bg-green-100 text-green-800",
    codes: [
      {
        code: 200,
        name: "OK",
        description: "The request has succeeded. The meaning depends on the HTTP method used.",
        whenSeen: "The most common status code. Returned when a page loads successfully, an API call works, or a form submission is accepted.",
        example: "GET /api/users returns a JSON list of users with status 200.",
      },
      {
        code: 201,
        name: "Created",
        description: "The request has been fulfilled and a new resource has been created.",
        whenSeen: "After a successful POST request that creates a new record in a database or API.",
        example: "POST /api/users with a new user payload returns 201 with the created user object and a Location header.",
      },
      {
        code: 202,
        name: "Accepted",
        description: "The request has been accepted for processing, but the processing is not yet complete.",
        whenSeen: "When a server queues a task for background processing rather than completing it immediately.",
        example: "POST /api/reports/generate returns 202 because the report will be built asynchronously.",
      },
      {
        code: 203,
        name: "Non-Authoritative Information",
        description: "The returned metadata is not exactly the same as available from the origin server. A modified version from a proxy.",
        whenSeen: "When a transforming proxy modifies the response headers before forwarding to the client.",
        example: "A CDN modifies caching headers and returns 203 to indicate the metadata was altered.",
      },
      {
        code: 204,
        name: "No Content",
        description: "The server successfully processed the request but is not returning any content.",
        whenSeen: "After a successful DELETE request or an update where no response body is needed.",
        example: "DELETE /api/users/42 returns 204 to confirm deletion without sending a body.",
      },
      {
        code: 205,
        name: "Reset Content",
        description: "The server processed the request and the client should reset the document view.",
        whenSeen: "After submitting a form, the server tells the browser to clear the form fields.",
        example: "A form submission returns 205 to instruct the browser to reset all input fields.",
      },
      {
        code: 206,
        name: "Partial Content",
        description: "The server is delivering only part of the resource due to a Range header sent by the client.",
        whenSeen: "When downloading large files in chunks or seeking within a video stream.",
        example: "A video player requests bytes 1000-2000 of a file. The server returns 206 with just that range.",
      },
      {
        code: 207,
        name: "Multi-Status",
        description: "Conveys information about multiple resources where multiple status codes might be appropriate.",
        whenSeen: "In WebDAV operations that affect multiple resources at once.",
        example: "A WebDAV PROPFIND on a folder returns 207 with individual status codes for each file in the XML body.",
      },
      {
        code: 208,
        name: "Already Reported",
        description: "The members of a DAV binding have already been enumerated in a previous reply and are not included again.",
        whenSeen: "In WebDAV responses to avoid listing the same resource multiple times.",
        example: "A recursive WebDAV listing uses 208 to skip resources already included in a previous part of the response.",
      },
      {
        code: 226,
        name: "IM Used",
        description: "The server has fulfilled a GET request and the response is a representation of the result of instance-manipulations.",
        whenSeen: "When delta encoding is applied. The response is a combination of the current instance and applied deltas.",
        example: "A client with a cached version requests changes. The server returns 226 with only the delta.",
      },
    ],
  },
  {
    range: "3xx",
    label: "Redirection",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    badgeColor: "bg-blue-100 text-blue-800",
    codes: [
      {
        code: 300,
        name: "Multiple Choices",
        description: "The request has more than one possible response. The client should choose one.",
        whenSeen: "When a resource is available in multiple formats (e.g., different languages or media types).",
        example: "GET /document returns 300 with links to /document.pdf, /document.html, and /document.xml.",
      },
      {
        code: 301,
        name: "Moved Permanently",
        description: "The resource has been permanently moved to a new URL. All future requests should use the new URL.",
        whenSeen: "When a website restructures its URLs, changes domains, or enforces HTTPS.",
        example: "GET /old-page returns 301 with Location: /new-page. Search engines update their index.",
      },
      {
        code: 302,
        name: "Found",
        description: "The resource temporarily resides at a different URL. The client should continue to use the original URL for future requests.",
        whenSeen: "After login redirects, temporary maintenance pages, or A/B testing redirects.",
        example: "POST /login returns 302 with Location: /dashboard to redirect after successful authentication.",
      },
      {
        code: 303,
        name: "See Other",
        description: "The response to the request can be found at another URL using a GET method.",
        whenSeen: "After a POST request to redirect the client to a result page using GET (Post/Redirect/Get pattern).",
        example: "POST /orders returns 303 with Location: /orders/123 so the browser loads the order page via GET.",
      },
      {
        code: 304,
        name: "Not Modified",
        description: "The resource has not been modified since the last request. The client can use its cached version.",
        whenSeen: "When the browser sends If-None-Match or If-Modified-Since headers and the resource has not changed.",
        example: "Browser sends If-None-Match with an ETag. Server confirms nothing changed and returns 304 with no body.",
      },
      {
        code: 307,
        name: "Temporary Redirect",
        description: "The resource temporarily resides at a different URL. The request method must not change.",
        whenSeen: "Similar to 302 but guarantees the HTTP method is preserved. Used for API redirects.",
        example: "POST /api/v1/data returns 307 with Location: /api/v2/data. The client re-sends the POST to the new URL.",
      },
      {
        code: 308,
        name: "Permanent Redirect",
        description: "The resource has permanently moved. The request method must not change.",
        whenSeen: "Similar to 301 but guarantees the HTTP method is preserved. Used for permanent API endpoint changes.",
        example: "POST /api/old returns 308 with Location: /api/new. The client re-sends the POST permanently to the new URL.",
      },
    ],
  },
  {
    range: "4xx",
    label: "Client Error",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    badgeColor: "bg-amber-100 text-amber-800",
    codes: [
      {
        code: 400,
        name: "Bad Request",
        description: "The server cannot process the request due to malformed syntax, invalid parameters, or missing fields.",
        whenSeen: "When sending invalid JSON, missing required fields, or using wrong data types in an API request.",
        example: "POST /api/users with { \"email\": \"not-an-email\" } returns 400 with a validation error message.",
      },
      {
        code: 401,
        name: "Unauthorized",
        description: "The request requires user authentication. The client must provide valid credentials.",
        whenSeen: "When accessing a protected resource without a valid token, API key, or session cookie.",
        example: "GET /api/profile without an Authorization header returns 401 with WWW-Authenticate challenge.",
      },
      {
        code: 402,
        name: "Payment Required",
        description: "Reserved for future use. Originally intended for digital payment systems.",
        whenSeen: "Some APIs use this to indicate that a paid subscription or credits are needed.",
        example: "GET /api/premium-data returns 402 when the user has exhausted their free tier API calls.",
      },
      {
        code: 403,
        name: "Forbidden",
        description: "The server understood the request but refuses to authorize it. Authentication will not help.",
        whenSeen: "When a logged-in user tries to access a resource they do not have permission for.",
        example: "A regular user tries DELETE /api/admin/users/1 and gets 403 because only admins can delete users.",
      },
      {
        code: 404,
        name: "Not Found",
        description: "The server cannot find the requested resource. The URL may be wrong or the resource may have been deleted.",
        whenSeen: "The most recognized error code. Appears when visiting a broken link, typo in URL, or deleted page.",
        example: "GET /api/users/99999 returns 404 because no user with that ID exists in the database.",
      },
      {
        code: 405,
        name: "Method Not Allowed",
        description: "The HTTP method used is not supported for the requested resource.",
        whenSeen: "When sending a POST to a read-only endpoint or a DELETE to an endpoint that only accepts GET.",
        example: "DELETE /api/logs returns 405 with Allow: GET, HEAD because the logs endpoint is read-only.",
      },
      {
        code: 406,
        name: "Not Acceptable",
        description: "The server cannot produce a response matching the Accept headers sent by the client.",
        whenSeen: "When requesting a content type the server does not support, like asking for XML from a JSON-only API.",
        example: "GET /api/data with Accept: application/xml returns 406 because the API only serves JSON.",
      },
      {
        code: 407,
        name: "Proxy Authentication Required",
        description: "The client must authenticate with the proxy before the request can proceed.",
        whenSeen: "In corporate networks where a proxy server requires credentials before allowing internet access.",
        example: "A request through a corporate proxy returns 407 with Proxy-Authenticate header.",
      },
      {
        code: 408,
        name: "Request Timeout",
        description: "The server timed out waiting for the request from the client.",
        whenSeen: "When the client takes too long to send the full request, often due to network issues.",
        example: "A slow upload on a poor connection exceeds the server timeout and receives 408.",
      },
      {
        code: 409,
        name: "Conflict",
        description: "The request conflicts with the current state of the server resource.",
        whenSeen: "When trying to create a resource that already exists or updating a resource with a stale version.",
        example: "PUT /api/users/42 with an outdated ETag returns 409 because another update happened first.",
      },
      {
        code: 410,
        name: "Gone",
        description: "The resource is no longer available and will not be available again. Unlike 404, this is permanent.",
        whenSeen: "When a resource has been intentionally and permanently removed. Tells search engines to deindex.",
        example: "GET /api/deprecated-endpoint returns 410 to indicate this endpoint has been permanently retired.",
      },
      {
        code: 411,
        name: "Length Required",
        description: "The server requires a Content-Length header in the request.",
        whenSeen: "When sending a request body without specifying its length.",
        example: "POST /upload without Content-Length header returns 411.",
      },
      {
        code: 412,
        name: "Precondition Failed",
        description: "One or more conditions in the request headers evaluated to false on the server.",
        whenSeen: "When using conditional headers like If-Match or If-Unmodified-Since that do not match.",
        example: "PUT /api/doc with If-Match and a stale ETag returns 412 because the document changed.",
      },
      {
        code: 413,
        name: "Content Too Large",
        description: "The request body is larger than the server is willing or able to process.",
        whenSeen: "When uploading a file that exceeds the server's size limit.",
        example: "POST /upload with a 500MB file returns 413 because the server limit is 100MB.",
      },
      {
        code: 414,
        name: "URI Too Long",
        description: "The request URL is longer than the server is willing to interpret.",
        whenSeen: "When a GET request has extremely long query parameters.",
        example: "A search with thousands of filter parameters in the URL returns 414.",
      },
      {
        code: 415,
        name: "Unsupported Media Type",
        description: "The media type of the request body is not supported by the server.",
        whenSeen: "When sending data in a format the server does not accept.",
        example: "POST /api/data with Content-Type: text/plain returns 415 because the API expects application/json.",
      },
      {
        code: 416,
        name: "Range Not Satisfiable",
        description: "The range specified in the Range header cannot be fulfilled. The resource may be smaller than requested.",
        whenSeen: "When requesting a byte range beyond the end of a file.",
        example: "GET /file.mp4 with Range: bytes=999999999- returns 416 because the file is only 10MB.",
      },
      {
        code: 418,
        name: "I'm a Teapot",
        description: "The server refuses to brew coffee because it is a teapot. An April Fools joke from RFC 2324.",
        whenSeen: "Not used in production. Some servers implement it as an Easter egg.",
        example: "GET /coffee on a novelty server returns 418 as a humorous response.",
      },
      {
        code: 422,
        name: "Unprocessable Content",
        description: "The server understands the content type and syntax but cannot process the contained instructions.",
        whenSeen: "When the request body is valid JSON but fails business logic validation.",
        example: "POST /api/orders with { \"quantity\": -5 } returns 422 because quantity must be positive.",
      },
      {
        code: 425,
        name: "Too Early",
        description: "The server is unwilling to risk processing a request that might be replayed.",
        whenSeen: "During TLS 1.3 early data (0-RTT) when the server cannot guarantee the request is not a replay.",
        example: "A request sent as TLS early data gets 425, prompting the client to retry after the handshake.",
      },
      {
        code: 426,
        name: "Upgrade Required",
        description: "The server refuses the request using the current protocol and requires the client to upgrade.",
        whenSeen: "When the server requires a newer protocol version or a switch to TLS.",
        example: "An HTTP/1.0 request to a server that requires HTTP/2 returns 426 with Upgrade: h2.",
      },
      {
        code: 428,
        name: "Precondition Required",
        description: "The server requires the request to be conditional to prevent lost update problems.",
        whenSeen: "When the server wants clients to include If-Match headers to avoid race conditions.",
        example: "PUT /api/doc without an If-Match header returns 428, requiring optimistic concurrency control.",
      },
      {
        code: 429,
        name: "Too Many Requests",
        description: "The user has sent too many requests in a given time period (rate limiting).",
        whenSeen: "When hitting API rate limits. The response often includes a Retry-After header.",
        example: "After 100 requests per minute, the API returns 429 with Retry-After: 60.",
      },
      {
        code: 431,
        name: "Request Header Fields Too Large",
        description: "The server refuses the request because the header fields are too large.",
        whenSeen: "When cookies or custom headers grow excessively large.",
        example: "A request with a 32KB cookie header returns 431 because the server limit is 16KB.",
      },
      {
        code: 451,
        name: "Unavailable For Legal Reasons",
        description: "The resource is unavailable due to legal demands such as censorship or court orders.",
        whenSeen: "When content is blocked due to DMCA takedowns, government censorship, or GDPR restrictions.",
        example: "GET /article/123 returns 451 with a Link header pointing to the legal authority requiring the block.",
      },
    ],
  },
  {
    range: "5xx",
    label: "Server Error",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    badgeColor: "bg-red-100 text-red-800",
    codes: [
      {
        code: 500,
        name: "Internal Server Error",
        description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        whenSeen: "The generic server error. Often caused by unhandled exceptions, bugs, or misconfiguration.",
        example: "An unhandled null pointer exception in the server code causes a 500 response.",
      },
      {
        code: 501,
        name: "Not Implemented",
        description: "The server does not support the functionality required to fulfill the request.",
        whenSeen: "When the server does not recognize the request method or lacks the ability to fulfill it.",
        example: "PATCH /api/data on a server that has not implemented PATCH returns 501.",
      },
      {
        code: 502,
        name: "Bad Gateway",
        description: "The server acting as a gateway received an invalid response from the upstream server.",
        whenSeen: "When a reverse proxy (like Nginx) cannot get a valid response from the application server behind it.",
        example: "Nginx forwards a request to a crashed Node.js server and returns 502 to the client.",
      },
      {
        code: 503,
        name: "Service Unavailable",
        description: "The server is temporarily unable to handle the request, usually due to maintenance or overload.",
        whenSeen: "During planned maintenance, server overload, or when a dependency is down.",
        example: "A server under heavy traffic returns 503 with Retry-After: 300 to ask clients to wait 5 minutes.",
      },
      {
        code: 504,
        name: "Gateway Timeout",
        description: "The server acting as a gateway did not receive a timely response from the upstream server.",
        whenSeen: "When a reverse proxy times out waiting for the backend server to respond.",
        example: "A slow database query causes the app server to take 60+ seconds. Nginx returns 504 after its timeout.",
      },
      {
        code: 505,
        name: "HTTP Version Not Supported",
        description: "The server does not support the HTTP protocol version used in the request.",
        whenSeen: "When the client uses an HTTP version the server cannot handle.",
        example: "A request using HTTP/3 to a server that only supports HTTP/1.1 returns 505.",
      },
      {
        code: 506,
        name: "Variant Also Negotiates",
        description: "Transparent content negotiation for the request results in a circular reference.",
        whenSeen: "A misconfiguration in server content negotiation causing an internal loop.",
        example: "The server's content negotiation configuration has a circular reference between variants.",
      },
      {
        code: 507,
        name: "Insufficient Storage",
        description: "The server is unable to store the representation needed to complete the request.",
        whenSeen: "In WebDAV when the server runs out of disk space.",
        example: "PUT /webdav/large-file returns 507 because the server disk is full.",
      },
      {
        code: 508,
        name: "Loop Detected",
        description: "The server detected an infinite loop while processing a request with Depth: infinity.",
        whenSeen: "In WebDAV operations that encounter circular references in the resource structure.",
        example: "A WebDAV PROPFIND with Depth: infinity hits a symlink loop and returns 508.",
      },
      {
        code: 510,
        name: "Not Extended",
        description: "Further extensions to the request are required for the server to fulfill it.",
        whenSeen: "When the server requires additional HTTP extensions not present in the request.",
        example: "A request lacking a required extension declaration returns 510.",
      },
      {
        code: 511,
        name: "Network Authentication Required",
        description: "The client needs to authenticate to gain network access, typically for captive portals.",
        whenSeen: "When connecting to a WiFi hotspot that requires login before granting internet access.",
        example: "Connecting to airport WiFi returns 511 with a login page until you accept the terms.",
      },
    ],
  },
];

export default function HttpStatusCodes() {
  const [search, setSearch] = useState("");
  const [expandedCode, setExpandedCode] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories
      .map((cat) => ({
        ...cat,
        codes: cat.codes.filter(
          (sc) =>
            sc.code.toString().includes(q) ||
            sc.name.toLowerCase().includes(q) ||
            sc.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.codes.length > 0);
  }, [search]);

  const handleCopy = useCallback(async (sc: StatusCode, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${sc.code} ${sc.name}: ${sc.description}`;
    await navigator.clipboard.writeText(text);
    setCopiedCode(sc.code);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const toggleExpand = useCallback((code: number) => {
    setExpandedCode((prev) => (prev === code ? null : code));
  }, []);

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code (e.g. 404) or keyword (e.g. timeout)..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Quick jump */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((cat) => (
          <a
            key={cat.range}
            href={`#${cat.range}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${cat.badgeColor} hover:opacity-80 transition-opacity`}
          >
            {cat.range} {cat.label}
          </a>
        ))}
      </div>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No status codes match your search.
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((cat) => (
            <section key={cat.range} id={cat.range}>
              <h2 className={`text-xl font-bold mb-3 ${cat.color}`}>
                {cat.range} {cat.label}
              </h2>
              <div className="space-y-2">
                {cat.codes.map((sc) => {
                  const isExpanded = expandedCode === sc.code;
                  const isCopied = copiedCode === sc.code;
                  return (
                    <div
                      key={sc.code}
                      className={`border rounded-lg transition-all cursor-pointer ${cat.borderColor} ${isExpanded ? cat.bgColor : "bg-white hover:bg-gray-50"}`}
                      onClick={() => toggleExpand(sc.code)}
                    >
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-sm font-mono font-bold ${cat.badgeColor}`}>
                            {sc.code}
                          </span>
                          <span className="font-medium text-gray-900 truncate">
                            {sc.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            onClick={(e) => handleCopy(sc, e)}
                            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                            title="Copy description"
                          >
                            {isCopied ? (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Description always visible */}
                      <div className="px-4 pb-3 -mt-1">
                        <p className="text-sm text-gray-600">{sc.description}</p>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className={`px-4 pb-4 border-t ${cat.borderColor}`}>
                          <div className="pt-3 space-y-3">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                When You See It
                              </h4>
                              <p className="text-sm text-gray-700">{sc.whenSeen}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                                Example
                              </h4>
                              <p className="text-sm text-gray-700 font-mono bg-white/50 rounded p-2 border border-gray-100">
                                {sc.example}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* FAQ */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-8">
        <h2 className="text-base font-bold text-gray-800 mb-3">よくある質問</h2>
        <div className="space-y-4">
          {[
            {
              q: "401 と 403 の違いは何ですか？",
              a: "401 Unauthorized は「認証が必要」を意味し、ログインしていない状態です。403 Forbidden は「認証済みだがアクセス権がない」状態です。ログインしても権限がなければ 403 が返ります。",
            },
            {
              q: "302 と 307 はどう使い分けますか？",
              a: "302 は一時的なリダイレクトですが、ブラウザが POST を GET に変えることがあります。307 はメソッドを変えずにリダイレクトすることを保証します。API や POST フォームのリダイレクトには 307 が適切です。",
            },
            {
              q: "500 と 502 の違いは何ですか？",
              a: "500 Internal Server Error はアプリケーションサーバー自体のエラーです。502 Bad Gateway はリバースプロキシ（Nginx など）がバックエンドサーバーから無効なレスポンスを受け取ったときに返ります。",
            },
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <p className="text-gray-800 font-bold text-sm mb-1">{faq.q}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "401 と 403 の違いは何ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "401 Unauthorized は「認証が必要」を意味し、ログインしていない状態です。403 Forbidden は「認証済みだがアクセス権がない」状態です。ログインしても権限がなければ 403 が返ります。" },
              },
              {
                "@type": "Question",
                "name": "302 と 307 はどう使い分けますか？",
                "acceptedAnswer": { "@type": "Answer", "text": "302 は一時的なリダイレクトですが、ブラウザが POST を GET に変えることがあります。307 はメソッドを変えずにリダイレクトすることを保証します。API や POST フォームのリダイレクトには 307 が適切です。" },
              },
              {
                "@type": "Question",
                "name": "500 と 502 の違いは何ですか？",
                "acceptedAnswer": { "@type": "Answer", "text": "500 Internal Server Error はアプリケーションサーバー自体のエラーです。502 Bad Gateway はリバースプロキシがバックエンドサーバーから無効なレスポンスを受け取ったときに返ります。" },
              },
            ],
          }),
        }}
      />

      {/* 関連ツール */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-4">
        <h2 className="text-base font-bold text-gray-800 mb-3">関連ツール</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/url-encoder", label: "URL エンコード/デコード", desc: "URL に使えない文字を %xx 形式に変換" },
            { href: "/jwt-decoder", label: "JWT デコーダー", desc: "JWT トークンをデコードしてクレームを確認" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-3 transition-colors"
            >
              <p className="text-gray-800 font-bold text-sm">{link.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
