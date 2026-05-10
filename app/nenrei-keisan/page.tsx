import type { Metadata } from "next";
import ToolPage from "@/tools/nenrei-keisan/page";

export const metadata: Metadata = {
  title: "年齢計算ツール - 満年齢・数え年・干支・星座・次の誕生日",
  description: "生年月日から満年齢、数え年、干支、星座、生まれてからの日数、次の誕生日までの日数を計算。2月29日生まれの平年扱いにも対応。",
  alternates: { canonical: "https://tools.loresync.dev/nenrei-keisan" },
};

export default function Page() {
  return <ToolPage />;
}
