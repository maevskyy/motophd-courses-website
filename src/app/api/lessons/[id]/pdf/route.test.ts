import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  getCurrentUser: vi.fn(),
  getPayloadClient: vi.fn(),
  hasPaidAccess: vi.fn(),
  readMediaObject: vi.fn()
}));

vi.mock('@/lib/access/hasPaidAccess', () => ({ hasPaidAccess: mocks.hasPaidAccess }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock('@/lib/data/payload', () => ({ getPayloadClient: mocks.getPayloadClient }));
vi.mock('@/lib/media', () => ({ readMediaObject: mocks.readMediaObject }));
vi.mock('@/lib/rateLimit', () => ({
  RATE_LIMITS: { pdfAnonIp: { limit: 30, windowMs: 1 }, pdfUser: { limit: 30, windowMs: 1 } },
  consumeRateLimit: mocks.consumeRateLimit,
  getClientIp: () => 'unknown'
}));

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
    mocks.consumeRateLimit.mockReturnValue({ allowed: true, retryAfterSec: 0 });
    mocks.getPayloadClient.mockResolvedValue({ findByID: vi.fn().mockResolvedValue(lesson) });
    mocks.readMediaObject.mockResolvedValue(new ReadableStream());
  });

  it('отвечает 429 с Retry-After сверх лимита и не читает файл', async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: 8, role: 'student' });
    mocks.consumeRateLimit.mockReturnValue({ allowed: false, retryAfterSec: 42 });

    const response = await GET(new Request('http://localhost/api/lessons/2/pdf?locale=en'), {
      params: Promise.resolve({ id: '2' })
    });

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('42');
    expect(mocks.consumeRateLimit).toHaveBeenCalledWith('pdf:user:8', expect.anything());
    expect(mocks.readMediaObject).not.toHaveBeenCalled();
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
