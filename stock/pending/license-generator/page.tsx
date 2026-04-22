import LicenseGenerator from "./components/LicenseGenerator";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* AdSense slot - top banner */}
      <div className="w-full bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Open Source License Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate MIT, Apache 2.0, GPL v3, BSD, ISC, MPL, and other open source
            license files. Enter your name and year, then copy or download.
          </p>
        </div>

        {/* Generator Tool */}
        <LicenseGenerator />

        {/* SEO Content Section */}
        <section className="mt-16 mb-12 max-w-3xl mx-auto prose prose-gray">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What Is an Open Source License?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            An open source license is a legal agreement that grants users the right
            to use, study, modify, and distribute your software under specific
            conditions. Without a license, copyright law applies by default, meaning
            others cannot legally use your code even if it is publicly available on
            platforms like GitHub. Choosing the right license is one of the most
            important decisions when releasing a software project.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Choosing the Right License
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Different licenses suit different goals. Here is a quick overview of the
            most popular options:
          </p>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              <strong>MIT</strong> — The most permissive and widely used license. Anyone
              can use, copy, modify, and distribute your code with minimal restrictions.
              Only requirement is to include the original copyright notice.
            </li>
            <li>
              <strong>Apache 2.0</strong> — Similar to MIT but explicitly grants patent
              rights to users, and requires contributors to state changes. Common in
              enterprise and cloud-native projects.
            </li>
            <li>
              <strong>GPL v3</strong> — A copyleft license that requires derivative works
              to be distributed under the same license. Ensures that modifications remain
              open source. Popular for desktop software and system tools.
            </li>
            <li>
              <strong>BSD 2-Clause / 3-Clause</strong> — Permissive like MIT. The
              3-Clause version adds a non-endorsement clause preventing use of the
              author&apos;s name in promotion.
            </li>
            <li>
              <strong>ISC</strong> — Functionally equivalent to MIT but with simpler
              language. Common in the Node.js ecosystem.
            </li>
            <li>
              <strong>MPL 2.0</strong> — A file-level copyleft license. You can combine
              MPL code with proprietary code, but modified MPL files must remain open.
            </li>
            <li>
              <strong>Unlicense / CC0</strong> — Dedicate your work to the public domain.
              No conditions, no restrictions. Anyone can do anything with the code.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            How to Add a License to Your Project
          </h2>
          <ol className="text-gray-700 leading-relaxed space-y-2 mb-4 list-decimal list-inside">
            <li>
              <strong>Select a license</strong> using the cards above. Compare permissions,
              conditions, and limitations in the Comparison Table tab.
            </li>
            <li>
              <strong>Enter your name and year.</strong> These replace the{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">[author]</code> and{" "}
              <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">[year]</code> placeholders
              in the license text.
            </li>
            <li>
              <strong>Copy or download</strong> the generated license text. The file is
              named <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">LICENSE.txt</code>.
            </li>
            <li>
              <strong>Place the file</strong> at the root of your repository. GitHub,
              GitLab, and other platforms automatically detect and display license information.
            </li>
            <li>
              <strong>Add a header</strong> (optional but recommended for GPL/MPL) to each
              source file referencing the license type and copyright holder.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Permissions, Conditions, and Limitations Explained
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            License attributes are broken into three categories. <strong>Permissions</strong>{" "}
            (green) describe what users are allowed to do with the software, such as commercial
            use, modification, or distribution. <strong>Conditions</strong> (blue) are requirements
            that must be met, such as including the original copyright notice or disclosing
            source code when distributing. <strong>Limitations</strong> (red) describe what
            the license explicitly does not grant, such as liability protection or warranty.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Copyleft vs. Permissive Licenses
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Permissive licenses (MIT, Apache, BSD, ISC) allow code to be incorporated into
            proprietary projects. Copyleft licenses (GPL, MPL) require that derivative works
            or modified files be released under the same or a compatible license. If you want
            your code to always remain open source, choose a copyleft license. If you want
            maximum adoption including commercial use, choose a permissive license.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Common Licensing Mistakes
          </h2>
          <ul className="text-gray-700 leading-relaxed space-y-2 mb-4 list-disc list-inside">
            <li>
              Publishing code without any license. Without an explicit license, all rights
              are reserved by default under copyright law.
            </li>
            <li>
              Choosing a license without reading its conditions. GPL v3 and AGPL require
              that distributed software remain open source, which may conflict with
              commercial plans.
            </li>
            <li>
              Forgetting to update the year when the project spans multiple years. Many
              projects use a range such as 2020-2024.
            </li>
            <li>
              Mixing incompatible licenses in a single project. For example, GPL v2 and
              Apache 2.0 code cannot be combined in the same binary.
            </li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-sm text-gray-500 mb-4">
            license-generator — Free online tool. No signup required.
          </p>
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Related Tools</p>
            <div className="flex flex-wrap justify-center gap-2">
              <a
                href="https://robots-txt-generator.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Robots.txt Generator
              </a>
              <a
                href="https://meta-tag-generator-indol.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Meta Tag Generator
              </a>
              <a
                href="https://json-formatter-topaz-pi.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                JSON Formatter
              </a>
              <a
                href="https://regex-tester-three.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                Regex Tester
              </a>
              <a
                href="https://http-status-eight.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded"
              >
                HTTP Status
              </a>
            </div>
          </div>
          <div className="flex justify-center gap-3 text-xs text-gray-400">
            <a
              href="https://cc-tools.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600"
            >
              53+ Free Tools →
            </a>
          </div>
        </div>
      </footer>

      {/* AdSense slot - bottom banner */}
      <div className="w-full bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-2 text-center text-xs text-gray-400">
          {/* AdSense slot */}
        </div>
      </div>
    </div>
  );
}
