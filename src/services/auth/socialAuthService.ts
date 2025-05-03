/**
 * Объединенный сервис для авторизации через социальные сети
 * Предоставляет единую точку входа для всех провайдеров социальной авторизации
 */

import { googleAuthService } from './googleAuthService';
import { facebookAuthService } from './facebookAuthService';

/**
 * Инициализация всех провайдеров авторизации
 * Должна вызываться при старте приложения
 */
export const initSocialAuth = () => {
  // Инициализируем каждый провайдер
  googleAuthService.init();
  facebookAuthService.init();

  console.log('Социальные провайдеры авторизации инициализированы');
};

/**
 * Объединяющий класс для всех социальных провайдеров
 * Позволяет централизованно управлять разными провайдерами авторизации
 */
export class SocialAuthService {
  /**
   * Получение инстанса провайдера по типу
   *
   * @param provider Тип провайдера ('google' или 'facebook')
   * @returns Инстанс соответствующего сервиса авторизации
   * @throws Ошибку, если запрошен неизвестный провайдер
   */
  static getProvider(provider: 'google' | 'facebook') {
    switch (provider) {
      case 'google':
        return googleAuthService;
      case 'facebook':
        return facebookAuthService;
      default:
        throw new Error(`Неизвестный провайдер: ${provider}`);
    }
  }
}