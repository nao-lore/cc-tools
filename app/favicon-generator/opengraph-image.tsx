import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "favicon-generator";

export default function Image() {
  return generateToolOgImage("favicon-generator");
}
