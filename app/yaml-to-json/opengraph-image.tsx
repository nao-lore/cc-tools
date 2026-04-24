import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "yaml-to-json";

export default function Image() {
  return generateToolOgImage("yaml-to-json");
}
