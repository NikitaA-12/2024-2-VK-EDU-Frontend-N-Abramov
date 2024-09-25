/*
You are given a non-empty list of integers (X).

For this task, you should return a list consisting of
only the non-unique elements in this list.

 To do so you will need to remove all unique elements
(elements which are contained in a given list only once).

When solving this task, do not change the order of the list.

Example:

input (array of integers): [1, 2, 3, 1, 3]
output (iterable of integers): [1, 3, 1, 3]

1 and 3 are non-unique elements.

More examples:

nonUniqueElements([1, 2, 3, 1, 3]) == [1, 3, 1, 3]
nonUniqueElements([1, 2, 3, 4, 5]) == []
nonUniqueElements([5, 5, 5, 5, 5]) == [5, 5, 5, 5, 5]
nonUniqueElements([10, 9, 10, 10, 9, 8]) == [10, 9, 10, 10, 9]
 */
export default function nonUniqueElements(data) {
  if (data == null) {
    // Проверка на null и undefined
    throw new Error('Input cannot be null or undefined');
  }

  if (!Array.isArray(data)) {
    throw new Error('Input must be an array');
  }

  if (data.length === 0) {
    return []; // Возвращаем пустой массив, если входной массив пуст
  }

  if (!data.every((item) => typeof item === 'number')) {
    throw new Error('All elements in the array must be numbers');
  }

  return data.filter((item) => data.indexOf(item) !== data.lastIndexOf(item));
}
