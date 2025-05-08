/**
 * Скрипт для генерации структуры документации Obsidian
 *
 * Позволяет автоматически создать структуру папок и базовые файлы
 * для документации проекта TaskMaster Pro.
 *
 * @author Ваше имя
 * @date Текущая дата
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Получение пути к текущему файлу в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Базовая директория для документации
const BASE_DIR = path.join(path.dirname(__dirname), 'TaskMaster_Pro_Docs');

// Структура директорий
const directories = [
  '00_Введение',
  '01_Настройка проекта',
  '02_Компоненты',
  '03_Функциональность',
  '04_Хуки',
  '05_Сервисы',
  '06_Состояние приложения',
  '07_Маршрутизация',
  '08_Оффлайн функциональность',
  '09_Тестирование',
  '10_DevOps',
  '11_Приложения'
];

// Создание базовой директории, если она не существует
if (!fs.existsSync(BASE_DIR)) {
  fs.mkdirSync(BASE_DIR);
}

// Создание поддиректорий
directories.forEach(dir => {
  const fullPath = path.join(BASE_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
    console.log(`Создана директория: ${fullPath}`);
  }
});

// Создание базового README файла
const readmeContent = `# TaskMaster Pro - Документация

Добро пожаловать в документацию проекта TaskMaster Pro!

## Навигация

- [Введение](./00_Введение/Обзор%20проекта.md)
- [Настройка проекта](./01_Настройка%20проекта/Установка%20и%20настройка.md)
- [Компоненты](./02_Компоненты/UI%20компоненты.md)
- [Функциональность](./03_Функциональность/Управление%20задачами.md)

## Краткое описание

TaskMaster Pro - продвинутое приложение для управления задачами с функциями:

- Управление проектами и задачами с Drag-and-Drop интерфейсом
- Аналитика и визуализация данных
- Темная/светлая тема и персонализация
- Оффлайн-работа и синхронизация
- Авторизация пользователей
`;

fs.writeFileSync(path.join(BASE_DIR, 'README.md'), readmeContent);
console.log('Документация успешно инициализирована!');