import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getPayloadClient: vi.fn(),
  hasPaidAccess: vi.fn(),
  readMediaObject: vi.fn()
}));

vi.mock('@/lib/access/hasPaidAccess', () => ({ hasPaidAccess: mocks.hasPaidAccess }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock('@/lib/data/payload', () => ({ getPayloadClient: mocks.getPayloadClient }));
vi.mock('@/lib/media', () => ({ readMediaObject: mocks.readMediaObject }));

import { GET } from './route';

const lesson = {
  course: 9,
  id: 2,
  isFreePreview: false,
  pdf: {
    filename: 'lesson.pdf',
    id: 4
  }
};

describe('GET /api/lessons/[id]/pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPayloadClient.mockResolvedValue({ findByID: vi.fn().mockResolvedValue(lesson) });
    mocks.readMediaObject.mockResolvedValue(new ReadableStream());
  });

  it('refuses anonymous visitors before reading the file', async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/lessons/2/pdf?locale=en'), {
      params: Promise.resolve({ id: '2' })
    });

    expect(response.status).toBe(403);
    expect(mocks.hasPaidAccess).not.toHaveBeenCalled();
    expect(mocks.readMediaObject).not.toHaveBeenCalled();
  });

  it('refuses a signed-in visitor without a purchase before reading the file', async () => {
    const user = { id: 8, role: 'student' };
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.hasPaidAccess.mockResolvedValue(false);

    const response = await GET(new Request('http://localhost/api/lessons/2/pdf?locale=en'), {
      params: Promise.resolve({ id: '2' })
    });

    expect(response.status).toBe(403);
    expect(mocks.hasPaidAccess).toHaveBeenCalledWith(expect.anything(), user, 9);
    expect(mocks.readMediaObject).not.toHaveBeenCalled();
  });

  it('returns a private inline PDF only after paid-access verification', async () => {
    const user = { id: 7, role: 'student' };
    mocks.getCurrentUser.mockResolvedValue(user);
    mocks.hasPaidAccess.mockResolvedValue(true);

    const response = await GET(new Request('http://localhost/api/lessons/2/pdf?locale=ru'), {
      params: Promise.resolve({ id: '2' })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('Content-Disposition')).toContain('inline');
    expect(mocks.hasPaidAccess).toHaveBeenCalledWith(expect.anything(), user, 9);
    expect(mocks.readMediaObject).toHaveBeenCalledWith('lesson.pdf');
  });
});
