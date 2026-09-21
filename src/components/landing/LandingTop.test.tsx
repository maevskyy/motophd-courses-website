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
  about: 'О школе',
  viewCourses: 'Смотреть курсы'
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

  it('links the compact instructor block to the About page', () => {
    render(<LandingTop content={homeContent.ru} courses={[]} labels={labels} />);

    expect(screen.getByRole('link', { name: 'О школе →' })).toHaveAttribute(
      'href',
      '/about'
    );
  });

  it('shows a compact coach block with two credentials', () => {
    const { container } = render(
      <LandingTop content={homeContent.en} courses={[]} labels={labels} />
    );

    expect(container.querySelector('img[src="/vlad.jpg"]')).toBeInTheDocument();
    expect(screen.getByText(homeContent.en.instructorCredentials![0])).toBeInTheDocument();
    expect(screen.getByText(homeContent.en.instructorCredentials![1])).toBeInTheDocument();
    expect(screen.queryByText(homeContent.en.instructorCredentials![2])).not.toBeInTheDocument();
  });

  it('shows every testimonial from the content after the coach, without a source link', () => {
    render(<LandingTop content={homeContent.en} courses={[]} labels={labels} />);

    const { testimonials } = homeContent.en;

    expect(screen.getByText(homeContent.en.testimonialsLabel)).toBeInTheDocument();
    expect(screen.getByText(homeContent.en.testimonialsTitle.join(' '))).toBeInTheDocument();
    expect(testimonials).toHaveLength(11);
    testimonials.forEach((item) => {
      expect(screen.getByText(item.quote)).toBeInTheDocument();
    });
    // Как в main: все отзывы сразу, без «Показать ещё» и без ссылки на Instagram.
    expect(screen.queryByRole('button', { name: /showMore/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /reviewsSource/ })).not.toBeInTheDocument();

    const coach = screen.getByText(homeContent.en.instructorName);
    const reviews = screen.getByText(homeContent.en.testimonialsLabel);

    expect(coach.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('has no "About the school" section', () => {
    render(<LandingTop content={homeContent.en} courses={[]} labels={labels} />);

    expect(screen.queryByText(/about the school/i)).not.toBeInTheDocument();
  });
});
