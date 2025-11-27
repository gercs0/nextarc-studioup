
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Notification } from '../types';
import { useAuth } from '../hooks/useAuth';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (userId: string, message: string, link: string) => void;
  markAllAsRead: () => void;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'nextarc_notifications';

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState<Record<string, Notification[]>>(() => {
    try {
      const localData = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return localData ? JSON.parse(localData) : {};
    } catch {
      return {};
    }
  });

  const { currentUser } = useAuth();
  
  const userNotifications = currentUser ? allNotifications[currentUser.id] || [] : [];
  const unreadCount = userNotifications.filter(n => !n.read).length;

  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
  }, [allNotifications]);

  const addNotification = useCallback((userId: string, message: string, link: string) => {
    const newNotification: Notification = {
      id: `notif_${Date.now()}`,
      message,
      link,
      timestamp: Date.now(),
      read: false,
    };
    setAllNotifications(prev => {
        const userNotifs = prev[userId] || [];
        return {
            ...prev,
            [userId]: [newNotification, ...userNotifs]
        }
    });
  }, []);
  
  const markAllAsRead = useCallback(() => {
      if (!currentUser || unreadCount === 0) return;
      setAllNotifications(prev => {
          const updatedUserNotifications = (prev[currentUser.id] || []).map(n => ({...n, read: true}));
          return {...prev, [currentUser.id]: updatedUserNotifications};
      });
  }, [currentUser, unreadCount]);

  return (
    <NotificationsContext.Provider value={{ notifications: userNotifications, unreadCount, addNotification, markAllAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};
