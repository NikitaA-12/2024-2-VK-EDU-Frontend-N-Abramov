import correctSentence from './correctSentence';

test('returns correct sentence', () => {
  // тестируем корректность работы функции
  expect(correctSentence('greetings, friends')).toBe('Greetings, friends.');
  expect(correctSentence('Greetings, friends')).toBe('Greetings, friends.');
  expect(correctSentence('Greetings, friends.')).toBe('Greetings, friends.');
});
