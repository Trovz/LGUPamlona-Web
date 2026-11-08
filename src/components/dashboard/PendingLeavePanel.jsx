import DashboardPanel from './DashboardPanel';
import DashboardTable from './DashboardTable';

export default function PendingLeavePanel({ leaves, onViewAll, onReview }) {
  const action = (
    <button
      className="rounded-lg px-2.5 py-1 text-xs font-semibold text-brand hover:bg-interactive-hover hover:text-interactive-hover-text"
      onClick={onViewAll}
      type="button"
    >
      View all
    </button>
  );

  const rows = leaves.slice(0, 6).map(leave => ({
    id: leave.id,
    cells: [
      leave.employeeName,
      leave.leaveType,
      leave.dateRange,
      leave.days,
      <button
        className="rounded-lg border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink hover:border-brand hover:bg-interactive-hover hover:text-interactive-hover-text"
        key="review"
        onClick={() => onReview(leave.id)}
        type="button"
      >
        Review
      </button>,
    ],
  }));

  return (
    <DashboardPanel action={action} title="Pending Leave Requests">
      <DashboardTable
        emptyMessage="No pending requests."
        headers={['Employee', 'Leave type', 'Dates', 'Days', '']}
        rows={rows}
      />
    </DashboardPanel>
  );
}
