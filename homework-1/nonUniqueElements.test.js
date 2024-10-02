import nonUniqueElements from './nonUniqueElements';

describe('nonUniqueElements', () => {
  test('returns non-unique elements from the array', () => {
    // Тестируем корректность работы функции
    expect(nonUniqueElements([1, 2, 3, 1, 3])).toEqual([1, 3, 1, 3]);
    expect(nonUniqueElements([1, 2, 3, 4, 5])).toEqual([]);
    expect(nonUniqueElements([5, 5, 5, 5, 5])).toEqual([5, 5, 5, 5, 5]);
    expect(nonUniqueElements([10, 9, 10, 10, 9, 8])).toEqual([10, 9, 10, 10, 9]);
  });

  test('throws an error if input is null', () => {
    // Тестируем поведение при null
    expect(() => nonUniqueElements(null)).toThrow('Input cannot be null or undefined');
  });

  test('throws an error if input is undefined', () => {
    // Тестируем поведение при undefined
    expect(() => nonUniqueElements(undefined)).toThrow('Input cannot be null or undefined');
  });

  test('throws an error if input is not an array', () => {
    // Тестируем поведение при неправильном типе
    expect(() => nonUniqueElements(12345)).toThrow('Input must be an array');
    expect(() => nonUniqueElements('not an array')).toThrow('Input must be an array');
    expect(() => nonUniqueElements({})).toThrow('Input must be an array');
  });

  test('returns empty array if input is an empty array', () => {
    // Тестируем поведение с пустым массивом
    expect(nonUniqueElements([])).toEqual([]);
  });

  test('throws an error if array contains non-number elements', () => {
    // Тестируем поведение при наличии нечисловых значений в массиве
    expect(() => nonUniqueElements([1, 2, '3', 4])).toThrow(
      'All elements in the array must be numbers',
    );
    expect(() => nonUniqueElements([1, {}, 3, 4])).toThrow(
      'All elements in the array must be numbers',
    );
    expect(() => nonUniqueElements([1, 2, true, 4])).toThrow(
      'All elements in the array must be numbers',
    );
    expect(() => nonUniqueElements([1, 2, null, 4])).toThrow(
      'All elements in the array must be numbers',
    );
  });
});
