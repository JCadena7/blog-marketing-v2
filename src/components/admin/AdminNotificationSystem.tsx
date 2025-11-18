import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const resolveCrypto = (): Crypto => {
  if (typeof globalThis !== 'undefined') {
    if (globalThis.crypto) {
      return globalThis.crypto;
    }

    const legacyCrypto = (globalThis as typeof globalThis & { msCrypto?: Crypto }).msCrypto;
    if (legacyCrypto) {
      return legacyCrypto;
    }
  }

  throw new Error('Secure crypto API is unavailable in this environment');
};

const generateNotificationId = () => {
  const cryptoApi = resolveCrypto();

  if (typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  if (typeof cryptoApi.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);

    const segments = [
      bytes.slice(0, 4),
      bytes.slice(4, 6),
      bytes.slice(6, 8),
      bytes.slice(8, 10),
      bytes.slice(10, 16)
    ].map(group => Array.from(group, value => value.toString(16).padStart(2, '0')).join(''));

    return segments.join('-');
  }

  throw new Error('Crypto API does not expose a supported random generator');
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateNotificationId();

    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const contextValue = useMemo(
    () => ({ addNotification, removeNotification, clearAll }),
    [addNotification, removeNotification, clearAll]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={() => onRemove(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface NotificationToastProps {
  notification: Notification;
  onRemove: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onRemove }) => {
  const getNotificationConfig = (type: string) => {
    const configs = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        titleColor: 'text-green-800 dark:text-green-300',
        textColor: 'text-green-700 dark:text-green-400'
      },
      error: {
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        titleColor: 'text-red-800 dark:text-red-300',
        textColor: 'text-red-700 dark:text-red-400'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        titleColor: 'text-yellow-800 dark:text-yellow-300',
        textColor: 'text-yellow-700 dark:text-yellow-400'
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        titleColor: 'text-blue-800 dark:text-blue-300',
        textColor: 'text-blue-700 dark:text-blue-400'
      }
    };

    return configs[type as keyof typeof configs] || configs.info;
  };

  const config = getNotificationConfig(notification.type);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 200,
        duration: 0.3 
      }}
      className={`p-4 rounded-lg border shadow-lg ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h4 className={`text-sm font-medium ${config.titleColor}`}>
              {notification.title}
            </h4>
          )}
          <p className={`text-sm ${config.textColor} ${notification.title ? 'mt-1' : ''}`}>
            {notification.message}
          </p>
          
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className={`mt-2 text-sm font-medium ${config.iconColor} hover:underline`}
            >
              {notification.action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

// Notification helpers
export const createSuccessNotification = (message: string, title?: string): Omit<Notification, 'id'> => ({
  type: 'success',
  title,
  message,
  duration: 4000
});

export const createErrorNotification = (message: string, title?: string): Omit<Notification, 'id'> => ({
  type: 'error',
  title,
  message,
  duration: 6000
});

export const createWarningNotification = (message: string, title?: string): Omit<Notification, 'id'> => ({
  type: 'warning',
  title,
  message,
  duration: 5000
});

export const createInfoNotification = (message: string, title?: string): Omit<Notification, 'id'> => ({
  type: 'info',
  title,
  message,
  duration: 4000
});

export default NotificationProvider;