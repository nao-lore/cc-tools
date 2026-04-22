export default function SeoContent() {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          和暦（日本の元号）について
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          和暦とは、日本独自の紀年法で、天皇の即位や国の節目に合わせて元号が定められます。現在の元号「令和」は2019年5月1日に始まりました。「令和」の由来は万葉集の「梅花の歌」にある「初春の令月にして、気淑く風和ぎ」という一節から取られています。日本では公的文書や履歴書などで和暦が広く使われており、西暦との変換は日常的に必要とされています。
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          各元号の期間と特徴
        </h2>
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>
            <strong className="text-blue-700">令和（れいわ）</strong>：2019年5月1日〜現在。第126代天皇徳仁の即位に伴い改元されました。日本の古典（万葉集）から初めて引用された元号です。
          </p>
          <p>
            <strong className="text-green-700">平成（へいせい）</strong>：1989年1月8日〜2019年4月30日。「内平外成」「地平天成」に由来し、国の内外にも天地にも平和が達成されるという意味が込められています。約31年間続きました。
          </p>
          <p>
            <strong className="text-orange-700">昭和（しょうわ）</strong>：1926年12月25日〜1989年1月7日。「百姓昭明、協和万邦」に由来します。64年間と歴代最長の元号で、戦前・戦中・戦後の激動の時代を含みます。
          </p>
          <p>
            <strong className="text-purple-700">大正（たいしょう）</strong>：1912年7月30日〜1926年12月24日。「大いに亨り正しきを以て天の道なり」に由来します。約15年間と比較的短い期間でしたが、大正デモクラシーなど近代化が進みました。
          </p>
          <p>
            <strong className="text-gray-700">明治（めいじ）</strong>：1868年1月25日〜1912年7月29日。「聖人南面して天下を聴き、明に嚮いて治む」に由来します。近代日本の幕開けとなった時代です。
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          履歴書での和暦の書き方
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          履歴書では学歴・職歴欄に和暦を使用するのが一般的です。書き方のポイントは次の通りです。元号の最初の年は「元年」と表記します（例：令和元年）。年月は「令和○年○月」の形式で統一します。履歴書全体で和暦か西暦のどちらかに統一することが重要です。本ツールの変換結果をそのままコピーしてお使いいただけます。
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          干支（えと）について
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          干支は十二支とも呼ばれ、子・丑・寅・卯・辰・巳・午・未・申・酉・戌・亥の12種類の動物で年を表す暦法です。中国から伝わり、日本では年賀状や占いなどで広く親しまれています。自分の生まれ年の干支は「年男・年女」として特別な意味を持ちます。本ツールでは年齢早見表に干支も併記しているため、各年の干支をすぐに確認できます。
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          このツールの使い方
        </h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          和暦から西暦への変換は、元号を選択して年数を入力するだけで即座に結果が表示されます。西暦から和暦への変換も同様に、西暦年を入力するだけです。元号の切り替わり年（例：昭和64年/平成元年）は両方の和暦が表示されるため、正確に確認できます。年齢早見表では1920年から現在までの全ての年について、西暦・和暦・年齢・干支を一覧で確認できます。
        </p>
      </div>
    </section>
  );
}
