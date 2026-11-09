import { CheckCircle, CircleAlert } from 'lucide-react';

export default function NotificationToast({ title, message, role = 'success' }) {
  const isSuccess = role === 'success';
  const Icon = isSuccess ? CheckCircle : CircleAlert;

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`toast-card flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg toast-${role}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <b>{title}</b>
        {message && <span className="toast-message mt-1 block text-sm">{message}</span>}
      </div>
    </div>
  );
}
