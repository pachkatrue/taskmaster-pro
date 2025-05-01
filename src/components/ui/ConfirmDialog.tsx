import React from 'react';
import Modal from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  isLoading?: boolean;
}

/**
 * Компонент диалога подтверждения действий
 * Используется для подтверждения важных действий, таких как удаление
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onConfirm,
                                                       title,
                                                       message,
                                                       confirmText = 'Подтвердить',
                                                       cancelText = 'Отмена',
                                                       confirmButtonClass = 'btn-danger',
                                                       isLoading = false,
                                                     }) => {
  // Обработчик подтверждения с предотвращением закрытия при загрузке
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnClickOutside={!isLoading} // Предотвращаем закрытие при загрузке
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`btn ${confirmButtonClass}`}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Подождите...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;