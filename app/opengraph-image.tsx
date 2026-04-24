import { generateHomeOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "tools.loresync.dev — Free Online Tools";

export default function Image() {
  return generateHomeOgImage();
}
