import type { Metadata } from "next";
import ToolPage from "@/tools/word-counter/page";

export const metadata: Metadata = {
  title: "Word Counter - Count Words, Characters & Reading Time | word-counter",
  description: "Free online word counter tool. Count words, characters, sentences, paragraphs, and estimate reading time. Check social media character limits for Twitter, Instagram, and LinkedIn.",
  alternates: { canonical: "https://tools.loresync.dev/word-counter" },
};

export default function Page() {
  return <ToolPage />;
}
