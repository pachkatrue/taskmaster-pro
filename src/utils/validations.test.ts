import { describe, expect, it } from 'vitest';
import {
  isValidEmail,
  minLength,
  maxLength,
  required,
  isValidDate,
  isNotPastDate,
  isStrongPassword,
  passwordsMatch,
  isInRange,
  isValidUrl
} from './validations';

describe('Validators', () => {
  // Email
  it('распознаёт корректный email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('отклоняет некорректный email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  // minLength
  it('проверяет минимальную длину строки', () => {
    expect(minLength('abcde', 3)).toBe(true);
    expect(minLength('ab', 3)).toBe(false);
  });

  // maxLength
  it('проверяет максимальную длину строки', () => {
    expect(maxLength('abc', 5)).toBe(true);
    expect(maxLength('abcdef', 5)).toBe(false);
  });

  // required
  it('проверяет обязательное поле', () => {
    expect(required('value')).toBe(true);
    expect(required('')).toBe(false);
    expect(required(null)).toBe(false);
  });

  // isValidDate
  it('распознаёт корректную дату', () => {
    expect(isValidDate('2025-05-01')).toBe(true);
    expect(isValidDate('not-a-date')).toBe(false);
  });

  // isNotPastDate
  it('проверяет, что дата не в прошлом', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isNotPastDate(today)).toBe(true);
    expect(isNotPastDate('2000-01-01')).toBe(false);
  });

  // isStrongPassword
  it('распознаёт сильный пароль', () => {
    expect(isStrongPassword('Abc123!@')).toBe(true);
    expect(isStrongPassword('weakpass')).toBe(false);
  });

  // passwordsMatch
  it('проверяет совпадение паролей', () => {
    expect(passwordsMatch('secret', 'secret')).toBe(true);
    expect(passwordsMatch('secret', 'other')).toBe(false);
  });

  // isInRange
  it('проверяет, входит ли значение в диапазон', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(0, 1, 10)).toBe(false);
  });

  // isValidUrl
  it('распознаёт корректный URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('invalid-url')).toBe(false);
  });
});
