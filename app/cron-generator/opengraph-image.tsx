import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "cron-generator";

export default function Image() {
  return generateToolOgImage("cron-generator");
}
