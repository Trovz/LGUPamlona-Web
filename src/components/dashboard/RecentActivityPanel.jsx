import DashboardPanel from './Panel';
import DashboardTable from './Table';

export default function RecentActivityPanel({ activities, onViewAll }) {
  const action = (
    <button
      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand hover:bg-interactive-hover hover:text-interactive-hover-text"
      onClick={onViewAll}
      type="button"
    >
      Audit log
    </button>
  );

  const rows = activities.slice(0, 6).map(activity => ({
    id: activity.id,
    cells: [activity.user, activity.action, activity.table, activity.time],
  }));

  return (
    <DashboardPanel action={action} title="Recent Activity">
      <DashboardTable
        emptyMessage="Activity appears here as you add, approve or remove records."
        headers={['User', 'Action', 'Table', 'Time']}
        rows={rows}
      />
    </DashboardPanel>
  );
}
