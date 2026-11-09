import { Plus } from 'lucide-react';
import AttendanceSummary from './AttendanceSummary';
import DashboardStatCard from './StatCard';
import PendingLeavePanel from './PendingLeavePanel';
import RecentActivityPanel from './RecentActivityPanel';

export default function DashboardPage({
  userName,
  stats,
  attendanceCounts,
  activeEmployees,
  pendingLeaves,
  recentActivities,
  onAddEmployee,
  onViewAllLeave,
  onReviewLeave,
  onViewAudit,
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">{userName} · Municipal HR Office</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          onClick={onAddEmployee}
          type="button"
        >
          <Plus aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Add Employee
        </button>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(stat => <DashboardStatCard key={stat.label} {...stat} />)}
      </div>
      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <PendingLeavePanel
          leaves={pendingLeaves}
          onReview={onReviewLeave}
          onViewAll={onViewAllLeave}
        />
        <AttendanceSummary counts={attendanceCounts} employeeTotal={activeEmployees} />
      </div>
      <RecentActivityPanel activities={recentActivities} onViewAll={onViewAudit} />
    </>
  );
}
