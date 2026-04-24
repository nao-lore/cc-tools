import { generateToolOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "image-compressor";

export default function Image() {
  return generateToolOgImage("image-compressor");
}
