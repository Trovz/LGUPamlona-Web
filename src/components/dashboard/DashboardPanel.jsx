export default function DashboardPanel({ title, action, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-sm font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
