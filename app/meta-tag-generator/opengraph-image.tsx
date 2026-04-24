import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "meta-tag-generator";

export default function Image() {
  return generateToolOgImage("meta-tag-generator");
}
