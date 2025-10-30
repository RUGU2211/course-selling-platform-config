import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { getUserNotifications, sendNotification, NotificationItem, markNotificationRead, deleteNotification } from '../services/notifications';
import { useAuth } from './AuthContext';

export type NotificationContextType = {
  notifications: NotificationItem[];
  refresh: () => Promise<void>;
  pushPopup: (title: string, message: string) => void;
  markRead: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [popup, setPopup] = React.useState<{ open: boolean; title: string; message: string } | null>(null);

  const refresh = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const list = await getUserNotifications(Number(user.id));
      setNotifications(list || []);
    } catch (e) {
      // swallows fetch errors
    }
  }, [user]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: poll periodically and refresh on window focus
  React.useEffect(() => {
    if (!user?.id) return;
    const id = window.setInterval(() => {
      refresh();
    }, 15000);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [user, refresh]);

  const pushPopup = (title: string, message: string) => {
    setPopup({ open: true, title, message });
    // Also persist to backend if user is known
    if (user?.id) {
      sendNotification({ userId: Number(user.id), title, message, type: 'IN_APP' }).catch(() => {});
    }
  };

  const handleClose = () => setPopup(prev => prev ? { ...prev, open: false } : null);

  const markRead = async (id: number) => {
    try {
      await markNotificationRead(id);
    } catch {}
    await refresh();
  };

  const remove = async (id: number) => {
    try {
      await deleteNotification(id);
    } catch {}
    await refresh();
  };

  return (
    <NotificationContext.Provider value={{ notifications, refresh, pushPopup, markRead, remove }}>
      {children}
      <Snackbar open={!!popup?.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
          <strong>{popup?.title}</strong>
          <div>{popup?.message}</div>
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};