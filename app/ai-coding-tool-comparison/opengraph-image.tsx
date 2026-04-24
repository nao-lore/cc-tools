import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "ai-coding-tool-comparison";

export default function Image() {
  return generateToolOgImage("ai-coding-tool-comparison");
}
