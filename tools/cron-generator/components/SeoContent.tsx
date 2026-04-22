export default function SeoContent() {
  return (
    <article className="prose prose-slate max-w-none">
      <h2 className="text-2xl font-bold text-slate-800 mt-12 mb-4">
        What is a Cron Expression?
      </h2>
      <p className="text-slate-600 leading-relaxed">
        A cron expression is a string consisting of five fields separated by spaces that represents a
        schedule. Cron expressions are used in Unix-like operating systems to schedule commands or
        scripts to run automatically at specified intervals. The name &quot;cron&quot; comes from the Greek word
        &quot;chronos&quot; meaning time. System administrators and developers rely on cron jobs for tasks like
        database backups, log rotation, sending scheduled emails, and running periodic maintenance scripts.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">
        Cron Expression Syntax Guide
      </h2>
      <p className="text-slate-600 leading-relaxed mb-4">
        A standard cron expression has five fields. Each field can contain specific values, wildcards,
        ranges, intervals, or lists. Understanding the syntax is essential for creating accurate schedules
        for your automated tasks and cron jobs.
      </p>

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                Field
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                Allowed Values
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                Special Characters
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">Minute</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">0-59</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">* , - /</td>
              <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">
                The minute of the hour when the command runs
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">Hour</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">0-23</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">* , - /</td>
              <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">
                The hour of the day (0 = midnight, 23 = 11 PM)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">Day of Month</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">1-31</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">* , - /</td>
              <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">
                The day of the month when the command runs
              </td>
            </tr>
            <tr className="bg-slate-50">
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">Month</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">1-12</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">* , - /</td>
              <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">
                The month of the year (1 = January, 12 = December)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">Day of Week</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">0-7</td>
              <td className="px-4 py-3 font-mono text-sm border border-slate-200">* , - /</td>
              <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">
                The day of the week (0 and 7 = Sunday, 1 = Monday)
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">
        Special Characters in Cron
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-mono text-lg font-bold text-blue-600 mb-1">* (Asterisk)</h3>
          <p className="text-sm text-slate-600">
            Matches every possible value for the field. For example, <code className="bg-slate-100 px-1 rounded">*</code> in
            the hour field means &quot;every hour.&quot;
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-mono text-lg font-bold text-blue-600 mb-1">, (Comma)</h3>
          <p className="text-sm text-slate-600">
            Specifies a list of values. For example, <code className="bg-slate-100 px-1 rounded">1,3,5</code> in
            the day-of-week field means Monday, Wednesday, and Friday.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-mono text-lg font-bold text-blue-600 mb-1">- (Hyphen)</h3>
          <p className="text-sm text-slate-600">
            Defines a range of values. For example, <code className="bg-slate-100 px-1 rounded">9-17</code> in
            the hour field means every hour from 9 AM to 5 PM.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <h3 className="font-mono text-lg font-bold text-blue-600 mb-1">/ (Slash)</h3>
          <p className="text-sm text-slate-600">
            Specifies step values. For example, <code className="bg-slate-100 px-1 rounded">*/15</code> in
            the minute field means &quot;every 15 minutes.&quot;
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">
        Common Cron Expression Examples
      </h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                Expression
              </th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700 border border-slate-200">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["* * * * *", "Every minute"],
              ["*/5 * * * *", "Every 5 minutes"],
              ["0 * * * *", "Every hour (at minute 0)"],
              ["0 0 * * *", "Every day at midnight"],
              ["0 9 * * 1-5", "Every weekday at 9:00 AM"],
              ["0 0 1 * *", "First day of every month at midnight"],
              ["0 0 * * 0", "Every Sunday at midnight"],
              ["30 4 1,15 * *", "At 4:30 AM on the 1st and 15th of every month"],
              ["0 22 * * 1-5", "Every weekday at 10:00 PM"],
              ["0 0 1 1 *", "Once a year on January 1st at midnight"],
            ].map(([expr, desc]) => (
              <tr key={expr} className="even:bg-slate-50">
                <td className="px-4 py-3 font-mono text-sm text-blue-700 border border-slate-200">
                  {expr}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 border border-slate-200">
                  {desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">
        How to Use This Cron Generator
      </h2>
      <p className="text-slate-600 leading-relaxed mb-4">
        This free online cron expression generator helps you build and understand cron schedules without
        memorizing the syntax. Use the visual builder to select values for each field, or choose from
        common presets to get started quickly. The tool instantly shows a human-readable explanation
        of your cron expression, calculates the next five execution times, and displays a visual
        timeline of when your job will fire throughout the day. You can also paste any existing cron
        expression into the explainer to get an instant plain-English description.
      </p>
      <p className="text-slate-600 leading-relaxed mb-4">
        Whether you are setting up a crontab on a Linux server, configuring a scheduled task in a CI/CD
        pipeline, or defining a cron trigger for a cloud function, this tool makes it easy to get the
        expression right the first time. The generated cron expressions are compatible with standard
        Unix cron, AWS CloudWatch Events, Google Cloud Scheduler, GitHub Actions, and most other
        platforms that support cron syntax.
      </p>

      <h2 className="text-2xl font-bold text-slate-800 mt-10 mb-4">
        Tips for Writing Cron Expressions
      </h2>
      <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
        <li>Always verify your cron expression by checking the next scheduled runs before deploying it to production.</li>
        <li>Remember that both 0 and 7 represent Sunday in the day-of-week field.</li>
        <li>When both day-of-month and day-of-week are specified, the job runs when either condition is met (OR logic).</li>
        <li>Use step values (/) for evenly spaced intervals instead of listing individual values.</li>
        <li>Be careful with timezone differences — cron typically runs in the system&apos;s local timezone unless configured otherwise.</li>
        <li>Avoid scheduling resource-intensive jobs at common times like midnight or the top of the hour to prevent contention.</li>
      </ul>
    </article>
  );
}
