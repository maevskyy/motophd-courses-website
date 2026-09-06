import type { Payload } from 'payload';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  dedupeFixturePdf,
  ensureFixturePdf,
  FIXTURE_PDF_ALT,
  FIXTURE_PDF_FILENAME,
  fixturePdfWhere,
  seedFixturePdf
} from './fixturePdf';

const makePayload = (docs: { id: number }[]) => {
  const mocks = {
    create: vi.fn().mockResolvedValue({ id: 100 }),
    delete: vi.fn().mockResolvedValue({}),
    find: vi.fn().mockResolvedValue({ docs }),
    logger: { info: vi.fn() },
    update: vi.fn().mockResolvedValue({ docs: [], errors: [] })
  };

  return { ...mocks, payload: mocks as unknown as Payload };
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('dedupeFixturePdf', () => {
  it('looks the fixture up by its marker, oldest first, without pagination', async () => {
    const { payload, find } = makePayload([]);

    await dedupeFixturePdf(payload);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        pagination: false,
        sort: 'createdAt',
        where: fixturePdfWhere
      })
    );
    expect(fixturePdfWhere).toEqual({
      and: [{ alt: { equals: FIXTURE_PDF_ALT } }, { filename: { like: 'motophd-fixture' } }]
    });
  });

  it('returns undefined and deletes nothing when there is no fixture', async () => {
    const { payload, delete: remove, update } = makePayload([]);

    await expect(dedupeFixturePdf(payload)).resolves.toBeUndefined();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('keeps a single existing fixture untouched', async () => {
    const { payload, delete: remove, update } = makePayload([{ id: 7 }]);

    await expect(dedupeFixturePdf(payload)).resolves.toEqual({ id: 7 });
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('keeps the oldest doc, relinks lessons in every locale, then deletes the extras', async () => {
    const { payload, delete: remove, update } = makePayload([{ id: 2 }, { id: 5 }, { id: 9 }]);

    await expect(dedupeFixturePdf(payload)).resolves.toEqual({ id: 2 });

    expect(update.mock.calls.map(([options]) => options)).toEqual([
      expect.objectContaining({ data: { pdf: 2 }, locale: 'en', where: { pdf: { equals: 5 } } }),
      expect.objectContaining({ data: { pdf: 2 }, locale: 'ru', where: { pdf: { equals: 5 } } }),
      expect.objectContaining({ data: { pdf: 2 }, locale: 'en', where: { pdf: { equals: 9 } } }),
      expect.objectContaining({ data: { pdf: 2 }, locale: 'ru', where: { pdf: { equals: 9 } } })
    ]);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ collection: 'lessons' }));

    expect(remove.mock.calls.map(([options]) => options)).toEqual([
      { collection: 'media', id: 5, overrideAccess: true },
      { collection: 'media', id: 9, overrideAccess: true }
    ]);

    // Lessons are moved before the media doc is deleted: the DB FK would null the link otherwise.
    const lastRelinkOf5 = update.mock.invocationCallOrder[1];
    const deleteOf5 = remove.mock.invocationCallOrder[0];

    expect(lastRelinkOf5).toBeLessThan(deleteOf5);
  });

  it('does not delete a duplicate whose lessons could not be relinked', async () => {
    const { payload, delete: remove, update } = makePayload([{ id: 2 }, { id: 5 }]);

    update.mockResolvedValueOnce({ docs: [], errors: [{ id: 3, message: 'boom' }] });

    await expect(dedupeFixturePdf(payload)).rejects.toThrow(/#5 to #2 \(en\): #3: boom/);
    expect(remove).not.toHaveBeenCalled();
  });
});

describe('ensureFixturePdf', () => {
  it('creates the fixture with the marker when none exists', async () => {
    const { payload, create } = makePayload([]);

    await expect(ensureFixturePdf(payload)).resolves.toEqual({ id: 100 });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'media',
        data: { alt: FIXTURE_PDF_ALT },
        file: expect.objectContaining({ mimetype: 'application/pdf', name: FIXTURE_PDF_FILENAME })
      })
    );
  });

  it('reuses the existing fixture instead of uploading again', async () => {
    const { payload, create } = makePayload([{ id: 7 }]);

    await expect(ensureFixturePdf(payload)).resolves.toEqual({ id: 7 });
    expect(create).not.toHaveBeenCalled();
  });
});

describe('seedFixturePdf', () => {
  it('attaches the fixture to every lesson in every locale', async () => {
    const { payload, update } = makePayload([{ id: 7 }]);

    await seedFixturePdf(payload, [3, 4]);

    expect(update.mock.calls.map(([options]) => options)).toEqual([
      expect.objectContaining({ collection: 'lessons', data: { pdf: 7 }, id: 3, locale: 'en' }),
      expect.objectContaining({ collection: 'lessons', data: { pdf: 7 }, id: 3, locale: 'ru' }),
      expect.objectContaining({ collection: 'lessons', data: { pdf: 7 }, id: 4, locale: 'en' }),
      expect.objectContaining({ collection: 'lessons', data: { pdf: 7 }, id: 4, locale: 'ru' })
    ]);
  });

  it('does nothing in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { payload, create, find, update } = makePayload([]);

    await seedFixturePdf(payload, [3]);

    expect(find).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});
