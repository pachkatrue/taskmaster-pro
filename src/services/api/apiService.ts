/**
 * Сервис для взаимодействия с API
 */

import {SyncEntity, syncService} from '../storage/syncService';
import { User } from '../../features/auth/authSlice';
import { Task } from '../../features/tasks/tasksSlice';
import { Project } from '../../features/projects/projectsSlice';
import { SocialAuthService } from '../auth/socialAuthService';

// Тип для возможных ошибок API
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// Базовый URL API
const API_URL = import.meta.env.VITE_API_URL || 'https://api.taskmaster.example';

/**
 * Класс для работы с API
 * Инкапсулирует логику взаимодействия с сервером
 */
class ApiService {
  private token: string | null = null;

  /**
   * Установка токена авторизации
   * @param token JWT токен
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Получение токена из локального хранилища при инициализации
   */
  loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Очистка токена при выходе из системы
   */
  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Базовый метод для выполнения запросов к API
   * @param endpoint Конечная точка API
   * @param method HTTP метод
   * @param data Данные для отправки
   * @returns Результат запроса
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: Record<string, unknown>
  ): Promise<T> {
    // Проверяем доступность сети
    if (!navigator.onLine) {
      // Если это запрос на изменение данных и мы офлайн, добавляем в очередь синхронизации
      if (method !== 'GET') {
        const rawEntity = endpoint.split('/')[0];
        const entityMap: Record<string, SyncEntity> = {
          tasks: 'task',
          projects: 'project',
          user: 'user',
          settings: 'settings'
        };
        const entity = entityMap[rawEntity];
        if (!entity) throw new Error(`Unknown sync entity: ${rawEntity}`);
        const operation = method === 'DELETE' ? 'delete' : (method === 'POST' ? 'create' : 'update');

        await syncService.addToSyncQueue(operation, entity, data);

        // Возвращаем заглушку для оффлайн-операций
        // В реальном приложении здесь будет более сложная логика
        return { success: true, message: 'Операция добавлена в очередь синхронизации' } as unknown as T;
      }

      throw new Error('Нет подключения к интернету');
    }

    // Формируем параметры запроса
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Добавляем токен авторизации, если он есть
    if (this.token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
      };
    }

    // Добавляем тело запроса, если есть данные
    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      // Выполняем запрос
      const response = await fetch(`${API_URL}/${endpoint}`, options);

      // Получаем данные ответа
      const responseData = await response.json();

      // Проверяем статус ответа
      if (!response.ok) {
        const error: ApiError = {
          status: response.status,
          message: responseData.message || 'Произошла ошибка при выполнении запроса',
          errors: responseData.errors,
        };
        throw error;
      }

      return responseData as T;
    } catch (error) {
      // Если это сетевая ошибка, проверяем подключение
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Ошибка сети. Проверьте подключение к интернету.');
      }

      // Пробрасываем ошибку дальше
      throw error;
    }
  }

  /**
   * Универсальный метод для авторизации через любой социальный провайдер
   *
   * @param provider Идентификатор провайдера ('google' или 'facebook')
   * @returns Результат авторизации с данными пользователя и токеном
   * @throws Ошибку при неудачной авторизации
   */
  async loginWithSocialProvider(provider: 'google' | 'facebook'): Promise<{user: User; token: string}> {
    try {
      // Получаем сервис авторизации для запрошенного провайдера
      const authService = SocialAuthService.getProvider(provider);
      // Выполняем процесс авторизации
      const result = await authService.signIn();

      if (!result || !result.token || !result.user) {
        throw new Error(`Не удалось выполнить вход через ${provider}: неверный ответ от провайдера`);
      }

      // Сохраняем полученный токен
      this.setToken(result.token);

      return {
        user: result.user as User,
        token: result.token
      };
    } catch (error) {
      console.error(`Ошибка при авторизации через ${provider}:`, error);
      throw new Error(`Не удалось выполнить вход через ${provider}`);
    }
  }

  /**
   * Авторизация через Google
   *
   * @returns Результат авторизации с данными пользователя и токеном
   */
  async loginWithGoogle(): Promise<{user: User; token: string}> {
    return this.loginWithSocialProvider('google');
  }

  /**
   * Авторизация через Facebook
   *
   * @returns Результат авторизации с данными пользователя и токеном
   */
  async loginWithFacebook(): Promise<{user: User; token: string}> {
    return this.loginWithSocialProvider('facebook');
  }

  /**
   * Методы для работы с аутентификацией
   */

  async login(email: string, password: string): Promise<{user: User; token: string}> {
    const response = await this.request<{user: User; token: string}>('auth/login', 'POST', { email, password });
    this.setToken(response.token);
    return response;
  }

  async register(userData: { fullName: string; email: string; password: string }): Promise<{user: User; token: string}> {
    const response = await this.request<{user: User; token: string}>('auth/register', 'POST', userData);
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('auth/logout', 'POST');
    this.clearToken();
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('auth/me');
  }

  /**
   * Методы для работы с задачами
   */

  async getTasks(): Promise<Task[]> {
    return this.request<Task[]>('tasks');
  }

  async getTaskById(id: string): Promise<Task> {
    return this.request<Task>(`tasks/${id}`);
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.request<Task>('tasks', 'POST', taskData);
  }

  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    return this.request<Task>(`tasks/${id}`, 'PUT', taskData);
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`tasks/${id}`, 'DELETE');
  }

  /**
   * Методы для работы с проектами
   */

  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('projects');
  }

  async getProjectById(id: string): Promise<Project> {
    return this.request<Project>(`projects/${id}`);
  }

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    return this.request<Project>('projects', 'POST', projectData);
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    return this.request<Project>(`projects/${id}`, 'PUT', projectData);
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`projects/${id}`, 'DELETE');
  }

  /**
   * Методы для работы с настройками пользователя
   */

  async getUserSettings(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('user/settings');
  }

  async updateUserSettings(settings: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('user/settings', 'PUT', settings);
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
export const apiService = new ApiService();

// При инициализации пытаемся загрузить токен из локального хранилища
apiService.loadToken();