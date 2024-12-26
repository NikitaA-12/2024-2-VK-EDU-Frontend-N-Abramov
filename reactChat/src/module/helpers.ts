export const memoize = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  const cache: Map<string, any> = new Map();

  return async (...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log('Returning cached translation');
      return cache.get(key);
    }

    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
};
