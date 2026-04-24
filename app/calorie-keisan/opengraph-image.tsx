import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "calorie-keisan";

export default function Image() {
  return generateToolOgImage("calorie-keisan");
}
