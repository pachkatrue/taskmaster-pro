import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './styles/global.css';
import { registerServiceWorker } from './serviceWorkerRegistration';
import DbInitializer from './components/common/DbInitializer';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Регистрируем Service Worker для оффлайн-функциональности
 */
registerServiceWorker();

/**
 * Точка входа в приложение
 * Подключаем все глобальные провайдеры и инициализируем БД
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <DbInitializer>
          <App />
        </DbInitializer>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);