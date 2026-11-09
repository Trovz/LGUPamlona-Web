import NotificationToast from './Toast';

export default function NotificationContainer({ notifications }) {
  return (
    <div
      className="fixed right-4 top-4 z-[70] grid w-[min(360px,calc(100vw-2rem))] gap-2"
      aria-live="polite"
    >
      {notifications.map(notification => (
        <NotificationToast key={notification.id} {...notification} />
      ))}
    </div>
  );
}
