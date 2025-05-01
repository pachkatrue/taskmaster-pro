import { describe, expect, it } from 'vitest';
import { formatDate } from './index';

describe('formatDate', () => {
  // Тест: корректное форматирование валидной даты в формате 'medium' и локали 'ru-RU'
  // Ожидаем: строка в виде "01 мая 2024"
  it('форматирует валидную дату в medium-формат для ru-RU', () => {
    const result = formatDate('2024-05-01T00:00:00.000Z', 'medium', 'ru-RU');
    expect(result).toMatch(/\d{2} [а-яА-Я]+ \d{4}/); // e.g. 01 мая 2024
  });

  // Тест: обработка некорректной строки вместо даты
  // Ожидаем: возвращается строка "Неверная дата"
  it('возвращает "Неверная дата" для некорректной строки', () => {
    const result = formatDate('invalid-date', 'medium', 'ru-RU');
    expect(result).toBe('Неверная дата');
  });

  // Тест: форматирование даты в формате 'short'
  // Ожидаем: строка с числовым представлением даты, например "01.05.2024"
  it('возвращает дату в short-формате', () => {
    const result = formatDate('2024-05-01T00:00:00.000Z', 'short', 'ru-RU');
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/); // e.g. 01.05.2024
  });
});
