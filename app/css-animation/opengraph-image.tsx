import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "css-animation";

export default function Image() {
  return generateToolOgImage("css-animation");
}
