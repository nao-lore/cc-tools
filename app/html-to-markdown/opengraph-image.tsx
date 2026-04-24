import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "html-to-markdown";

export default function Image() {
  return generateToolOgImage("html-to-markdown");
}
