import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedPublic, clearPublicCache, clearPublicCacheHook } from './publicCache';

describe('publicCache', () => {
  beforeEach(() => {
    clearPublicCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads once and serves the same data again', async () => {
    const load = vi.fn().mockResolvedValue([{ slug: 'lean' }]);

    await expect(cachedPublic('courses:en', load)).resolves.toEqual([{ slug: 'lean' }]);
    await expect(cachedPublic('courses:en', load)).resolves.toEqual([{ slug: 'lean' }]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('shares one database trip between simultaneous requests', async () => {
    const load = vi.fn().mockResolvedValue([]);

    await Promise.all([cachedPublic('k', load), cachedPublic('k', load), cachedPublic('k', load)]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('hands out copies, so one page changing a course does not leak to the next', async () => {
    const load = vi.fn().mockResolvedValue({ priceStandard: 49 });
    const first = await cachedPublic<{ priceStandard: number }>('course', load);

    first.priceStandard = 19;

    await expect(cachedPublic('course', load)).resolves.toEqual({ priceStandard: 49 });
  });

  it('does not keep a failed load', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('db down')).mockResolvedValue('ok');

    await expect(cachedPublic('k', load)).rejects.toThrow('db down');
    await expect(cachedPublic('k', load)).resolves.toBe('ok');
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('reloads after five minutes', async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValue('v');

    await cachedPublic('k', load);
    vi.advanceTimersByTime(5 * 60 * 1000 + 1);
    await cachedPublic('k', load);

    expect(load).toHaveBeenCalledTimes(2);
  });

  it('the admin hook drops everything now and once more after the transaction commits', async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValue('v');

    await cachedPublic('k', load);
    clearPublicCacheHook();
    await cachedPublic('k', load);
    expect(load).toHaveBeenCalledTimes(2);

    // Запрос, успевший прочитать базу до коммита, положил старое — второй
    // сброс его убирает.
    vi.advanceTimersByTime(2000);
    await cachedPublic('k', load);
    expect(load).toHaveBeenCalledTimes(3);
  });
});
