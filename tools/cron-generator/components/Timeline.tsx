"use client";

export default function Timeline({ firesPerHour }: { firesPerHour: number[] }) {
  const maxFires = Math.max(...firesPerHour, 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-end gap-px h-20">
        {firesPerHour.map((count, hour) => {
          const height = count > 0 ? Math.max(15, (count / maxFires) * 100) : 0;
          return (
            <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-t transition-all duration-200 ${
                  count > 0 ? "bg-blue-500" : "bg-slate-100"
                }`}
                style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "2px" }}
                title={`${hour}:00 — ${count} execution${count !== 1 ? "s" : ""}/hour`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-px mt-1">
        {firesPerHour.map((_, hour) => (
          <div key={hour} className="flex-1 text-center">
            {hour % 3 === 0 && (
              <span className="text-[10px] text-slate-400">{hour}</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1 text-xs text-slate-400">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}
