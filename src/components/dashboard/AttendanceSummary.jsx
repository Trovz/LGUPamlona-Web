import DashboardPanel from './DashboardPanel';

export default function AttendanceSummary({ counts, employeeTotal }) {
  return (
    <DashboardPanel title="Attendance Today">
      <div className="grid gap-4 p-5">
        {Object.entries(counts).map(([label, count]) => (
          <div className="flex items-center gap-3 text-sm" key={label}>
            <span className="w-36">{label}</span>
            <div className="h-2 flex-1 rounded bg-slate-100">
              <div
                className="h-2 rounded bg-brand"
                style={{ width: `${employeeTotal ? Math.max(count ? 3 : 0, count / employeeTotal * 100) : 0}%` }}
              />
            </div>
            <b>{count}</b>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}
