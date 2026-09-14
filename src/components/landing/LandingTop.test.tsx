import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { homeContent } from '@/lib/content';
import { LandingTop } from './LandingTop';

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...rest }: React.ComponentProps<'a'>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}));

// Секция отзывов — клиентский компонент и берёт подписи из next-intl.
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key
}));

const labels = {
  viewCourses: 'Начать обучение'
};

describe('LandingTop', () => {
  it('does not preload the hero video: the poster is the LCP element', () => {
    const { container } = render(
      <LandingTop content={homeContent.ru} courses={[]} labels={labels} />
    );
    const video = container.querySelector('video');

    expect(video).toHaveAttribute('preload', 'none');
    expect(video).toHaveAttribute('poster', '/hero-poster.jpg');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
  });

  it('разводит школу и инструктора по разным блокам', () => {
    render(<LandingTop content={homeContent.ru} courses={[]} labels={labels} />);

    expect(screen.getByText(homeContent.ru.schoolTitle)).toBeInTheDocument();
    expect(screen.getByText(homeContent.ru.instructorTitle)).toBeInTheDocument();
    expect(screen.getByText(homeContent.ru.instructorQuote)).toBeInTheDocument();
  });

  it('не ставит кнопок в блоке инструктора: действие живёт в хиро и в финальном блоке', () => {
    render(<LandingTop content={homeContent.ru} courses={[]} labels={labels} />);

    // Единственная ссылка-действие верхней части — кнопка хиро.
    expect(screen.getAllByRole('link', { name: 'Начать обучение' })).toHaveLength(1);
    expect(screen.queryByRole('link', { name: /смотреть все курсы/i })).not.toBeInTheDocument();
  });
});
