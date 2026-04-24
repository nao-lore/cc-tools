import { ImageResponse } from "next/og";
import { tools } from "@/lib/tools-config";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function generateToolOgImage(slug: string): ImageResponse {
  const tool = tools.find((t) => t.slug === slug);
  const name = tool?.name ?? slug;
  const description = tool?.description ?? "";
  const isJP = tool?.market === "JP";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #0c1120 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: isJP
            ? '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif'
            : '"Geist", "Inter", system-ui, sans-serif',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow top-center */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.22) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Bottom-right accent glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            padding: "64px 72px",
            position: "relative",
          }}
        >
          {/* Market badge */}
          {tool && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "6px 16px",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: isJP
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(96,165,250,0.15)",
                  color: isJP ? "#fca5a5" : "#93c5fd",
                  border: isJP
                    ? "1px solid rgba(239,68,68,0.3)"
                    : "1px solid rgba(96,165,250,0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                {isJP ? "JP" : "EN"}
              </div>
              <div
                style={{
                  marginLeft: "12px",
                  color: "rgba(156,163,175,0.7)",
                  fontSize: "14px",
                }}
              >
                {tool.category}
              </div>
            </div>
          )}

          {/* Tool name */}
          <div
            style={{
              fontSize: name.length > 28 ? "52px" : "64px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
              maxWidth: "900px",
            }}
          >
            {name}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "24px",
                color: "rgba(156,163,175,0.9)",
                lineHeight: 1.5,
                maxWidth: "820px",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 72px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            position: "relative",
          }}
        >
          {/* Logo / branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              T
            </div>
            <span
              style={{
                color: "rgba(209,213,219,0.9)",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              tools.loresync.dev
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              color: "rgba(107,114,128,0.8)",
              fontSize: "14px",
            }}
          >
            Free · No signup · Browser-based
          </div>
        </div>
      </div>
    ),
    {
      width: ogImageSize.width,
      height: ogImageSize.height,
    }
  );
}

export function generateHomeOgImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #030712 0%, #0f172a 50%, #0c1120 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: '"Geist", "Inter", system-ui, sans-serif',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "64px",
            position: "relative",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#818cf8",
              }}
            />
            <span
              style={{
                color: "#a5b4fc",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              80+ ツール — 登録不要・完全無料
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: "20px",
            }}
          >
            無料オンラインツール集
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "rgba(156,163,175,0.85)",
              lineHeight: 1.5,
              maxWidth: "700px",
            }}
          >
            開発・変換・計算・デザインまで、すべてブラウザ上で完結
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 72px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              T
            </div>
            <span
              style={{
                color: "rgba(209,213,219,0.9)",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              tools.loresync.dev
            </span>
          </div>
          <div
            style={{
              color: "rgba(107,114,128,0.8)",
              fontSize: "14px",
            }}
          >
            Free · No signup · Browser-based
          </div>
        </div>
      </div>
    ),
    {
      width: ogImageSize.width,
      height: ogImageSize.height,
    }
  );
}
