// Только для тестов: Node 22+ подставляет собственный `localStorage`
// (undefined без `--localstorage-file`) поверх jsdom-овского, поэтому
// в тестах подменяем его in-memory реализацией через `vi.stubGlobal`.
export const createMemoryStorage = (): Storage => {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, String(value));
    }
  };
};
