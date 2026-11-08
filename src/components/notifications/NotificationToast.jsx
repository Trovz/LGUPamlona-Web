export default function NotificationToast({ title, message, role = 'success' }) {
  const isSuccess = role === 'success';

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`toast-card flex items-start gap-3 rounded-lg border-l-4 p-4 shadow-lg toast-${role}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 h-5 w-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isSuccess
          ? <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>
          : <><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></>}
      </svg>
      <div className="min-w-0">
        <b>{title}</b>
        {message && <span className="toast-message mt-1 block text-sm">{message}</span>}
      </div>
    </div>
  );
}
