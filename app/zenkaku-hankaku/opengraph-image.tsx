import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "zenkaku-hankaku";

export default function Image() {
  return generateToolOgImage("zenkaku-hankaku");
}
