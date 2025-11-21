
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { MOCK_NOTIFICATIONS, markAllNotificationsRead } from '../services/mockData';

interface NotificationContextType {
  toasts: AppNotification[];
  notifications: AppNotification[];
  addToast: (title: string, message: string, type?: AppNotification['type']) => void;
  markAllRead: (userId: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode; userId?: string }> = ({ children, userId }) => {
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Poll for new notifications (Simulation of real-time socket)
  useEffect(() => {
      if (!userId) return;

      const fetchNotifications = () => {
          // Filter mock database for this user
          const myNotifs = MOCK_NOTIFICATIONS.filter(n => n.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
          setNotifications(myNotifs);
      };

      fetchNotifications();
      // Simulate real-time polling every 3 seconds
      const interval = setInterval(fetchNotifications, 3000);
      return () => clearInterval(interval);
  }, [userId]);

  const addToast = (title: string, message: string, type: AppNotification['type'] = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: AppNotification = {
          id,
          userId: userId || 'anon',
          title,
          message,
          type,
          read: true,
          timestamp: Date.now()
      };
      setToasts(prev => [...prev, newToast]);

      // Auto dismiss toast after 5 seconds
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
  };

  const markAllRead = (uid: string) => {
      markAllNotificationsRead(uid);
      // Optimistically update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ toasts, notifications, addToast, markAllRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
