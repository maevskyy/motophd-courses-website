import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CourseTrailer } from './CourseTrailer';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key
}));

const fetchMock = vi.fn();

const renderTrailer = (poster: null | string = '/media/cover.jpg') =>
  render(<CourseTrailer courseSlug="lean" courseTitle="Lean" locale="uk" poster={poster} />);

describe('CourseTrailer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('до нажатия показывает обложку и кнопку, видео не запрашивает', () => {
    const { container } = renderTrailer();

    expect(screen.getByRole('button', { name: 'play {"course":"Lean"}' })).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/media/cover.jpg');
    expect(container.querySelector('iframe')).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('без обложки остаётся одна кнопка', () => {
    const { container } = renderTrailer(null);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('по нажатию берёт ссылку у курса на его языке и запускает плеер', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ url: 'https://customer-x.cloudflarestream.com/token/iframe?poster=p' })
    );
    renderTrailer();

    fireEvent.click(screen.getByRole('button'));

    const frame = await screen.findByTitle('title {"course":"Lean"}');
    expect(fetchMock).toHaveBeenCalledWith('/api/courses/lean/teaser?locale=uk');
    expect(frame.getAttribute('src')).toBe(
      'https://customer-x.cloudflarestream.com/token/iframe?poster=p&autoplay=true'
    );
  });

  it('если ссылку не дали — сообщает и оставляет кнопку для повтора', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 404 }));
    renderTrailer();

    fireEvent.click(screen.getByRole('button'));

    expect((await screen.findByRole('alert')).textContent).toBe('error');
    expect(screen.getByRole('button')).toHaveProperty('disabled', false);
  });
});
