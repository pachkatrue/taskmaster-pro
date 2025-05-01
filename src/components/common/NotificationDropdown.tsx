import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'task' | 'project' | 'system';
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

/**
 * Компонент выпадающего списка уведомлений
 * Показывает список уведомлений и позволяет отметить их как прочитанные
 */
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
                                                                     isOpen,
                                                                     onClose,
                                                                     notifications,
                                                                     onMarkAllAsRead,
                                                                   }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Обработчик клика вне компонента для закрытия дропдауна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Анимации для дропдауна
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  // Определение иконки на основе типа уведомления
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'task':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
        );
      case 'project':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-2 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Уведомления
              </h3>
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-primary hover:text-primary-dark"
              >
                Отметить все как прочитанные
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700 last:border-b-0 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <p className="text-sm">У вас нет новых уведомлений</p>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t dark:border-gray-700">
            <button
              className="w-full text-center text-xs text-primary hover:text-primary-dark font-medium"
              onClick={() => console.log('Перейти к настройкам уведомлений')}
            >
              Все уведомления
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;