/*
 * Необходимо покрыть все возможные
 * и невозможные кейсы. Например,
 * convertBytesToHuman(-1) === false,
 * convertBytesToHuman(-1) !== '1 B',
 * convertBytesToHuman('string') === false
 *  convertBytesToHuman(5) === '5 B'
 */

import convertBytesToHuman from './convertBytesToHuman';

test('Возвращает false для неправильного типа данных', () => {
  // Передача отрицательных чисел
  expect(convertBytesToHuman(-1)).toBe(false);
  expect(convertBytesToHuman(-1024)).toBe(false);

  // Передача строки вместо числа
  expect(convertBytesToHuman('1024')).toBe(false);

  // Передача null, undefined, и других типов
  expect(convertBytesToHuman(null)).toBe(false);
  expect(convertBytesToHuman(undefined)).toBe(false);
  expect(convertBytesToHuman([1024])).toBe(false);
  expect(convertBytesToHuman({ bytes: 1024 })).toBe(false);
});

test('Возвращает корректное значение для чисел', () => {
  // Проверка корректных числовых значений
  expect(convertBytesToHuman(1024)).toBe('1 KB');
  expect(convertBytesToHuman(123123123)).toBe('117.42 MB');
  expect(convertBytesToHuman(1610612736)).toBe('1.5 GB');

  // Проверка значений с минимальной размерностью
  expect(convertBytesToHuman(0)).toBe('0 B');
  expect(convertBytesToHuman(1)).toBe('1 B');
  expect(convertBytesToHuman(5)).toBe('5 B');
});

test('Возвращает корректное значение для больших чисел', () => {
  // Проверка значений в терабайтах и петабайтах
  expect(convertBytesToHuman(1099511627776)).toBe('1 TB');
  expect(convertBytesToHuman(1125899906842624)).toBe('1 PB');
});
