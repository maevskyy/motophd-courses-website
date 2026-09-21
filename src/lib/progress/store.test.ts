import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMemoryStorage } from './storage.mock';
import { markDone, progressStorageKey, readProgress, setLastOpened } from './store';
import { EMPTY_PROGRESS } from './types';

const key = progressStorageKey('lean');

describe('progress store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses a versioned key per course', () => {
    expect(key).toBe('motophd:progress:v1:lean');
  });

  it('returns empty progress when nothing is stored', () => {
    expect(readProgress('lean')).toEqual(EMPTY_PROGRESS);
  });

  it('returns empty progress for invalid JSON without throwing', () => {
    window.localStorage.setItem(key, '{not json');

    expect(() => readProgress('lean')).not.toThrow();
    expect(readProgress('lean')).toEqual(EMPTY_PROGRESS);
  });

  it('returns empty progress for JSON of the wrong shape', () => {
    window.localStorage.setItem(key, JSON.stringify({ done: 'nope' }));

    expect(readProgress('lean')).toEqual(EMPTY_PROGRESS);
  });

  it('drops non-numeric entries from done', () => {
    window.localStorage.setItem(
      key,
      JSON.stringify({ done: [1, 'x', 3], lastOpened: 3, updatedAt: '2026-01-01' })
    );

    expect(readProgress('lean')).toEqual({ done: [1, 3], lastOpened: 3, updatedAt: '2026-01-01' });
  });

  it('does not throw when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined);

    expect(() => readProgress('lean')).not.toThrow();
    expect(readProgress('lean')).toEqual(EMPTY_PROGRESS);
  });

  it('markDone persists sorted unique orders with a timestamp', () => {
    markDone('lean', 2);
    const progress = markDone('lean', 1);

    expect(progress.done).toEqual([1, 2]);
    expect(markDone('lean', 2).done).toEqual([1, 2]);
    expect(readProgress('lean').done).toEqual([1, 2]);
    expect(readProgress('lean').updatedAt).not.toBe('');
  });

  it('setLastOpened keeps done and stores the order', () => {
    markDone('lean', 1);

    expect(setLastOpened('lean', 4)).toMatchObject({ done: [1], lastOpened: 4 });
    expect(readProgress('lean').lastOpened).toBe(4);
  });

  it('keeps courses apart', () => {
    markDone('lean', 1);

    expect(readProgress('braking').done).toEqual([]);
  });
});
