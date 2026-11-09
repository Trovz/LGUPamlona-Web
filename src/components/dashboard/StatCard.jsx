export default function DashboardStatCard({ label, value, hint }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-card px-5 py-4 shadow-sm">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted">{hint}</div>
    </section>
  );
}
