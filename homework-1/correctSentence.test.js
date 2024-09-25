import correctSentence from './correctSentence';

describe('correctSentence', () => {
  test('throws an error if input is null', () => {
    // Тестируем поведение при null
    expect(() => correctSentence(null)).toThrow('Input cannot be null or undefined');
  });

  test('throws an error if input is undefined', () => {
    // Тестируем поведение при undefined
    expect(() => correctSentence(undefined)).toThrow('Input cannot be null or undefined');
  });

  test('throws an error if input is not a string', () => {
    // Тестируем поведение при неправильном типе
    expect(() => correctSentence(12345)).toThrow('Input must be a string');
    expect(() => correctSentence({})).toThrow('Input must be a string');
    expect(() => correctSentence(true)).toThrow('Input must be a string');
  });

  test('returns the input as is if the input is an empty string', () => {
    // Тестируем поведение с пустой строкой
    expect(correctSentence('')).toBe('');
  });

  test('returns corrected sentence', () => {
    // Тестируем корректность работы функции
    expect(correctSentence('greetings, friends')).toBe('Greetings, friends.');
    expect(correctSentence('Greetings, friends')).toBe('Greetings, friends.');
    expect(correctSentence('Greetings, friends.')).toBe('Greetings, friends.');
  });
});
