import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "gacha-cost-ceiling";

export default function Image() {
  return generateToolOgImage("gacha-cost-ceiling");
}
