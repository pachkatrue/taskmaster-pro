import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Компонент для отображения ссылки "Подробнее" с улучшенной контрастностью в темной теме
 */
interface DetailsLinkProps {
  to: string;
  className?: string;
  children?: React.ReactNode;
}

const DetailsLink: React.FC<DetailsLinkProps> = ({
                                                   to,
                                                   className = '',
                                                   children = 'Подробнее'
                                                 }) => {
  return (
    <Link
      to={to}
      className={`font-medium text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm ${className}`}
    >
      {children}
    </Link>
  );
};

export default DetailsLink;