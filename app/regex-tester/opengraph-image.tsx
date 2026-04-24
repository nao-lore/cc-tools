import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "regex-tester";

export default function Image() {
  return generateToolOgImage("regex-tester");
}
