import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
}

/**
 * Универсальный компонент модального окна
 * Использует React Portal для рендеринга вне основного DOM-дерева
 * и Framer Motion для анимаций
 */
const Modal: React.FC<ModalProps> = ({
                                       isOpen,
                                       onClose,
                                       title,
                                       size = 'md',
                                       children,
                                       closeOnClickOutside = true,
                                       showCloseButton = true,
                                     }) => {
  // Ссылка на модальное окно для определения кликов вне его области
  const modalRef = useRef<HTMLDivElement>(null);

  // Определяем ширину модального окна в зависимости от размера
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  // Блокируем прокрутку страницы, когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Добавляем обработчик для закрытия по клавише Escape
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Обработчик клика вне модального окна
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Создаем анимации для модального окна
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  // Создаем анимации для оверлея
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.15,
      },
    },
  };

  // Рендерим компонент через портал в конец body
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Фоновый оверлей */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={handleClickOutside}
            />

            {/* Модальное окно */}
            <motion.div
              ref={modalRef}
              className={`z-10 w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Шапка модального окна с заголовком и кнопкой закрытия */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                  {title && (
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                      onClick={onClose}
                      aria-label="Закрыть"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {/* Содержимое модального окна */}
              <div className="px-6 py-4">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;