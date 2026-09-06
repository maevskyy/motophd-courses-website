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

const labels = {
  viewCourses: 'Смотреть курсы',
  browseAllCourses: 'Смотреть все курсы'
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

  it('links the instructor section to the course catalog', () => {
    render(<LandingTop content={homeContent.ru} courses={[]} labels={labels} />);

    expect(screen.getByRole('link', { name: 'Смотреть все курсы' })).toHaveAttribute(
      'href',
      '/courses'
    );
  });
});
